-- Add columns that exist in Drizzle schema but were never in any Drizzle migration.
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS "tax_rate" numeric(5,2) DEFAULT '14.00' NOT NULL;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS "low_stock_threshold" integer DEFAULT 5;
