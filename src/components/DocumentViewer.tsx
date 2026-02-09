import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import {
    ArrowLeft,
    Download,
    ZoomIn,
    ZoomOut,
    Maximize2,
    Check,
    X,
    PenTool
} from 'lucide-react';

interface DocumentData {
    id: string;
    title: string;
    content: string;
    requiresSignature: boolean;
    signatureFields: {
        id: string;
        label: string;
        required: boolean;
    }[];
}

export default function DocumentViewer() {
    const { documentId } = useParams();
    const navigate = useNavigate();
    const signatureCanvasRef = useRef<SignatureCanvas>(null);

    const [zoom, setZoom] = useState(100);
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [currentSignatureField, setCurrentSignatureField] = useState<string | null>(null);
    const [signatures, setSignatures] = useState<Record<string, string>>({});
    const [documentSigned, setDocumentSigned] = useState(false);

    // Renamed to docData to avoid shadowing global 'document'
    const [docData, setDocData] = useState<DocumentData | null>(null);

    useEffect(() => {
        // Check if document is already signed
        const stored = localStorage.getItem('signedDocuments');
        if (stored && documentId) {
            const signedDocs = JSON.parse(stored);
            if (signedDocs.includes(documentId)) {
                setDocumentSigned(true);
            }
        }

        // Auto-fill date field with today's date
        const todayDate = new Date().toISOString().split('T')[0];
        setSignatures((prev) => ({
            ...prev,
            date: todayDate,
        }));

        // Mock loading document data
        const mockDocuments: Record<string, DocumentData> = {
            '1': {
                id: '1',
                title: 'Therapist Onboarding Agreement',
                content: `
THERAPIST ONBOARDING AGREEMENT

This Agreement is entered into between [Platform Name] and the Therapist, governing the terms of professional engagement on the platform.

1. SCOPE OF PRACTICE
The Therapist agrees to provide mental health services in accordance with:
- Rehabilitation Council of India (RCI) guidelines
- Mental Healthcare Act, 2017
- Professional ethical standards and code of conduct

2. PLATFORM LIABILITY
The Platform provides a technology infrastructure for connecting therapists with clients. The Platform:
- Does not provide medical advice or mental health services directly
- Is not responsible for the professional conduct of individual therapists
- Maintains insurance coverage for platform operations only

3. PROFESSIONAL RESPONSIBILITIES
The Therapist shall:
- Maintain valid RCI registration throughout the engagement
- Carry professional liability insurance with minimum coverage of INR 10,00,00,000
- Comply with all applicable laws and regulations
- Maintain client confidentiality per DPDP Act, 2023
- Report any adverse events or ethical violations

4. COMPENSATION AND FEES
- Therapist fee structure: [Details]
- Platform commission: [Percentage]
- Payment terms: Net 15 days
- Tax responsibilities: Therapist is responsible for all applicable taxes

5. TERMINATION
Either party may terminate this agreement with 30 days written notice.

6. DISPUTE RESOLUTION
Any disputes shall be resolved through arbitration in accordance with the Arbitration and Conciliation Act, 1996.

By signing below, you acknowledge that you have read, understood, and agree to be bound by the terms of this Agreement.
        `,
                requiresSignature: true,
                signatureFields: [
                    { id: 'therapist-signature', label: 'Therapist Signature', required: true },
                    { id: 'date', label: 'Date', required: true },
                ],
            },
            '2': {
                id: '2',
                title: 'Patient Informed Consent',
                content: `
PATIENT INFORMED CONSENT FOR TELE-MENTAL HEALTH SERVICES

This consent form complies with the Mental Healthcare Act, 2017 and establishes the terms for providing mental health services via telecommunication.

1. NATURE OF TELE-MENTAL HEALTH SERVICES
Tele-mental health involves the delivery of mental health services using technology including:
- Video conferencing
- Telephone consultations
- Secure messaging platforms
- Digital assessment tools

2. BENEFITS AND RISKS
Benefits:
- Convenient access to mental health care
- Reduced travel time and costs
- Continuity of care regardless of location
- Access to specialists who may not be locally available

Risks:
- Technical difficulties may interrupt sessions
- Privacy concerns with electronic communication
- Limitations in emergency situations
- Reduced ability to observe non-verbal cues

3. CONFIDENTIALITY AND PRIVACY
- All sessions are confidential per DPDP Act, 2023
- Electronic records are encrypted and stored securely
- Video/audio recordings are not made without explicit consent
- Exceptions to confidentiality include imminent risk of harm

4. EMERGENCY PROTOCOLS
In case of emergency:
- Client should call local emergency services (112, 100)
- Therapist will provide crisis resources and referrals
- Tele-health is not suitable for acute psychiatric emergencies

5. TECHNOLOGY REQUIREMENTS
- Stable internet connection required
- Private, quiet space for sessions
- Compatible device (computer, tablet, or smartphone)
- Updated browser or app

6. FEES AND CANCELLATION
- Session fees as per agreed schedule
- 24-hour cancellation notice required
- Technical issues resulting in session interruption will not be charged

By signing below, you acknowledge that you have read and understood this consent form and agree to participate in tele-mental health services.
        `,
                requiresSignature: true,
                signatureFields: [
                    { id: 'patient-signature', label: 'Patient/Client Signature', required: true },
                    { id: 'date', label: 'Date', required: true },
                ],
            },
            '3': {
                id: '3',
                title: 'Privacy & Data Protection Policy',
                content: `
PRIVACY & DATA PROTECTION POLICY

Effective Date: February 9, 2026
Last Updated: February 9, 2026

This policy complies with the Digital Personal Data Protection Act, 2023 (DPDP Act) and Information Technology Act, 2000.

1. DATA COLLECTION
We collect the following types of data:
- Personal identification information (name, email, phone number)
- Health information (mental health assessment, treatment notes)
- Technical data (IP address, device information, session logs)
- Payment information (processed through secure third-party processors)

2. PURPOSE OF DATA COLLECTION
Data is collected for the following purposes:
- Providing mental health services
- Maintaining treatment records
- Processing payments
- Improving service quality
- Legal compliance and reporting

3. DATA STORAGE AND SECURITY
- All data is encrypted at rest and in transit (AES-256 encryption)
- ISO 27001 certified data centers in India
- Regular security audits and penetration testing
- Role-based access controls
- Automatic backup and disaster recovery systems

4. DATA SHARING
We do not sell or rent personal data. Data may be shared with:
- Healthcare providers involved in your care (with consent)
- Legal authorities (when legally required)
- Service providers bound by confidentiality agreements
- Insurance companies (with explicit consent for claims)

5. YOUR RIGHTS UNDER DPDP ACT 2023
You have the right to:
- Access your personal data
- Correct inaccurate data
- Request data deletion (subject to legal retention requirements)
- Withdraw consent for data processing
- Lodge complaints with Data Protection Authority

6. DATA RETENTION
- Active treatment records: Duration of treatment + 7 years
- Inactive records: Minimum 10 years as per medical record guidelines
- Payment records: 7 years as per tax requirements
- Marketing consent: Until withdrawn

7. COOKIES AND TRACKING
- Essential cookies for platform functionality
- Analytics cookies (can be disabled)
- No third-party advertising cookies

8. INTERNATIONAL DATA TRANSFERS
- Data is primarily stored within India
- International transfers only with adequate safeguards
- Compliance with cross-border data transfer regulations

9. CHILDREN'S PRIVACY
- Services for children require parental consent
- Special protections for data of minors
- Parental access to child's non-sensitive information

10. CONTACT INFORMATION
Data Protection Officer: [Contact Details]
Email: privacy@platform.com
Address: [Office Address]

By signing below, you acknowledge that you have read and understood this privacy policy.
        `,
                requiresSignature: true,
                signatureFields: [
                    { id: 'user-signature', label: 'Your Signature', required: true },
                    { id: 'date', label: 'Date', required: true },
                ],
            },
            '4': {
                id: '4',
                title: 'Crisis & Emergency Protocol',
                content: `
CRISIS & EMERGENCY PROTOCOL

MANDATORY GUIDELINES FOR MENTAL HEALTH PROFESSIONALS

1. SUICIDE RISK ASSESSMENT
All therapists must conduct suicide risk assessment when:
- Client expresses suicidal ideation
- Client exhibits warning signs of self-harm
- Client has a history of suicide attempts

Risk Assessment Components:
- Intent and plan
- Access to means
- Protective factors
- Previous attempts
- Current mental state

2. DUTY TO PROTECT
Therapists have a legal and ethical duty to:
- Protect clients from harming themselves
- Protect identified third parties from harm
- Report credible threats to appropriate authorities

3. CONFIDENTIALITY BREAK CONDITIONS
Confidentiality may be broken in the following circumstances:
- Imminent risk of suicide or self-harm
- Threat of harm to identified third parties
- Child abuse or neglect (mandatory reporting)
- Elder abuse (mandatory reporting)
- Court orders or legal requirements

4. EMERGENCY RESPONSE PROCEDURES
In case of emergency:
1. Assess immediate risk level
2. Contact emergency services if necessary (dial 112)
3. Notify platform emergency response team
4. Document all actions taken
5. Follow up with client within 24 hours

5. CRISIS RESOURCES
- National Suicide Prevention Helpline: 9152987821
- Mental Health Emergency: 1800-599-0019
- Police Emergency: 100
- Ambulance: 102

6. DOCUMENTATION REQUIREMENTS
All crisis interventions must be documented within 24 hours, including:
- Assessment of risk
- Actions taken
- Resources provided
- Follow-up plan

By signing below, you acknowledge your understanding and commitment to following these emergency protocols.
        `,
                requiresSignature: true,
                signatureFields: [
                    { id: 'therapist-signature', label: 'Therapist Signature', required: true },
                    { id: 'date', label: 'Date', required: true },
                ],
            },
            '5': {
                id: '5',
                title: 'Ethics & Code of Conduct',
                content: `
ETHICS & CODE OF CONDUCT

This document outlines the ethical standards and professional conduct expected of all mental health professionals on this platform, in accordance with the Rehabilitation Council of India (RCI) Code of Ethics.

1. PROFESSIONAL COMPETENCE
Therapists must:
- Practice only within their areas of competence
- Maintain current knowledge through continuing education
- Seek supervision or consultation when needed
- Recognize limitations and refer when appropriate

2. PROFESSIONAL BOUNDARIES
- Maintain appropriate professional relationships with clients
- Avoid dual relationships that could impair professional judgment
- No sexual or romantic relationships with current clients
- Wait minimum 2 years before any relationship with former clients
- No exploitation of the therapeutic relationship for personal gain

3. CONFIDENTIALITY
- Protect client privacy and confidential information
- Discuss confidentiality limits at the start of therapy
- Obtain informed consent before sharing information
- Maintain secure records and communication channels
- Exceptions only as required by law or to prevent harm

4. INFORMED CONSENT
Clients must be informed about:
- Nature and goals of therapy
- Qualifications and approach of the therapist
- Fees and payment policies
- Confidentiality and its limits
- Right to refuse or withdraw from treatment

5. NON-DISCRIMINATION
Therapists must provide services without discrimination based on:
- Race, caste, or ethnicity
- Gender, sexual orientation, or gender identity
- Religion or belief system
- Age or disability
- Socioeconomic status
- Political affiliation

6. PROFESSIONAL RELATIONSHIPS
- Respect colleagues and other professionals
- Collaborate for the benefit of clients
- Address concerns about colleague's ethics appropriately
- Provide accurate information about qualifications
- Acknowledge the contributions of others

7. RESEARCH AND PUBLICATION
- Obtain informed consent for research participation
- Protect participant confidentiality
- Report findings accurately and honestly
- Give proper credit to contributors

8. CULTURAL COMPETENCE
- Respect cultural diversity and individual differences
- Recognize impact of own cultural background
- Seek to understand client's cultural context
- Adapt interventions to be culturally appropriate

9. ADVERTISING AND PUBLIC STATEMENTS
- Represent qualifications accurately
- Avoid false or misleading claims
- Maintain professional dignity in marketing
- Protect client confidentiality in testimonials

10. TECHNOLOGY AND SOCIAL MEDIA
- Maintain professional boundaries online
- Protect client confidentiality in digital communications
- Be aware of technology limitations
- Stay informed about digital ethics issues

11. SELF-CARE
- Maintain personal well-being
- Recognize impact of personal issues on professional work
- Seek help when experiencing personal difficulties
- Take time off when needed to maintain effectiveness

12. REPORTING VIOLATIONS
- Report suspected violations of ethics code
- Cooperate with ethics investigations
- Take responsibility for own ethical violations
- Self-report any personal ethical violations immediately

By signing below, you agree to uphold these ethical standards and code of conduct in all professional activities.
        `,
                requiresSignature: true,
                signatureFields: [
                    { id: 'professional-signature', label: 'Professional Signature', required: true },
                    { id: 'date', label: 'Date', required: true },
                ],
            },
        };

        const doc = mockDocuments[(documentId as string) || '1'];
        setDocData(doc || mockDocuments['1']);
    }, [documentId]);

    const handleZoomIn = () => {
        setZoom((prev) => Math.min(prev + 10, 200));
    };

    const handleZoomOut = () => {
        setZoom((prev) => Math.max(prev - 10, 50));
    };

    const handleFullScreen = () => {
        // Correctly using the global document object here
        document.documentElement.requestFullscreen().catch(err => {
            console.error("Error attempting to enable full-screen mode:", err);
        });
    };

    const handleOpenSignatureModal = (fieldId: string) => {
        setCurrentSignatureField(fieldId);
        setShowSignatureModal(true);
    };

    const handleSaveSignature = () => {
        if (signatureCanvasRef.current && currentSignatureField) {
            if (signatureCanvasRef.current.isEmpty()) {
                alert('Please draw your signature before saving');
                return;
            }

            const signatureData = signatureCanvasRef.current.toDataURL();
            setSignatures((prev) => ({
                ...prev,
                [currentSignatureField]: signatureData,
            }));
            setShowSignatureModal(false);
            setCurrentSignatureField(null);
        }
    };

    const handleClearSignature = () => {
        signatureCanvasRef.current?.clear();
    };

    const handleSignDocument = () => {
        if (!docData) return;

        const requiredFields = docData.signatureFields.filter((f) => f.required);
        const allRequiredSigned = requiredFields.every((f) => signatures[f.id]);

        if (!allRequiredSigned) {
            alert('Please complete all required signature fields');
            return;
        }

        // Mark document as signed
        setDocumentSigned(true);

        // Save to localStorage
        const stored = localStorage.getItem('signedDocuments');
        const signedDocs = stored ? JSON.parse(stored) : [];
        if (!signedDocs.includes(docData.id)) {
            signedDocs.push(docData.id);
            localStorage.setItem('signedDocuments', JSON.stringify(signedDocs));
        }

        // Save signature data and date for download
        Object.keys(signatures).forEach((key) => {
            if (signatures[key]) {
                localStorage.setItem(`document_${docData.id}_signature_${key}`, signatures[key]);
            }
        });

        // Save the signing date
        const signedDate = new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
        });
        localStorage.setItem(`document_${docData.id}_date`, signedDate);

        // Log the signed document data
        console.log('Document signed:', {
            documentId: docData.id,
            documentTitle: docData.title,
            signatures: signatures,
            signedAt: new Date().toISOString(),
        });

        alert('Document signed successfully! You can now download it.');

        // Navigate back to the list
        setTimeout(() => {
            // Try to go back to the previous context
            // If opened from a list, this works well.
            navigate(-1);
        }, 1000);
    };

    const handleDownload = () => {
        if (!docData) return;
        alert(`Downloading: ${docData.title}`);
    };

    if (!docData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Loading document...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                                title="Back to Documents"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-lg font-semibold">{docData.title}</h1>
                                {documentSigned && (
                                    <span className="text-sm text-green-600 flex items-center gap-1 mt-1">
                                        <Check className="w-4 h-4" />
                                        Signed
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleZoomOut}
                                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                                title="Zoom Out"
                            >
                                <ZoomOut className="w-5 h-5" />
                            </button>
                            <span className="text-sm text-gray-600 min-w-[60px] text-center">
                                {zoom}%
                            </span>
                            <button
                                onClick={handleZoomIn}
                                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                                title="Zoom In"
                            >
                                <ZoomIn className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleFullScreen}
                                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                                title="Full Screen"
                            >
                                <Maximize2 className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleDownload}
                                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                                title="Download"
                            >
                                <Download className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Document Content */}
            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
                    <div
                        style={{
                            fontSize: `${zoom}%`,
                            transition: 'font-size 0.2s',
                        }}
                        className="prose max-w-none"
                    >
                        <div className="whitespace-pre-wrap leading-relaxed">
                            {docData.content}
                        </div>
                    </div>

                    {/* Signature Fields */}
                    {docData.requiresSignature && docData.signatureFields.length > 0 && (
                        <div className="mt-12 pt-8 border-t border-gray-200">
                            <h3 className="text-lg font-semibold mb-6">Signature Required</h3>
                            <div className="space-y-6">
                                {docData.signatureFields.map((field) => (
                                    <div key={field.id}>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {field.label}
                                            {field.required && (
                                                <span className="text-red-500 ml-1">*</span>
                                            )}
                                        </label>
                                        {field.id === 'date' ? (
                                            <input
                                                type="date"
                                                value={signatures[field.id] || new Date().toISOString().split('T')[0]}
                                                onChange={(e) =>
                                                    setSignatures((prev) => ({
                                                        ...prev,
                                                        [field.id]: e.target.value,
                                                    }))
                                                }
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        ) : (
                                            <div className="relative">
                                                {signatures[field.id] ? (
                                                    <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
                                                        <img
                                                            src={signatures[field.id]}
                                                            alt="Signature"
                                                            className="max-h-24"
                                                        />
                                                        <button
                                                            onClick={() => handleOpenSignatureModal(field.id)}
                                                            className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                                                        >
                                                            Change Signature
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleOpenSignatureModal(field.id)}
                                                        className="w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400 transition-colors flex flex-col items-center justify-center gap-2 text-gray-600"
                                                    >
                                                        <PenTool className="w-6 h-6" />
                                                        <span className="text-sm">Click to sign</span>
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleSignDocument}
                                disabled={documentSigned}
                                className={`mt-8 px-6 py-3 rounded-md font-medium transition-colors ${documentSigned
                                        ? 'bg-green-600 text-white cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                {documentSigned ? (
                                    <span className="flex items-center gap-2">
                                        <Check className="w-5 h-5" />
                                        Document Signed
                                    </span>
                                ) : (
                                    'Sign Document'
                                )}
                            </button>
                        </div>
                    )}

                    {/* Acknowledge Button for non-signature documents */}
                    {!docData.requiresSignature && (
                        <div className="mt-12 pt-8 border-t border-gray-200">
                            <button
                                onClick={() => {
                                    alert('Protocol acknowledged!');
                                    navigate(-1);
                                }}
                                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                            >
                                Acknowledge & Return
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Signature Modal */}
            {showSignatureModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Draw Your Signature</h2>
                                <button
                                    onClick={() => {
                                        setShowSignatureModal(false);
                                        setCurrentSignatureField(null);
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="border-2 border-gray-300 rounded-md bg-gray-50 mb-4">
                                <SignatureCanvas
                                    ref={signatureCanvasRef}
                                    canvasProps={{
                                        className: 'w-full h-64',
                                    }}
                                    backgroundColor="rgb(249, 250, 251)"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <button
                                    onClick={handleClearSignature}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    Clear
                                </button>
                                <button
                                    onClick={handleSaveSignature}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Save Signature
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
