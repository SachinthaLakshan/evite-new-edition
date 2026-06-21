-- Add status column to budget_ledger table
ALTER TABLE public.budget_ledger
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'unpaid'));
