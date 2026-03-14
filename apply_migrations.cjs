const { Client } = require('pg');
const fs = require('fs');

const DATABASE_URL = 'postgres://postgres.equodqypaphjjrursuql:mp095011@aws-0-us-east-1.pooler.supabase.com:6543/postgres';

const sql = `
-- Add color and quantity type columns
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS selected_color TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS quantity_type TEXT NOT NULL DEFAULT 'Lump';
ALTER TABLE public.quote_requests ADD COLUMN IF NOT EXISTS selected_color TEXT;
ALTER TABLE public.quote_requests ADD COLUMN IF NOT EXISTS quantity_type TEXT NOT NULL DEFAULT 'Lump';

-- Update trigger for profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;
`;

async function apply() {
  const client = new Client({ 
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Applying migrations...');
    await client.query(sql);
    console.log('Migrations applied successfully!');
  } catch (err) {
    fs.writeFileSync('error.log', err.stack || err.message);
    console.error('Error applying migrations. Check error.log');
  } finally {
    await client.end();
  }
}

apply();
