-- Migration: Dual-Track Subscription Support
-- Adds trial tracking to organizations and owner distinctions to users

-- 1. Organizations: Add trial fields if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'ataraxia' AND table_name = 'organizations' AND column_name = 'trial_start_date') THEN
        ALTER TABLE ataraxia.organizations ADD COLUMN trial_start_date TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'ataraxia' AND table_name = 'organizations' AND column_name = 'trial_end_date') THEN
        ALTER TABLE ataraxia.organizations ADD COLUMN trial_end_date TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'ataraxia' AND table_name = 'organizations' AND column_name = 'created_by_user_id') THEN
        ALTER TABLE ataraxia.organizations ADD COLUMN created_by_user_id BIGINT REFERENCES ataraxia.users(id);
    END IF;
END $$;

-- 2. Users: Add ownership flag
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'ataraxia' AND table_name = 'users' AND column_name = 'is_org_owner') THEN
        ALTER TABLE ataraxia.users ADD COLUMN is_org_owner BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 3. Data Backfill: Set default trial dates for existing trial organizations
UPDATE ataraxia.organizations 
SET 
  trial_start_date = COALESCE(trial_start_date, created_at),
  trial_end_date = COALESCE(trial_end_date, created_at + INTERVAL '30 days')
WHERE subscription_plan = 'trial';
