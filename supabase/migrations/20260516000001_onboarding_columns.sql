-- Onboarding progress tracking columns for the Get Started card
-- Run manually in Supabase SQL Editor.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_dismissed_at timestamptz,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS benefits_acknowledged_at timestamptz,
  ADD COLUMN IF NOT EXISTS readiness_overview_acknowledged_at timestamptz;
