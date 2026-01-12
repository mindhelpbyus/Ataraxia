import { Check, Clock, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type StepStatus = 'completed' | 'current' | 'pending' | 'failed' | 'in_progress';

interface VerificationStepProps {
    title: string;
    description: string;
    status: StepStatus;
    details?: { label: string; value: string }[];
    onApprove?: () => void;
    onReject?: () => void;
    approveLabel?: string;
    rejectLabel?: string;
    isLoading?: boolean;
}

export function VerificationStep({
    title,
    description,
    status,
    details,
    onApprove,
    onReject,
    approveLabel = 'Approve',
    rejectLabel = 'Reject',
    isLoading,
}: VerificationStepProps) {
    const isCurrent = status === 'current';
    const isCompleted = status === 'completed';

    return (
        <Card className={cn(
            'transition-all duration-300 border',
            isCurrent ? 'border-teal-500/40 shadow-[0_0_30px_-10px_rgba(20,184,166,0.3)] bg-white ring-1 ring-teal-500/20' : 'border-slate-200 bg-white/50 shadow-sm',
            status === 'pending' && 'opacity-60 grayscale-[0.5]'
        )}>
            <CardContent className="p-8">
                <div className="flex items-start gap-5">
                    {/* Icon Status Indicator */}
                    <div className="mt-1 shrink-0">
                        {status === 'completed' ? (
                            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                <Check className="h-5 w-5 text-emerald-600" />
                            </div>
                        ) : status === 'failed' ? (
                            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                            </div>
                        ) : isCurrent ? (
                            <div className="h-8 w-8 rounded-full bg-teal-50 flex items-center justify-center ring-4 ring-teal-50">
                                <Clock className="h-5 w-5 text-teal-600 animate-pulse" />
                            </div>
                        ) : (
                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                                <Clock className="h-5 w-5 text-slate-400" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                            <h3 className={cn("text-lg font-bold tracking-tight text-slate-900", isCompleted && "text-slate-700")}>
                                {title}
                            </h3>

                            {/* Status Badge */}
                            {isCompleted && (
                                <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                    Completed
                                </span>
                            )}
                            {isCurrent && (
                                <span className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 ring-1 ring-inset ring-teal-600/20">
                                    Action Required
                                </span>
                            )}
                            {status === 'pending' && (
                                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                                    Pending
                                </span>
                            )}
                        </div>

                        <p className="text-sm text-slate-500 font-medium">{description}</p>

                        {/* Details Grid */}
                        {details && details.length > 0 && (
                            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 rounded-xl bg-slate-50/80 p-6 border border-slate-100">
                                {details.map((detail, idx) => (
                                    <div key={idx}>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">{detail.label}</p>
                                        <p className="text-base font-bold text-slate-900">{detail.value}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Actions */}
                        {isCurrent && (onApprove || onReject) && (
                            <div className="flex flex-col sm:flex-row gap-4 pt-6 mt-2">
                                {onApprove && (
                                    <Button
                                        onClick={onApprove}
                                        disabled={isLoading}
                                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold h-12 text-base shadow-sm ring-4 ring-emerald-500/10 border-2 border-emerald-500 transition-all hover:-translate-y-0.5"
                                    >
                                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                                        {approveLabel}
                                    </Button>
                                )}
                                {onReject && (
                                    <Button
                                        onClick={onReject}
                                        disabled={isLoading}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold h-12 text-base shadow-sm ring-4 ring-red-600/10 border-2 border-red-600 transition-all hover:-translate-y-0.5"
                                    >
                                        {rejectLabel}
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
