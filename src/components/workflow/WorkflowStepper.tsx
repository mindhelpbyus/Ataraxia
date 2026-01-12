import { Check, Circle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Therapist } from '@/types/therapist';

interface Step {
    id: number;
    name: string;
    description: string;
}

const steps: Step[] = [
    { id: 1, name: 'Registration', description: 'Account created' },
    { id: 2, name: 'License Verification', description: 'Credentials validated' },
    { id: 3, name: 'Background Check', description: 'Security screening' },
    { id: 4, name: 'Final Activation', description: 'Go live' },
];

interface WorkflowStepperProps {
    therapist: Therapist;
}

export function WorkflowStepper({ therapist }: WorkflowStepperProps) {
    const getStepStatus = (stepId: number): 'completed' | 'current' | 'pending' | 'failed' => {
        const { license_verified, background_check_status, account_status } = therapist;

        switch (stepId) {
            case 1:
                return 'completed'; // Always completed if they're in the system
            case 2:
                if (account_status === 'rejected' && !license_verified) return 'failed';
                return license_verified ? 'completed' : 'current';
            case 3:
                if (!license_verified) return 'pending';
                if (background_check_status === 'failed') return 'failed';
                if (background_check_status === 'completed') return 'completed';
                return 'current';
            case 4:
                if (background_check_status !== 'completed') return 'pending';
                if (account_status === 'rejected') return 'failed';
                return account_status === 'active' ? 'completed' : 'current';
            default:
                return 'pending';
        }
    };

    return (
        <nav aria-label="Progress" className="mb-8 overflow-x-auto pb-4">
            <ol className="flex items-center min-w-[500px]">
                {steps.map((step, stepIdx) => {
                    const status = getStepStatus(step.id);

                    return (
                        <li
                            key={step.name}
                            className={cn(
                                'relative',
                                stepIdx !== steps.length - 1 ? 'flex-1 pr-8' : ''
                            )}
                        >
                            <div className="flex items-center">
                                <div
                                    className={cn(
                                        'relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 z-10',
                                        status === 'completed' && 'bg-emerald-500 border-emerald-500',
                                        status === 'current' && 'bg-teal-600 ring-4 ring-teal-100 border-teal-600',
                                        status === 'pending' && 'bg-white border-2 border-slate-200',
                                        status === 'failed' && 'bg-destructive border-destructive'
                                    )}
                                >
                                    {status === 'completed' ? (
                                        <Check className="h-5 w-5 text-white" />
                                    ) : status === 'failed' ? (
                                        <XCircle className="h-5 w-5 text-white" />
                                    ) : status === 'current' ? (
                                        <div className="h-3 w-3 bg-white rounded-full" />
                                    ) : (
                                        <span className="text-sm font-medium text-slate-400">{step.id}</span>
                                    )}
                                </div>

                                {stepIdx !== steps.length - 1 && (
                                    <div
                                        className={cn(
                                            'absolute left-10 top-5 h-0.5 w-[calc(100%-1.25rem)] -translate-y-1/2 transition-colors duration-300',
                                            status === 'completed' ? 'bg-emerald-500' : 'bg-slate-200'
                                        )}
                                    />
                                )}
                            </div>

                            <div className="mt-3">
                                <span
                                    className={cn(
                                        'text-sm font-semibold block',
                                        status === 'completed' && 'text-emerald-600',
                                        status === 'current' && 'text-teal-700',
                                        status === 'pending' && 'text-slate-500',
                                        status === 'failed' && 'text-destructive'
                                    )}
                                >
                                    {step.name}
                                </span>
                                <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
