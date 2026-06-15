// api/dados.js — Banco de dados compartilhado via Upstash Redis
// Todos os colaboradores leem e escrevem nos mesmos dados em tempo real

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const KEY = 'moas-pallets-dados';
  const URL = process.env.KV_REST_API_URL;
  const TOKEN = process.env.KV_REST_API_TOKEN;

  if (!URL || !TOKEN) {
    return res.status(500).json({ ok: false, error: 'Variáveis de ambiente não configuradas' });
  }

  try {
    // GET — ler dados
    if (req.method === 'GET') {
      const response = await fetch(`${URL}/get/${KEY}`, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      });
      const data = await response.json();
      const value = data.result ? JSON.parse(data.result) : null;
      return res.status(200).json({ ok: true, data: value });
    }

    // POST — salvar dados
    if (req.method === 'POST') {
      const body = JSON.stringify(req.body);
      const encoded = encodeURIComponent(body);
      const response = await fetch(`${URL}/set/${KEY}/${encoded}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${TOKEN}` }
      });
      const result = await response.json();
      return res.status(200).json({ ok: true, result });
    }

    return res.status(405).json({ ok: false, error: 'Método não permitido' });

  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}
