# Deployment Guide

## Prerequisites
- Node.js 18+
- Supabase account and project
- Vercel or Netlify account (for web)

## Steps
1. **Clone repository**.
2. **Install dependencies**: `npm install`.
3. **Configure Environment**: Copy `web/.env.example` to `web/.env` and fill in credentials.
4. **Deploy Database**:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```
5. **Build Web App**:
   ```bash
   cd web
   npm run build
   ```
6. **Deploy Web App**: Deploy the `web/dist` folder to your provider.
