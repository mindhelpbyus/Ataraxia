import { useState } from 'react';
import {
    Check,
    X,
    AlertCircle,
    FileText,
    Calendar,
    Shield,
    User,
    Clock,
    ExternalLink
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

import { Therapist, VerificationStage, VerificationStatus } from '@/types/therapist';
import { WorkflowStepper } from './WorkflowStepper';
import { VerificationStep } from './VerificationStep';

export interface TherapistVerificationModalProps {
    therapist: Therapist | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (therapistId: string, stage: VerificationStage, status: VerificationStatus, notes?: string) => Promise<void>;
}

export function TherapistVerificationModal({
    therapist,
    isOpen,
    onClose,
    onUpdate
}: TherapistVerificationModalProps) {
    const [notes, setNotes] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [isLoading, setIsLoading] = useState(false);

    if (!therapist) return null;

    const handleStageUpdate = async (stage: VerificationStage, status: VerificationStatus) => {
        setIsLoading(true);
        try {
            // Pass the update to the parent component which handles the API call
            await onUpdate(therapist.id, stage, status, notes);

            // Notes are cleared only on success (handled by parent logic typically, but we can clear here)
            // Since onUpdate is async and we await it, if it throws we won't get here.
            setNotes('');
            // Toast is mostly handled by parent to coordinate with list refresh, 
            // but we could add specific feedback here if needed.
        } catch (error) {
            console.error('Update failed', error);
            // Parent should handle error toast
        } finally {
            setIsLoading(false);
        }
    };

    const getStep2Status = () => {
        // Logic for Step 2: License Verification
        // Simplified: If license verified -> completed. Else if rejected -> failed. Else -> current (if step 1 done).
        // Assuming Step 1 (Registration) is always done if they are in the list.
        if (therapist.account_status === 'rejected') return 'failed';
        return therapist.license_verified ? 'completed' : 'current';
    };

    const getStep3Status = () => {
        // Logic for Step 3: Background Check (depends on Step 2)
        if (!therapist.license_verified) return 'pending';

        // If pending, check specific background status
        if (therapist.background_check_status === 'failed') return 'failed';
        if (therapist.background_check_status === 'completed') return 'completed';

        // If we are here, license is verified, so this is the current step
        return 'current';
    };

    const getStep4Status = () => {
        // Logic for Step 4: Final Review (depends on Step 3)
        if (therapist.background_check_status !== 'completed') return 'pending';

        if (therapist.account_status === 'active') return 'completed';
        if (therapist.account_status === 'rejected') return 'failed'; // Could be rejected at final stage

        return 'current';
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">

                {/* Header */}
                <div className="p-6 border-b bg-muted/10">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
                                <AvatarImage src={therapist.profile_image_url} />
                                <AvatarFallback className="text-lg bg-primary/10 text-primary">
                                    {therapist.first_name[0]}{therapist.last_name[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <DialogTitle className="text-2xl font-bold">
                                    {therapist.first_name} {therapist.last_name}
                                </DialogTitle>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <FileText className="h-3 w-3" />
                                        License: {therapist.license_number || 'Pending'}
                                    </span>
                                    <span>•</span>
                                    <span>{therapist.email}</span>
                                </div>
                                <div className="flex gap-2 pt-1">
                                    {/* Status Badge */}
                                    <Badge variant={therapist.account_status === 'active' ? 'default' : 'secondary'} className="capitalize">
                                        {therapist.account_status?.replace('_', ' ')}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col">
                    <ScrollArea className="flex-1">
                        <div className="p-6 space-y-8">

                            {/* Visual Stepper */}
                            <WorkflowStepper therapist={therapist} />

                            <div className="grid gap-6">
                                {/* Step 1: Registration (Always Completed) */}
                                <VerificationStep
                                    title="1. Registration Profile"
                                    description="Basic account details and profile information."
                                    status="completed"
                                    details={[
                                        { label: 'Joined', value: new Date(therapist.created_at).toLocaleDateString() },
                                        { label: 'Email', value: therapist.email }
                                    ]}
                                />

                                {/* Step 2: License Verification */}
                                <VerificationStep
                                    title="2. License Verification"
                                    description="Verify the therapist's state license against the official registry."
                                    status={getStep2Status()}
                                    details={[
                                        { label: 'License Number', value: therapist.license_number },
                                        { label: 'State', value: therapist.license_state }
                                    ]}
                                    approveLabel="Verify License"
                                    rejectLabel="Reject License"
                                    onApprove={async () => await handleStageUpdate('documents', 'approved')}
                                    onReject={async () => await handleStageUpdate('documents', 'rejected')}
                                    isLoading={isLoading}
                                />

                                {/* Step 3: Background Check */}
                                <VerificationStep
                                    title="3. Background Check"
                                    description="Review criminal record and safety screenings."
                                    status={getStep3Status()}
                                    details={[
                                        { label: 'Current Status', value: therapist.background_check_status?.toUpperCase() || 'NOT STARTED' }
                                    ]}
                                    approveLabel="Pass Background Check"
                                    rejectLabel="Fail Background Check"
                                    onApprove={async () => await handleStageUpdate('background_check', 'approved')}
                                    onReject={async () => await handleStageUpdate('background_check', 'rejected')}
                                    isLoading={isLoading}
                                />

                                {/* Step 4: Final Approval */}
                                <VerificationStep
                                    title="4. Final Activation"
                                    description="Activate the therapist account to start accepting patients."
                                    status={getStep4Status()}
                                    approveLabel="Activate Account"
                                    rejectLabel="Reject Application"
                                    onApprove={async () => await handleStageUpdate('final', 'approved')}
                                    onReject={async () => await handleStageUpdate('final', 'rejected')}
                                    isLoading={isLoading}
                                />
                            </div>

                            <Separator />

                            {/* Notes Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-primary" />
                                    <h3 className="font-semibold">Verification Notes</h3>
                                </div>

                                {therapist.verification_notes && (
                                    <div className="bg-muted/30 p-4 rounded-lg text-sm border border-border/50">
                                        <span className="font-medium text-muted-foreground block mb-1">Previous Notes:</span>
                                        {therapist.verification_notes}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Add Note</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Enter notes about this verification step (e.g., 'License verified on CA breeze board')..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="min-h-[100px]"
                                    />
                                </div>
                            </div>

                        </div>
                    </ScrollArea>
                </div>

            </DialogContent>
        </Dialog>
    );
}
