import React from 'react';
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
        <div className="flex items-center justify-between gap-4 pt-6 border-t border-gray-200">
            <Button
                variant="outline"
                onClick={onPrevious}
                disabled={currentStep === 1}
                className="w-32 border-gray-300 hover:bg-gray-50"
            >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
            </Button>

            <div className="flex gap-2">
                <Button
                    variant="ghost"
                    onClick={onSaveAndExit}
                    className="hidden sm:flex text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                    Save Draft
                </Button>
                <Button
                    onClick={onNext}
                    disabled={!isStepValid}
                    size="lg"
                    className="w-40 bg-[#F97316] hover:bg-[#ea6b0f] text-white disabled:bg-gray-300 disabled:text-gray-500"
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
