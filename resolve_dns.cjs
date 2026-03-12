const dns = require('dns').promises;

async function resolve() {
  const host = 'db.equodqypaphjjrursuql.supabase.co';
  const resolvers = ['8.8.8.8', '1.1.1.1', '8.8.4.4'];
  
  for (const resolver of resolvers) {
    try {
      console.log(`Trying resolver ${resolver} for ${host}...`);
      const resolverObj = new dns.Resolver();
      resolverObj.setServers([resolver]);
      const addrs = await resolverObj.resolve4(host);
      console.log(`SUCCESS: ${addrs.join(', ')}`);
      return;
    } catch (err) {
      console.log(`FAIL ${resolver}: ${err.message}`);
    }
  }
}

resolve();
