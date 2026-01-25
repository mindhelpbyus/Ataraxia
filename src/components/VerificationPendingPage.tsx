import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, FileCheck, Shield, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { verificationService, RegistrationStatus } from '../api/services/verification';
import { auth } from '../config/firebase';

interface TimelineStepProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    completed?: boolean;
    active?: boolean;
    last?: boolean;
}

function TimelineStep({ title, description, icon, completed, active, last }: TimelineStepProps) {
    return (
        <div className="flex gap-4">
            {/* Icon */}
            <div className="flex flex-col items-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`
            w-12 h-12 rounded-full flex items-center justify-center
            ${completed ? 'bg-green-500 text-white' : active ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-400'}
          `}
                >
                    {completed ? <CheckCircle2 className="w-6 h-6" /> : icon}
                </motion.div>
                {!last && (
                    <div className={`w-0.5 h-16 mt-2 ${completed ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-8">
                <h3 className={`text-lg font-semibold ${completed || active ? 'text-gray-900' : 'text-gray-400'}`}>
                    {title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{description}</p>
                {active && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-2 inline-flex items-center gap-2 text-sm text-orange-600"
                    >
                        <Clock className="w-4 h-4 animate-pulse" />
                        In Progress...
                    </motion.div>
                )}
            </div>
        </div>
    );
}

export function VerificationPendingPage() {
    const [status, setStatus] = useState<RegistrationStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const checkStatus = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Try to get user from Firebase Auth
            let user = auth.currentUser;

            // If not authenticated, try to get from localStorage (saved during registration)
            if (!user) {
                const savedEmail = localStorage.getItem('therapistOnboardingEmail');
                const savedUid = localStorage.getItem('therapistFirebaseUid');

                if (savedUid) {
                    // Use the saved UID to fetch status
                    const result = await verificationService.getRegistrationStatus(savedUid);
                    setStatus(result);
                    setLoading(false);
                    return;
                } else {
                    setError('Your session has expired. Please sign in again to view your application status.');
                    setLoading(false);
                    // Redirect to login after 5 seconds
                    setTimeout(() => {
                        window.location.href = '/?returnTo=verification-pending';
                    }, 5000);
                    return;
                }
            }

            const result = await verificationService.getRegistrationStatus(user.uid);
            setStatus(result);
            setLoading(false);
        } catch (err: any) {
            console.error('Failed to get verification status:', err);
            setError(err.message || 'Failed to load status');
            setLoading(false);
        }
    };

    useEffect(() => {
        checkStatus();
        // Don't auto-refresh - user can manually refresh or logout and login again
        // Polling every 30s keeps users stuck on this page
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading verification status...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-50">
                <Card className="max-w-md w-full">
                    <CardContent className="p-6 text-center">
                        <p className="text-red-600">{error}</p>
                        <Button onClick={() => window.location.reload()} className="mt-4">
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const workflowStage = status?.registration?.workflow_stage || 'registration_submitted';
    const registrationStatus = status?.registration?.status || 'pending_review';

    // ROUTING LOGIC: Handle different statuses
    // 1. If APPROVED → Show success message and redirect to dashboard
    if (registrationStatus === 'approved') {
        // Auto-redirect after 5 seconds
        useEffect(() => {
            const timer = setTimeout(() => {
                window.location.href = '/dashboard';
            }, 5000);
            return () => clearTimeout(timer);
        }, []);

        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        🎉 Congratulations!
                    </h1>
                    <p className="text-lg text-gray-600 mb-6">
                        Your therapist account has been approved and activated!
                    </p>
                    <Button
                        onClick={() => window.location.href = '/dashboard'}
                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                    >
                        Access Your Dashboard
                    </Button>
                    <p className="text-sm text-gray-500 mt-4">
                        You will be redirected automatically in 5 seconds...
                    </p>
                </div>
            </div>
        );
    }

    // 2. If REJECTED or ADDITIONAL_INFO_REQUIRED → Show rejection page
    if (registrationStatus === 'rejected' || registrationStatus === 'additional_info_required') {
        // Dynamically import and show ApplicationRejectedPage
        const { ApplicationRejectedPage } = require('./ApplicationRejectedPage');
        return (
            <ApplicationRejectedPage
                status={registrationStatus}
                rejectionReason={registrationStatus === 'rejected' ? status?.message : undefined}
                additionalInfoRequired={registrationStatus === 'additional_info_required' ? status?.message : undefined}
            />
        );
    }

    // 3. All other statuses (pending_review, documents_verified, background_check_pending, background_check_completed)
    //    → Show Verification Pending Page with dynamic timeline

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-100 mb-4">
                        <Shield className="w-10 h-10 text-orange-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Verification In Progress
                    </h1>
                    <p className="text-lg text-gray-600">
                        Thank you for applying to join Ataraxia!
                    </p>
                </motion.div>

                {/* Main Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="shadow-xl">
                        <CardHeader className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-semibold">Application Status</h2>
                                    <p className="text-orange-100 mt-1">
                                        {status?.message || 'Your application is being reviewed'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-orange-100">Estimated Time</div>
                                    <div className="text-xl font-bold">2-5 Days</div>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-8">
                            {/* Timeline */}
                            <div className="space-y-0">
                                <TimelineStep
                                    title="Application Submitted"
                                    description="Your application has been received and is in our queue."
                                    icon={<FileCheck className="w-6 h-6" />}
                                    completed={true}
                                />

                                <TimelineStep
                                    title="Documents Review"
                                    description="Our team is reviewing your license, credentials, and professional documents."
                                    icon={<FileCheck className="w-6 h-6" />}
                                    completed={workflowStage !== 'registration_submitted'}
                                    active={workflowStage === 'documents_review'}
                                />

                                <TimelineStep
                                    title="Background Check"
                                    description="We're conducting a background check to ensure client safety."
                                    icon={<Shield className="w-6 h-6" />}
                                    completed={status?.registration?.background_check_status === 'completed'}
                                    active={workflowStage === 'background_check'}
                                />

                                <TimelineStep
                                    title="Final Review"
                                    description="Final verification and account setup."
                                    icon={<CheckCircle2 className="w-6 h-6" />}
                                    active={workflowStage === 'final_review'}
                                    last={true}
                                />
                            </div>

                            {/* Info Box */}
                            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex gap-3">
                                    <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-blue-900">We'll keep you updated</h4>
                                        <p className="text-sm text-blue-700 mt-1">
                                            You'll receive an email notification at each stage of the verification process.
                                            Once approved, you'll be able to log in and access your therapist dashboard.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-8 flex gap-4 justify-center">
                                <Button
                                    variant="outline"
                                    onClick={checkStatus}
                                    disabled={loading}
                                >
                                    {loading ? 'Checking...' : 'Refresh Status'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        auth.signOut();
                                        window.location.href = '/';
                                    }}
                                >
                                    Logout
                                </Button>
                            </div>

                            {/* Help text */}
                            <p className="text-center text-sm text-gray-500 mt-6">
                                You can safely logout and login again later to check your status
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Additional Info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 text-center text-sm text-gray-600"
                >
                    <p>
                        Questions about your application?{' '}
                        <a href="mailto:support@ataraxia.app" className="text-orange-600 hover:underline">
                            Contact our support team
                        </a>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
