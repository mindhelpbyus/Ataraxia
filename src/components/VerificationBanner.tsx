import React from 'react';
import { Clock, AlertCircle, CheckCircle2, ChevronRight, Settings } from 'lucide-react';
import { Button } from './ui/button';

interface VerificationBannerProps {
  accountStatus: string;
  userRole: string;
  className?: string;
  onCompleteProfile?: () => void;
  profileCompletion?: number;
}

export function VerificationBanner({ accountStatus, userRole, className = '', onCompleteProfile, profileCompletion = 10 }: VerificationBannerProps) {
  // Only show banner for therapists
  if (userRole !== 'therapist') {
    return null;
  }

  // Don't show banner for verified/active users
  if (accountStatus === 'verified' || accountStatus === 'active') {
    return null;
  }

  const getBannerConfig = (status: string) => {
    switch (status) {
      case 'registered':
        return {
          icon: AlertCircle,
          bgColor: 'bg-orange-50', // Warm/Urgent
          borderColor: 'border-orange-200',
          iconColor: 'text-orange-600',
          textColor: 'text-orange-900',
          title: 'Complete Your Profile to Get Started',
          message: `Your profile is only ${profileCompletion}% complete. Complete your profile to get verified and start accepting clients.`,
          action: true
        };

      case 'onboarding_pending':
        return {
          icon: Clock,
          bgColor: 'bg-blue-50', // Calming/Waiting
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-500',
          textColor: 'text-blue-900',
          title: 'Verification Pending',
          message: 'Your application is under review. You\'ll get full access to clients once approved (typically 24-48 hours).',
          action: false
        };

      case 'pending':
      case 'pending_verification':
      case 'documents_review':
      case 'background_check':
      case 'final_review':
        return {
          icon: Clock,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-500',
          textColor: 'text-blue-900',
          title: 'Verification In Progress',
          message: 'Your application is being reviewed. You\'ll be notified once the verification process is complete.',
          action: false
        };

      case 'rejected':
        return {
          icon: AlertCircle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          textColor: 'text-red-900',
          title: 'Application Needs Attention',
          message: 'There are issues with your application. Please contact support for assistance.',
          action: false
        };

      default:
        return {
          icon: Clock,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-500',
          textColor: 'text-gray-900',
          title: 'Account Status Update',
          message: 'Your account status is being updated. Please contact support if you have questions.',
          action: false
        };
    }
  };

  const config = getBannerConfig(accountStatus);
  const IconComponent = config.icon;

  return (
    <div className={`${config.bgColor} border ${config.borderColor} rounded-xl p-6 ${className} shadow-sm transition-all duration-300`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full bg-white/60 backdrop-blur-sm ${config.iconColor} shadow-sm shrink-0`}>
            <IconComponent className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className={`text-base font-bold ${config.textColor}`}>
              {config.title}
            </h3>
            <p className={`text-sm ${config.textColor} opacity-90 max-w-2xl leading-relaxed`}>
              {config.message}
            </p>

            {/* Progress Bar for Registered Users */}
            {config.action && (
              <div className="mt-3 w-full max-w-xs space-y-2">
                <div className="flex justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <span>Profile Completion</span>
                  <span>{profileCompletion}%</span>
                </div>
                <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {config.action && onCompleteProfile && (
          <Button
            onClick={onCompleteProfile}
            className="bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg transition-all active:scale-95 font-semibold"
          >
            <Settings className="w-4 h-4 mr-2" />
            Complete Profile
          </Button>
        )}
      </div>
    </div>
  );
}