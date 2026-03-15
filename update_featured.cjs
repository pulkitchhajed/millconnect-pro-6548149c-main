const { Client } = require('pg');

const DATABASE_URL = 'postgres://postgres.equodqypaphjjrursuql:mp095011@aws-0-us-east-1.pooler.supabase.com:6543/postgres';

async function run() {
  const client = new Client({ 
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected!');
    
    // Check if column exists (just in case)
    const colCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='fabrics' AND column_name='is_featured';
    `);
    
    if (colCheck.rowCount === 0) {
      console.log('Adding column is_featured...');
      await client.query('ALTER TABLE public.fabrics ADD COLUMN is_featured BOOLEAN DEFAULT false;');
    }
    
    console.log('Updating fabrics to be featured...');
    const res = await client.query(`
      UPDATE public.fabrics 
      SET is_featured = true 
      WHERE available = true 
      LIMIT 3;
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
