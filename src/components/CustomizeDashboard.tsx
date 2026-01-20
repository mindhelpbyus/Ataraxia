import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from './ui/dialog';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { GripVertical, X } from 'lucide-react';

export interface DashboardWidgets {
    stats: boolean;
    agenda: boolean;
    categories: boolean;
    completionRate: boolean;
    people: boolean;
    companies: boolean;
}

interface CustomizeDashboardProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    widgets: DashboardWidgets;
    onToggle: (key: keyof DashboardWidgets) => void;
}

export function CustomizeDashboard({ open, onOpenChange, widgets, onToggle }: CustomizeDashboardProps) {
    const widgetList: { key: keyof DashboardWidgets; label: string }[] = [
        { key: 'stats', label: 'Statistics Overview' },
        { key: 'agenda', label: 'Upcoming Agenda' },
        { key: 'categories', label: 'Company Categories' },
        { key: 'completionRate', label: 'Session Completion' },
        { key: 'people', label: 'People Directory' },
        { key: 'companies', label: 'Companies Directory' },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[850px] p-0 gap-0 rounded-xl overflow-hidden bg-white shadow-2xl border-none">
                <div className="p-6 border-b border-gray-100 flex items-start justify-between">
                    <div className="space-y-1">
                        <DialogTitle className="text-xl font-bold tracking-tight text-gray-900">Customize dashboard</DialogTitle>
                        <DialogDescription className="text-gray-500 font-normal">
                            Select the widgets you want to see on your dashboard
                        </DialogDescription>
                    </div>
                    <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none hover:bg-gray-100 p-2">
                        <X className="h-5 w-5 text-gray-500" />
                        <span className="sr-only">Close</span>
                    </DialogClose>
                </div>

                <div className="p-8 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {widgetList.map((item) => (
                            <div
                                key={item.key}
                                className="flex items-center justify-between p-4 bg-gray-50/80 rounded-lg group hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                            >
                                <div className="flex items-center gap-3">
                                    <GripVertical className="h-5 w-5 text-gray-300 cursor-grab active:cursor-grabbing hover:text-gray-400" />
                                    <Label htmlFor={item.key} className="font-semibold text-gray-700 cursor-pointer select-none">
                                        {item.label}
                                    </Label>
                                </div>
                                <Switch
                                    id={item.key}
                                    checked={widgets[item.key]}
                                    onCheckedChange={() => onToggle(item.key)}
                                    className="data-[state=checked]:bg-gray-900"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
