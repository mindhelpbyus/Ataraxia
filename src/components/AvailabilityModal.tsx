import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { OnboardingStep6AvailabilityEnhanced } from './onboarding/OnboardingStep6AvailabilityEnhanced';
import { dataService } from '../api';
import { toast } from 'sonner';

interface AvailabilityModalProps {
    therapistId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

const DEFAULT_SCHEDULE = {
    monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []
};

const DEFAULT_DATA = {
    video: false,
    inPerson: false,
    phone: false,
    messaging: false,
    newClientsCapacity: 5,
    maxCaseloadCapacity: 20,
    clientIntakeSpeed: 'moderate' as const,
    sessionLengthsOffered: [50],
    emergencySameDayCapacity: false,
    weeklySchedule: DEFAULT_SCHEDULE,
    timezone: 'America/New_York',
    hoursPerDay: 8,
    daysAvailable: [],
    preferredSchedulingDensity: 'spread-out' as const,
    sessionDurations: [50],
    breakTimeBetweenSessions: 10,
    sessionTypes: [],
    supportedLanguages: []
};

export function AvailabilityModal({ therapistId, isOpen, onClose }: AvailabilityModalProps) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(DEFAULT_DATA);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen && therapistId) {
            loadData();
        }
    }, [isOpen, therapistId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const therapist = await dataService.get('therapists', therapistId!);

            // Map Backend -> Frontend
            const settings = therapist.session_settings || {};

            // Merge defaults -> settings -> explicit fields
            const mergedData = {
                ...DEFAULT_DATA,
                ...settings,
                weeklySchedule: therapist.weekly_schedule || DEFAULT_SCHEDULE,
                timezone: therapist.timezone || 'UTC'
            };

            setData(mergedData);
        } catch (error) {
            console.error('Failed to load availability:', error);
            toast.error('Failed to load availability settings');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = (updates: any) => {
        setData((prev: any) => ({ ...prev, ...updates }));
    };

    const handleSave = async () => {
        if (!therapistId) return;
        setIsSaving(true);
        try {
            // Map Frontend -> Backend
            // Separate top-level fields from session_settings
            const { weeklySchedule, timezone, ...settings } = data;

            const payload = {
                weekly_schedule: weeklySchedule,
                timezone: timezone,
                session_settings: settings
            };

            await dataService.update('therapists', therapistId, payload);
            toast.success('Availability updated successfully');
            onClose();
        } catch (error) {
            console.error('Failed to save:', error);
            toast.error('Failed to save availability');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Manage Availability</DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="p-8 text-center text-muted-foreground">Loading schedule...</div>
                ) : (
                    <div className="py-4">
                        {/* We use the Onboarding component but mostly for the UI logic */}
                        <OnboardingStep6AvailabilityEnhanced
                            data={data}
                            onUpdate={handleUpdate}
                            onNext={() => { }} // No-op
                            onBack={() => { }} // No-op
                            hideNavigation={true}
                        />
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isSaving || loading}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
