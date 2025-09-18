# Supabase Migration Guide 🚀

## Understanding Migrations vs Schema

### 📁 File Structure
```
supabase/
├── schema.sql                              ← Full database snapshot (for local dev)
├── migrations/
│   ├── 20250917124002_initial_schema.sql   ← Initial tables and policies
│   ├── 20250917124532_fix_auth_trigger.sql ← Bug fix
│   └── 20250917124934_add_categories.sql   ← New feature
└── config.toml                            ← Supabase configuration
```

### 🔄 How Migrations Work

**schema.sql** = Complete database state (snapshot)
- Used for: Local resets, new developer setup
- **NOT used in production**

**migrations/*.sql** = Individual changes (incremental)
- Used for: Production deployments, version control
- **Each file runs only once**

## 🛠️ Creating Migrations

### Method 1: Manual Creation (Recommended)

```bash
# 1. Create new migration file
npm run supabase:migration:new add_user_settings

# This creates: supabase/migrations/[timestamp]_add_user_settings.sql

# 2. Edit the file with your SQL changes
# 3. Test locally
npm run db:migrate:local

# 4. Deploy
git add supabase/migrations/
git commit -m "feat: add user settings"
git push  # CI applies migration automatically
```

### Method 2: Generate from UI Changes

```bash
# 1. Make changes in Supabase Studio (http://127.0.0.1:54323)
# 2. Generate migration from changes
supabase db diff --local > supabase/migrations/$(date +%Y%m%d%H%M%S)_my_changes.sql

# 3. Review and edit the generated file
# 4. Apply locally and deploy as above
```

## 📋 Migration Examples

### Adding a New Table

```sql
-- supabase/migrations/20250917130000_add_categories.sql

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#6B7280',
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can view own categories" ON categories
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own categories" ON categories
    FOR ALL USING (auth.uid() = user_id);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);

-- Add triggers
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
```

### Adding a Column

```sql
-- supabase/migrations/20250917130100_add_expense_tags.sql

-- Add tags column to expenses table
ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Add index for tag searches
CREATE INDEX IF NOT EXISTS idx_expenses_tags ON expenses USING gin(tags);
```

### Modifying Existing Data

```sql
-- supabase/migrations/20250917130200_set_default_categories.sql

-- Insert default categories for existing users
INSERT INTO categories (name, color, user_id)
SELECT 'Food', '#EF4444', id FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE user_id = auth.users.id AND name = 'Food'
);

INSERT INTO categories (name, color, user_id)
SELECT 'Transport', '#3B82F6', id FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE user_id = auth.users.id AND name = 'Transport'
);
```

## 📝 NPM Scripts Reference

```json
{
  "scripts": {
    // Local Development
    "db:migrate:local": "supabase db push --local",
    "db:diff:local": "supabase db diff --local",
    "db:generate:local": "supabase gen types typescript --local > src/types/database.types.ts",

    // Production (via CI)
    "db:migrate": "supabase db push --linked",
    "db:diff": "supabase db diff --linked",
    "db:generate": "supabase gen types typescript --linked > src/types/database.types.ts",

    // Utilities
    "supabase:start": "supabase start",
    "supabase:stop": "supabase stop",
    "supabase:reset": "supabase db reset",
    "supabase:status": "supabase status"
  }
}
```

## 🔥 Common Workflows

### Adding a New Feature

```bash
# 1. Create migration
supabase migration new add_expense_categories

# 2. Write SQL (see examples above)

# 3. Test locally
npm run db:migrate:local

# 4. Generate updated types
npm run db:generate:local

# 5. Update your code to use new types

# 6. Test your app locally
npm run dev

# 7. Deploy
git add .
git commit -m "feat: add expense categories"
git push
```

### Fixing Production Issues

```bash
# 1. Create hotfix migration
supabase migration new fix_auth_trigger_error

# 2. Write fix (see existing fix_production_auth_trigger.sql)

# 3. Test locally first
npm run db:migrate:local

# 4. Deploy immediately
git add supabase/migrations/
git commit -m "fix: resolve auth trigger 500 error"
git push
```

### Rollback Strategy

```bash
# Create a rollback migration (no automatic rollback)
supabase migration new rollback_categories_table

# Write the reverse operations
DROP TABLE IF EXISTS categories;
```

## 🤖 CI/CD Integration

### GitHub Secrets Required

Add these to your GitHub repository settings → Secrets:

```bash
SUPABASE_PROJECT_REF=your-project-id
SUPABASE_ACCESS_TOKEN=your-personal-access-token
SUPABASE_DB_PASSWORD=your-database-password
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

### Workflow Triggers

Migrations run automatically when:
- ✅ Push to `main` branch
- ✅ Merge pull request to `main`
- ✅ Manual workflow dispatch

Migrations also run during deployment to ensure database is up-to-date before app deployment.

## 🚨 Best Practices

### ✅ DO

- **Always test locally first**: `npm run db:migrate:local`
- **Use descriptive migration names**: `add_user_preferences`, not `update_db`
- **Include rollback strategy**: Document how to reverse changes
- **Use `IF NOT EXISTS`**: Prevent errors if migration runs twice
- **Update TypeScript types**: Run `npm run db:generate:local` after changes
- **Small, focused migrations**: One feature per migration file
- **Comment your SQL**: Explain what and why

### ❌ DON'T

- **Don't edit existing migrations**: Create new ones instead
- **Don't edit schema.sql for changes**: Use migrations
- **Don't skip local testing**: Always test before pushing
- **Don't ignore CI failures**: Fix immediately
- **Don't delete migration files**: They're permanent history
- **Don't run SQL manually in production**: Use migrations

## 🐛 Troubleshooting

### Migration Fails in CI

```bash
# Check the error logs in GitHub Actions
# Common issues:
1. Missing secrets
2. SQL syntax errors
3. Permission issues
4. Constraint violations
```

### Local vs Production Differences

```bash
# Compare schemas
npm run db:diff

# Generate migration to sync
supabase db diff --linked > supabase/migrations/$(date +%Y%m%d%H%M%S)_sync_schemas.sql
```

### Types Out of Sync

```bash
# Regenerate types after migration
npm run db:generate:local

# Commit updated types
git add src/types/database.types.ts
git commit -m "chore: update database types"
```

### Reset Local Database

```bash
# Reset to clean state (uses schema.sql)
npm run supabase:reset

# Reapply all migrations
npm run db:migrate:local
```

## 📚 Migration History

| Migration | Purpose | Status |
|-----------|---------|--------|
| `20250917124002_initial_schema` | Initial tables, policies, indexes | ✅ Applied |
| `20250917124532_fix_auth_trigger` | Fix 500 error in signup | ✅ Applied |
| `20250917124934_add_categories` | Add expense categories | 🚧 Example |

## 🎯 Quick Reference

```bash
# Create migration
supabase migration new my_feature

# Test locally
npm run db:migrate:local

# Generate types
npm run db:generate:local

# Deploy
git push

# Check status
npm run supabase:status
```

---

**Remember**: Migrations are like Git commits for your database. Each one should be small, focused, and move you forward one step at a time. 🚀