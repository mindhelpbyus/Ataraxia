import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { CheckCircle2, User, FileText, Award, Calendar, Shield } from 'lucide-react';
import { get } from '../../api/client';
import { logger } from '../../services/secureLogger';

interface OnboardingStatus {
  profileCompleted: boolean;
  credentialsCompleted: boolean;
  licenseCompleted: boolean;
  availabilityCompleted: boolean;
  overallCompleted: boolean;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  path: string;
}

export function OnboardingRouter() {
  const navigate = useNavigate();
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOnboardingStatus();
  }, []);

  const fetchOnboardingStatus = async () => {
    try {
      const result = await get<{ success: boolean; onboardingStatus: OnboardingStatus }>('/onboarding/status');
      
      if (result.success) {
        setOnboardingStatus(result.onboardingStatus);
        
        // If onboarding is complete, redirect to dashboard
        if (result.onboardingStatus.overallCompleted) {
          navigate('/dashboard');
          return;
        }
      } else {
        throw new Error('Failed to fetch onboarding status');
      }
    } catch (error: any) {
      logger.error('Failed to fetch onboarding status', { error: error.message });
      setError('Failed to load onboarding status');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your onboarding progress...</p>
        </div>
      </div>
    );
  }

  if (error || !onboardingStatus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 mb-4">{error || 'Failed to load onboarding'}</p>
            <Button onClick={fetchOnboardingStatus}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const steps: OnboardingStep[] = [
    {
      id: 'profile',
      title: 'Personal Profile',
      description: 'Complete your personal information and bio',
      icon: <User className="w-6 h-6" />,
      completed: onboardingStatus.profileCompleted,
      path: '/onboarding/profile'
    },
    {
      id: 'credentials',
      title: 'Credentials & Education',
      description: 'Add your education and specializations',
      icon: <FileText className="w-6 h-6" />,
      completed: onboardingStatus.credentialsCompleted,
      path: '/onboarding/credentials'
    },
    {
      id: 'license',
      title: 'License & Certifications',
      description: 'Upload your professional licenses',
      icon: <Award className="w-6 h-6" />,
      completed: onboardingStatus.licenseCompleted,
      path: '/onboarding/license'
    },
    {
      id: 'availability',
      title: 'Availability & Preferences',
      description: 'Set your schedule and session preferences',
      icon: <Calendar className="w-6 h-6" />,
      completed: onboardingStatus.availabilityCompleted,
      path: '/onboarding/availability'
    }
  ];

  const completedSteps = steps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  const handleStepClick = (step: OnboardingStep) => {
    navigate(step.path);
  };

  const handleSkipForNow = () => {
    // Allow user to access dashboard with incomplete onboarding
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600 mb-6">
            Help us set up your therapist profile so clients can find and book with you
          </p>
          
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{completedSteps} of {steps.length} completed</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {steps.map((step) => (
            <Card 
              key={step.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                step.completed 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => handleStepClick(step)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      step.completed 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {step.completed ? <CheckCircle2 className="w-6 h-6" /> : step.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{step.title}</CardTitle>
                    </div>
                  </div>
                  {step.completed && (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 text-sm">{step.description}</p>
                <div className="mt-3">
                  <Button 
                    variant={step.completed ? "outline" : "default"}
                    size="sm"
                    className="w-full"
                  >
                    {step.completed ? 'Review & Edit' : 'Complete Step'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            You can complete these steps later if needed
          </p>
          <Button 
            variant="outline" 
            onClick={handleSkipForNow}
            className="mr-4"
          >
            Skip for Now
          </Button>
          <Button 
            onClick={() => {
              const nextIncompleteStep = steps.find(step => !step.completed);
              if (nextIncompleteStep) {
                handleStepClick(nextIncompleteStep);
              }
            }}
            disabled={onboardingStatus.overallCompleted}
          >
            Continue Onboarding
          </Button>
        </div>
      </div>
    </div>
  );
}