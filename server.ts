import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { buildTestQuestions } from "./src/data/mockQuestions";
import { AuthEnv, handleAdminInspectors, verifyInspector } from "./server-lib/supabaseAuth";

// Samma miljövariabler som Cloudflare-funktionerna får i produktion
const authEnv: AuthEnv = {
  SUPABASE_URL: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

// Express-anrop -> Fetch Request, så att den delade serverlogiken kan användas
function toFetchRequest(req: express.Request): Request {
  const headers = new Headers();
  Object.entries(req.headers).forEach(([k, v]) => {
    if (typeof v === "string") headers.set(k, v);
  });
  return new Request(`http://localhost${req.originalUrl}`, {
    method: req.method,
    headers,
    body: req.method === "GET" || req.method === "HEAD" ? undefined : JSON.stringify(req.body ?? {}),
  });
}

async function sendFetchResponse(res: express.Response, response: Response) {
  res.status(response.status).type("application/json").send(await response.text());
}

// Middleware: kräver inloggad, aktiv inspektör
const requireInspector: express.RequestHandler = async (req, res, next) => {
  const verified = await verifyInspector(toFetchRequest(req), authEnv);
  if ("error" in verified) return sendFetchResponse(res, verified.error);
  next();
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));

  app.post("/api/admin/inspectors", async (req, res) => {
    try {
      await sendFetchResponse(res, await handleAdminInspectors(toFetchRequest(req), authEnv));
    } catch (e: any) {
      res.status(500).json({ error: "Ett oväntat fel inträffade", detail: e?.message });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Skickar resultatmejl via Brevo. Speglar functions/api/send-protocol.ts
  // (Cloudflare Pages Function i produktion) så mejlutskicket fungerar
  // identiskt lokalt under `npm run dev` istället för att tyst falla igenom
  // till Vites SPA-fallback (index.html) på en route som annars inte fanns
  // i dev-servern.
  app.post("/api/send-protocol", requireInspector, async (req, res) => {
    try {
      const { to, toName, subject, html } = req.body as {
        to: string;
        toName?: string;
        subject: string;
        html: string;
      };

      if (!to || !subject || !html) {
        return res.status(400).json({ error: "to, subject och html krävs" });
      }

      const apiKey = process.env.BREVO_API_KEY;
      if (!apiKey) {
        return res.status(503).json({ error: "E-posttjänsten är inte konfigurerad (BREVO_API_KEY saknas i .env)" });
      }

      const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          sender: { name: "ProvProtokoll (Svara inte)", email: "info@rasmusl.se" },
          replyTo: { name: "Svara inte på detta mejl", email: "noreply@rasmusl.se" },
          to: [{ email: to, name: toName || undefined }],
          subject,
          htmlContent: html,
        }),
      });

      if (!brevoRes.ok) {
        const errBody = await brevoRes.text();
        return res.status(502).json({ error: "Kunde inte skicka mejlet", detail: errBody });
      }

      const brevoBody: any = await brevoRes.json().catch(() => ({}));
      res.json({ status: "sent", messageId: brevoBody?.messageId || null });
    } catch (e: any) {
      res.status(500).json({ error: "Ett oväntat fel inträffade", detail: e?.message });
    }
  });

  // Slår upp faktisk leveransstatus (Delivered/Bounced/Blocked/Spam) hos Brevo.
  // Speglar functions/api/send-protocol-status.ts. Ett lyckat svar från
  // /api/send-protocol betyder bara att Brevo tog emot mejlet, inte att det
  // faktiskt nått mottagarens inkorg - den här routen ger den riktiga statusen.
  const EVENT_PRIORITY: Record<string, number> = {
    sent: 1,
    delivered: 2,
    opened: 3,
    clicks: 3,
    softBounces: 4,
    hardBounces: 5,
    blocked: 5,
    spam: 5,
    error: 5,
    invalid: 5,
  };

  app.get("/api/send-protocol-status", requireInspector, async (req, res) => {
    try {
      const email = req.query.email as string | undefined;
      const messageId = req.query.messageId as string | undefined;

      if (!email && !messageId) {
        return res.status(400).json({ error: "email eller messageId krävs" });
      }

      const apiKey = process.env.BREVO_API_KEY;
      if (!apiKey) {
        return res.status(503).json({ error: "E-posttjänsten är inte konfigurerad (BREVO_API_KEY saknas i .env)" });
      }

      const params = new URLSearchParams({ limit: "20", offset: "0", days: "2" });
      if (email) params.set("email", email);
      if (messageId) params.set("messageId", messageId);

      const brevoRes = await fetch(`https://api.brevo.com/v3/smtp/statistics/events?${params.toString()}`, {
        headers: { "api-key": apiKey, Accept: "application/json" },
      });

      if (!brevoRes.ok) {
        const errBody = await brevoRes.text();
        return res.status(502).json({ error: "Kunde inte hämta leveransstatus", detail: errBody });
      }

      const data: any = await brevoRes.json();
      const events: any[] = data.events || [];
      const relevant = messageId ? events.filter((e) => e.messageId === messageId) : events;

      if (relevant.length === 0) {
        return res.json({ status: "pending", events: [] });
      }

      const best = relevant.reduce((acc, e) =>
        (EVENT_PRIORITY[e.event] || 0) > (EVENT_PRIORITY[acc.event] || 0) ? e : acc
      );

      res.json({ status: best.event, reason: best.reason || null, date: best.date, events: relevant });
    } catch (e: any) {
      res.status(500).json({ error: "Ett oväntat fel inträffade", detail: e?.message });
    }
  });

  // Authoritative server-side grading for a completed theory exam.
  // The client sends the testId it was assigned plus the selected answer index per question;
  // the server rebuilds the same question set and computes the score, so the pass/fail
  // decision cannot be tampered with in the browser.
  app.post("/api/theory/submit", (req, res) => {
    try {
      const { testId, answers } = req.body as { testId: string; answers: Record<number, number> };
      if (!testId) {
        return res.status(400).json({ error: "testId saknas" });
      }

      const questions = buildTestQuestions(testId);
      const categoryScores: Record<number, { correct: number; total: number }> = {
        1: { correct: 0, total: 0 },
        2: { correct: 0, total: 0 },
        3: { correct: 0, total: 0 },
        4: { correct: 0, total: 0 },
        5: { correct: 0, total: 0 },
      };

      let score = 0;
      questions.forEach((q, idx) => {
        const studentAns = answers?.[idx];
        const cat = q.categoryId || 4;
        if (!categoryScores[cat]) categoryScores[cat] = { correct: 0, total: 0 };
        categoryScores[cat].total += 1;
        if (studentAns === q.correct) {
          score += 1;
          categoryScores[cat].correct += 1;
        }
      });

      const total = questions.length;
      const passedLimit = Math.ceil(total * 0.8);
      const passed = score >= passedLimit;

      res.json({ score, total, passed, categoryScores });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: "Kunde inte rätta provet" });
    }
  });

  // Backend protocol persistence endpoint with file/memory backup
  let savedProtocols: any[] = [];

  app.get("/api/protocols", (req, res) => {
    res.json({ success: true, count: savedProtocols.length, protocols: savedProtocols });
  });

  app.get("/api/protocols/:id", (req, res) => {
    const found = savedProtocols.find(p => p.id === req.params.id);
    if (!found) return res.status(404).json({ error: "Protokoll hittades inte" });
    res.json({ success: true, protocol: found });
  });

  app.post("/api/protocols", (req, res) => {
    try {
      const protocol = req.body;
      if (!protocol || !protocol.id) {
        return res.status(400).json({ error: "Ogiltigt protokoll" });
      }
      // Upsert: replace existing or add new
      const index = savedProtocols.findIndex(p => p.id === protocol.id);
      if (index >= 0) {
        savedProtocols[index] = { ...protocol, updated_at: new Date().toISOString() };
      } else {
        savedProtocols.unshift({ ...protocol, saved_at: new Date().toISOString() });
      }
      res.json({ success: true, id: protocol.id, total: savedProtocols.length });
    } catch (err: any) {
      res.status(500).json({ error: "Kunde inte spara protokoll", details: err.message });
    }
  });

  app.delete("/api/protocols/:id", (req, res) => {
    const beforeCount = savedProtocols.length;
    savedProtocols = savedProtocols.filter(p => p.id !== req.params.id);
    res.json({ success: true, deleted: beforeCount !== savedProtocols.length });
  });

  // Inspector & Candidate backend endpoints
  app.get("/api/inspector/stats", (req, res) => {
    const total = savedProtocols.length;
    const passed = savedProtocols.filter(p => p.driving_result === 'Godkänt' || p.full_state?.result?.drivingResult === 'Godkänt').length;
    const failed = total - passed;
    res.json({
      totalProtocols: total,
      passedProtocols: passed,
      failedProtocols: failed,
      passRatePercent: total > 0 ? Math.round((passed / total) * 100) : 0,
      activeInspector: "Rasmus Lundin (INSP-2045)"
    });
  });

  // Short Lathundar (Quick references saved in backend)
  let backendLathundar = [
    {
      license: "B",
      title: "Körprov B (Personbil)",
      minDrivingMinutes: 25,
      requiredManeuvers: ["Backning (obligatoriskt)", "Parkering eller vändning"],
      checklist: ["Säkerhetskontroll (inre/yttre)", "Körställning & sikt", "Tätort & oskyddade", "Landsväg & omkörning", "Självständig körning mot mål"],
      speedMargin: "Följ hastighetsgränser och grundregel 14 §. Inga onödiga tveksamheter vid företräde."
    },
    {
      license: "B1",
      title: "Körprov B1 (Fyrhjuling & Lätt bil)",
      minDrivingMinutes: 25,
      requiredManeuvers: ["Backning runt hörn / trång passage", "Vändning med kort vändradie", "Effektiv panikbromsning"],
      checklist: ["Säkerhetskontroll fyrhjuling/microcar", "Kurvstabilitet & vältningsförebyggande", "Uppsikt döda vinkeln", "Blandtrafik med tunga fordon"],
      speedMargin: "Följ hastighetsgränser. Extra försiktighet vid sidovind och möte med tunga fordon."
    },
    {
      license: "C",
      title: "Körprov C (Tung Lastbil)",
      minDrivingMinutes: 45,
      requiredManeuvers: ["Säkerhetskontroll inklusive tryckluft & bromsservo", "Backning med precision till lastkaj"],
      checklist: ["Färdskrivare / Körtidskontroll", "Svepytor & svängradie", "Tungfordonsbromsning", "Vägval & bärighetsklasser"],
      speedMargin: "Max 80 km/h på landsväg, 90 km/h på motorväg. Håll avstånd och planera retardationssträckor."
    },
    {
      license: "CE",
      title: "Körprov CE (Tungt Lastbilssläp)",
      minDrivingMinutes: 45,
      requiredManeuvers: ["Till- och frånkoppling av släpvagn (bromsuttag, vändskiva/dragstång)", "Backning i kurva mot lastport"],
      checklist: ["Bromsfalls- och täthetsprov", "Spärrventiler & luftslangar", "Täckning och lastsäkring"],
      speedMargin: "Max 80 km/h. Extra vaksamhet vid fällknivsrisk och sidovind."
    },
    {
      license: "D",
      title: "Körprov D (Buss)",
      minDrivingMinutes: 45,
      requiredManeuvers: ["Säkerhetskontroll (nödutgångar, brandsläckare, dörrspärr)", "Precision vid hållplatsangöring"],
      checklist: ["Passagerarkomfort & mjuk inbromsning", "Överhäng bak & fram vid sväng", "Färdskrivarhantering"],
      speedMargin: "Mjuk körning prioriteras. Bussbälte och passagerarsäkerhet."
    },
    {
      license: "BE",
      title: "Körprov BE (Personbil med släp)",
      minDrivingMinutes: 35,
      requiredManeuvers: ["Till- och frånkoppling med kultryckskontroll", "Backning med sväng runt gathörn"],
      checklist: ["Säkerhetskontroll på släp & dragkrok", "Katastrofbromsvajer", "Lastsäkringskontroll"],
      speedMargin: "Max 80 km/h med släp. God uppsikt i yttre backspeglar."
    },
    {
      license: "TAXI",
      title: "Taxiförarprov (Körprov)",
      minDrivingMinutes: 30,
      requiredManeuvers: ["Navigering efter adressangivelse utan GPS", "Ekonomisk & passagerarvänlig körning"],
      checklist: ["Kundbemötande & service", "Hitta kortaste/lämpligaste väg", "Säker av- och påstigning"],
      speedMargin: "Enligt taxitrafiklagen (2012:211). Hög säkerhet och lugn körstil."
    },
    {
      license: "Traktor",
      title: "Traktorkort (Jordbruksdrag & vagn)",
      minDrivingMinutes: 30,
      requiredManeuvers: ["Säkerhetskontroll trepunktslyft & kraftuttag (PTO)", "Backning med jordbruksvagn"],
      checklist: ["LGF-skylt och varningslykta", "Hydraulslangar och läckage", "Styrbromspedallås"],
      speedMargin: "Max 40 km/h (Traktor b) eller 50 km/h. Underlätta omkörning via vägren."
    },
    {
      license: "Snöskoter",
      title: "Förarbevis Snöskoter",
      minDrivingMinutes: 35,
      requiredManeuvers: ["Start och stopp i djup snö", "Skråkörning och balansförskjutning", "Nödstoppslina"],
      checklist: ["Isbedömning & säkerhetsutrustning (isdubbar)", "Lavinsond & spade", "Styrstål & matta"],
      speedMargin: "Högst 70 km/h på skoterled, 20 km/h vid passage av bebyggelse."
    },
    {
      license: "Terränghjuling",
      title: "Förarbevis Terränghjuling (ATV)",
      minDrivingMinutes: 30,
      requiredManeuvers: ["Överkörning av hinder med aktiv balans", "Klättring i brant slänt", "Vinschning"],
      checklist: ["Lågtrycksdäck och däcktryck", "Dödmansgrepp / nödstopp", "Styrleder och packväskor"],
      speedMargin: "Terrängkörningslagen. Förbud på barmark utan dispens."
    },
    {
      license: "Truck",
      title: "Truckförarbevis (Kategori A+B)",
      minDrivingMinutes: 25,
      requiredManeuvers: ["Stapling i hyllställage på hög höjd", "Precisionsbackning med skymd sikt framåt"],
      checklist: ["Daglig tillsyn AFS 2006:4", "Lyftkedjor & gaffelsprintar", "Batteri- / gassäkerhet"],
      speedMargin: "Anpassad gånghastighet i lager (max 10–12 km/h). Signalera i dolda hörn."
    }
  ];

  app.get("/api/lathundar/quick", (req, res) => {
    res.json({ success: true, lathundar: backendLathundar });
  });

  app.post("/api/lathundar/quick", (req, res) => {
    const item = req.body;
    if (item && item.license) {
      const idx = backendLathundar.findIndex(l => l.license === item.license);
      if (idx >= 0) backendLathundar[idx] = item;
      else backendLathundar.push(item);
    }
    res.json({ success: true, count: backendLathundar.length });
  });

  // Driving School Students backend endpoints
  let drivingSchoolStudents: any[] = [];
  app.get("/api/trafikskola/students", (req, res) => {
    res.json({ success: true, count: drivingSchoolStudents.length, students: drivingSchoolStudents });
  });
  app.post("/api/trafikskola/students", (req, res) => {
    drivingSchoolStudents = req.body || [];
    res.json({ success: true, count: drivingSchoolStudents.length });
  });

  // Trafikverket Provkandidater (Elevregister för förarprov & kunskapsprov)
  let trvCandidates: any[] = [];
  app.get("/api/trv/candidates", (req, res) => {
    res.json({ success: true, count: trvCandidates.length, candidates: trvCandidates });
  });
  app.post("/api/trv/candidates", (req, res) => {
    trvCandidates = req.body || [];
    res.json({ success: true, count: trvCandidates.length });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

