const { neon } = require('@neondatabase/serverless');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, test_type, report, scores } = req.body || {};
  if (!name || !test_type || !report) return res.status(400).json({ error: 'Saknar data.' });

  const sql = neon(process.env.DATABASE_URL);

  await sql`
    CREATE TABLE IF NOT EXISTS results (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      test_type TEXT NOT NULL,
      report TEXT NOT NULL,
      scores JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`ALTER TABLE results ADD COLUMN IF NOT EXISTS scores JSONB`;

  await sql`
    INSERT INTO results (name, test_type, report, scores)
    VALUES (${name}, ${test_type}, ${report}, ${scores ? JSON.stringify(scores) : null})
  `;

  return res.status(200).json({ ok: true });
};
