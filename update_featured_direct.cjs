const { Client } = require('pg');

// Direct connection string format: postgres://postgres:[password]@db.[project-id].supabase.co:5432/postgres
const DATABASE_URL = 'postgres://postgres:mp095011@db.evvbmeorbikxpnguqivu.supabase.co:5432/postgres';

async function run() {
  const client = new Client({ 
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected!');
    
    // Add column if missing
    await client.query('ALTER TABLE public.fabrics ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;');
    
    console.log('Marking first 3 fabrics as featured...');
    const res = await client.query(`
      UPDATE public.fabrics 
      SET is_featured = true 
      WHERE id IN (
        SELECT id FROM public.fabrics 
        WHERE available = true 
        ORDER BY created_at ASC 
        LIMIT 3
      )
      RETURNING name;
    `);
    
    console.log(`Updated ${res.rowCount} fabrics:`);
    res.rows.forEach(r => console.log(`- ${r.name}`));

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

run();
