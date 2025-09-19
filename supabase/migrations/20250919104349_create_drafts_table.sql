-- Create drafts table migration
-- This table stores draft expense items before they are converted to plans

-- Create drafts table
CREATE TABLE IF NOT EXISTS drafts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    note TEXT NOT NULL,
    amount DECIMAL(10,2) CHECK (amount > 0),
    category TEXT,
    date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;

-- Drafts policies - users can only access their own drafts
CREATE POLICY "Users can view own drafts" ON drafts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own drafts" ON drafts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own drafts" ON drafts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own drafts" ON drafts
    FOR DELETE USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_drafts_user_id ON drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_drafts_created_at ON drafts(created_at);

-- Add updated_at trigger
CREATE TRIGGER update_drafts_updated_at BEFORE UPDATE ON drafts
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Add audit trigger
CREATE TRIGGER audit_drafts_trigger
    AFTER INSERT OR UPDATE OR DELETE ON drafts
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON drafts TO authenticated;