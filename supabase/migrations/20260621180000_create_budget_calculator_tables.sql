-- Create budget settings table to store user's overall wedding budget limit
CREATE TABLE IF NOT EXISTS public.budget_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_budget NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create budget ledger table to store expenses and payments
CREATE TABLE IF NOT EXISTS public.budget_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('expense', 'payment')),
  for_what TEXT NOT NULL,
  vendor TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  notes TEXT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for budget_ledger
CREATE INDEX IF NOT EXISTS budget_ledger_user_id_idx ON public.budget_ledger(user_id);
CREATE INDEX IF NOT EXISTS budget_ledger_type_idx ON public.budget_ledger(type);

-- Enable Row-Level Security
ALTER TABLE public.budget_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_ledger ENABLE ROW LEVEL SECURITY;

-- RLS Policies for budget_settings
CREATE POLICY "Users can view their own budget settings"
  ON public.budget_settings FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own budget settings"
  ON public.budget_settings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own budget settings"
  ON public.budget_settings FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for budget_ledger
CREATE POLICY "Users can view their own ledger items"
  ON public.budget_ledger FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own ledger items"
  ON public.budget_ledger FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own ledger items"
  ON public.budget_ledger FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own ledger items"
  ON public.budget_ledger FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Grant access permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.budget_settings TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.budget_ledger TO anon, authenticated;
