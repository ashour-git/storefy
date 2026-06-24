import 'dotenv/config';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

async function main() {
  const connectionString = process.env.DATABASE_URL_UNPOOLED;
  if (!connectionString) {
    console.error('DATABASE_URL_UNPOOLED environment variable is not set.');
    process.exit(1);
  }

  console.log('Running Drizzle migrations...');
  const migrationClient = postgres(connectionString, { max: 1 });
  const db = drizzle(migrationClient);

  try {
    await migrate(db, { migrationsFolder: 'src/db/migrations' });
    console.log('Drizzle migrations completed successfully!');

    // Run standalone SQL fixes (files matching NNN_*.sql with 3-digit prefix >= 004)
    // Drizzle files use 4-digit prefixes (0000_, 0001_, etc.)
    // RLS fixes 001-003 were applied manually; we auto-run 004+
    const files = fs.readdirSync('src/db/migrations')
      .filter((f) => f.endsWith('.sql'))
      .filter((f) => /^\d{3}_/.test(f) && parseInt(f) >= 4)
      .sort();

    for (const file of files) {
      const filePath = path.join('src/db/migrations', file);
      const contents = fs.readFileSync(filePath, 'utf-8');
      // Split on statement-breakpoint comments
      const statements = contents.split('--> statement-breakpoint')
        .map((s) => s.trim())
        .filter(Boolean);

      for (const stmt of statements) {
        try {
          // Use raw postgres client to avoid Drizzle template wrapping
          await migrationClient.unsafe(stmt);
        } catch (err: any) {
          if (err.code === '42P07' || err.code === '42701') {
            // 42P07 = relation already exists, 42701 = column already exists
            // These are expected for idempotent migrations that use CREATE TABLE IF NOT EXISTS / ADD COLUMN IF NOT EXISTS
            // PostgreSQL still returns an error for these despite IF NOT EXISTS in some edge cases
            console.log(`[${file}] Skipped (already applied): ${err.message}`);
          } else {
            throw err;
          }
        }
      }
      console.log(`[${file}] Applied successfully`);
    }

    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await migrationClient.end();
  }
}

main();
