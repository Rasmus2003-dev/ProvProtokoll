import { AuthEnv, verifyInspector } from '../../server-lib/supabaseAuth';

interface Env extends AuthEnv {
  BREVO_API_KEY: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const verified = await verifyInspector(context.request, context.env);
    if ('error' in verified) return verified.error;

    if (!context.env.BREVO_API_KEY) {
      return new Response(JSON.stringify({ error: 'E-posttjänsten är inte konfigurerad' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const res = await fetch('https://api.brevo.com/v3/account', {
      headers: {
        'api-key': context.env.BREVO_API_KEY,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      return new Response(JSON.stringify({ error: 'Kunde inte hämta kontoinformation från Brevo', detail: errText }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = (await res.json()) as any;
    const plans = data.plan || [];
    const freePlan = plans.find((p: any) => p.creditsType === 'sendLimit' || p.type === 'free') || plans[0];

    return new Response(
      JSON.stringify({
        email: data.email,
        companyName: data.companyName,
        planType: freePlan?.type || 'free',
        creditsRemainingToday: freePlan?.credits ?? 300,
        dailyLimit: 300,
        resetsAt: '00:00 UTC (varje natt)',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'Internt fel', detail: e?.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
