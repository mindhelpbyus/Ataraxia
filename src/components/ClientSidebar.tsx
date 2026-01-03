import React from 'react';
import { motion } from 'framer-motion';
import {
    Home,
    Calendar,
    MessageSquare,
    Heart,
    User,
    LogOut,
    Sparkles
} from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface ClientSidebarProps {
    activeTab: string;
    onNavigate: (tab: string) => void;
    userName: string;
    userEmail: string;
    userAvatar?: string;
    onLogout: () => void;
}

const clientNavItems = [
    { id: 'home', label: 'Home', icon: Home, description: 'Your dashboard' },
    { id: 'sessions', label: 'Sessions', icon: Calendar, description: 'Upcoming & past' },
    { id: 'journal', label: 'Journal', icon: MessageSquare, description: 'Your reflections' },
    { id: 'wellness', label: 'Wellness', icon: Heart, description: 'Resources & tools' },
    { id: 'profile', label: 'Profile', icon: User, description: 'Your information' },
];

export function ClientSidebar({
    activeTab,
    onNavigate,
    userName,
    userEmail,
    userAvatar,
    onLogout
}: ClientSidebarProps) {
    return (
        <div className="w-72 h-screen bg-gradient-to-b from-white to-orange-50/30 border-r border-gray-200 flex flex-col">

            {/* Logo */}
            <div className="p-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
                            Ataraxia
                        </h1>
                        <p className="text-xs text-muted-foreground">Your Wellness Journey</p>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {clientNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                        <motion.button
                            key={item.id}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onNavigate(item.id)}
                            className={`
                                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                                ${isActive
                                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                                    : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                                }
                            `}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                            <div className="flex-1 text-left">
                                <div className={`font-semibold text-sm ${isActive ? 'text-white' : ''}`}>
                                    {item.label}
                                </div>
                                <div className={`text-xs ${isActive ? 'text-orange-100' : 'text-gray-500'}`}>
                                    {item.description}
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </nav>

            <Separator />

            {/* User Profile */}
            <div className="p-4 space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-orange-50/30">
                    <Avatar className="w-12 h-12 border-2 border-orange-200">
                        <AvatarImage src={userAvatar} />
                        <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white">
                            {userName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{userName}</p>
                        <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                    </div>
                </div>

                <Button
                    variant="outline"
                    className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200"
                    onClick={onLogout}
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
}
