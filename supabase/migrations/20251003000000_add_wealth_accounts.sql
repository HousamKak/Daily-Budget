-- Create accounts table
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('checking', 'savings', 'credit', 'investment', 'cash', 'asset', 'property', 'vehicle', 'other')),
  balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Create account_transactions table
CREATE TABLE IF NOT EXISTS public.account_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'transfer', 'adjustment')),
  amount DECIMAL(15, 2) NOT NULL,
  date DATE NOT NULL,
  note TEXT,
  category TEXT,
  -- Link to budget expenses
  expense_id UUID,
  -- For transfers between accounts
  transfer_to_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_user_active ON public.accounts(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_account_transactions_user_id ON public.account_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_account_transactions_account_id ON public.account_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_account_transactions_date ON public.account_transactions(date);
CREATE INDEX IF NOT EXISTS idx_account_transactions_expense_id ON public.account_transactions(expense_id);

-- Enable Row Level Security
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for accounts
CREATE POLICY "Users can view their own accounts"
  ON public.accounts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own accounts"
  ON public.accounts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts"
  ON public.accounts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts"
  ON public.accounts
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for account_transactions
CREATE POLICY "Users can view their own transactions"
  ON public.account_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON public.account_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
  ON public.account_transactions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
  ON public.account_transactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_account_transactions_updated_at
  BEFORE UPDATE ON public.account_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to get user's total wealth
CREATE OR REPLACE FUNCTION get_user_total_wealth(p_user_id UUID)
RETURNS TABLE (
  total_wealth DECIMAL(15, 2),
  total_assets DECIMAL(15, 2),
  total_liabilities DECIMAL(15, 2),
  by_type JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN type != 'credit' THEN balance ELSE -balance END), 0) as total_wealth,
    COALESCE(SUM(CASE WHEN type != 'credit' THEN balance ELSE 0 END), 0) as total_assets,
    COALESCE(SUM(CASE WHEN type = 'credit' THEN ABS(balance) ELSE 0 END), 0) as total_liabilities,
    jsonb_object_agg(
      type,
      SUM(balance)
    ) as by_type
  FROM public.accounts
  WHERE user_id = p_user_id
    AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
