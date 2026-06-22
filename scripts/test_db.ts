import postgres from 'postgres';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL || 'postgresql://app_user:app_user_password@localhost:5433/storefy';
console.log('Connecting to:', connectionString);

const sql = postgres(connectionString);

async function main() {
  try {
    const result = await sql`SELECT 1 + 1 as sum`;
    console.log('Success!', result);
  } catch (err) {
    console.error('Failed to connect:', err);
  } finally {
    await sql.end();
  }
}

main();
