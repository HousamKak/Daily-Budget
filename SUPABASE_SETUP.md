# Supabase Setup Guide

This project uses **local Supabase for development** and **cloud Supabase for production**.

## 🏠 Local Development Setup

### Prerequisites
1. **Docker Desktop** must be installed and running
2. **Supabase CLI** installed: `npm install -g @supabase/cli`

### Setup Steps

1. **Start local Supabase**:
   ```bash
   supabase start
   ```
   This will start local Supabase on `http://localhost:54321`

2. **Your `.env` file is already configured**:
   ```
   VITE_SUPABASE_URL=http://localhost:54321
   VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_APP_ENV=development
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

### Local Supabase Dashboard
- **Studio**: http://localhost:54323
- **API**: http://localhost:54321
- **DB**: postgres://postgres:postgres@localhost:54322/postgres

## ☁️ Production Setup

### GitHub Secrets Configuration
In your GitHub repository, go to **Settings** → **Secrets and variables** → **Actions** → **Environment secrets** → **github-pages**:

1. `VITE_SUPABASE_URL` - Your cloud Supabase project URL
2. `VITE_SUPABASE_PUBLISHABLE_KEY` - Your cloud Supabase anon/public key

### Supabase Cloud Settings
1. **Authentication** → **Settings** → **Site URLs**:
   - Add: `https://[your-username].github.io/Daily-Budget/`

2. **Authentication** → **Settings** → **Redirect URLs**:
   - Add: `https://[your-username].github.io/Daily-Budget/`

## 🔄 Database Schema Sync

Your schema is in `supabase/schema.sql`. To apply it:

### To Local:
```bash
supabase db reset
```

### To Production:
```bash
supabase link --project-ref your-project-ref
supabase db push
```

## 🧪 Testing Authentication

1. **Local**: Create test accounts at http://localhost:54323
2. **Production**: Test with real email accounts

## 📁 Environment Files

- `.env` - Local development (already configured)
- `.env.production` - Production template (secrets come from GitHub)
- GitHub Secrets - Production values (configured in your repo)

## 🚀 Development Workflow

1. Code locally with Docker Supabase
2. Test authentication and data sync
3. Push to GitHub → Automatic deployment to production
4. Production uses cloud Supabase with your configured secrets

✅ **Your setup is ready to go!**