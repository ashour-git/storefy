import postgres from 'postgres';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL_UNPOOLED;
if (!connectionString) {
  console.error('DATABASE_URL_UNPOOLED is not set');
  process.exit(1);
}

const sql = postgres(connectionString, { max: 1 });

async function main() {
  try {
    console.log('Resetting public schema...');
    await sql`DROP SCHEMA IF EXISTS public CASCADE`;
    await sql`CREATE SCHEMA public`;
    await sql`GRANT ALL ON SCHEMA public TO postgres`;
    await sql`GRANT ALL ON SCHEMA public TO public`;
    await sql`GRANT ALL ON SCHEMA public TO app_user`;
    console.log('Database public schema reset successfully!');
  } catch (err) {
    console.error('Failed to reset db:', err);
  } finally {
    await sql.end();
  }
}

main();
