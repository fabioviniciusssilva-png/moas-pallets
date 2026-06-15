module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const KEY = 'moas-pallets-dados';
  const URL = process.env.KV_REST_API_URL;
  const TOKEN = process.env.KV_REST_API_TOKEN;

  if (!URL || !TOKEN) return res.status(500).json({ ok: false, error: 'Sem credenciais' });

  const headers = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

  try {
    if (req.method === 'GET') {
      const r = await fetch(`${URL}/get/${KEY}`, { headers });
      const d = await r.json();
      return res.status(200).json({ ok: true, data: d.result ? JSON.parse(d.result) : null });
    }
    if (req.method === 'POST') {
      const value = JSON.stringify(req.body);
      await fetch(`${URL}/pipeline`, { method: 'POST', headers, body: JSON.stringify([['SET', KEY, value]]) });
      return res.status(200).json({ ok: true });
    }
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
};
