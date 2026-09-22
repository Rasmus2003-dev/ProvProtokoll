interface Env {
  BREVO_API_KEY: string;
}

interface BrevoEvent {
  date: string;
  email: string;
  event: string;
  messageId: string;
  reason?: string;
}

// Rangordning: senaste/"starkaste" händelsen vinner när vi visar en enda status.
// T.ex. om mejlet både är "delivered" och senare "opened" visar vi det mer
// specifika. Bounces/blocked trumfar alltid ett tidigare "sent" eller "delivered".
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

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const email = url.searchParams.get('email');
    const messageId = url.searchParams.get('messageId');

    if (!email && !messageId) {
      return new Response(JSON.stringify({ error: 'email eller messageId krävs' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!context.env.BREVO_API_KEY) {
      return new Response(JSON.stringify({ error: 'E-posttjänsten är inte konfigurerad' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const params = new URLSearchParams({ limit: '20', offset: '0', days: '2' });
    if (email) params.set('email', email);
    if (messageId) params.set('messageId', messageId);

    const brevoRes = await fetch(`https://api.brevo.com/v3/smtp/statistics/events?${params.toString()}`, {
      headers: {
        'api-key': context.env.BREVO_API_KEY,
        Accept: 'application/json',
      },
    });

    if (!brevoRes.ok) {
      const errBody = await brevoRes.text();
      return new Response(JSON.stringify({ error: 'Kunde inte hämta leveransstatus', detail: errBody }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = (await brevoRes.json()) as { events?: BrevoEvent[] };
    const events = data.events || [];

    // Filtrera till just detta messageId om vi har det, annars förlitar vi
    // oss på att email-filtret ovan redan begränsat urvalet.
    const relevant = messageId ? events.filter((e) => e.messageId === messageId) : events;

    if (relevant.length === 0) {
      return new Response(JSON.stringify({ status: 'pending', events: [] }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const best = relevant.reduce((acc, e) =>
      (EVENT_PRIORITY[e.event] || 0) > (EVENT_PRIORITY[acc.event] || 0) ? e : acc
    );

    return new Response(
      JSON.stringify({
        status: best.event,
        reason: best.reason || null,
        date: best.date,
        events: relevant,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Ett oväntat fel inträffade' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
