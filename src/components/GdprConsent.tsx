import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Cookie } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function GdprConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already made a choice
        const consent = localStorage.getItem('ataraxia_gdpr_consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('ataraxia_gdpr_consent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('ataraxia_gdpr_consent', 'declined');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
                    data-testid="gdpr-consent-banner"
                >
                    <div className="mx-auto max-w-4xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-2xl rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-start md:items-center gap-4">
                            <div className="bg-primary/10 p-3 rounded-full flex-shrink-0">
                                <Cookie className="size-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                    We value your privacy
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking &quot;Accept All&quot;, you consent to our use of cookies according to GDPR standards.
                                </p>
                            </div>
                        </div>

                        <div className="flex w-full md:w-auto items-center gap-3 shrink-0">
                            <Button
                                variant="outline"
                                className="w-full md:w-auto"
                                onClick={handleDecline}
                                data-testid="gdpr-decline-button"
                            >
                                Decline
                            </Button>
                            <Button
                                className="w-full md:w-auto"
                                onClick={handleAccept}
                                data-testid="gdpr-accept-button"
                            >
                                Accept All
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
