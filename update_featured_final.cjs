const { Client } = require('pg');

// Corrected URL using project ID from .env: evvbmeorbikxpnguqivu
const DATABASE_URL = 'postgres://postgres.evvbmeorbikxpnguqivu:mp095011@aws-0-us-east-1.pooler.supabase.com:5432/postgres';

async function run() {
  const client = new Client({ 
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected!');
    
    // Add column if missing (just to be safe)
    await client.query('ALTER TABLE public.fabrics ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;');
    
    console.log('Marking fabrics as featured...');
    const res = await client.query(`
      UPDATE public.fabrics 
      SET is_featured = true 
      WHERE available = true 
      AND (id IN (
        SELECT id FROM public.fabrics 
        WHERE available = true 
        ORDER BY created_at ASC 
        LIMIT 3
      ));
    `);
    
    console.log(`Updated ${res.rowCount} fabrics.`);
    
    const names = await client.query('SELECT name FROM public.fabrics WHERE is_featured = true;');
    console.log('Currently featured:');
    names.rows.forEach(r => console.log(`- ${r.name}`));

  } catch (err) {
    console.error('Error during update:', err.message);
  } finally {
    await client.end();
  }
}

run();
