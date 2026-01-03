-- Database Schema for Ataraxia (Final Comprehensive with Clinical Fields)
-- Target: PostgreSQL
-- Schema: ataraxia

-- Create Schema
CREATE SCHEMA IF NOT EXISTS ataraxia;

-- ============================================================================
-- 1. ORGANIZATIONS
-- ============================================================================
CREATE SEQUENCE ataraxia.organizations_id_seq START WITH 1000000 INCREMENT BY 1;
CREATE TABLE ataraxia.organizations (
    id BIGINT PRIMARY KEY DEFAULT nextval('ataraxia.organizations_id_seq'),
    name TEXT NOT NULL,
    legal_name TEXT NOT NULL,
    dba TEXT,
    tax_id TEXT,
    npi TEXT,
    slug TEXT UNIQUE,
    type TEXT CHECK (type IN ('solo', 'small-group', 'mid-size', 'large-enterprise', 'telehealth-only', 'multi-location')),
    primary_contact_name TEXT,
    primary_contact_email TEXT,
    primary_contact_phone TEXT,
    primary_contact_country_code TEXT DEFAULT '+1',
    hq_address_1 TEXT, -- ... (keeping previous address fields implied to save space in this prompt, but listing key ones)
    hq_address_2 TEXT,
    hq_city TEXT,
    hq_state TEXT,
    hq_zip TEXT,
    hq_country TEXT DEFAULT 'US',
    billing_address_same_as_hq BOOLEAN DEFAULT TRUE,
    billing_address_1 TEXT,
    billing_address_2 TEXT,
    billing_city TEXT,
    billing_state TEXT,
    billing_zip TEXT,
    billing_country TEXT,
    number_of_clinicians INTEGER DEFAULT 1,
    departments TEXT[],
    divisions TEXT[],
    hipaa_baa_signed BOOLEAN DEFAULT FALSE,
    data_processing_agreement_signed BOOLEAN DEFAULT FALSE,
    audit_logging_level TEXT DEFAULT 'standard',
    mfa_required BOOLEAN DEFAULT TRUE,
    password_policy JSONB DEFAULT '{"minLength": 12, "rotationDays": 90, "sessionTimeoutMinutes": 30}',
    brand_color_primary TEXT DEFAULT '#F97316',
    brand_color_secondary TEXT DEFAULT '#F59E0B',
    logo_url TEXT,
    email_sender_name TEXT,
    sms_sender_name TEXT,
    custom_domain TEXT,
    custom_login_branding BOOLEAN DEFAULT FALSE,
    subscription_plan TEXT DEFAULT 'trial',
    subscription_status TEXT DEFAULT 'active',
    integrations_enabled JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. USERS
-- ============================================================================
CREATE SEQUENCE ataraxia.users_id_seq START WITH 1000000 INCREMENT BY 1;
CREATE TABLE ataraxia.users (
    id BIGINT PRIMARY KEY DEFAULT nextval('ataraxia.users_id_seq'),
    organization_id BIGINT REFERENCES ataraxia.organizations(id) ON DELETE SET NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    first_name TEXT NOT NULL,
    middle_name TEXT,
    last_name TEXT NOT NULL,
    preferred_name TEXT,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'org_admin', 'therapist', 'client', 'intake_coordinator', 'clinical_supervisor')),
    phone_number TEXT,
    country_code TEXT DEFAULT '+1',
    profile_image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    firebase_uid TEXT UNIQUE,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    onboarding_step INTEGER DEFAULT 0,
    onboarding_status TEXT DEFAULT 'pending',
    onboarding_session_id TEXT,
    marketing_consent BOOLEAN DEFAULT FALSE,
    referral_source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. THERAPIST PROFILES
-- ============================================================================
CREATE SEQUENCE ataraxia.therapist_profiles_id_seq START WITH 1000000 INCREMENT BY 1;
CREATE TABLE ataraxia.therapist_profiles (
    id BIGINT PRIMARY KEY DEFAULT nextval('ataraxia.therapist_profiles_id_seq'),
    user_id BIGINT NOT NULL UNIQUE REFERENCES ataraxia.users(id) ON DELETE CASCADE,
    bio_short TEXT,
    bio_extended TEXT,
    approach_description TEXT,
    what_to_expect_description TEXT,
    license_type TEXT,
    license_number TEXT,
    npi_number TEXT,
    dea_number TEXT,
    highest_degree TEXT,
    institution_name TEXT,
    graduation_year INTEGER,
    years_of_experience INTEGER,
    licenses JSONB DEFAULT '[]', -- [{state, licenseNumber, expiry, documentUrl}]
    clinical_specialties JSONB DEFAULT '{}', 
    therapeutic_modalities JSONB DEFAULT '{}',
    personal_style JSONB DEFAULT '{}',
    demographic_preferences JSONB DEFAULT '{}',
    session_capacity_weekly INTEGER DEFAULT 20,
    new_clients_capacity INTEGER,
    session_lengths_offered INTEGER[],
    accepted_insurances TEXT[],
    languages_spoken TEXT[],
    weekly_schedule JSONB DEFAULT '{}',
    background_check_status TEXT,
    hipaa_training_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. CLIENT PROFILES (Expanded with Live Clinical Data)
-- Now includes fields from ProfessionalClientsView & EditClientProfileForm.
-- ============================================================================
CREATE SEQUENCE ataraxia.client_profiles_id_seq START WITH 1000000 INCREMENT BY 1;
CREATE TABLE ataraxia.client_profiles (
    id BIGINT PRIMARY KEY DEFAULT nextval('ataraxia.client_profiles_id_seq'),
    user_id BIGINT NOT NULL UNIQUE REFERENCES ataraxia.users(id) ON DELETE CASCADE,
    assigned_therapist_id BIGINT REFERENCES ataraxia.users(id),
    
    -- A. Personal Details
    date_of_birth DATE,
    gender_identity TEXT,
    pronouns TEXT,
    preferred_language TEXT,
    marital_status TEXT,
    occupation TEXT,
    
    -- B. Address & Emergency
    address_1 TEXT,
    address_2 TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT,
    emergency_contact_json JSONB DEFAULT '{}', -- {name, relation, phone, email}
    
    -- C. Insurance & Payment
    has_insurance BOOLEAN DEFAULT FALSE,
    insurance_data JSONB DEFAULT '{}', -- {provider, policyNumber, groupNumber, primaryInsuredDOB}
    payment_method_id TEXT,
    payment_method_type TEXT, -- 'card', 'ach'
    billing_address_json JSONB,
    billing_outstanding_balance DECIMAL(10, 2) DEFAULT 0.00,
    
    -- D. Clinical Intake (Registration Data)
    reason_for_therapy TEXT,
    presenting_concerns_data JSONB, -- {mainReason, severity, primaryConcerns[]}
    intake_safety_screening_data JSONB, -- Initial screening
    
    -- E. Medical Background
    medical_history JSONB DEFAULT '{}', -- {medications: [], allergies: [], previousTherapy: "", substanceUse: ""}
    
    -- F. Live Clinical Status (Mutable by Therapist)
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_hold', 'discharged', 'new')),
    safety_risk_level TEXT DEFAULT 'low' CHECK (safety_risk_level IN ('low', 'moderate', 'high')),
    safety_risk_flags TEXT[], -- ['suicidal_ideation', 'substance_risk', 'abuse_environment']
    safety_plan_url TEXT,
    risk_banner_alert TEXT, -- "Recent suicidal ideation reported..."
    
    treatment_plan JSONB DEFAULT '{}', -- {mainGoal: "...", subGoals: [], modality: "CBT", progress: "on_track", progressPercent: 45}
    
    diagnoses_structured JSONB DEFAULT '{}', -- {primary: {code, description}, secondary: [...]}
    medications_current JSONB DEFAULT '[]', -- [{name, dosage, prescribedBy, lastUpdated}]
    
    -- G. Assessment History
    assessment_scores JSONB DEFAULT '{}', -- {PHQ9: {latest: 14, history: [...]}, GAD7: ...}

    -- H. Consents
    consents_signed JSONB DEFAULT '{}', 
    signature_url TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. APPOINTMENTS
-- ============================================================================
CREATE SEQUENCE ataraxia.appointments_id_seq START WITH 1000000 INCREMENT BY 1;
CREATE TABLE ataraxia.appointments (
    id BIGINT PRIMARY KEY DEFAULT nextval('ataraxia.appointments_id_seq'),
    organization_id BIGINT REFERENCES ataraxia.organizations(id),
    therapist_id BIGINT NOT NULL REFERENCES ataraxia.users(id),
    client_id BIGINT REFERENCES ataraxia.users(id),
    title TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'pending', 'cancelled_patient', 'cancelled_provider', 'completed', 'no_show', 'rescheduled')),
    type TEXT DEFAULT 'video' CHECK (type IN ('video', 'audio', 'in-person', 'chat', 'intake', 'group', 'block', 'internal')),
    is_video_call BOOLEAN DEFAULT TRUE,
    video_room_name TEXT,
    video_url TEXT,
    video_provider TEXT,
    notes TEXT,
    flagged BOOLEAN DEFAULT FALSE,
    flag_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 6. CLINICAL NOTES (Charts)
-- ============================================================================
CREATE SEQUENCE ataraxia.clinical_notes_id_seq START WITH 1000000 INCREMENT BY 1;
CREATE TABLE ataraxia.clinical_notes (
    id BIGINT PRIMARY KEY DEFAULT nextval('ataraxia.clinical_notes_id_seq'),
    organization_id BIGINT REFERENCES ataraxia.organizations(id),
    client_id BIGINT NOT NULL REFERENCES ataraxia.users(id),
    therapist_id BIGINT NOT NULL REFERENCES ataraxia.users(id),
    appointment_id BIGINT REFERENCES ataraxia.appointments(id),
    note_type TEXT CHECK (note_type IN ('soap', 'dap', 'intake', 'treatment_plan', 'progress', 'discharge')),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'signed', 'addended')),
    content_structured JSONB NOT NULL, -- {subjective, objective, assessment, plan, goalsDiscussed, actionItems, summary}
    diagnosis_codes TEXT[],
    signed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Triggers for Timestamps
CREATE OR REPLACE FUNCTION ataraxia.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_orgs BEFORE UPDATE ON ataraxia.organizations FOR EACH ROW EXECUTE PROCEDURE ataraxia.trigger_set_timestamp();
CREATE TRIGGER set_timestamp_users BEFORE UPDATE ON ataraxia.users FOR EACH ROW EXECUTE PROCEDURE ataraxia.trigger_set_timestamp();
CREATE TRIGGER set_timestamp_clients BEFORE UPDATE ON ataraxia.client_profiles FOR EACH ROW EXECUTE PROCEDURE ataraxia.trigger_set_timestamp();
CREATE TRIGGER set_timestamp_therapists BEFORE UPDATE ON ataraxia.therapist_profiles FOR EACH ROW EXECUTE PROCEDURE ataraxia.trigger_set_timestamp();
CREATE TRIGGER set_timestamp_appointments BEFORE UPDATE ON ataraxia.appointments FOR EACH ROW EXECUTE PROCEDURE ataraxia.trigger_set_timestamp();
