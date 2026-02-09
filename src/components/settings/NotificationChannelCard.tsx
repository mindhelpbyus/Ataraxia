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
        bg: 'bg-blue-50',
        icon: 'text-blue-600',
        border: 'border-blue-200',
        activeBorder: 'border-blue-400',
    },
    green: {
        bg: 'bg-green-50',
        icon: 'text-green-600',
        border: 'border-green-200',
        activeBorder: 'border-green-400',
    },
    purple: {
        bg: 'bg-purple-50',
        icon: 'text-purple-600',
        border: 'border-purple-200',
        activeBorder: 'border-purple-400',
    },
    orange: {
        bg: 'bg-orange-50',
        icon: 'text-orange-600',
        border: 'border-orange-200',
        activeBorder: 'border-orange-400',
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
                : 'bg-white border-gray-200'
                }`}
            onClick={() => onToggle(!enabled)}
        >
            <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${enabled ? 'bg-white' : colors.bg}`}>
                    <Icon className={`w-5 h-5 ${colors.icon}`} />
                </div>
                <Switch
                    key={`master-${enabled}`}
                    checked={enabled}
                    onCheckedChange={onToggle}
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
    );
};
