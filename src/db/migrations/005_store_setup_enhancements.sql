--> statement-breakpoint
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS phone text;
--> statement-breakpoint
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS whatsapp text;
--> statement-breakpoint
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS address text;
--> statement-breakpoint
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS onboarding_complete boolean NOT NULL DEFAULT false;
