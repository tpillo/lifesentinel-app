-- Add veteran family member fields to profiles
-- Allows non-military users to identify as a veteran's family member
-- and receive the correct DIC / CHAMPVA / DEA benefit analysis.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS veteran_family_member TEXT
    CHECK (veteran_family_member IN ('yes', 'no', 'unknown')),
  ADD COLUMN IF NOT EXISTS veteran_family_relationship TEXT
    CHECK (veteran_family_relationship IN ('spouse', 'child', 'parent', 'sibling', 'other')),
  ADD COLUMN IF NOT EXISTS veteran_family_sc_death TEXT
    CHECK (veteran_family_sc_death IN ('yes', 'no', 'unknown')),
  ADD COLUMN IF NOT EXISTS veteran_family_disability_rating TEXT;
