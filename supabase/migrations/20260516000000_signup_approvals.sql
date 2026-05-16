-- Signup approval gate
-- Run manually in Supabase SQL Editor after deploying this commit.

CREATE TABLE public.signup_approvals (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email           text NOT NULL,
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','denied')),
  approval_token  text NOT NULL UNIQUE DEFAULT replace(gen_random_uuid()::text, '-', ''),
  token_used_at   timestamptz,
  approved_at     timestamptz,
  denied_at       timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX signup_approvals_user_idx ON public.signup_approvals(user_id);
CREATE INDEX signup_approvals_token_idx ON public.signup_approvals(approval_token);

ALTER TABLE public.signup_approvals ENABLE ROW LEVEL SECURITY;

-- Users can read their own approval status (used by middleware and waitlist page)
CREATE POLICY "user can read own approval"
  ON public.signup_approvals FOR SELECT
  USING (auth.uid() = user_id);

-- Grandfather all existing users as already approved
INSERT INTO public.signup_approvals (user_id, email, status, approved_at, token_used_at)
SELECT id, email, 'approved', now(), now()
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
