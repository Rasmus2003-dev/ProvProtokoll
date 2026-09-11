import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { buildTestQuestions } from "./src/data/mockQuestions";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
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

  // Backend protocol persistence endpoint
  const inMemoryProtocols: any[] = [];

  app.get("/api/protocols", (req, res) => {
    res.json({ protocols: inMemoryProtocols });
  });

  app.post("/api/protocols", (req, res) => {
    try {
      const protocol = req.body;
      if (!protocol || !protocol.id) {
        return res.status(400).json({ error: "Ogiltigt protokoll" });
      }
      inMemoryProtocols.unshift(protocol);
      res.json({ success: true, id: protocol.id, total: inMemoryProtocols.length });
    } catch (err: any) {
      res.status(500).json({ error: "Kunde inte spara protokoll" });
    }
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

