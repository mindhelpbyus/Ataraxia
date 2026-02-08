import React from 'react';

interface SettingsSectionProps {
    title?: string;
    description?: string;
    children: React.ReactNode;
    danger?: boolean;
    className?: string;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
    title,
    description,
    children,
    danger = false,
    className = ""
}) => (
    <div className={`mb-12 animate-in slide-in-from-bottom-2 duration-500 ${className}`}>
        {title && (
            <div className="mb-8">
                <h3 className={`text-2xl font-semibold tracking-tight ${danger ? 'text-rose-700' : 'text-foreground'}`}>{title}</h3>
                {description && <p className="text-base text-muted-foreground mt-1 max-w-2xl">{description}</p>}
            </div>
        )}
        <div className={`rounded-xl border-border/40 ${danger ? 'border-rose-200 bg-rose-50/10' : 'bg-transparent'}`}>
            {children}
        </div>
    </div>
);
