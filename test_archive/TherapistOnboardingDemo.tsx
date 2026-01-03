import React from 'react';
import { TherapistOnboarding } from './onboarding/TherapistOnboarding';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';

interface TherapistOnboardingDemoProps {
  onBack?: () => void;
}

export function TherapistOnboardingDemo({ onBack }: TherapistOnboardingDemoProps) {
  return (
    <div className="min-h-screen">
      {/* Onboarding Flow */}
      <TherapistOnboarding onComplete={onBack} />
    </div>
  );
}