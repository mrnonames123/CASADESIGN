const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readJson(req) {
  // If the body is already parsed by a middleware (like Vercel's default), return it.
  if (req.body && typeof req.body === 'object') {
    return Promise.resolve(req.body);
  }

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
  // CORS support
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const body = await readJson(req);
    
    // Debug log (Keys only to protect privacy but see what's arriving)
    console.log('Inquiry received. Fields:', Object.keys(body).join(', '));

    const name = String(body?.name || '').trim();
    const email = String(body?.email || '').trim();
    const message = String(body?.message || '').trim();
    const projectType = String(body?.projectType || '').trim();
    const budgetRange = String(body?.budgetRange || '').trim();
    const timeline = String(body?.timeline || '').trim();
    const preferredContact = String(body?.preferredContact || '').trim();
    const website = String(body?.website || body?.hp_website || '').trim(); // honeypot

    if (website) {
      console.warn('Honeypot triggered. Silent ignore.');
      return res.status(200).json({ ok: true, note: 'spam_filtered' });
    }

    if (!name || name.length < 2) {
      return res.status(400).json({ ok: false, error: 'Please enter your name.' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ ok: false, error: 'Please enter a valid email.' });
    }
    if (!message || message.length < 10) {
      return res.status(400).json({ ok: false, error: 'Please enter a message (at least 10 chars).' });
    }

    const toInput = (process.env.INQUIRY_TO_EMAIL || '').trim();
    const from = (process.env.INQUIRY_FROM_EMAIL || 'onboarding@resend.dev').trim();
    const resendKey = (process.env.RESEND_API_KEY || '').trim();

    if (!resendKey || !toInput) {
      console.error('Email config missing: RESEND_API_KEY or INQUIRY_TO_EMAIL');
      return res.status(501).json({
        ok: false,
        error: 'Email delivery is not configured on the server.',
      });
    }

    // Handle multiple recipients if comma separated
    const to = toInput.includes(',') ? toInput.split(',').map(s => s.trim()) : toInput;

    const subject = `New Inquiry: ${name}`;

    const metaLines = [
      `<p style="margin:0 0 10px"><strong>Project Type:</strong> ${escapeHtml(projectType || 'Not specified')}</p>`,
      `<p style="margin:0 0 10px"><strong>Budget:</strong> ${escapeHtml(budgetRange || 'Not specified')}</p>`,
      `<p style="margin:0 0 10px"><strong>Timeline:</strong> ${escapeHtml(timeline || 'Not specified')}</p>`,
      `<p style="margin:0 0 10px"><strong>Preferred Contact:</strong> ${escapeHtml(preferredContact || 'Not specified')}</p>`
    ].join('');

    const html = `
      <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#111;">
        <h2 style="margin:0 0 20px;color:#A68A64;">CASA DESIGN Inquiry</h2>
        <div style="background:#f9f9f9;padding:20px;border-radius:12px;border:1px solid #eee;">
          <p style="margin:0 0 10px"><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p style="margin:0 0 10px"><strong>Email:</strong> ${escapeHtml(email)}</p>
          <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;">
          ${metaLines}
        </div>
        <p style="margin:24px 0 8px"><strong>Message:</strong></p>
        <div style="white-space:pre-wrap;background:#0b0b0b;color:#f5f5f7;padding:20px;border-radius:12px;font-size:15px;line-height:1.7;">${escapeHtml(message)}</div>
        <p style="margin-top:20px;font-size:12px;color:#999;">Sent from the Casa Design website contact form.</p>
      </div>
    `;

    const metaText = [
      `Project Type: ${projectType || 'Not specified'}`,
      `Budget: ${budgetRange || 'Not specified'}`,
      `Timeline: ${timeline || 'Not specified'}`,
      `Preferred Contact: ${preferredContact || 'Not specified'}`
    ].join('\n');

    const text = `CASA DESIGN Inquiry\n\nName: ${name}\nEmail: ${email}\n\n${metaText}\n\nMessage:\n${message}`;

    console.log(`Sending email to: ${Array.isArray(to) ? to.join(', ') : to}`);

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
      console.error('Resend API error:', data);
      return res.status(502).json({
        ok: false,
        error: data?.message || 'Failed to send email via Resend.'
      });
    }

    console.log('Email sent successfully:', data.id);
    return res.status(200).json({ ok: true, id: data?.id || null });
  } catch (err) {
    console.error('Server error in inquiry handler:', err);
    return res.status(500).json({ ok: false, error: err?.message || 'Internal server error' });
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
