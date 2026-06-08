// Vercel Serverless Function – proxy mot Claude API.
// API-nyckeln ligger som miljövariabel (ANTHROPIC_API_KEY) och lämnar aldrig servern.

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Serverkonfiguration saknas (ANTHROPIC_API_KEY).' });
  }

  const { prompt, max_tokens } = req.body || {};

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Saknar prompt.' });
  }

  const maxTokens = Math.min(Math.max(parseInt(max_tokens) || 900, 100), 1500);

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await resp.json();
    if (!resp.ok) {
      return res.status(resp.status).json({ error: data?.error?.message || `API-fel ${resp.status}` });
    }

    const text = data?.content?.find((b) => b.type === 'text')?.text || '';
    if (!text) return res.status(502).json({ error: 'Tomt svar från AI.' });

    return res.status(200).json({ text });
  } catch (e) {
    return res.status(502).json({ error: 'Kunde inte nå AI-tjänsten: ' + e.message });
  }
}
