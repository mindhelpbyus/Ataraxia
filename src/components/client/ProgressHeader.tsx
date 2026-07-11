
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';

interface ProgressHeaderProps {
    currentStep: number;
    totalSteps: number;
    stepTitle: string;
}

export function ProgressHeader({ currentStep, totalSteps }: ProgressHeaderProps) {
    const progressPercent = (currentStep / totalSteps) * 100;

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <div className="text-sm text-muted-foreground mb-1">
                        Step {currentStep} of {totalSteps}
                    </div>
                </div>
                <Badge variant="secondary" className="bg-muted text-foreground border-0 px-3 py-1">
                    {Math.round(progressPercent)}% Complete
                </Badge>
            </div>
            <Progress value={progressPercent} className="h-2 bg-muted">
                <div
                    className="h-full bg-[#1E7048] transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                />
            </Progress>
        </div>
    );
}
