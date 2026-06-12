const { neon } = require('@neondatabase/serverless');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const sql = neon(process.env.DATABASE_URL);

  const rows = await sql`
    SELECT id, name, test_type, report, scores, created_at
    FROM results
    ORDER BY created_at DESC
  `;

  return res.status(200).json(rows);
};
