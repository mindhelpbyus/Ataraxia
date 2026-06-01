import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Switch } from '../ui/switch';

interface NotificationChannelCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    enabled: boolean;
    onToggle: (enabled: boolean) => void;
    color: 'blue' | 'green' | 'purple' | 'orange';
}

const colorClasses = {
    blue: {
        bg: 'bg-primary/10',
        icon: 'text-primary',
        border: 'border-primary/20',
        activeBorder: 'border-primary',
    },
    green: {
        bg: 'bg-primary/10',
        icon: 'text-primary',
        border: 'border-primary/20',
        activeBorder: 'border-primary',
    },
    purple: {
        bg: 'bg-primary/10',
        icon: 'text-primary',
        border: 'border-primary/20',
        activeBorder: 'border-primary',
    },
    orange: {
        bg: 'bg-primary/10',
        icon: 'text-primary',
        border: 'border-primary/20',
        activeBorder: 'border-primary',
    },
};

export const NotificationChannelCard: React.FC<NotificationChannelCardProps> = ({
    icon: Icon,
    title,
    description,
    enabled,
    onToggle,
    color,
}) => {
    const colors = colorClasses[color];

    return (
        <div
            className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${enabled
                ? `${colors.bg} ${colors.activeBorder}`
                : 'bg-card border-border'
                }`}
            onClick={() => onToggle(!enabled)}
        >
            <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${enabled ? 'bg-card' : colors.bg}`}>
                    <Icon className={`w-5 h-5 ${colors.icon}`} />
                </div>
                <Switch
                    key={`master-${enabled}`}
                    checked={enabled}
                    onCheckedChange={onToggle}
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
            <h3 className="font-medium text-foreground mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
};
