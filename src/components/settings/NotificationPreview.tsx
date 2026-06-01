import React from 'react';

export const NotificationPreview: React.FC = () => {
    return (
        <div className="p-4 bg-[var(--surface-warm)] rounded-lg border border-border mb-8">
            <h3 className="font-medium text-foreground mb-2">Notification Preview</h3>
            <p className="text-sm text-muted-foreground">
                This is a preview of how your notifications will appear.
            </p>
            {/* Add more preview content if needed */}
        </div>
    );
};
