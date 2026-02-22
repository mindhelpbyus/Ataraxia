import React from 'react';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';

interface ProgressHeaderProps {
    currentStep: number;
    totalSteps: number;
    stepTitle: string;
}

export function ProgressHeader({ currentStep, totalSteps, stepTitle }: ProgressHeaderProps) {
    const progressPercent = (currentStep / totalSteps) * 100;

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <div className="text-sm text-gray-500 mb-1">
                        Step {currentStep} of {totalSteps}
                    </div>
                </div>
                <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-0 px-3 py-1">
                    {Math.round(progressPercent)}% Complete
                </Badge>
            </div>
            <Progress value={progressPercent} className="h-2 bg-gray-100">
                <div
                    className="h-full bg-[#F97316] transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                />
            </Progress>
        </div>
    );
}
