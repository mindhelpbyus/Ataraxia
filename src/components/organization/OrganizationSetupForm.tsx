import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { toast } from 'sonner';
import { Check, ChevronRight, ChevronLeft } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { OrganizationData, ServiceLocation } from './types';
import { BasicDetailsStep } from './BasicDetailsStep';
import { OrganizationSizeStep } from './OrganizationSizeStep';
import { BillingSubscriptionStep } from './BillingSubscriptionStep';
import { AnalyticsReportsStep } from './AnalyticsReportsStep';
import { CommunicationsStep } from './CommunicationsStep';

interface Props {
    onComplete: (data: OrganizationData) => void;
    onCancel?: () => void;
    editMode?: boolean;
    existingData?: Partial<OrganizationData>;
}

export function OrganizationSetupForm({ onComplete, onCancel, editMode = false, existingData }: Props) {
    const [currentStep, setCurrentStep] = useState<number>(1);
    const totalSteps = 5;

    // Form data state
    const [formData, setFormData] = useState<OrganizationData>({
        organizationName: existingData?.organizationName || '',
        legalName: existingData?.legalName || '',
        taxId: existingData?.taxId || '',
        organizationType: existingData?.organizationType || '',
        primaryContactName: existingData?.primaryContactName || '',
        primaryContactEmail: existingData?.primaryContactEmail || '',
        primaryContactPhone: existingData?.primaryContactPhone || '',
        primaryContactCountryCode: existingData?.primaryContactCountryCode || '+1',
        hqAddress1: existingData?.hqAddress1 || '',
        hqAddress2: existingData?.hqAddress2 || '',
        hqCity: existingData?.hqCity || '',
        hqState: existingData?.hqState || '',
        hqZip: existingData?.hqZip || '',
        hqCountry: existingData?.hqCountry || 'US',
        billingAddressSameAsHQ: existingData?.billingAddressSameAsHQ ?? true,
        billingAddress1: existingData?.billingAddress1 || '',
        billingAddress2: existingData?.billingAddress2 || '',
        billingCity: existingData?.billingCity || '',
        billingState: existingData?.billingState || '',
        billingZip: existingData?.billingZip || '',
        billingCountry: existingData?.billingCountry || 'US',
        timezone: existingData?.timezone || 'America/New_York',
        serviceLocations: existingData?.serviceLocations || [],
        numberOfClinicians: existingData?.numberOfClinicians || 1,
        numberOfAdminStaff: existingData?.numberOfAdminStaff || 0,
        numberOfLocations: existingData?.numberOfLocations || 1,
        departments: existingData?.departments || [],
        divisions: existingData?.divisions || [],
        hipaaBAASigned: existingData?.hipaaBAASigned || false,
        dataProcessingAgreementSigned: existingData?.dataProcessingAgreementSigned || false,
        auditLoggingLevel: existingData?.auditLoggingLevel || 'standard',
        mfaRequired: existingData?.mfaRequired || true,
        passwordMinLength: existingData?.passwordMinLength || 12,
        passwordRotationDays: existingData?.passwordRotationDays || 90,
        sessionTimeoutMinutes: existingData?.sessionTimeoutMinutes || 30,
        brandColorPrimary: existingData?.brandColorPrimary || '#F97316',
        brandColorSecondary: existingData?.brandColorSecondary || '#F59E0B',
        emailSenderName: existingData?.emailSenderName || '',
        smsSenderName: existingData?.smsSenderName || '',
        customLoginBranding: existingData?.customLoginBranding || false,
        subscriptionPlan: existingData?.subscriptionPlan || '',
        billingContactName: existingData?.billingContactName || '',
        billingContactEmail: existingData?.billingContactEmail || '',
        paymentMethod: existingData?.paymentMethod || '',
        billingModel: existingData?.billingModel || '',
        billingCycle: existingData?.billingCycle || '',
        billingPeriodRules: existingData?.billingPeriodRules || '',
        paymentTerms: existingData?.paymentTerms || '',
        legalBusinessName: existingData?.legalBusinessName || '',
        billingAddressLine1: existingData?.billingAddressLine1 || '',
        billingAddressCity: existingData?.billingAddressCity || '',
        billingAddressState: existingData?.billingAddressState || '',
        billingAddressZip: existingData?.billingAddressZip || '',
        billingAddressCountry: existingData?.billingAddressCountry || '',
        billingEmail: existingData?.billingEmail || '',
        cancellationPolicy: existingData?.cancellationPolicy || '',
        noShowPolicy: existingData?.noShowPolicy || '',
        reschedulePolicy: existingData?.reschedulePolicy || '',
        disputeWindow: existingData?.disputeWindow || '',
        acceptedInsurancePlans: existingData?.acceptedInsurancePlans || [],
        ediEnrolled: existingData?.ediEnrolled || false,
        defaultSessionTypes: existingData?.defaultSessionTypes || ['therapy'],
        defaultSessionDuration: existingData?.defaultSessionDuration || 50,
        consentForms: existingData?.consentForms || [],
        documentationTemplates: existingData?.documentationTemplates || [],
        telehealthProvider: existingData?.telehealthProvider || 'jitsi',
        supervisorHierarchy: existingData?.supervisorHierarchy || false,
        caseloadLimitsEnabled: existingData?.caseloadLimitsEnabled || false,
        videoProvider: existingData?.videoProvider || 'jitsi',
        analyticsEnabled: existingData?.analyticsEnabled || true,
        revenueReports: existingData?.revenueReports || true,
        clinicalOutcomes: existingData?.clinicalOutcomes || true,
        appointmentReminders: existingData?.appointmentReminders || true,
        smsEnabled: existingData?.smsEnabled || true,
        emailEnabled: existingData?.emailEnabled || true,
        dataImportPlanned: existingData?.dataImportPlanned || false,
    });

    const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;

    // Step configuration
    const stepTitles = [
        'Basic Details',
        'Organization Size',
        'Billing',
        'Analytics & Reports',
        'Communications'
    ];

    // Update form data
    const updateFormData = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Toggle array values
    const toggleArrayValue = (field: keyof OrganizationData, value: string) => {
        const currentArray = (formData[field] as string[]) || [];
        const newArray = currentArray.includes(value)
            ? currentArray.filter(item => item !== value)
            : [...currentArray, value];
        updateFormData(field, newArray);
    };

    // Add service location
    const addServiceLocation = () => {
        const newLocation: ServiceLocation = {
            id: Date.now().toString(),
            name: '',
            address1: '',
            address2: '',
            city: '',
            state: '',
            zip: '',
            country: 'US',
            phone: '',
            phoneCountryCode: '+1',
            isPrimary: formData.serviceLocations.length === 0
        };
        updateFormData('serviceLocations', [...formData.serviceLocations, newLocation]);
    };

    // Update service location
    const updateServiceLocation = (id: string, field: string, value: any) => {
        const updated = formData.serviceLocations.map(loc =>
            loc.id === id ? { ...loc, [field]: value } : loc
        );
        updateFormData('serviceLocations', updated);
    };

    // Remove service location
    const removeServiceLocation = (id: string) => {
        updateFormData('serviceLocations', formData.serviceLocations.filter(loc => loc.id !== id));
    };

    // Validate current step
    const validateStep = (): boolean => {
        switch (currentStep) {
            case 1:
                return !!(
                    formData.organizationName &&
                    formData.legalName &&
                    formData.taxId &&
                    formData.organizationType &&
                    formData.primaryContactName &&
                    formData.primaryContactEmail &&
                    formData.primaryContactPhone
                );
            case 2:
                return formData.numberOfClinicians > 0;
            case 3:
                return !!(formData.subscriptionPlan && formData.billingContactEmail);
            case 4:
                return true;
            case 5:
                return true;
            default:
                return true;
        }
    };

    // Handle next step
    const handleNext = () => {
        if (!validateStep()) {
            toast.error('Please complete all required fields');
            return;
        }
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    // Handle previous step
    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Handle form submission
    const handleSubmit = () => {
        toast.success(editMode ? 'Organization Updated! 🎉' : 'Organization Created! 🎉', {
            description: 'The organization has been successfully configured'
        });
        onComplete(formData);
    };

    // Render current step content
    const renderStepContent = () => {
        const stepProps = {
            formData,
            updateFormData,
            toggleArrayValue,
            addServiceLocation,
            updateServiceLocation,
            removeServiceLocation
        };

        switch (currentStep) {
            case 1:
                return <BasicDetailsStep {...stepProps} />;
            case 2:
                return <OrganizationSizeStep {...stepProps} />;
            case 3:
                return <BillingSubscriptionStep {...stepProps} />;
            case 4:
                return <AnalyticsReportsStep {...stepProps} />;
            case 5:
                return <CommunicationsStep {...stepProps} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-5xl mx-auto">
                {/* Progress Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4 gap-4">
                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-muted-foreground">
                                Step {currentStep} of {totalSteps}
                            </h3>
                            <h2 className="text-xl font-semibold">{stepTitles[currentStep - 1]}</h2>
                        </div>

                        {/* Step Navigation Dropdown */}
                        <div className="flex items-center gap-3">
                            <div className="min-w-[200px]">
                                <Select
                                    value={currentStep.toString()}
                                    onValueChange={(value) => setCurrentStep(parseInt(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Jump to step..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {stepTitles.map((title, index) => (
                                            <SelectItem key={index + 1} value={(index + 1).toString()}>
                                                Step {index + 1}: {title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Badge variant="outline">
                                {Math.round(progressPercent)}% Complete
                            </Badge>
                        </div>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                </div>

                {/* Step Content */}
                <div className="mb-8">
                    {renderStepContent()}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handlePrevious}
                            disabled={currentStep === 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Previous
                        </Button>
                        {onCancel && (
                            <Button variant="ghost" onClick={onCancel}>
                                Cancel
                            </Button>
                        )}
                    </div>
                    <Button
                        onClick={handleNext}
                        disabled={!validateStep()}
                        size="lg"
                    >
                        {currentStep === totalSteps ? (
                            <>
                                <Check className="h-4 w-4 mr-2" />
                                {editMode ? 'Update Organization' : 'Create Organization'}
                            </>
                        ) : (
                            <>
                                Next Step
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
