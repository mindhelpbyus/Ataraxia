import React from 'react';
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface VerificationBannerProps {
  accountStatus: string;
  userRole: string;
  className?: string;
}

export function VerificationBanner({ accountStatus, userRole, className = '' }: VerificationBannerProps) {
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
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-400',
          iconColor: 'text-blue-400',
          textColor: 'text-blue-700',
          title: 'Complete Your Onboarding',
          message: 'Finish your therapist application to access clients and start accepting appointments.'
        };
      
      case 'onboarding_pending':
        return {
          icon: Clock,
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-400',
          iconColor: 'text-amber-400',
          textColor: 'text-amber-700',
          title: 'Verification Pending',
          message: 'Your application is under review. You\'ll get full access to clients once approved (typically 24-48 hours).'
        };
      
      case 'pending':
      case 'pending_verification':
      case 'documents_review':
      case 'background_check':
      case 'final_review':
        return {
          icon: Clock,
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-400',
          iconColor: 'text-amber-400',
          textColor: 'text-amber-700',
          title: 'Verification In Progress',
          message: 'Your application is being reviewed. You\'ll be notified once the verification process is complete.'
        };
      
      case 'rejected':
        return {
          icon: AlertCircle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-400',
          iconColor: 'text-red-400',
          textColor: 'text-red-700',
          title: 'Application Needs Attention',
          message: 'There are issues with your application. Please contact support for assistance.'
        };
      
      default:
        return {
          icon: Clock,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-400',
          iconColor: 'text-gray-400',
          textColor: 'text-gray-700',
          title: 'Account Status Update',
          message: 'Your account status is being updated. Please contact support if you have questions.'
        };
    }
  };

  const config = getBannerConfig(accountStatus);
  const IconComponent = config.icon;

  return (
    <div className={`${config.bgColor} border-l-4 ${config.borderColor} p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <IconComponent className={`h-5 w-5 ${config.iconColor}`} />
        </div>
        <div className="ml-3">
          <p className={`text-sm ${config.textColor}`}>
            <strong>{config.title}</strong> - {config.message}
          </p>
        </div>
      </div>
    </div>
  );
}