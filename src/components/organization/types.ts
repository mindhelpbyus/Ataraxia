// Organization data types and interfaces

export type UserRole = 'client' | 'therapist' | 'receptionist';

export interface ServiceLocation {
    id: string;
    name: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone: string;
    phoneCountryCode: string;
    isPrimary: boolean;
}

export interface OrganizationData {
    // A. Basic Details
    organizationName: string;
    legalName: string;
    dba?: string;
    taxId: string;
    npi?: string;
    organizationType: string;
    primaryContactName: string;
    primaryContactEmail: string;
    primaryContactPhone: string;
    primaryContactCountryCode: string;
    hqAddress1: string;
    hqAddress2: string;
    hqCity: string;
    hqState: string;
    hqZip: string;
    hqCountry: string;
    billingAddressSameAsHQ: boolean;
    billingAddress1?: string;
    billingAddress2?: string;
    billingCity?: string;
    billingState?: string;
    billingZip?: string;
    billingCountry?: string;
    timezone: string;
    serviceLocations: ServiceLocation[];

    // India-specific compliance (only for IN organizations)
    indiaEntityType?: 'pvt-ltd-llp' | 'sole-proprietor' | 'trust-ngo';
    indiaCIN?: string; // For Pvt Ltd / LLP
    indiaLLPIN?: string; // For LLP
    indiaIncorporationCert?: File;
    indiaPAN?: string;
    indiaGSTIN?: string;
    indiaBankName?: string;
    indiaBankAccountNumber?: string;
    indiaBankIFSC?: string;
    indiaCancelledCheque?: File;
    indiaSignatoryPAN?: string;
    indiaSignatoryAadhaar?: string;
    indiaSignatoryPassport?: string;
    indiaTrustDeed?: File;
    indiaAddressProof?: File;

    // B. Size & Structure
    numberOfClinicians: number;
    numberOfAdminStaff: number;
    numberOfLocations: number;
    departments: string[];
    divisions: string[];
    organizationStructure?: string;

    // C. Compliance
    hipaaBAASigned: boolean;
    dataProcessingAgreementSigned: boolean;
    auditLoggingLevel: string;
    mfaRequired: boolean;
    passwordMinLength: number;
    passwordRotationDays: number;
    sessionTimeoutMinutes: number;
    ipAllowlist?: string[];

    // D. Branding
    logo?: File;
    brandColorPrimary: string;
    brandColorSecondary: string;
    customDomain?: string;
    emailSenderName: string;
    smsSenderName: string;
    customLoginBranding: boolean;

    // E. Billing & Subscription
    subscriptionPlan: string;
    billingContactName: string;
    billingContactEmail: string;
    paymentMethod: string;

    // Billing Configuration
    billingModel: string; // per-session / per-therapist / per-resource
    ratePerSession?: number;
    ratePerTherapistMonth?: number;
    ratePerSessionType?: {
        therapy?: number;
        couples?: number;
        intake?: number;
    };
    billingCycle: string; // weekly / monthly
    billingPeriodRules: string; // calendar-month / 30-day
    paymentTerms: string; // Net 15/30, prepaid, autopay

    // Finance Details
    legalBusinessName: string;
    billingAddressLine1: string;
    billingAddressLine2?: string;
    billingAddressCity: string;
    billingAddressState: string;
    billingAddressZip: string;
    billingAddressCountry: string;
    billingEmail: string;
    poNumber?: string;
    taxIdEin?: string; // US EIN
    gstin?: string; // India GSTIN

    // Contract Rules
    cancellationPolicy: string;
    noShowPolicy: string;
    reschedulePolicy: string;
    disputeWindow: string; // e.g., "14 days"

    // F. Insurance & Payor
    acceptedInsurancePlans: string[];
    clearinghouseProvider?: string;
    ediEnrolled: boolean;

    // G. Clinical Workflow
    defaultSessionTypes: string[];
    defaultSessionDuration: number;
    consentForms: string[];
    documentationTemplates: string[];
    telehealthProvider: string;

    // H. Staff Management
    supervisorHierarchy: boolean;
    caseloadLimitsEnabled: boolean;

    // I. Integrations
    ehrIntegration?: string;
    videoProvider: string;
    calendarIntegration?: string;
    identityProvider?: string;

    // J. Analytics
    analyticsEnabled: boolean;
    revenueReports: boolean;
    clinicalOutcomes: boolean;

    // K. Communications
    appointmentReminders: boolean;
    smsEnabled: boolean;
    emailEnabled: boolean;

    // L. Data Import
    dataImportPlanned: boolean;
    recordCount?: number;
}

export interface StepProps {
    formData: OrganizationData;
    updateFormData: (field: string, value: any) => void;
    toggleArrayValue?: (field: keyof OrganizationData, value: string) => void;
    addServiceLocation?: () => void;
    updateServiceLocation?: (id: string, field: string, value: any) => void;
    removeServiceLocation?: (id: string) => void;
}
