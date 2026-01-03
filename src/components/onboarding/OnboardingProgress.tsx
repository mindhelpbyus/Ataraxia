import React from 'react';
import { Check } from 'lucide-react';
import { OnboardingStep } from '../../types/onboarding';

interface OnboardingProgressProps {
  currentStep: OnboardingStep;
  totalSteps: number;
}

const steps = [
  { number: 1, label: 'Account' },
  { number: 2, label: 'Verification' },
  { number: 3, label: 'Personal' },
  { number: 4, label: 'Credentials' },
  { number: 5, label: 'License' },
  { number: 6, label: 'Availability' },
  { number: 7, label: 'Review' },
  { number: 8, label: 'Demographics' },
  { number: 9, label: 'Insurance' },
  { number: 10, label: 'Profile' },
];

export function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-8">
      <div className="relative">
        {/* Progress Bar Background */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200" style={{ top: '20px' }} />
        
        {/* Progress Bar Fill */}
        <div 
          className="absolute top-5 left-0 h-0.5 bg-[#F97316] transition-all duration-500"
          style={{ 
            width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
            top: '20px'
          }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step) => {
            const isCompleted = step.number < currentStep;
            const isCurrent = step.number === currentStep;
            const isPending = step.number > currentStep;

            return (
              <div key={step.number} className="flex flex-col items-center">
                {/* Step Circle */}
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    transition-all duration-300 relative z-10
                    ${isCompleted ? 'bg-[#F97316] text-white' : ''}
                    ${isCurrent ? 'bg-[#F97316] text-white ring-4 ring-[#F97316]/20' : ''}
                    ${isPending ? 'bg-white border-2 border-gray-300 text-gray-400' : ''}
                  `}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className={isCurrent ? 'font-semibold' : ''}>{step.number}</span>
                  )}
                </div>

                {/* Step Label */}
                <span
                  className={`
                    mt-2 text-xs font-medium text-center
                    ${isCurrent ? 'text-[#F97316]' : ''}
                    ${isCompleted ? 'text-gray-700' : ''}
                    ${isPending ? 'text-gray-400' : ''}
                  `}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Step Indicator */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Step <span className="font-semibold text-[#F97316]">{currentStep}</span> of {totalSteps}
        </p>
      </div>
    </div>
  );
}