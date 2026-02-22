import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { FileText, AlertCircle, Check, Eye, Download } from 'lucide-react';
import { StepProps } from './types';
import { ConsentDocumentModal } from './ConsentDocumentModal';

interface ConsentDocument {
    id: string;
    title: string;
    content: string;
    signatureFields: {
        id: string;
        label: string;
        required: boolean;
    }[];
}

const CONSENT_DOCUMENTS: ConsentDocument[] = [
    {
        id: 'consent-to-treat',
        title: 'Consent to Treat',
        content: `CONSENT FOR TREATMENT

This document outlines your consent to receive mental health services from our practice.

UNDERSTANDING OF SERVICES
I understand that I am seeking services from a licensed mental health professional. The services may include:
- Individual psychotherapy
- Group therapy sessions
- Family or couples counseling
- Psychiatric evaluations and medication management
- Crisis intervention services

TREATMENT PROCESS
I understand that:
1. Therapy involves discussing personal matters and may bring up uncomfortable feelings
2. Progress requires active participation and honest communication
3. The course of treatment will be discussed and may be modified as needed
4. There are no guarantees about the outcome of treatment

CONFIDENTIALITY
I understand that all information disclosed during sessions is confidential, except in situations where:
- There is a risk of harm to myself or others
- There is suspected abuse or neglect of a child, elderly person, or dependent adult
- A court order requires disclosure
- I provide written authorization for release of information

RIGHTS AND RESPONSIBILITIES
As a client, I have the right to:
- Ask questions about my treatment at any time
- Request information about my therapist's qualifications
- Participate in treatment planning
- Refuse or discontinue treatment
- Request a second opinion
- File a complaint if I believe my rights have been violated

I understand that I am responsible for:
- Attending scheduled appointments or providing 24-hour notice for cancellations
- Paying for services as agreed
- Actively participating in my treatment
- Following safety plans when appropriate

EMERGENCY SERVICES
I understand that this practice does not provide 24-hour crisis services. In case of emergency, I should:
- Call 911
- Go to the nearest emergency room
- Call the National Suicide Prevention Lifeline at 988

By signing below, I acknowledge that I have read and understood this consent for treatment, have had the opportunity to ask questions, and agree to participate in mental health services.`,
        signatureFields: [
            { id: 'signature', label: 'Your Signature', required: true },
            { id: 'date', label: 'Date', required: true }
        ]
    },
    {
        id: 'hipaa-privacy',
        title: 'HIPAA Notice of Privacy Practices',
        content: `NOTICE OF PRIVACY PRACTICES

This notice describes how medical information about you may be used and disclosed and how you can get access to this information.

YOUR RIGHTS REGARDING YOUR HEALTH INFORMATION

You have the following rights regarding your protected health information (PHI):

RIGHT TO INSPECT AND COPY
You have the right to inspect and obtain a copy of your PHI that may be used to make decisions about your care. To inspect or copy your PHI, you must submit a written request to our Privacy Officer.

RIGHT TO AMEND
If you believe that information in your record is incorrect or incomplete, you may request that we amend it. Your request must be in writing and include the reason for your request.

RIGHT TO AN ACCOUNTING OF DISCLOSURES
You have the right to request an accounting of certain disclosures of your PHI made by us. This does not include disclosures for treatment, payment, or healthcare operations.

RIGHT TO REQUEST RESTRICTIONS
You have the right to request restrictions on certain uses and disclosures of your PHI. We are not required to agree to your request, except in certain circumstances involving payment and health care operations.

RIGHT TO REQUEST CONFIDENTIAL COMMUNICATIONS
You have the right to request that we communicate with you about your PHI in a certain way or at a certain location.

RIGHT TO A PAPER COPY OF THIS NOTICE
You have the right to obtain a paper copy of this notice, even if you have agreed to receive it electronically.

HOW WE MAY USE AND DISCLOSE YOUR HEALTH INFORMATION

TREATMENT
We may use and disclose your PHI to provide, coordinate, or manage your healthcare and related services. This includes consultation with other healthcare providers.

PAYMENT
We may use and disclose your PHI to obtain payment for services we provide. This may include billing activities and collections.

HEALTHCARE OPERATIONS
We may use and disclose your PHI for healthcare operations, including quality assessment, credentialing, and business planning.

REQUIRED BY LAW
We may use and disclose your PHI when required to do so by federal, state, or local law.

PUBLIC HEALTH ACTIVITIES
We may disclose your PHI for public health activities such as reporting disease, injury, or vital events.

ABUSE OR NEGLECT
We may disclose your PHI to appropriate authorities if we reasonably believe you are a victim of abuse, neglect, or domestic violence.

SERIOUS THREAT TO HEALTH OR SAFETY
We may use and disclose your PHI when necessary to prevent a serious threat to your health and safety or the health and safety of others.

COMPLAINTS
If you believe your privacy rights have been violated, you may file a complaint with our Privacy Officer or with the Secretary of the Department of Health and Human Services. You will not be retaliated against for filing a complaint.

By signing below, I acknowledge that I have received and reviewed the Notice of Privacy Practices.`,
        signatureFields: [
            { id: 'signature', label: 'Your Signature', required: true },
            { id: 'date', label: 'Date', required: true }
        ]
    },
    {
        id: 'financial-policy',
        title: 'Financial Policy Agreement',
        content: `FINANCIAL POLICY AGREEMENT

Thank you for choosing our practice. We are committed to providing you with quality mental health care. Please read and understand our financial policy.

PAYMENT RESPONSIBILITY
Payment is due at the time services are rendered. We accept cash, checks, credit cards, and debit cards. If you are using insurance, you are responsible for any deductibles, co-payments, or non-covered services.

INSURANCE
We participate with many insurance plans. However, insurance is a contract between you and your insurance company. You are responsible for:
- Knowing your mental health benefits
- Understanding your coverage limitations
- Providing accurate insurance information
- Paying any amounts not covered by your insurance

We will bill your insurance company as a courtesy, but you are ultimately responsible for payment of services rendered.

FEES FOR SERVICES
Our standard fees are:
- Initial Evaluation (60-90 minutes): $200-$250
- Individual Therapy (50 minutes): $150
- Family/Couples Therapy (50 minutes): $175
- Group Therapy (90 minutes): $75
- Medication Management (30 minutes): $125

Fees are subject to change with 30 days notice.

CANCELLATION POLICY
We require 24 hours advance notice for cancellations or rescheduling. Late cancellations and no-shows will be charged the full session fee and are not billable to insurance.

LATE ARRIVALS
If you arrive more than 15 minutes late for your appointment, your therapist may need to reschedule, and you may be charged the full session fee.

TELEPHONE CONSULTATIONS
Brief telephone calls (under 10 minutes) are not charged. Longer consultations will be billed at the therapist's hourly rate, prorated to 15-minute increments.

COURT APPEARANCES
If you involve your therapist in legal proceedings, there is a fee of $400 per hour (including preparation and travel time) with a 4-hour minimum. Payment is required in advance.

COLLECTIONS
In the event that your account is sent to collections, you will be responsible for all collection costs, including attorney fees and court costs.

SLIDING SCALE
We offer a limited number of sliding scale slots for clients experiencing financial hardship. Please speak with our billing department to see if you qualify.

GOOD FAITH ESTIMATE
Under the No Surprises Act, you have the right to receive a Good Faith Estimate of expected charges for services. Please request this from our billing office.

By signing below, I acknowledge that I have read, understand, and agree to this financial policy. I accept financial responsibility for all charges incurred.`,
        signatureFields: [
            { id: 'signature', label: 'Your Signature', required: true },
            { id: 'date', label: 'Date', required: true }
        ]
    },
    {
        id: 'telehealth-consent',
        title: 'Telehealth Consent',
        content: `INFORMED CONSENT FOR TELEHEALTH SERVICES

This document outlines the terms and conditions for receiving mental health services via telehealth.

DEFINITION OF TELEHEALTH
Telehealth involves the use of electronic communications to enable healthcare providers to deliver services remotely. This may include video conferencing, telephone calls, and secure messaging.

BENEFITS OF TELEHEALTH
- Increased access to care, especially for those in remote areas
- Convenience and flexibility in scheduling
- Reduced travel time and associated costs
- Continuity of care when in-person sessions are not possible

POTENTIAL RISKS OF TELEHEALTH
Despite our efforts to ensure secure communication, there are potential risks:
- Technology failures or interruptions
- Unauthorized access to protected health information
- Difficulty ensuring the client's physical safety during crisis situations
- Limitations in the therapist's ability to observe non-verbal cues

TECHNOLOGY REQUIREMENTS
To participate in telehealth sessions, you will need:
- A device with a camera and microphone (computer, tablet, or smartphone)
- Reliable internet connection
- A private space where you can speak freely

PRIVACY AND CONFIDENTIALITY
We use HIPAA-compliant video conferencing platforms to protect your privacy. However, you are responsible for:
- Ensuring you are in a private location during sessions
- Using a secure internet connection (avoid public WiFi)
- Protecting your device with passwords and security measures

EMERGENCIES
In case of a mental health emergency during a telehealth session:
1. Inform your therapist immediately
2. Your therapist may contact emergency services on your behalf
3. Be prepared to provide your current location
4. Have emergency contact information readily available

Please provide your current physical location for each telehealth session.

SESSION PROCEDURES
- Sessions will begin and end on time, just like in-person appointments
- The same cancellation policy applies to telehealth sessions
- Technical issues do not excuse missed appointments without prior notice
- If we experience technical difficulties, we will attempt to reconnect or continue by phone

LIMITATIONS
Telehealth may not be appropriate for all situations. Your therapist will assess whether telehealth is suitable for your needs and may recommend in-person sessions when necessary.

CONSENT TO RECORD
Sessions will not be recorded unless you provide explicit written consent. You are also prohibited from recording sessions without consent.

By signing below, I consent to receiving mental health services via telehealth. I understand the potential risks and benefits, and I agree to the terms outlined above.`,
        signatureFields: [
            { id: 'signature', label: 'Your Signature', required: true },
            { id: 'date', label: 'Date', required: true }
        ]
    },
    {
        id: 'data-usage-consent',
        title: 'Data Usage & AI Safety Monitoring',
        content: `CONSENT FOR DATA USAGE AND AI-ASSISTED SAFETY MONITORING

PURPOSE OF THIS CONSENT
This document explains how your clinical data will be used to provide you with the best possible care, including the use of AI-assisted tools for safety monitoring and treatment planning.

DATA COLLECTION
We collect various types of information to provide comprehensive mental health services:
- Demographic information
- Clinical assessments and diagnoses
- Treatment notes and progress reports
- Safety screening data
- Medication information
- Insurance and billing information

HOW YOUR DATA WILL BE USED

1. THERAPIST MATCHING
Your assessment data helps us match you with a therapist who specializes in your specific needs and concerns. Our AI-assisted matching system considers:
- Your presenting concerns and symptoms
- Severity and complexity of your situation
- Preferred treatment modalities
- Therapist specialties and experience
- Cultural and linguistic considerations

2. PERSONALIZED CARE RECOMMENDATIONS
We use your data to:
- Identify appropriate treatment interventions
- Recommend evidence-based therapeutic approaches
- Suggest community resources and support services
- Track your progress over time

3. SAFETY RISK MONITORING
Your safety screening data is analyzed to:
- Identify acute safety risks requiring immediate attention
- Predict potential crisis situations before they escalate
- Ensure appropriate level of care
- Trigger safety protocols when necessary
- Alert clinical staff to high-risk situations

4. CLINICAL PREPARATION
Before your sessions, your therapist will review:
- Recent safety screenings
- Progress notes from previous sessions
- Changes in symptoms or medications
- Areas of concern flagged by our monitoring systems

5. CASE SEVERITY CLASSIFICATION
We classify cases by severity to ensure:
- Appropriate allocation of clinical resources
- Timely response to urgent situations
- Proper level of clinical oversight
- Effective care coordination

ROLE OF ARTIFICIAL INTELLIGENCE
We use AI-assisted tools to enhance clinical decision-making. These tools:
- Analyze patterns in safety screening responses
- Flag concerning changes in symptoms or behavior
- Suggest evidence-based treatment approaches
- Predict potential risks based on clinical data

IMPORTANT: AI tools assist but never replace human clinical judgment. All AI-generated recommendations are reviewed and approved by licensed clinicians.

DATA SECURITY AND PRIVACY
Your data is protected by:
- HIPAA-compliant security measures
- Encrypted storage and transmission
- Restricted access limited to authorized personnel
- Regular security audits and updates

HOW YOUR DATA WILL NOT BE USED
We will never:
- Sell your data to third parties
- Use your data for marketing purposes without consent
- Share your data with unauthorized individuals or organizations
- Make treatment decisions based solely on AI recommendations

YOUR RIGHTS
You have the right to:
- Access your data and request corrections
- Request a human review of any AI-assisted decisions
- Opt-out of AI-assisted matching (though this may limit available options)
- Withdraw consent at any time (this may affect our ability to provide services)

DATA RETENTION
We retain your clinical data according to state and federal regulations, typically 7 years after your last appointment.

RESEARCH
De-identified, aggregated data may be used for research purposes to improve mental health services. Individual identifiable information is never used for research without explicit additional consent.

QUESTIONS AND CONCERNS
If you have questions about how your data is used or concerns about privacy, please contact our Privacy Officer.

By signing below, I consent to the collection, use, and analysis of my clinical data as described above, including the use of AI-assisted tools for safety monitoring and care optimization.`,
        signatureFields: [
            { id: 'signature', label: 'Your Signature', required: true },
            { id: 'date', label: 'Date', required: true }
        ]
    }
];

export function ConsentFormsStep({ formData, updateFormData }: StepProps) {
    const [selectedDocument, setSelectedDocument] = useState<ConsentDocument | null>(null);
    const [signedDocuments, setSignedDocuments] = useState<string[]>([]);

    // Load signed documents from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('clientConsentDocuments');
        if (stored) {
            const signed = JSON.parse(stored);
            setSignedDocuments(signed);

            // Update form data based on signed documents
            updateFormData('consentToTreat', signed.includes('consent-to-treat'));
            updateFormData('hipaaConsent', signed.includes('hipaa-privacy'));
            updateFormData('financialPolicyConsent', signed.includes('financial-policy'));
            updateFormData('telehealthConsent', signed.includes('telehealth-consent'));
            updateFormData('dataUsageConsent', signed.includes('data-usage-consent'));
        }
    }, []);

    const handleDocumentSigned = (documentId: string) => {
        const newSignedDocs = [...signedDocuments, documentId];
        setSignedDocuments(newSignedDocs);

        // Update individual form fields
        if (documentId === 'consent-to-treat') updateFormData('consentToTreat', true);
        if (documentId === 'hipaa-privacy') updateFormData('hipaaConsent', true);
        if (documentId === 'financial-policy') updateFormData('financialPolicyConsent', true);
        if (documentId === 'telehealth-consent') updateFormData('telehealthConsent', true);
        if (documentId === 'data-usage-consent') updateFormData('dataUsageConsent', true);
    };

    const handleViewDocument = (doc: ConsentDocument) => {
        setSelectedDocument(doc);
    };

    const handleDownloadDocument = (doc: ConsentDocument) => {
        const isSigned = signedDocuments.includes(doc.id);
        if (!isSigned) {
            return;
        }

        // Create a simple text file for download
        const element = document.createElement('a');
        const file = new Blob([doc.content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `${doc.title.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const allRequiredSigned = CONSENT_DOCUMENTS.every(doc => signedDocuments.includes(doc.id));

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold mb-2">Consent & Legal Documents</h2>
                <p className="text-sm text-gray-500">Review and sign all required documents to proceed</p>
            </div>

            {/* Progress Summary */}
            <Card className="border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-700">Signing Progress</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {signedDocuments.length} / {CONSENT_DOCUMENTS.length}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Documents signed</p>
                        </div>
                        {allRequiredSigned && (
                            <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                                <Check className="w-5 h-5" />
                                <span className="font-medium">All Complete!</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Document List */}
            <div className="space-y-3">
                {CONSENT_DOCUMENTS.map((doc) => {
                    const isSigned = signedDocuments.includes(doc.id);
                    const signedDate = isSigned ? localStorage.getItem(`consent_${doc.id}_date`) : null;

                    return (
                        <Card
                            key={doc.id}
                            className={`border-2 transition-all hover:shadow-md ${isSigned ? 'border-green-200 bg-green-50/30' : 'border-gray-200'
                                }`}
                        >
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 flex-1">
                                        <div className={`p-2 rounded-lg ${isSigned ? 'bg-green-100' : 'bg-gray-100'}`}>
                                            <FileText className={`w-5 h-5 ${isSigned ? 'text-green-700' : 'text-gray-600'}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-gray-900">{doc.title}</h3>
                                                {isSigned && (
                                                    <Badge className="bg-green-600 hover:bg-green-600 text-white">
                                                        <Check className="w-3 h-3 mr-1" />
                                                        Signed
                                                    </Badge>
                                                )}
                                            </div>
                                            {isSigned && signedDate && (
                                                <p className="text-xs text-gray-500">Signed on {signedDate}</p>
                                            )}
                                            {!isSigned && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Required • Review and sign this document
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {!isSigned ? (
                                            <Button
                                                onClick={() => handleViewDocument(doc)}
                                                className="bg-[#F97316] hover:bg-[#ea6b0f] text-white"
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                Review & Sign
                                            </Button>
                                        ) : (
                                            <>
                                                <Button
                                                    onClick={() => handleViewDocument(doc)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-gray-300"
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View
                                                </Button>
                                                <Button
                                                    onClick={() => handleDownloadDocument(doc)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-gray-300"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Legal Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-900">
                        <p className="font-medium mb-1">Important Legal Information</p>
                        <p>
                            By signing these documents electronically using the signature canvas, you are providing a
                            legally binding signature equivalent to a handwritten signature. All documents must be
                            signed to proceed with registration.
                        </p>
                    </div>
                </div>
            </div>

            {/* Document Modal */}
            {selectedDocument && (
                <ConsentDocumentModal
                    document={selectedDocument}
                    isOpen={!!selectedDocument}
                    onClose={() => setSelectedDocument(null)}
                    onSigned={handleDocumentSigned}
                />
            )}
        </div>
    );
}