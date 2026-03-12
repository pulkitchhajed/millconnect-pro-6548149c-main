const { Client } = require('pg');

const projectRef = 'equodqypaphjjrursuql';
const password = 'mp095011';
const regions = [
  'ap-south-1',
  'us-east-1',
  'eu-central-1',
  'ap-southeast-1',
  'us-west-2'
];

async function testConnection(host, port, user) {
  const url = `postgres://${user}:${password}@${host}:${port}/postgres`;
  const client = new Client({ 
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });
  
  try {
    console.log(`Testing ${host}:${port} with user ${user}...`);
    await client.connect();
    console.log(`SUCCESS connected to ${host}:${port}`);
    await client.end();
    return true;
  } catch (err) {
    console.log(`FAIL ${host}:${port}: ${err.message}`);
    await client.end().catch(() => {});
    return false;
  }
}

async function run() {
  for (const region of regions) {
    const poolerHost = `aws-0-${region}.pooler.supabase.com`;
    // Test Pooler (Transaction/Session)
    await testConnection(poolerHost, 6543, `postgres.${projectRef}`);
    await testConnection(poolerHost, 5432, `postgres.${projectRef}`);
  }
  
  // Test Direct (if DNS works)
  const directHost = `db.${projectRef}.supabase.co`;
  await testConnection(directHost, 5432, 'postgres');
}

run();
