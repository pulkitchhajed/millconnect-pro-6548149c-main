const { Client } = require('pg');

const DATABASE_URL = 'postgres://postgres.equodqypaphjjrursuql:mp095011@aws-0-us-east-1.pooler.supabase.com:6543/postgres';

async function update() {
  const client = new Client({ 
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  try {
    await client.connect();
    
    // Mark first 3 available fabrics as featured
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
    
    console.log('Successfully featured these fabrics:');
    res.rows.forEach(row => console.log(`- ${row.name}`));
    
    if (res.rowCount === 0) {
      console.log('No fabrics found to mark as featured.');
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

update();
