# Storefy: The AI-First E-Commerce Platform

Storefy is an open-source, multi-tenant e-commerce platform designed to empower merchants with AI. Built to be "Better than Shopify" by natively integrating LLMs into every aspect of the merchant and customer experience.

## Core Features

### 🏢 Next-Gen Multi-Tenant Architecture
- **Wildcard Subdomains & Custom Domains**: Managed automatically via Next.js Middleware.
- **Isolated Tenant Data**: Complete data separation at the database level using Drizzle ORM.
- **Global-Local Payouts**: Automated merchant payouts and split payments powered by Paymob integration.

### 🤖 AI-Native Operations
- **AI POS Terminal**: Simply type or speak an order (e.g., "Add 2 vanilla perfumes") and the AI will build the cart, parse variants, and suggest smart upsells.
- **Natural Language Analytics**: No more complex dashboards. Ask "How did my weekend sale perform?" and get real-time charts and data narratives.
- **AI Business Advisor**: A dedicated AI co-pilot that analyzes recent orders, suggests marketing campaigns, and helps write product copy.
- **Omnichannel AI Inbox**: Ingests orders directly from WhatsApp or Instagram via webhooks, parsing natural language messages into structured draft orders.

### 🎨 AI Layout & Storefront Engine
- **Generative Onboarding**: Describe your business during sign-up, and Storefy generates a complete, tailored storefront (theme, colors, blocks, and dummy products) in seconds.
- **AI Design Copilot**: An interactive widget in the Theme Customizer. Tell it to "make the hero section darker" or "change the CTA to 'Shop Now'", and it safely updates the underlying JSON blocks.

## Tech Stack
- **Framework**: Next.js 15 (App Router, Server Actions)
- **Database**: PostgreSQL (Neon Serverless) + Drizzle ORM
- **Authentication**: Better Auth
- **AI Models**: Groq (Llama-3 70b)
- **Background Jobs**: Inngest
- **Payments**: Paymob

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Setup Database
npm run db:push

# 3. Start Development Server
npm run dev
```

Requires `GROQ_API_KEY`, `PAYMOB_API_KEY`, and standard DB credentials in `.env`.
