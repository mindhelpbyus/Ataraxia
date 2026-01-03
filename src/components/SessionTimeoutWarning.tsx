import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { AlertTriangle } from 'lucide-react';

interface SessionTimeoutWarningProps {
    open: boolean;
    remainingSeconds: number;
    onExtendSession: () => void;
    onLogout: () => void;
}

export function SessionTimeoutWarning({
    open,
    remainingSeconds,
    onExtendSession,
    onLogout,
}: SessionTimeoutWarningProps) {
    const [countdown, setCountdown] = useState(remainingSeconds);

    useEffect(() => {
        setCountdown(remainingSeconds);
    }, [remainingSeconds]);

    useEffect(() => {
        if (!open) return;

        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onLogout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [open, onLogout]);

    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;

    return (
        <Dialog open={open} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                            <AlertTriangle className="h-6 w-6 text-orange-600" />
                        </div>
                        <DialogTitle className="text-xl">Session Expiring Soon</DialogTitle>
                    </div>
                    <DialogDescription className="text-base">
                        Your session will expire due to inactivity. For your security, you will be automatically logged out in:
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center justify-center py-6">
                    <div className="text-center">
                        <div className="text-6xl font-bold text-orange-600 tabular-nums">
                            {minutes}:{seconds.toString().padStart(2, '0')}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">minutes remaining</p>
                    </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-medium">Why does this happen?</p>
                    <p className="text-xs text-muted-foreground">
                        To protect patient privacy and comply with HIPAA regulations, we automatically log you out after 15 minutes of inactivity.
                    </p>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                        variant="outline"
                        onClick={onLogout}
                        className="w-full sm:w-auto"
                    >
                        Logout Now
                    </Button>
                    <Button
                        onClick={onExtendSession}
                        className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700"
                    >
                        Stay Logged In
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
