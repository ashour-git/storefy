const postgres = require('postgres');
const sql = postgres('postgresql://postgres@localhost:5433/storefy');

async function main() {
  await sql`DROP SCHEMA IF EXISTS public CASCADE`;
  await sql`CREATE SCHEMA public`;
  await sql`DROP SCHEMA IF EXISTS drizzle CASCADE`;
  console.log('Dropped schema public and drizzle');
  process.exit(0);
}
main().catch(console.error);
