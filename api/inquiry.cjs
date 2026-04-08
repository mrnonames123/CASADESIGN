const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 200_000) reject(new Error('Payload too large'));
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
  });
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const body = await readJson(req);

    const name = String(body?.name || '').trim();
    const email = String(body?.email || '').trim();
    const message = String(body?.message || '').trim();
    const website = String(body?.website || '').trim(); // honeypot

    if (website) {
      return res.status(200).json({ ok: true }); // silently accept bots
    }

    if (!name || name.length < 2 || name.length > 80) {
      return res.status(400).json({ ok: false, error: 'Please enter your name.' });
    }
    if (!EMAIL_RE.test(email) || email.length > 160) {
      return res.status(400).json({ ok: false, error: 'Please enter a valid email.' });
    }
    if (!message || message.length < 10 || message.length > 5000) {
      return res.status(400).json({ ok: false, error: 'Please enter a message (10–5000 chars).' });
    }

    const to = (process.env.INQUIRY_TO_EMAIL || '').trim();
    const from = (process.env.INQUIRY_FROM_EMAIL || 'onboarding@resend.dev').trim();
    const resendKey = (process.env.RESEND_API_KEY || '').trim();

    // If Resend isn't configured, still return a friendly error so the UI can guide you.
    if (!resendKey || !to) {
      return res.status(501).json({
        ok: false,
        error: 'Email delivery is not configured.',
        missing: {
          RESEND_API_KEY: !resendKey,
          INQUIRY_TO_EMAIL: !to
        }
      });
    }

    const subject = `New inquiry from ${name}`;

    const html = `
      <div style="font-family:Inter,Arial,sans-serif;line-height:1.6">
        <h2 style="margin:0 0 12px">New Casa Design inquiry</h2>
        <p style="margin:0 0 10px"><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p style="margin:0 0 10px"><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p style="margin:16px 0 8px"><strong>Message:</strong></p>
        <pre style="white-space:pre-wrap;background:#0b0b0b;color:#f5f5f7;padding:14px;border-radius:10px">${escapeHtml(message)}</pre>
      </div>
    `;

    const text = `New Casa Design inquiry\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n`;

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html,
        text,
        reply_to: email
      })
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return res.status(502).json({
        ok: false,
        error: data?.message || 'Failed to send email.'
      });
    }

    return res.status(200).json({ ok: true, id: data?.id || null });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err?.message || 'Server error' });
  }
};

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

