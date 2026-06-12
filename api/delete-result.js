const { neon } = require('@neondatabase/serverless');

module.exports = async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.body || {};
  if (!id) return res.status(400).json({ error: 'Saknar id.' });

  const sql = neon(process.env.DATABASE_URL);
  await sql`DELETE FROM results WHERE id = ${id}`;

  return res.status(200).json({ ok: true });
};
