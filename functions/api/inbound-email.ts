interface InboundEmailContext {
  request: Request;
  env: Record<string, any>;
}

export const onRequestPost = async (context: InboundEmailContext) => {
  try {
    const body = (await context.request.json().catch(() => ({}))) as any;

    // Brevo Inbound Webhook payload structure:
    // { items: [ { From: { Address: '...', Name: '...' }, Subject: '...', ExtractedMarkdownMessage: '...', ... } ] }
    // Eller anpassat format { sender: '...', subject: '...', message: '...' }
    let fromEmail = '';
    let fromName = '';
    let subject = '';
    let messageText = '';

    if (Array.isArray(body?.items) && body.items.length > 0) {
      const item = body.items[0];
      fromEmail = item?.From?.Address || '';
      fromName = item?.From?.Name || fromEmail;
      subject = item?.Subject || 'Svar från kandidat';
      messageText = item?.ExtractedMarkdownMessage || item?.RawTextBody || item?.RawHtmlBody || '';
    } else {
      fromEmail = body?.sender || body?.from || body?.candidateEmail || '';
      fromName = body?.senderName || body?.name || fromEmail;
      subject = body?.subject || 'Svar från kandidat';
      messageText = body?.message || body?.text || body?.body || '';
    }

    return new Response(
      JSON.stringify({
        success: true,
        received: {
          fromEmail,
          fromName,
          subject,
          length: messageText.length,
          timestamp: new Date().toISOString(),
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Kunde inte behandla inkommande e-post' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
