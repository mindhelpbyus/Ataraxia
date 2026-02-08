import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { AlertCircle, CheckCircle2, Settings } from 'lucide-react';

interface ProfileCompletionBannerProps {
  completionPercentage: number;
  onCompleteProfile: () => void;
  onDismiss?: () => void;
}

export function ProfileCompletionBanner({ 
  completionPercentage, 
  onCompleteProfile,
  onDismiss 
}: ProfileCompletionBannerProps) {
  // Don't show if profile is 100% complete
  if (completionPercentage >= 100) {
    return null;
  }

  const isLowCompletion = completionPercentage < 30;
  const isMediumCompletion = completionPercentage >= 30 && completionPercentage < 70;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-6"
    >
      <div className={`relative overflow-hidden rounded-[1.5rem] border shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] ${
        isLowCompletion 
          ? 'bg-orange-50 border-orange-200' 
          : isMediumCompletion 
          ? 'bg-blue-50 border-blue-200' 
          : 'bg-green-50 border-green-200'
      }`}>
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className={`p-3 rounded-2xl ${
                isLowCompletion 
                  ? 'bg-orange-100' 
                  : isMediumCompletion 
                  ? 'bg-blue-100' 
                  : 'bg-green-100'
              }`}>
                {completionPercentage >= 70 ? (
                  <CheckCircle2 className={`w-6 h-6 ${
                    completionPercentage >= 70 ? 'text-green-600' : 'text-blue-600'
                  }`} />
                ) : (
                  <AlertCircle className={`w-6 h-6 ${
                    isLowCompletion ? 'text-orange-600' : 'text-blue-600'
                  }`} />
                )}
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-1 tracking-tight">
                  {completionPercentage < 30 
                    ? 'Complete Your Profile to Get Started' 
                    : completionPercentage < 70 
                    ? 'Almost There! Finish Your Profile' 
                    : 'Final Steps to Complete Your Profile'}
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  {completionPercentage < 30 
                    ? 'Your profile is only ' + completionPercentage + '% complete. Complete your profile to get verified and start accepting clients.' 
                    : completionPercentage < 70 
                    ? 'You\'re making great progress! Just a few more sections to complete.' 
                    : 'You\'re almost done! Complete the remaining sections to unlock all features.'}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">Profile Completion</span>
                    <span className="font-bold text-slate-900">{completionPercentage}%</span>
                  </div>
                  <Progress 
                    value={completionPercentage} 
                    className="h-2 bg-white/50"
                    indicatorClassName={
                      isLowCompletion 
                        ? 'bg-orange-500' 
                        : isMediumCompletion 
                        ? 'bg-blue-500' 
                        : 'bg-green-500'
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={onCompleteProfile}
                className="bg-[var(--action-primary-base)] hover:bg-[var(--action-primary-hover)] text-white shadow-sm"
              >
                <Settings className="w-4 h-4 mr-2" />
                Complete Profile
              </Button>
              {onDismiss && completionPercentage > 30 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDismiss}
                  className="text-slate-500 hover:text-slate-700"
                >
                  Dismiss
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
