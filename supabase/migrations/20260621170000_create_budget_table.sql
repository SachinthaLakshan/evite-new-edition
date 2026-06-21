-- Create Budget table to store status of checklist tasks
CREATE TABLE IF NOT EXISTS public."Budget" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT budget_user_task_key UNIQUE (user_id, task_id)
);

-- Enable Row-Level Security
ALTER TABLE public."Budget" ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can view their own budget statuses"
  ON public."Budget" FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own budget statuses"
  ON public."Budget" FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own budget statuses"
  ON public."Budget" FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own budget statuses"
  ON public."Budget" FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Grant access permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."Budget" TO anon, authenticated;
