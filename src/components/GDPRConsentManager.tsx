import  { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Separator } from './ui/separator';
import { logger } from '../utils/secureLogger';

interface ConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

interface GDPRConsentManagerProps {
  onConsentChange?: (preferences: ConsentPreferences) => void;
}

/**
 * ✅ P2 FIX: GDPR Consent UI Component
 * Compliant with GDPR Article 7 (Conditions for consent)
 * Provides granular consent management for data processing
 */
export function GDPRConsentManager({ onConsentChange }: GDPRConsentManagerProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    necessary: true, // Always true - required for app functionality
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    // Check if user has already provided consent
    const storedConsent = localStorage.getItem('gdpr-consent');
    if (!storedConsent) {
      setShowBanner(true);
    } else {
      try {
        const parsed = JSON.parse(storedConsent);
        setPreferences(parsed);
      } catch (error) {
        logger.error('Failed to parse stored consent', error);
        setShowBanner(true);
      }
    }
  }, []);

  const saveConsent = (prefs: ConsentPreferences) => {
    const consentData = {
      ...prefs,
      timestamp: new Date().toISOString(),
      version: '1.0',
    };
    
    localStorage.setItem('gdpr-consent', JSON.stringify(consentData));
    setShowBanner(false);
    setShowDetails(false);
    
    if (onConsentChange) {
      onConsentChange(prefs);
    }
    
    logger.info('GDPR consent saved', { preferences: prefs });
  };

  const handleAcceptAll = () => {
    const allAccepted: ConsentPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    saveConsent(allAccepted);
  };

  const handleAcceptNecessary = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    });
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  const handleTogglePreference = (key: keyof ConsentPreferences) => {
    if (key === 'necessary') return; // Cannot disable necessary cookies
    
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                We value your privacy
              </h3>
              <p className="text-sm text-gray-600">
                We use cookies and similar technologies to provide, protect, and improve our services. 
                By clicking "Accept All", you consent to our use of cookies for analytics, personalization, and marketing.
                {' '}
                <button
                  onClick={() => setShowDetails(true)}
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  Learn more
                </button>
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Button
                onClick={handleAcceptNecessary}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Necessary Only
              </Button>
              <Button
                onClick={() => setShowDetails(true)}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Customize
              </Button>
              <Button
                onClick={handleAcceptAll}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
              >
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Preferences Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cookie Preferences</DialogTitle>
            <DialogDescription>
              Manage your cookie and data processing preferences. You can change these settings at any time.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Necessary Cookies */}
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">Necessary Cookies</h4>
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">Required</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Essential for the website to function. These cookies enable core functionality such as security, 
                    network management, and accessibility. Cannot be disabled.
                  </p>
                </div>
                <Checkbox
                  checked={true}
                  disabled
                  className="mt-1"
                />
              </div>
            </div>

            <Separator />

            {/* Analytics Cookies */}
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Analytics Cookies</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Help us understand how visitors interact with our website by collecting and reporting information anonymously.
                    Used to improve user experience and site performance.
                  </p>
                </div>
                <Checkbox
                  checked={preferences.analytics}
                  onCheckedChange={() => handleTogglePreference('analytics')}
                  className="mt-1"
                />
              </div>
            </div>

            <Separator />

            {/* Functional Cookies */}
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Functional Cookies</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Enable enhanced functionality and personalization, such as remembering your preferences and settings.
                  </p>
                </div>
                <Checkbox
                  checked={preferences.functional}
                  onCheckedChange={() => handleTogglePreference('functional')}
                  className="mt-1"
                />
              </div>
            </div>

            <Separator />

            {/* Marketing Cookies */}
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Marketing Cookies</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Used to track visitors across websites to display relevant advertisements and measure campaign effectiveness.
                  </p>
                </div>
                <Checkbox
                  checked={preferences.marketing}
                  onCheckedChange={() => handleTogglePreference('marketing')}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              onClick={handleAcceptNecessary}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Necessary Only
            </Button>
            <Button
              onClick={handleSavePreferences}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
            >
              Save Preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
