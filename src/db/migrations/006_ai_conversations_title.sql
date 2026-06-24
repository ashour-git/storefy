-- Add title column to ai_conversations for dashboard conversation labeling
ALTER TABLE ai_conversations ADD COLUMN IF NOT EXISTS title text;
