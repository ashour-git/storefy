ALTER TABLE "knowledge_chunks" ALTER COLUMN "embedding" SET DATA TYPE real[];--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "verifications" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();