
import React, { useState, useEffect, ReactNode } from 'react';
import {
    Activity, Search, Filter, MoreVertical, Check, X,
    ChevronRight, ChevronLeft, Circle, Clock, AlertCircle, FileText, Download,
    Shield, CheckCircle2, ExternalLink, Rocket, User, Mail, GraduationCap,
    MapPin, Calendar, Briefcase, Phone, Loader2, RefreshCw, Award
} from 'lucide-react';
import { toast } from 'sonner';
import { verificationService } from '@/services/verificationService';
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
                                    <div className="h-full bg-gray-200 rounded">
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
                            : 'text-gray-600 hover:bg-gray-100'
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
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLastStep ? 'Complete' : 'Next'}
                    </button>
                </div>
            )}
        </div>
    );
}



// ==================== VERIFICATION MODAL ====================
function VerificationModal({
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

    const handleApproveStep = async (stage: VerificationStage) => {
        setIsLoading(true);
        try {
            const payload: any = {
                stage,
                status: 'approved',
                notes: notes
            };

            if (stage === 'background_check') {
                payload.details = backgroundChecks;
            }

            await verificationService.updateVerificationStage(therapist.id, payload);
            toast.success(`Stage ${stage} approved successfully`);

            // Optimistic update logic (simplified for brevity)
            if (stage === 'documents') {
                setCurrentStep(2);
            } else if (stage === 'background_check') {
                setCurrentStep(3);
            } else if (stage === 'final') {
                onUpdate(); // Refresh all
                onClose();
            }
        } catch (error) {
            toast.error('Failed to update verification stage');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRejectStep = async (stage: VerificationStage) => {
        setIsLoading(true);
        try {
            let apiStage: 'documents' | 'background_check' | 'final' = 'documents';
            if (stage === 'background_check') apiStage = 'background_check';

            await verificationService.updateVerificationStage(therapist.id, {
                stage: apiStage,
                status: 'rejected',
                notes
            });

            toast.error(`${stage === 'documents' ? 'License' : 'Background check'} rejected`);
            onUpdate();
        } catch (error) {
            toast.error('Failed to update verification status');
        } finally {
            setIsLoading(false);
        }
    };

    const isDocVerified = therapist.license_verified;
    const isBgCheckPassed = therapist.background_check_status === 'completed';
    const isActive = therapist.account_status === 'active';

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl relative">
                {/* Absolute Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-full transition-all border border-gray-100 shadow-sm"
                    aria-label="Close modal"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="p-6 bg-white border-b border-gray-100 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <div className="relative">
                                <img
                                    src={therapist.profile_image_url || `https://ui-avatars.com/api/?name=${therapist.first_name}+${therapist.last_name}`}
                                    alt={`${therapist.first_name} ${therapist.last_name}`}
                                    className="w-16 h-16 rounded-full object-cover ring-2 ring-orange-100 shadow-sm"
                                />
                                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${isActive ? 'bg-emerald-500' : 'bg-orange-500'
                                    }`}>
                                    {isActive ? (
                                        <Check className="w-3 h-3 text-white" />
                                    ) : (
                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                    )}
                                </div>
                            </div >

                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                                    {therapist.first_name} {therapist.last_name}
                                </h2>
                                <p className="text-gray-500 font-medium text-sm mt-0.5">{therapist.email}</p>
                                <div className="flex gap-2 mt-3">
                                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold border border-gray-200">
                                        {therapist.specialty || 'Therapist'}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${isActive
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                        : 'bg-orange-50 text-orange-700 border-orange-100'
                                        }`}>
                                        {isActive ? 'Verified & Active' : 'Pending Review'}
                                    </span>
                                </div>
                            </div>
                        </div >
                    </div >
                </div >

                {/* Stepper Content */}
                < div className="p-8 overflow-y-auto flex-1 min-h-0 bg-gray-50/50" >
                    <Stepper
                        currentStep={currentStep}
                        totalSteps={4}
                        onStepChange={setCurrentStep}
                        onComplete={onClose}
                        hideNavigation={true}
                    >
                        {/* Step 1: Registration Complete */}
                        <Step>
                            <div className="max-w-3xl mx-auto">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-blue-100">
                                        <Check className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">Registration Details</h2>
                                    <p className="text-gray-500 mt-2">Initial application info</p>
                                </div>
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Date Joined</p>
                                            <p className="font-medium">{new Date(therapist.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Status</p>
                                            <p className="font-medium text-blue-600">Submitted</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8 flex justify-end">
                                    <button
                                        onClick={() => setCurrentStep(1)}
                                        className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </Step>

                        {/* Step 2: License Verification */}
                        <Step>
                            <div className="max-w-3xl mx-auto">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-blue-100">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping absolute" />
                                        <div className="w-8 h-8 rounded-full border-2 border-blue-500" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">License Verification</h2>
                                    <p className="text-gray-500 mt-2">Review and verify professional credentials</p>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                                    <div className="grid grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className="text-sm text-gray-500 block mb-1">License Number</label>
                                            <div className="font-bold text-xl text-gray-900">{therapist.license_number || 'N/A'}</div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-500 block mb-1">License State</label>
                                            <div className="font-bold text-xl text-gray-900">{therapist.license_state || 'N/A'}</div>
                                        </div>
                                    </div>

                                    {/* Document Preview */}
                                    <div className="p-4 border border-gray-200 rounded-xl bg-gray-50 flex items-center justify-between hover:border-blue-200 transition-all group cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">Professional License Document</p>
                                                <p className="text-sm text-gray-400">license_verification.pdf</p>
                                            </div>
                                        </div>
                                        <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 px-4 py-2 hover:bg-blue-50 rounded-lg transition-colors">
                                            View Document
                                        </button>
                                    </div>
                                </div>

                                {/* ACTION BUTTONS */}
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => handleApproveStep('documents')}
                                        disabled={isLoading}
                                        className="flex-1 px-8 py-4 bg-orange-500 text-white rounded-xl font-bold text-lg hover:bg-orange-600 transition-colors shadow-lg shadow-orange-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        ✓ Approve License
                                    </button>
                                    <button
                                        onClick={() => handleRejectStep('documents')}
                                        disabled={isLoading}
                                        className="flex-1 px-8 py-4 bg-white border-2 border-red-100 text-red-600 rounded-xl font-bold text-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        ✗ Reject License
                                    </button>
                                </div>
                            </div>
                        </Step>

                        {/* Step 3: Background Check */}
                        <Step>
                            <div className="max-w-3xl mx-auto">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-purple-100">
                                        <Shield className="w-8 h-8 text-purple-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">Background Check</h2>
                                    <p className="text-gray-500 mt-2">Criminal and professional history review</p>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                                    <div className="flex flex-col gap-4">
                                        {/* Criminal History */}
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-full bg-emerald-50">
                                                    <Shield className="w-4 h-4 text-emerald-500" />
                                                </div>
                                                <span className="font-medium text-gray-700">Criminal History</span>
                                            </div>
                                            <select
                                                value={backgroundChecks.criminal}
                                                onChange={(e) => setBackgroundChecks({ ...backgroundChecks, criminal: e.target.value })}
                                                className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none font-medium cursor-pointer"
                                            >
                                                <option value="clear">Clear</option>
                                                <option value="flagged">Flagged</option>
                                                <option value="pending">Pending</option>
                                            </select>
                                        </div>

                                        {/* Professional References */}
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-full bg-blue-50">
                                                    <User className="w-4 h-4 text-blue-500" />
                                                </div>
                                                <span className="font-medium text-gray-700">Professional References</span>
                                            </div>
                                            <select
                                                value={backgroundChecks.references}
                                                onChange={(e) => setBackgroundChecks({ ...backgroundChecks, references: e.target.value })}
                                                className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none font-medium cursor-pointer"
                                            >
                                                <option value="verified">Verified</option>
                                                <option value="pending">Pending</option>
                                                <option value="failed">Failed</option>
                                            </select>
                                        </div>

                                        {/* Education Verification */}
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-full bg-orange-50">
                                                    <GraduationCap className="w-4 h-4 text-orange-500" />
                                                </div>
                                                <span className="font-medium text-gray-700">Education Verification</span>
                                            </div>
                                            <select
                                                value={backgroundChecks.education}
                                                onChange={(e) => setBackgroundChecks({ ...backgroundChecks, education: e.target.value })}
                                                className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none font-medium cursor-pointer"
                                            >
                                                <option value="verified">Verified</option>
                                                <option value="pending">Pending</option>
                                                <option value="unverified">Unverified</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button className="w-full mt-4 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                                        <ExternalLink className="w-4 h-4" />
                                        View Full Report
                                    </button>
                                </div>

                                {/* ACTION BUTTONS */}
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => handleApproveStep('background_check')}
                                        disabled={isLoading}
                                        className="flex-1 px-8 py-4 bg-orange-500 text-white rounded-xl font-bold text-lg hover:bg-orange-600 transition-colors shadow-lg shadow-orange-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        ✓ Pass Background Check
                                    </button>
                                    <button
                                        onClick={() => handleRejectStep('background_check')}
                                        disabled={isLoading}
                                        className="flex-1 px-8 py-4 bg-white border-2 border-red-100 text-red-600 rounded-xl font-bold text-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        ✗ Fail Check
                                    </button>
                                </div>
                            </div>
                        </Step>

                        {/* Step 4: Final Approval */}
                        <Step>
                            <div className="max-w-xl mx-auto py-8">
                                {isActive ? (
                                    <div className="text-center space-y-6 animate-in zoom-in duration-300">
                                        <div className="w-24 h-24 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-200">
                                            <Check className="w-12 h-12 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-bold text-gray-900">Verification Complete!</h2>
                                            <p className="text-gray-500 mt-2 text-lg">
                                                {therapist.first_name} has been successfully verified and activated.
                                            </p>
                                        </div>
                                        <button
                                            onClick={onClose}
                                            className="px-8 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl shadow-sm hover:bg-gray-50 transition-all w-full"
                                        >
                                            Close
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="text-center mb-8">
                                            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3 transform hover:rotate-6 transition-transform">
                                                <Rocket className="w-10 h-10 text-white" />
                                            </div>
                                            <h2 className="text-3xl font-bold text-gray-900">Ready to Activate?</h2>
                                            <p className="text-gray-500 mt-2 text-lg">
                                                All checks passed. Confirm to enable this therapist account.
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                                                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                                    <span className="text-gray-500">License Verification</span>
                                                    <span className="flex items-center gap-2 text-emerald-600 font-semibold bg-emerald-50 px-3 py-1 rounded-full text-sm">
                                                        <Check className="w-4 h-4" /> Verified
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                                    <span className="text-gray-500">Background Check</span>
                                                    <span className="flex items-center gap-2 text-emerald-600 font-semibold bg-emerald-50 px-3 py-1 rounded-full text-sm">
                                                        <Check className="w-4 h-4" /> Clear
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleApproveStep('final')}
                                                disabled={isLoading}
                                                className="w-full px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-200 hover:shadow-orange-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                                            >
                                                {isLoading ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <Loader2 className="w-5 h-5 animate-spin" /> Activating...
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center justify-center gap-2">
                                                        🚀 Activate Therapist Account
                                                    </span>
                                                )}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </Step>
                    </Stepper>
                </div >
            </div >
        </div >
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
            setTherapists(data);
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
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header Section */}
            <div className="bg-white border-b">
                <div className="max-w-[1600px] mx-auto px-6 py-6">
                    {/* Action Buttons Row - Top Right */}
                    <div className="flex items-center justify-end gap-3 mb-6">
                        <button
                            onClick={() => {
                                fetchTherapists();
                                toast.success('Refreshed therapist list');
                            }}
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    <p className="text-xs text-gray-600 mb-1">Total Therapists</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-orange-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-600 mb-1">Active</p>
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
                                    <p className="text-xs text-gray-600 mb-1">Pending</p>
                                    <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                                </div>
                                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-yellow-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-600 mb-1">Inactive</p>
                                    <p className="text-3xl font-bold text-gray-600">{stats.total - stats.active - stats.pending}</p>
                                </div>
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-gray-600" />
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

                        {!isLoading && filteredTherapists.length === 0 && (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">No therapists found</h3>
                                <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
                            </div>
                        )}
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Verification Modal */}
            {selectedTherapist && (
                <VerificationModal
                    therapist={selectedTherapist}
                    onClose={() => setSelectedTherapist(null)}
                    onUpdate={() => {
                        fetchTherapists();
                    }}
                />
            )}
        </div>
    );
}