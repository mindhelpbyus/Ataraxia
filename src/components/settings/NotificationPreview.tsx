import React from 'react';

export const NotificationPreview: React.FC = () => {
    return (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-8">
            <h3 className="font-medium text-gray-900 mb-2">Notification Preview</h3>
            <p className="text-sm text-gray-500">
                This is a preview of how your notifications will appear.
            </p>
            {/* Add more preview content if needed */}
        </div>
    );
};
