import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { CheckCircle2, XCircle, AlertCircle, FileText, Shield, UserCheck, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { dataService } from '../api';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';

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
            // Call the specialized verification endpoint
            // Note: dataService.update usually does PATCH, but we need POST or specific structure.
            // We'll use dataService.update but with a special flag or just use fetch directly if needed.
            // Actually, let's assume dataService can handle custom paths or we extend it?
            // For now, I'll direct fetch or assume dataService has a custom method.
            // Since I can't easily change dataService interface right now, I'll use raw fetch for this specific new endpoint.

            const response = await fetch(`${import.meta.env.VITE_THERAPIST_SERVICE_URL || 'http://localhost:3004/api'}/therapists/${therapistId}/verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stage, status, notes })
            });

            if (!response.ok) throw new Error('Failed to update stage');

            toast.success(`Stage ${stage} updated to ${status}`);
            loadTherapist(); // Reload to see changes
        } catch (error) {
            console.error('Update failed:', error);
            toast.error('Failed to update verification stage');
        } finally {
            setActionLoading(false);
        }
    };

    if (!therapist) return null;

    const currentStatus = therapist.account_status; // 'pending_verification', 'background_check', 'final_review', 'active'

    // Helper to determine stage state
    const isDocVerified = therapist.license_verified;
    const isBgCheckPassed = therapist.background_check_status === 'completed';
    const isActive = therapist.account_status === 'active';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={therapist.profile_image_url} />
                            <AvatarFallback>{therapist.first_name?.[0]}{therapist.last_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <DialogTitle className="text-xl">Verify Therapist Application</DialogTitle>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm text-muted-foreground">{therapist.first_name} {therapist.last_name}</p>
                                <Badge variant={isActive ? 'default' : 'secondary'}>{currentStatus?.replace('_', ' ')}</Badge>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-6">
                    {/* Stage 1: Registration */}
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <div className="w-0.5 grow bg-green-100 mt-2" />
                        </div>
                        <div className="pb-8">
                            <h3 className="font-semibold text-foreground">Registration Submitted</h3>
                            <p className="text-sm text-muted-foreground">User has completed basic profile, contact info, and email verification.</p>
                            <p className="text-xs text-muted-foreground mt-1">Signed up on: {new Date(therapist.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Stage 2: Documents */}
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${isDocVerified ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                {isDocVerified ? <CheckCircle2 className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                            </div>
                            <div className={`w-0.5 grow mt-2 ${isDocVerified ? 'bg-green-100' : 'bg-orange-100'}`} />
                        </div>
                        <div className="pb-8 grow">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-foreground">License & Documents Review</h3>
                                    <p className="text-sm text-muted-foreground">Verify professional license validty and insurance coverage.</p>
                                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm bg-muted p-3 rounded-md">
                                        <div>
                                            <span className="text-muted-foreground block text-xs">License Number</span>
                                            <span className="font-mono">{therapist.license_number || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground block text-xs">State</span>
                                            <span>{therapist.license_state || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {!isDocVerified ? (
                                        <>
                                            <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50"
                                                onClick={() => handleStageUpdate('documents', 'approved')} disabled={actionLoading}>
                                                Approve
                                            </Button>
                                            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50"
                                                onClick={() => handleStageUpdate('documents', 'rejected')} disabled={actionLoading}>
                                                Reject
                                            </Button>
                                        </>
                                    ) : (
                                        <Badge variant="outline" className="text-green-600 border-green-200">Verified</Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stage 3: Background Check */}
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${isBgCheckPassed ? 'bg-green-100 text-green-600' : (isDocVerified ? 'bg-orange-100 text-orange-600' : 'bg-muted text-muted-foreground')}`}>
                                <Shield className="h-5 w-5" />
                            </div>
                            <div className={`w-0.5 grow mt-2 ${isBgCheckPassed ? 'bg-green-100' : 'bg-muted'}`} />
                        </div>
                        <div className="pb-8 grow">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className={`font-semibold ${isDocVerified ? 'text-foreground' : 'text-muted-foreground'}`}>Background Check</h3>
                                    <p className="text-sm text-muted-foreground">Criminal record and safety screening status.</p>
                                </div>
                                <div className="flex gap-2">
                                    {isDocVerified && !isBgCheckPassed && (
                                        <>
                                            <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50"
                                                onClick={() => handleStageUpdate('background_check', 'approved')} disabled={actionLoading}>
                                                Pass Check
                                            </Button>
                                            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50"
                                                onClick={() => handleStageUpdate('background_check', 'rejected')} disabled={actionLoading}>
                                                Fail
                                            </Button>
                                        </>
                                    )}
                                    {isBgCheckPassed && <Badge variant="outline" className="text-green-600 border-green-200">Passed</Badge>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stage 4: Final Approval */}
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${isActive ? 'bg-green-600 text-white' : (isBgCheckPassed ? 'bg-orange-100 text-orange-600' : 'bg-muted text-muted-foreground')}`}>
                                <UserCheck className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="pb-2 grow">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className={`font-semibold ${isBgCheckPassed ? 'text-foreground' : 'text-muted-foreground'}`}>Final Activation</h3>
                                    <p className="text-sm text-muted-foreground">Activate account and grant access to dashboard.</p>
                                </div>
                                <div className="flex gap-2">
                                    {isBgCheckPassed && !isActive && (
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white"
                                            onClick={() => handleStageUpdate('final', 'approved')} disabled={actionLoading}>
                                            Activate Account
                                        </Button>
                                    )}
                                    {isActive && <Badge className="bg-green-600">Active</Badge>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator className="my-2" />

                <div className="space-y-2">
                    <label className="text-sm font-medium">Verification Notes (Internal)</label>
                    <Textarea
                        placeholder="Add internal notes about this application..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="min-h-[80px]"
                    />
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
