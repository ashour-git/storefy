# 9. Vector search with pgvector + expand RAG

**Label:** ready-for-agent, feature

## What to build

Add pgvector extension to PostgreSQL for semantic search. Expand RAG knowledge sources to include product descriptions, order history, and customer interactions. Store embeddings in a new `ai_embeddings` table.

## Acceptance criteria

- [ ] pgvector extension enabled on Neon
- [ ] `ai_embeddings` table created with vector column
- [ ] Embeddings generated for product descriptions on create/update
- [ ] Semantic search returns relevant products by meaning, not just keywords
- [ ] AI advisor uses vector search for context-aware responses

## Blocked by

None - can start immediately
