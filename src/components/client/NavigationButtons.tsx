
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface NavigationButtonsProps {
    currentStep: number;
    totalSteps: number;
    isStepValid: boolean;
    onPrevious: () => void;
    onNext: () => void;
    onSaveAndExit: () => void;
}

export function NavigationButtons({
    currentStep,
    totalSteps,
    isStepValid,
    onPrevious,
    onNext,
    onSaveAndExit
}: NavigationButtonsProps) {
    const isLastStep = currentStep === totalSteps;

    return (
        <div className="flex items-center justify-between gap-4 pt-6 border-t border-border">
            <Button
                variant="outline"
                onClick={onPrevious}
                disabled={currentStep === 1}
                className="w-32 border-border hover:bg-[var(--surface-warm)]"
            >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
            </Button>

            <div className="flex gap-2">
                <Button
                    variant="ghost"
                    onClick={onSaveAndExit}
                    className="hidden sm:flex text-muted-foreground hover:text-foreground hover:bg-[var(--surface-warm)]"
                >
                    Save Draft
                </Button>
                <Button
                    onClick={onNext}
                    disabled={!isStepValid}
                    size="lg"
                    className="w-40 bg-[#1E7048] hover:bg-[#ea6b0f] text-white disabled:bg-[var(--rule)] disabled:text-muted-foreground"
                >
                    {isLastStep ? (
                        <>
                            <Check className="h-4 w-4 mr-2" />
                            Complete
                        </>
                    ) : (
                        <>
                            Next Step
                            <ChevronRight className="h-4 w-4 ml-2" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
