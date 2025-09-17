# Migration Guide

## Quick Commands

```bash
# Local development
npm run db:migrate:local     # Apply migrations locally
npm run db:diff:local        # See differences
npm run db:generate:local    # Generate TypeScript types

# Production (via CI)
npm run db:migrate          # Apply migrations to linked project
npm run db:diff             # See differences in production
npm run db:generate         # Generate types from production
```

## Creating New Migrations

### Method 1: Auto-generate from changes
```bash
# Make changes in Supabase Studio or via SQL
# Then generate migration
supabase migration new my_feature_name
supabase db diff --local >> supabase/migrations/[timestamp]_my_feature_name.sql
```

### Method 2: Write manually
```bash
supabase migration new my_feature_name
# Edit the created file manually
```

## Workflow

1. **Make changes locally** (Studio or migration files)
2. **Test locally**: `npm run db:migrate:local`
3. **Generate types**: `npm run db:generate:local`
4. **Commit changes**: Include migration files + updated types
5. **Deploy**: Push to main → CI runs migrations automatically

## Current Migrations

- `20250917124002_initial_schema.sql` - Initial tables and policies
- `20250917124532_fix_production_auth_trigger.sql` - Fixes 500 error in signup

## GitHub Secrets Required

Add these to your GitHub repository secrets:

- `SUPABASE_PROJECT_REF` - Your project ID (found in Supabase dashboard)
- `SUPABASE_ACCESS_TOKEN` - Personal access token from Supabase
- `SUPABASE_DB_PASSWORD` - Database password
- `VITE_SUPABASE_URL` - Your public Supabase URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Your public anon key

## Troubleshooting

### Migration fails in CI
- Check the migration SQL syntax
- Ensure all required secrets are set
- Review logs in GitHub Actions

### Types out of sync
- Run `npm run db:generate:local` after migrations
- Commit the updated `src/types/database.types.ts`

### Local vs Production differences
- Use `npm run db:diff` to see what's different
- Create migrations to sync them up