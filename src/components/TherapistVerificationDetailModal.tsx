import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { CheckCircle2, FileText, Shield, UserCheck, Clock, Check, X, ArrowRight, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { dataService } from '../api';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { motion } from 'framer-motion';

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

interface VerificationModalProps {
    therapistId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

export function TherapistVerificationDetailModal({ therapistId, isOpen, onClose }: VerificationModalProps) {
    const [therapist, setTherapist] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (isOpen && therapistId) {
            loadTherapist();
        }
    }, [isOpen, therapistId]);

    const loadTherapist = async () => {
        setLoading(true);
        try {
            const data = await dataService.get('therapists', therapistId!);
            setTherapist(data);
            if (data.verification_notes) setNotes(data.verification_notes);
        } catch (error) {
            console.error('Failed to load therapist:', error);
            toast.error('Failed to load therapist details');
        } finally {
            setLoading(false);
        }
    };

    const handleStageUpdate = async (stage: string, status: string) => {
        setActionLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_THERAPIST_SERVICE_URL || 'http://localhost:3004/api'}/therapists/${therapistId}/verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stage, status, notes })
            });

            if (!response.ok) throw new Error('Failed to update stage');

            toast.success(`Stage updated successfully`);
            loadTherapist();
        } catch (error) {
            console.error('Update failed:', error);
            toast.error('Failed to update verification stage');
        } finally {
            setActionLoading(false);
        }
    };

    if (!therapist) return null;

    const isDocVerified = therapist.license_verified;
    const isBgCheckPassed = therapist.background_check_status === 'completed';
    const isActive = therapist.account_status === 'active';
    const isRejected = therapist.account_status === 'rejected';

    const StatusBadge = ({ active, label, icon: Icon }: { active: boolean, label: string, icon: any }) => (
        <div className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ring-1 ring-inset transition-all",
            active
                ? "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/30 dark:text-green-400 dark:ring-green-500/30"
                : "bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700"
        )}>
            <Icon className="w-3.5 h-3.5" />
            {label}
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="!max-w-6xl w-[95vw] p-0 overflow-hidden bg-white dark:bg-zinc-950 border-0 shadow-2xl sm:rounded-3xl ring-1 ring-zinc-200 dark:ring-zinc-800 outline-none">

                {/* Modern Header - Clean & Spacious */}
                <div className="relative bg-zinc-50/80 dark:bg-zinc-900/50 pt-10 px-8 pb-8 border-b border-zinc-100 dark:border-zinc-800/50">
                    <div className="absolute top-6 right-6 flex gap-3">
                        <StatusBadge active={isActive} label={isActive ? "Active" : "In Review"} icon={isActive ? UserCheck : Clock} />
                        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative"
                        >
                            <Avatar className="h-28 w-28 ring-8 ring-white dark:ring-zinc-950 shadow-2xl bg-white dark:bg-zinc-900">
                                <AvatarImage src={therapist.profile_image_url} className="object-cover" />
                                <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-orange-100 to-orange-50 text-orange-600 dark:from-orange-900/30 dark:to-orange-900/10 dark:text-orange-500">
                                    {therapist.first_name?.[0]}{therapist.last_name?.[0]}
                                </AvatarFallback>
                            </Avatar>
                            {isActive && (
                                <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1.5 rounded-full ring-4 ring-white dark:ring-zinc-950 shadow-sm">
                                    <Check className="w-4 h-4" strokeWidth={3} />
                                </div>
                            )}
                        </motion.div>

                        <div className="text-center md:text-left space-y-2 pt-2">
                            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                                {therapist.first_name} {therapist.last_name}
                            </h2>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 px-3 py-1 rounded-full shadow-sm border border-zinc-200/50 dark:border-zinc-800">
                                    <Mail className="w-3.5 h-3.5" />
                                    {therapist.email}
                                </div>
                                <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 px-3 py-1 rounded-full shadow-sm border border-zinc-200/50 dark:border-zinc-800">
                                    <Shield className="w-3.5 h-3.5" />
                                    License: {therapist.license_number || 'Pending'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row min-h-[600px] bg-white dark:bg-zinc-950">

                    {/* Left: Workflow Timeline */}
                    <div className="flex-1 p-8 md:p-12 space-y-12">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Onboarding Progress</h3>
                            <span className="text-xs text-zinc-400 font-medium">
                                {isActive ? 'Completed' : 'In Progress'}
                            </span>
                        </div>

                        <div className="relative space-y-12 pl-4">
                            {/* Connecting Line */}
                            <div className="absolute left-[27px] top-4 bottom-12 w-[2px] bg-gradient-to-b from-green-500 via-orange-300 to-zinc-200 dark:from-green-500 dark:via-orange-700 dark:to-zinc-800 md:block hidden opacity-30"></div>

                            {/* Step 1: Registration (Done) */}
                            <div className="relative grid grid-cols-[50px_1fr] gap-6 group">
                                <div className="flex flex-col items-center">
                                    <div className="w-14 h-14 rounded-full bg-green-50 dark:bg-green-900/20 border-2 border-green-500 text-green-600 flex items-center justify-center shadow-sm z-10 transition-transform group-hover:scale-110 duration-300">
                                        <Check className="w-6 h-6" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Account Created</h4>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Profile setup and email verification completed.</p>
                                </div>
                            </div>

                            {/* Step 2: License (Active) */}
                            <div className="relative grid grid-cols-[50px_1fr] gap-6 group">
                                <div className="flex flex-col items-center">
                                    <div className={cn("w-14 h-14 rounded-full flex items-center justify-center border-2 shadow-sm z-10 transition-all duration-300",
                                        isDocVerified
                                            ? "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-600"
                                            : "bg-white dark:bg-zinc-900 border-orange-500 text-orange-500 ring-4 ring-orange-50 dark:ring-orange-900/20"
                                    )}>
                                        {isDocVerified ? <Check className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                                    </div>
                                </div>
                                <div className="bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800 transition-shadow hover:shadow-md">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">License Verification</h4>
                                            <p className="text-zinc-500 dark:text-zinc-400 text-sm">Review submitted credentials.</p>
                                        </div>
                                        {isDocVerified && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">Verified</Badge>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200/50 dark:border-zinc-800">
                                            <div className="text-[10px] uppercase font-bold text-zinc-400 mb-1">State</div>
                                            <div className="font-semibold text-zinc-800 dark:text-zinc-200">{therapist.license_state || 'N/A'}</div>
                                        </div>
                                        <div className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200/50 dark:border-zinc-800">
                                            <div className="text-[10px] uppercase font-bold text-zinc-400 mb-1">Number</div>
                                            <div className="font-mono font-medium text-zinc-800 dark:text-zinc-200">{therapist.license_number || 'N/A'}</div>
                                        </div>
                                    </div>

                                    {!isDocVerified && (
                                        <div className="flex gap-3">
                                            <Button onClick={() => handleStageUpdate('documents', 'rejected')} disabled={actionLoading} variant="ghost" className="hover:bg-red-50 hover:text-red-600 text-zinc-500">Reject</Button>
                                            <Button onClick={() => handleStageUpdate('documents', 'approved')} disabled={actionLoading} className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 px-6">Approve License</Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Step 3: Background Check */}
                            <div className={cn("relative grid grid-cols-[50px_1fr] gap-6 group transition-opacity duration-300", !isDocVerified && "opacity-50 grayscale")}>
                                <div className="flex flex-col items-center">
                                    <div className={cn("w-14 h-14 rounded-full flex items-center justify-center border-2 z-10 bg-white dark:bg-zinc-900",
                                        isBgCheckPassed
                                            ? "border-green-500 text-green-600 bg-green-50 dark:bg-green-900/20"
                                            : "border-zinc-200 dark:border-zinc-700 text-zinc-300"
                                    )}>
                                        <Shield className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Background Check</h4>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">Safety and criminal record screening.</p>

                                    {isDocVerified && !isBgCheckPassed && (
                                        <div className="flex gap-3">
                                            <Button onClick={() => handleStageUpdate('background_check', 'rejected')} disabled={actionLoading} variant="ghost" className="hover:bg-red-50 hover:text-red-600 text-zinc-500">Fail</Button>
                                            <Button onClick={() => handleStageUpdate('background_check', 'approved')} disabled={actionLoading} variant="outline" className="border-zinc-300 dark:border-zinc-700 font-medium">Pass Check</Button>
                                        </div>
                                    )}
                                    {isBgCheckPassed && <div className="text-sm font-medium text-green-600 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Passed Successfully</div>}
                                </div>
                            </div>

                            {/* Step 4: Final Activation */}
                            <div className={cn("relative grid grid-cols-[50px_1fr] gap-6 group transition-opacity duration-300", !isBgCheckPassed && "opacity-50 grayscale")}>
                                <div className="flex flex-col items-center">
                                    <div className={cn("w-14 h-14 rounded-full flex items-center justify-center border-2 z-10 bg-white dark:bg-zinc-900",
                                        isActive
                                            ? "border-green-500 text-green-600 bg-green-50 dark:bg-green-900/20"
                                            : "border-zinc-200 dark:border-zinc-700 text-zinc-300"
                                    )}>
                                        <UserCheck className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Final Activation</h4>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">Grant access to platform dashboard.</p>

                                    {isBgCheckPassed && !isActive && !isRejected && (
                                        <Button onClick={() => handleStageUpdate('final', 'approved')} disabled={actionLoading} className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20 px-8 py-6 text-lg h-auto rounded-xl">
                                            Activate Account
                                            <ArrowRight className="ml-2 w-5 h-5" />
                                        </Button>
                                    )}
                                    {isActive && <div className="text-sm font-medium text-green-600 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Account is Active</div>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Tools Panel */}
                    <div className="w-full md:w-[360px] bg-zinc-50/80 dark:bg-zinc-900/30 border-l border-zinc-100 dark:border-zinc-800 p-8 flex flex-col gap-8">
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Internal Notes
                            </h4>
                            <div className="bg-white dark:bg-zinc-950 p-1 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
                                <Textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add verification notes..."
                                    className="min-h-[180px] border-0 bg-transparent resize-none focus-visible:ring-0 text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400"
                                />
                                <div className="flex justify-between items-center px-2 pb-2 mt-2">
                                    <span className="text-[10px] text-zinc-400 font-medium">Markdown supported</span>
                                    <Button size="sm" variant="ghost" className="h-7 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500">Save</Button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Quick Actions</h4>
                            <div className="space-y-3">
                                <button className="w-full flex items-center gap-3 p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all text-left text-sm font-medium text-zinc-700 dark:text-zinc-300 group">
                                    <div className="p-2 bg-zinc-50 dark:bg-zinc-900 rounded-lg group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800 transition-colors">
                                        <Mail className="w-4 h-4 text-zinc-500" />
                                    </div>
                                    Send Email
                                </button>
                                <button className="w-full flex items-center gap-3 p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all text-left text-sm font-medium text-zinc-700 dark:text-zinc-300 group">
                                    <div className="p-2 bg-zinc-50 dark:bg-zinc-900 rounded-lg group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800 transition-colors">
                                        <FileText className="w-4 h-4 text-zinc-500" />
                                    </div>
                                    View Documents
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
