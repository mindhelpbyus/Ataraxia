
import React, { useState, useEffect, ReactNode } from 'react';
import {
    Activity, Search, Filter, MoreVertical, Check, X,
    ChevronRight, ChevronLeft, Circle, Clock, AlertCircle, FileText, Download,
    Shield, CheckCircle2, ExternalLink, Rocket, User, Mail, GraduationCap,
    MapPin, Calendar, Briefcase, Phone, Loader2, RefreshCw, Award
} from 'lucide-react';
import { toast } from 'sonner';
import { verificationService } from '@/api/verification';
import { Therapist, VerificationStage, VerificationStatus } from '@/types/therapist';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';

// ==================== STEPPER COMPONENT ====================
interface StepperProps {
    currentStep: number;
    totalSteps: number;
    children: ReactNode;
    onStepChange: (step: number) => void;
    onComplete?: () => void;
    canProceed?: boolean;
    hideNavigation?: boolean;
}

export function Step({ children }: { children: ReactNode }) {
    return <>{children}</>;
}

function Stepper({
    currentStep,
    totalSteps,
    children,
    onStepChange,
    onComplete,
    canProceed = true,
    hideNavigation = false
}: StepperProps) {
    const steps = React.Children.toArray(children);
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === totalSteps - 1;

    return (
        <div className="w-full">
            {/* Stepper Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    {Array.from({ length: totalSteps }).map((_, index) => (
                        <div key={index} className="flex items-center flex-1">
                            {/* Step Circle */}
                            <div className="flex flex-col items-center flex-1">
                                <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${index < currentStep
                                        ? 'bg-emerald-500 border-emerald-500'
                                        : index === currentStep
                                            ? 'bg-blue-500 border-blue-500'
                                            : 'bg-white border-gray-300'
                                        }`}
                                >
                                    {index < currentStep ? (
                                        <Check className="w-6 h-6 text-white" />
                                    ) : (
                                        <span
                                            className={`font-bold ${index === currentStep ? 'text-white' : 'text-gray-400'
                                                }`}
                                        >
                                            {index + 1}
                                        </span>
                                    )}
                                </div>
                                <div className="mt-2 text-center">
                                    <div
                                        className={`text-sm font-semibold ${index <= currentStep ? 'text-gray-900' : 'text-gray-400'
                                            }`}
                                    >
                                        Step {index + 1}
                                    </div>
                                </div>
                            </div>

                            {/* Connector Line */}
                            {index < totalSteps - 1 && (
                                <div className="flex-1 h-1 mx-2 relative top-[-14px]">
                                    <div className="h-full bg-muted/30 rounded">
                                        <div
                                            className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                                            style={{
                                                width: index < currentStep ? '100%' : '0%'
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="mt-6">
                {steps[currentStep]}
            </div>

            {/* Navigation Buttons (if enabled) */}
            {!hideNavigation && (
                <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                    <button
                        onClick={() => onStepChange(Math.max(0, currentStep - 1))}
                        disabled={isFirstStep}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${isFirstStep
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-orange-600 hover:bg-orange-50 border border-orange-200'
                            }`}
                    >
                        Back
                    </button>
                    <button
                        onClick={() => {
                            if (isLastStep && onComplete) onComplete();
                            else onStepChange(Math.min(totalSteps - 1, currentStep + 1));
                        }}
                        disabled={!canProceed}
                        className="px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLastStep ? 'Complete' : 'Next'}
                    </button>
                </div>
            )}
        </div>
    );
}



// ==================== VERIFICATION MODAL ====================
// ==================== VERIFICATION SHEET ====================
function VerificationSheet({
    therapist,
    onClose,
    onUpdate,
}: {
    therapist: Therapist;
    onClose: () => void;
    onUpdate: () => void;
}) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [notes, setNotes] = useState(therapist.verification_notes || '');
    const [backgroundChecks, setBackgroundChecks] = useState({
        criminal: 'clear',
        references: 'verified',
        education: 'verified'
    });

    // Calculate initial step based on therapist status
    useEffect(() => {
        if (therapist.account_status === 'active') {
            setCurrentStep(3);
        } else if (therapist.background_check_status === 'completed') {
            setCurrentStep(3);
        } else if (therapist.license_verified) {
            setCurrentStep(2);
        } else {
            setCurrentStep(1);
        }
    }, [therapist]);

    const handleApprove = async () => {
        setIsLoading(true);
        try {
            await verificationService.activateTherapistAccount(therapist.id);
            toast.success('Therapist account activated successfully!');
            onUpdate();
            onClose();
        } catch (error: any) {
            console.error('Error activating therapist:', error);
            toast.error(error.message || 'Failed to activate therapist account');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReject = async () => {
        setIsLoading(true);
        try {
            await verificationService.rejectTherapist(therapist.id, 'Application rejected after review');
            toast.success('Therapist application rejected');
            onUpdate();
            onClose();
        } catch (error: any) {
            console.error('Error rejecting therapist:', error);
            toast.error(error.message || 'Failed to reject therapist application');
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewDocument = (documentUrl: string, documentName: string) => {
        if (!documentUrl) {
            toast.error('Document not available');
            return;
        }

        // Open document in new tab
        window.open(documentUrl, '_blank', 'noopener,noreferrer');
    };

    const getDocumentName = (type: string) => {
        const documentTypes: Record<string, string> = {
            'license_document': 'Professional License',
            'degree_certificate': 'Degree Certificate',
            'malpractice_insurance': 'Malpractice Insurance',
            'photo_id': 'Photo ID',
            'headshot': 'Professional Headshot'
        };
        return documentTypes[type] || 'Document';
    };

    const isDocVerified = therapist.license_verified;
    const isBgCheckPassed = therapist.background_check_status === 'completed';
    const isActive = therapist.account_status === 'active';

    return (
        <SheetContent side="right" className="sm:max-w-4xl w-[90vw] p-0 border-l border-border shadow-2xl bg-background overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-orange-50 border-b border-orange-200 px-8 py-6 flex-shrink-0 z-10 shadow-sm">
                <div className="flex items-start justify-between">
                    <div className="flex gap-6">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="mr-4 -ml-2 hover:bg-orange-100 text-orange-600 hover:text-orange-700"
                            onClick={onClose}
                        >
                            <ChevronRight className="h-6 w-6 rotate-180" />
                        </Button>
                        <Avatar className="h-20 w-20 ring-4 ring-orange-100 shadow-md rounded-2xl">
                            <AvatarImage
                                src={therapist.profile_image_url || `https://ui-avatars.com/api/?name=${therapist.first_name}+${therapist.last_name}`}
                                alt={`${therapist.first_name} ${therapist.last_name}`}
                            />
                            <AvatarFallback className="bg-orange-500 text-white text-2xl font-light">
                                {therapist.first_name?.[0]}{therapist.last_name?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div className="pt-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                                    {therapist.first_name} {therapist.last_name}
                                </h2>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${isActive ? 'bg-green-100 text-green-700' :
                                    therapist.registration_status === 'pending_review' ? 'bg-orange-100 text-orange-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                    {isActive ? 'Active' : therapist.registration_status?.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm font-medium text-gray-600">
                                <span>{therapist.email}</span>
                                <span className="text-gray-400">•</span>
                                <span>{therapist.phone_number || 'No phone'}</span>
                                <span className="text-gray-400">•</span>
                                <span className="capitalize">
                                    {therapist.workflow_stage?.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={handleReject}
                            disabled={isLoading}
                            className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Reject
                        </Button>
                        <Button
                            onClick={handleApprove}
                            disabled={isLoading}
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Check className="h-4 w-4 mr-2" />
                            )}
                            Approve & Activate
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <Stepper
                    currentStep={currentStep}
                    totalSteps={4}
                    onStepChange={setCurrentStep}
                    canProceed={true}
                    hideNavigation={true}
                >
                    {/* Step 1: Registration Complete */}
                    <Step>
                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-foreground">Personal Information</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                                        <p className="text-base font-medium text-foreground">{therapist.first_name} {therapist.last_name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                                        <p className="text-base text-foreground">{therapist.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                                        <p className="text-base text-foreground">{therapist.phone_number || 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                                        <p className="text-base text-foreground">{therapist.date_of_birth || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Registration Date</label>
                                        <p className="text-base text-foreground">
                                            {therapist.created_at ? new Date(therapist.created_at).toLocaleDateString() : 'Unknown'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Step>

                    {/* Step 2: License Verification */}
                    <Step>
                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <GraduationCap className="w-5 h-5 text-green-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-foreground">Professional Credentials</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">License Number</label>
                                        <p className="text-base font-medium text-foreground">{therapist.license_number}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">License State</label>
                                        <p className="text-base text-foreground">{therapist.license_state}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Degree</label>
                                        <p className="text-base text-foreground">{therapist.degree || 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Years of Experience</label>
                                        <p className="text-base text-foreground">{therapist.years_of_experience || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Specializations</label>
                                        <p className="text-base text-foreground">
                                            {therapist.specializations ?
                                                (Array.isArray(therapist.specializations) ?
                                                    therapist.specializations.join(', ') :
                                                    therapist.specializations) :
                                                'Not provided'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">NPI Number</label>
                                        <p className="text-base text-foreground">{therapist.npi_number || 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Documents Section */}
                            <div className="mt-8">
                                <h4 className="text-lg font-semibold text-foreground mb-4">Uploaded Documents</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* License Document */}
                                    {therapist.license_document_url && (
                                        <div className="p-4 border border-orange-200 rounded-xl bg-orange-50/50 hover:bg-orange-50 transition-colors cursor-pointer"
                                            onClick={() => handleViewDocument(therapist.license_document_url, 'Professional License')}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-orange-100 rounded-lg">
                                                        <FileText className="w-5 h-5 text-orange-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">Professional License</p>
                                                        <p className="text-sm text-gray-500">Click to view document</p>
                                                    </div>
                                                </div>
                                                <ExternalLink className="w-4 h-4 text-orange-600" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Degree Certificate */}
                                    {therapist.degree_certificate_url && (
                                        <div className="p-4 border border-orange-200 rounded-xl bg-orange-50/50 hover:bg-orange-50 transition-colors cursor-pointer"
                                            onClick={() => handleViewDocument(therapist.degree_certificate_url, 'Degree Certificate')}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-orange-100 rounded-lg">
                                                        <Award className="w-5 h-5 text-orange-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">Degree Certificate</p>
                                                        <p className="text-sm text-gray-500">Click to view document</p>
                                                    </div>
                                                </div>
                                                <ExternalLink className="w-4 h-4 text-orange-600" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Malpractice Insurance */}
                                    {therapist.malpractice_document_url && (
                                        <div className="p-4 border border-orange-200 rounded-xl bg-orange-50/50 hover:bg-orange-50 transition-colors cursor-pointer"
                                            onClick={() => handleViewDocument(therapist.malpractice_document_url, 'Malpractice Insurance')}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-orange-100 rounded-lg">
                                                        <Shield className="w-5 h-5 text-orange-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">Malpractice Insurance</p>
                                                        <p className="text-sm text-gray-500">Click to view document</p>
                                                    </div>
                                                </div>
                                                <ExternalLink className="w-4 h-4 text-orange-600" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Photo ID */}
                                    {therapist.photo_id_url && (
                                        <div className="p-4 border border-orange-200 rounded-xl bg-orange-50/50 hover:bg-orange-50 transition-colors cursor-pointer"
                                            onClick={() => handleViewDocument(therapist.photo_id_url, 'Photo ID')}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-orange-100 rounded-lg">
                                                        <User className="w-5 h-5 text-orange-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">Photo ID</p>
                                                        <p className="text-sm text-gray-500">Click to view document</p>
                                                    </div>
                                                </div>
                                                <ExternalLink className="w-4 h-4 text-orange-600" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Professional Headshot */}
                                    {therapist.headshot_url && (
                                        <div className="p-4 border border-orange-200 rounded-xl bg-orange-50/50 hover:bg-orange-50 transition-colors cursor-pointer"
                                            onClick={() => handleViewDocument(therapist.headshot_url, 'Professional Headshot')}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-orange-100 rounded-lg">
                                                        <User className="w-5 h-5 text-orange-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">Professional Headshot</p>
                                                        <p className="text-sm text-gray-500">Click to view image</p>
                                                    </div>
                                                </div>
                                                <ExternalLink className="w-4 h-4 text-orange-600" />
                                            </div>
                                        </div>
                                    )}

                                    {/* No Documents Message */}
                                    {!therapist.license_document_url && !therapist.degree_certificate_url &&
                                        !therapist.malpractice_document_url && !therapist.photo_id_url && !therapist.headshot_url && (
                                            <div className="col-span-2 p-6 border border-gray-200 rounded-xl bg-gray-50 text-center">
                                                <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                <p className="text-gray-500">No documents uploaded yet</p>
                                            </div>
                                        )}
                                </div>
                            </div>
                        </div>
                    </Step>

                    {/* Step 3: Background Check */}
                    <Step>
                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Shield className="w-5 h-5 text-purple-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-foreground">Insurance & Verification</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Malpractice Insurance Provider</label>
                                        <p className="text-base text-foreground">{therapist.malpractice_insurance_provider || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Policy Number</label>
                                        <p className="text-base text-foreground">{therapist.malpractice_policy_number || 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Background Check Status</label>
                                        <p className="text-base text-foreground capitalize">
                                            {therapist.background_check_status?.replace('_', ' ') || 'Pending'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Background Check Consent</label>
                                        <p className="text-base text-foreground">
                                            {therapist.background_check_consent ? 'Provided' : 'Not provided'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Step>

                    {/* Step 4: Final Review */}
                    <Step>
                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <CheckCircle2 className="w-5 h-5 text-orange-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-foreground">Final Review</h3>
                            </div>

                            <div className="bg-muted/30 rounded-lg p-6">
                                <h4 className="font-semibold text-foreground mb-4">Application Summary</h4>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Applicant:</span>
                                        <span className="font-medium text-foreground">{therapist.first_name} {therapist.last_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">License:</span>
                                        <span className="font-medium text-foreground">{therapist.license_number} ({therapist.license_state})</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Status:</span>
                                        <span className="font-medium text-foreground capitalize">
                                            {therapist.registration_status?.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Background Check:</span>
                                        <span className="font-medium text-foreground capitalize">
                                            {therapist.background_check_status?.replace('_', ' ') || 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                                    <div>
                                        <h5 className="font-medium text-blue-900 mb-1">Ready for Activation</h5>
                                        <p className="text-sm text-blue-700">
                                            This therapist application has been reviewed and is ready for activation.
                                            Approving will create their account and grant access to the platform.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Step>
                </Stepper>
            </div>
        </SheetContent>
    );
}

// ==================== MAIN APP ====================
export default function TherapistVerificationView() {
    const [therapists, setTherapists] = useState<Therapist[]>([]);
    const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active'>('all');
    const [isLoading, setIsLoading] = useState(true);

    const fetchTherapists = async () => {
        try {
            setIsLoading(true);
            const data = await verificationService.getAllTherapists();
            setTherapists(data as unknown as Therapist[]);
        } catch (error) {
            toast.error('Failed to load therapists');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTherapists();
    }, []);

    const filteredTherapists = therapists.filter((t) => {
        const matchesSearch =
            t.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.license_number && t.license_number.toLowerCase().includes(searchQuery.toLowerCase()));

        let matchesStatus = true;
        if (statusFilter === 'pending') {
            matchesStatus = t.account_status !== 'active';
        } else if (statusFilter === 'active') {
            matchesStatus = t.account_status === 'active';
        }

        return matchesSearch && matchesStatus;
    });

    const stats = {
        pending: therapists.filter((t) => t.account_status === 'onboarding_pending').length,
        active: therapists.filter((t) => t.account_status === 'active').length,
        total: therapists.length,
    };

    // Export to CSV
    const exportToCSV = () => {
        try {
            const headers = ['Name', 'Email', 'License Number', 'License State', 'Specialty', 'Status', 'Created Date', 'Verification Stage'];
            const rows = filteredTherapists.map(t => [
                `${t.first_name} ${t.last_name}`,
                t.email,
                t.license_number || 'N/A',
                t.license_state || 'N/A',
                t.specialty || 'N/A',
                t.account_status === 'active' ? 'Active' : 'Pending',
                new Date(t.created_at).toLocaleDateString(),
                t.verification_stage || 'N/A'
            ]);

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `therapist_verification_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('Exported to CSV successfully');
        } catch (error) {
            toast.error('Failed to export to CSV');
        }
    };

    // Export to Excel (using CSV format with .xlsx extension for simplicity)
    const exportToExcel = () => {
        try {
            const headers = ['Name', 'Email', 'License Number', 'License State', 'Specialty', 'Status', 'Created Date', 'Verification Stage', 'Background Check', 'License Verified'];
            const rows = filteredTherapists.map(t => [
                `${t.first_name} ${t.last_name}`,
                t.email,
                t.license_number || 'N/A',
                t.license_state || 'N/A',
                t.specialty || 'N/A',
                t.account_status === 'active' ? 'Active' : 'Pending',
                new Date(t.created_at).toLocaleDateString(),
                t.verification_stage || 'N/A',
                t.background_check_status || 'N/A',
                t.license_verified ? 'Yes' : 'No'
            ]);

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `therapist_verification_${new Date().toISOString().split('T')[0]}.xlsx`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('Exported to Excel successfully');
        } catch (error) {
            toast.error('Failed to export to Excel');
        }
    };

    return (
        <div className="min-h-screen bg-background font-sans">
            {/* Header Section */}
            <div className="bg-white">
                <div className="max-w-[1600px] mx-auto px-6 py-6">
                    {/* Action Buttons Row - Top Right */}
                    <div className="flex items-center justify-end gap-3 mb-6">
                        <button
                            onClick={() => {
                                fetchTherapists();
                                toast.success('Refreshed therapist list');
                            }}
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-background border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>

                        <button
                            onClick={exportToCSV}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-all"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>

                        <button
                            onClick={exportToExcel}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-all"
                        >
                            <Download className="w-4 h-4" />
                            Export Excel
                        </button>
                    </div>

                    {/* Search and Filter Row */}
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-200 mb-6">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                                <div className="flex-1 relative group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                    <Input
                                        placeholder="Search therapists by name, email, specialty..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 border-border/50 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200"
                                    />
                                </div>
                                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                                    <SelectTrigger className="w-[180px] border-border/50 focus:ring-primary/20">
                                        <Filter className="h-4 w-4 mr-2" />
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Therapists</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-4 gap-4">
                        <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Total Therapists</p>
                                    <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                                </div>
                                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-orange-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Active</p>
                                    <p className="text-3xl font-bold text-emerald-600">{stats.active}</p>
                                </div>
                                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Pending</p>
                                    <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                                </div>
                                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-yellow-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-muted/50 rounded-lg p-4 border border-border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Inactive</p>
                                    <p className="text-3xl font-bold text-muted-foreground">{stats.total - stats.active - stats.pending}</p>
                                </div>
                                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-muted-foreground" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="max-w-[1600px] mx-auto px-6 py-6">
                <Card className="border-border/50 shadow-lg overflow-hidden">
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/30 hover:bg-muted/30 border-border/50">
                                                <TableHead className="w-[280px] font-semibold text-muted-foreground uppercase tracking-wider">Therapist</TableHead>
                                                <TableHead className="font-semibold text-muted-foreground uppercase tracking-wider">Email</TableHead>
                                                <TableHead className="w-[140px] font-semibold text-muted-foreground uppercase tracking-wider">Phone</TableHead>
                                                <TableHead className="w-[180px] font-semibold text-muted-foreground uppercase tracking-wider">Specialty</TableHead>
                                                <TableHead className="w-[140px] font-semibold text-muted-foreground uppercase tracking-wider">Location</TableHead>
                                                <TableHead className="w-[110px] font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
                                                <TableHead className="w-[40px]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredTherapists.map((therapist) => (
                                                <TableRow
                                                    key={therapist.id}
                                                    className="group hover:bg-muted/30 transition-colors duration-200 border-b border-border/30 last:border-0 cursor-pointer"
                                                    onClick={() => setSelectedTherapist(therapist)}
                                                >
                                                    <TableCell className="py-4">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm group-hover:ring-primary/20 transition-all duration-200">
                                                                <AvatarImage src={therapist.profile_image_url} />
                                                                <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                                                                    {therapist.first_name?.[0]}{therapist.last_name?.[0]}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                                                    {therapist.first_name} {therapist.last_name}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground truncate">
                                                                    {therapist.license_number || 'N/A'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <Mail className="h-3.5 w-3.5 text-muted-foreground/60 flex-shrink-0" strokeWidth={2} />
                                                            <span className="text-sm text-muted-foreground truncate">{therapist.email}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="h-3.5 w-3.5 text-muted-foreground/60 flex-shrink-0" strokeWidth={2} />
                                                            <span className="text-sm text-muted-foreground">{therapist.phone_number || '-'}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <Award className="h-3.5 w-3.5 text-muted-foreground/60 flex-shrink-0" strokeWidth={2} />
                                                            <span className="text-sm text-muted-foreground truncate" title={therapist.specialty}>
                                                                {therapist.specialty || 'General'}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="h-3.5 w-3.5 text-muted-foreground/60 flex-shrink-0" strokeWidth={2} />
                                                            <span className="text-sm text-muted-foreground">{therapist.license_state || 'Remote'}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                        {therapist.account_status === 'active' ? (
                                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-200">
                                                                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                                                <span className="text-xs font-medium text-green-700">Active</span>
                                                            </div>
                                                        ) : (
                                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-50 border border-yellow-200">
                                                                <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                                                                <span className="text-xs font-medium text-yellow-700">Pending</span>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="py-4 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-muted"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedTherapist(therapist);
                                                            }}
                                                        >
                                                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination */}
                                {filteredTherapists.length > 0 && (
                                    <div className="w-full flex items-center justify-between px-6 py-4 border-t border-border/50 bg-muted/20">
                                        <div className="text-sm text-muted-foreground">
                                            Showing <span className="font-medium text-foreground">1</span> to{' '}
                                            <span className="font-medium text-foreground">{filteredTherapists.length}</span> of{' '}
                                            <span className="font-medium text-foreground">{filteredTherapists.length}</span> therapists
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled>
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <Button variant="default" size="sm" className="h-8 w-8 p-0">
                                                1
                                            </Button>
                                            <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled>
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {filteredTherapists.length === 0 && (
                                    <div className="text-center py-16">
                                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Search className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-foreground mb-2">No therapists found</h3>
                                        <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Verification Sheet */}
            <Sheet open={!!selectedTherapist} onOpenChange={(open) => !open && setSelectedTherapist(null)}>
                {selectedTherapist && (
                    <VerificationSheet
                        therapist={selectedTherapist}
                        onClose={() => setSelectedTherapist(null)}
                        onUpdate={() => {
                            fetchTherapists();
                        }}
                    />
                )}
            </Sheet>
        </div>
    );
}