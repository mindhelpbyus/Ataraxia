import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Shield, AlertTriangle, Scale, Download, FileCheck } from 'lucide-react';

interface Document {
    id: string;
    title: string;
    description: string;
    status: 'signed' | 'active' | 'review-required' | 'acknowledged' | 'action-needed';
    tags: string[];
    date?: string;
    version?: string;
    icon: 'file-text' | 'shield' | 'alert' | 'scale';
}

export const DocumentSettings = () => {
    const navigate = useNavigate();
    const [signedDocuments, setSignedDocuments] = useState<Set<string>>(new Set());

    // Load signed documents from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('signedDocuments');
        if (stored) {
            setSignedDocuments(new Set(JSON.parse(stored)));
        }
    }, []);

    // Refresh signed documents when component becomes visible
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                const stored = localStorage.getItem('signedDocuments');
                if (stored) {
                    setSignedDocuments(new Set(JSON.parse(stored)));
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    const documents: Document[] = [
        {
            id: '1',
            title: 'Therapist Onboarding Agreement',
            description: 'India law compliant, RCI-aligned agreement covering scope-of-practice and platform liability.',
            status: 'active', // Changed from 'signed' - only user signatures count
            tags: ['RCI-Aligned', 'Liability Shield'],
            icon: 'file-text',
        },
        {
            id: '2',
            title: 'Patient Informed Consent',
            description: 'Tele-Mental Health consent compliant with Mental Healthcare Act, 2017.',
            status: 'active',
            tags: ['Tele-Health', 'Risk Disclosure'],
            version: 'Rev. 1.2',
            icon: 'shield',
        },
        {
            id: '3',
            title: 'Privacy & Data Protection Policy',
            description: 'DPDP Act, 2023 & IT Act, 2000 compliant policy. Referenced ISO 27001 & HIPAA standards.',
            status: 'active',
            tags: ['DPDP 2023', 'ISO 27001'],
            version: 'Rev. 2.0',
            icon: 'shield',
        },
        {
            id: '4',
            title: 'Crisis & Emergency Protocol',
            description: 'Mandatory suicide risk handling, duty to protect, and confidentiality break conditions.',
            status: 'review-required',
            tags: ['Emergency Duty', 'Suicide Prevention'],
            icon: 'alert',
        },
        {
            id: '5',
            title: 'Ethics & Code of Conduct',
            description: 'Adherence to RCI Code of Ethics, boundary rules, and non-discrimination policies.',
            status: 'active', // Changed from 'acknowledged'
            tags: ['RCI Ethics', 'Boundaries'],
            icon: 'scale',
        },
    ];

    const getStatusBadge = (docId: string, originalStatus: string) => {
        // Check if document has been signed by user
        const isSigned = signedDocuments.has(docId);
        const status = isSigned ? 'signed' : originalStatus;

        switch (status) {
            case 'signed':
                return (
                    <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">
                        Signed
                    </span>
                );
            case 'active':
                return (
                    <span className="px-3 py-1 text-xs rounded-full bg-orange-100 text-orange-700">
                        Active
                    </span>
                );
            case 'review-required':
                return (
                    <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                        Review Required
                    </span>
                );
            case 'acknowledged':
                return (
                    <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                        Acknowledged
                    </span>
                );
            default:
                return null;
        }
    };

    const getIcon = (iconType: string) => {
        switch (iconType) {
            case 'file-text':
                return <FileText className="w-6 h-6 text-orange-500" />;
            case 'shield':
                return <Shield className="w-6 h-6 text-orange-500" />;
            case 'alert':
                return <AlertTriangle className="w-6 h-6 text-orange-500" />;
            case 'scale':
                return <Scale className="w-6 h-6 text-orange-500" />;
            default:
                return <FileText className="w-6 h-6 text-orange-500" />;
        }
    };

    const handleViewDocument = (docId: string) => {
        navigate(`/documents/${docId}`);
    };

    const handleDownloadDocument = (docId: string, title: string) => {
        // Check if document is signed
        if (!signedDocuments.has(docId)) {
            alert('Please sign the document before downloading');
            return;
        }

        // Get document content from storage
        const documentContent = getDocumentContent(docId, title);

        // Create blob and download
        const blob = new Blob([documentContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title.replace(/[^a-z0-9]/gi, '_')}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log(`Downloaded document: ${title}`);
    };

    const getDocumentContent = (docId: string, title: string): string => {
        // Get signature data from localStorage
        const signatureData = localStorage.getItem(`document_${docId}_signature`);
        const signedDate = localStorage.getItem(`document_${docId}_date`);

        const header = `${title}\n${'='.repeat(title.length)}\n\nDocument ID: ${docId}\nSigned Date: ${signedDate || new Date().toLocaleDateString()}\n\n`;

        // Document content based on ID
        const contents: Record<string, string> = {
            '1': `THERAPIST ONBOARDING AGREEMENT

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
- Carry professional liability insurance with minimum coverage of INR 10,00,000
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
Any disputes shall be resolved through arbitration in accordance with the Arbitration and Conciliation Act, 1996.`,

            '2': `PATIENT INFORMED CONSENT FOR TELE-MENTAL HEALTH SERVICES

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
- Technical issues resulting in session interruption will not be charged`,

            '3': `PRIVACY & DATA PROTECTION POLICY

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
- Lodge complaints with Data Protection Authority`,

            '4': `CRISIS & EMERGENCY PROTOCOL

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
- Ambulance: 102`,

            '5': `ETHICS & CODE OF CONDUCT

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
- Political affiliation`
        };

        const footer = `\n\n${'='.repeat(50)}\nDIGITAL SIGNATURE\n${'='.repeat(50)}\n\nThis document has been digitally signed.\nSignature Date: ${signedDate || new Date().toLocaleDateString()}\n\nFor verification purposes, please contact the platform administrator.`;

        return header + (contents[docId] || 'Document content not available') + footer;
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-semibold mb-2">Documents</h1>
                </div>

                <div className="space-y-4">
                    {documents.map((doc) => (
                        <div
                            key={doc.id}
                            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div className="mt-1">{getIcon(doc.icon)}</div>

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            {doc.title}
                                        </h2>
                                        {signedDocuments.has(doc.id) && !doc.date ? (
                                            <span className="text-sm text-gray-500">
                                                {new Date().toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: '2-digit',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        ) : doc.date ? (
                                            <span className="text-sm text-gray-500">{doc.date}</span>
                                        ) : doc.version ? (
                                            <span className="text-sm text-gray-500">{doc.version}</span>
                                        ) : null}
                                    </div>

                                    <p className="text-sm text-gray-600 mb-4">{doc.description}</p>

                                    {/* Tags */}
                                    <div className="flex items-center gap-2 mb-6">
                                        {getStatusBadge(doc.id, doc.status)}
                                        {doc.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => handleViewDocument(doc.id)}
                                            className="flex-1 py-2 px-4 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
                                        >
                                            <FileCheck className="w-4 h-4" />
                                            View
                                        </button>
                                        <button
                                            onClick={() => handleDownloadDocument(doc.id, doc.title)}
                                            disabled={!signedDocuments.has(doc.id)}
                                            className={`text-sm transition-colors flex items-center gap-2 ${signedDocuments.has(doc.id)
                                                    ? 'text-gray-600 hover:text-gray-900 cursor-pointer'
                                                    : 'text-gray-300 cursor-not-allowed'
                                                }`}
                                            title={!signedDocuments.has(doc.id) ? 'Sign document to enable download' : 'Download signed document'}
                                        >
                                            <Download className="w-4 h-4" />
                                            Download
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
