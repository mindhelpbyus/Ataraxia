import { ChevronRight, CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Therapist } from '@/types/therapist';
import { cn } from '@/lib/utils';

interface TherapistCardProps {
    therapist: Therapist;
    onClick: () => void;
}

export function TherapistCard({ therapist, onClick }: TherapistCardProps) {
    const getStatusInfo = () => {
        switch (therapist.account_status) {
            case 'active':
                return {
                    icon: <CheckCircle2 className="h-4 w-4" />,
                    label: 'Active',
                    className: 'bg-green-500/10 text-green-600 border-green-500/20',
                };
            case 'rejected':
                return {
                    icon: <XCircle className="h-4 w-4" />,
                    label: 'Rejected',
                    className: 'bg-destructive/10 text-destructive border-destructive/20',
                };
            case 'suspended':
                return {
                    icon: <AlertTriangle className="h-4 w-4" />,
                    label: 'Suspended',
                    className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
                };
            default:
                return {
                    icon: <Clock className="h-4 w-4" />,
                    label: 'Onboarding',
                    className: 'bg-primary/10 text-primary border-primary/20',
                };
        }
    };

    const getCurrentStep = () => {
        if (therapist.account_status === 'active') return 'Completed';
        if (therapist.account_status === 'rejected') return 'Rejected';
        if (!therapist.license_verified) return 'License Verification';
        if (therapist.background_check_status !== 'completed') return 'Background Check';
        return 'Final Activation';
    };

    const getProgress = () => {
        let completed = 1; // Registration always done
        if (therapist.license_verified) completed++;
        if (therapist.background_check_status === 'completed') completed++;
        if (therapist.account_status === 'active') completed++;
        return completed;
    };

    const status = getStatusInfo();
    const progress = getProgress();

    return (
        <Card
            className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/30 active:scale-[0.99]"
            onClick={onClick}
        >
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 ring-2 ring-background shadow-sm">
                        <AvatarImage src={therapist.profile_image_url} alt={`${therapist.first_name} ${therapist.last_name}`} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {therapist.first_name[0]}{therapist.last_name[0]}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate">
                                {therapist.first_name} {therapist.last_name}
                            </h3>
                            <Badge variant="outline" className={cn('text-xs flex gap-1', status.className)}>
                                <span className="mr-1">{status.icon}</span>
                                {status.label}
                            </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground truncate">{therapist.email}</p>

                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1.5">
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4].map((step) => (
                                        <div
                                            key={step}
                                            className={cn(
                                                'h-1.5 w-6 rounded-full transition-colors',
                                                step <= progress ? 'bg-green-500' : 'bg-muted'
                                            )}
                                        />
                                    ))}
                                </div>
                                <span className="text-xs text-muted-foreground">{progress}/4</span>
                            </div>

                            <span className="text-xs text-muted-foreground hidden sm:inline">
                                Current: <span className="font-medium text-foreground">{getCurrentStep()}</span>
                            </span>
                        </div>
                    </div>

                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
            </CardContent>
        </Card>
    );
}
