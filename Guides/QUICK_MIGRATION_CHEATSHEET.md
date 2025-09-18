# Migration Quick Cheatsheet 🚀

## Most Common Commands

```bash
# Create new migration
npm run supabase:migration:new my_feature_name

# Apply migrations locally (test)
npm run db:migrate:local

# Generate TypeScript types
npm run db:generate:local

# See what changed
npm run db:diff:local

# Deploy (push to main)
git add . && git commit -m "feat: add feature" && git push
```

## Quick Examples

### Add Table
```sql
-- supabase/migrations/[timestamp]_add_table.sql
CREATE TABLE IF NOT EXISTS my_table (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own data" ON my_table
    FOR ALL USING (auth.uid() = user_id);
```

### Add Column
```sql
-- supabase/migrations/[timestamp]_add_column.sql
ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS tags TEXT[];
```

### Fix Function
```sql
-- supabase/migrations/[timestamp]_fix_function.sql
CREATE OR REPLACE FUNCTION my_function()
RETURNS TEXT AS $$
BEGIN
    -- Fixed function code
    RETURN 'success';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Workflow
1. **Create**: `npm run supabase:migration:new feature_name`
2. **Edit**: Write SQL in the created file
3. **Test**: `npm run db:migrate:local`
4. **Types**: `npm run db:generate:local`
5. **Deploy**: `git push`

## Emergency Fixes
```bash
# For production issues
npm run supabase:migration:new hotfix_critical_bug
# Write fix, test locally, push immediately
```

---
**Remember**: Never edit existing migration files, always create new ones! ⚠️