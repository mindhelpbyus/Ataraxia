import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home,
    Calendar,
    MessageSquare,
    Heart,
    User,
    LogOut,
    Sparkles,
    Video,
    TrendingUp,
    Zap,
    Cloud,
    Smile,
    Meh,
    Frown,
    ChevronRight,
    Bell,
    Menu,
    X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface ClientLayoutProps {
    userId: string;
    userEmail: string;
    userName: string;
    onLogout: () => void;
}

const upcomingSession = {
    therapist: 'Dr. Sarah Johnson',
    therapistImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    date: 'Tomorrow',
    time: '2:00 PM',
    duration: '50 min'
};

const moodHistory = [
    { date: 'Mon', mood: 'happy', energy: 8, stress: 3 },
    { date: 'Tue', mood: 'neutral', energy: 6, stress: 5 },
    { date: 'Wed', mood: 'happy', energy: 7, stress: 4 },
    { date: 'Thu', mood: 'neutral', energy: 6, stress: 6 },
    { date: 'Fri', mood: 'happy', energy: 8, stress: 2 },
    { date: 'Sat', mood: 'happy', energy: 9, stress: 1 },
    { date: 'Sun', mood: 'happy', energy: 7, stress: 3 },
];

const journalPrompts = [
    "What made you smile today?",
    "What are you grateful for?",
    "How did you practice self-care today?"
];

export function ClientLayout({ userId, userEmail, userName, onLogout }: ClientLayoutProps) {
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('home');

    const getMoodIcon = (mood: string) => {
        switch (mood) {
            case 'happy': return <Smile className="w-6 h-6 text-green-500" />;
            case 'neutral': return <Meh className="w-6 h-6 text-yellow-500" />;
            case 'sad': return <Frown className="w-6 h-6 text-orange-500" />;
            default: return <Meh className="w-6 h-6 text-gray-400" />;
        }
    };

    const navItems = [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'sessions', label: 'Sessions', icon: Calendar },
        { id: 'journal', label: 'Journal', icon: MessageSquare },
        { id: 'wellness', label: 'Wellness', icon: Heart },
        { id: 'profile', label: 'Profile', icon: User },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-orange-50/30">

            {/* Top Navigation Bar */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-orange-100/50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">

                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
                                    Ataraxia
                                </h1>
                                <p className="text-xs text-gray-500">Your Wellness Journey</p>
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-2">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`
                                            flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium text-sm
                                            ${isActive
                                                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                                                : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                                            }
                                        `}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {item.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Right Side */}
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" className="relative hidden md:flex">
                                <Bell className="w-5 h-5 text-gray-600" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full"></span>
                            </Button>

                            {/* User Menu */}
                            <div className="hidden md:flex items-center gap-3 pl-3 border-l border-gray-200">
                                <Avatar className="w-9 h-9 border-2 border-orange-200">
                                    <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white text-sm">
                                        {userName?.split(' ').map(n => n[0]).join('') || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="text-left">
                                    <p className="text-sm font-semibold text-gray-900">{userName || 'User'}</p>
                                    <button
                                        onClick={onLogout}
                                        className="text-xs text-gray-500 hover:text-orange-600 transition-colors"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            </div>

                            {/* Mobile Menu Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden border-t border-orange-100 bg-white"
                        >
                            <div className="px-4 py-4 space-y-2">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = activeTab === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                setActiveTab(item.id);
                                                setMobileMenuOpen(false);
                                            }}
                                            className={`
                                                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium
                                                ${isActive
                                                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                                                    : 'text-gray-600 hover:bg-orange-50'
                                                }
                                            `}
                                        >
                                            <Icon className="w-5 h-5" />
                                            {item.label}
                                        </button>
                                    );
                                })}
                                <div className="pt-4 border-t border-gray-200">
                                    <Button
                                        onClick={onLogout}
                                        variant="outline"
                                        className="w-full justify-start text-gray-600"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Sign Out
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Welcome Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                        Welcome back, {userName?.split(' ')[0] || 'there'} 👋
                    </h2>
                    <p className="text-gray-600">How are you feeling today?</p>
                </motion.div>

                {/* Quick Mood Check */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    <Card className="border-2 border-orange-100 bg-white shadow-xl shadow-orange-500/5">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                <Heart className="w-5 h-5 text-orange-500" />
                                Quick Mood Check-In
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
                                {[
                                    { mood: 'Amazing', icon: <Sparkles className="w-7 h-7 sm:w-8 h-8" />, color: 'from-green-400 to-emerald-500' },
                                    { mood: 'Good', icon: <Smile className="w-7 h-7 sm:w-8 h-8" />, color: 'from-blue-400 to-cyan-500' },
                                    { mood: 'Okay', icon: <Meh className="w-7 h-7 sm:w-8 h-8" />, color: 'from-yellow-400 to-orange-400' },
                                    { mood: 'Low', icon: <Cloud className="w-7 h-7 sm:w-8 h-8" />, color: 'from-orange-400 to-red-400' },
                                    { mood: 'Struggling', icon: <Frown className="w-7 h-7 sm:w-8 h-8" />, color: 'from-red-400 to-rose-500' },
                                ].map((item) => (
                                    <motion.button
                                        key={item.mood}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => setSelectedMood(item.mood)}
                                        className={`
                                            flex flex-col items-center justify-center gap-2 sm:gap-3 p-4 sm:p-6 rounded-2xl border-2 transition-all
                                            ${selectedMood === item.mood
                                                ? `bg-gradient-to-br ${item.color} text-white border-transparent shadow-lg`
                                                : 'bg-white border-gray-200 hover:border-orange-300 text-gray-600'
                                            }
                                        `}
                                    >
                                        {item.icon}
                                        <span className="text-xs sm:text-sm font-semibold">{item.mood}</span>
                                    </motion.button>
                                ))}
                            </div>
                            {selectedMood && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-200"
                                >
                                    <p className="text-sm text-orange-900 font-medium">
                                        ✨ Thank you for sharing. Your mood has been logged.
                                    </p>
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">

                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-6 sm:space-y-8">

                        {/* Next Session - Hero Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="border-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-2xl shadow-orange-500/30 overflow-hidden">
                                <CardContent className="p-6 sm:p-8">
                                    <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                                        <div className="space-y-4 flex-1">
                                            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                                                <Video className="w-3 h-3 mr-1" />
                                                Upcoming Session
                                            </Badge>
                                            <div>
                                                <h3 className="text-2xl sm:text-3xl font-bold mb-2">Your Next Session</h3>
                                                <p className="text-orange-50 text-base sm:text-lg font-medium">{upcomingSession.date} at {upcomingSession.time}</p>
                                            </div>
                                            <div className="flex items-center gap-4 pt-2">
                                                <Avatar className="w-14 h-14 sm:w-16 sm:h-16 border-4 border-white/30">
                                                    <AvatarImage src={upcomingSession.therapistImage} />
                                                    <AvatarFallback className="bg-white/20">SJ</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-bold text-base sm:text-lg">{upcomingSession.therapist}</p>
                                                    <p className="text-orange-50 text-sm">{upcomingSession.duration} session</p>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            size="lg"
                                            className="w-full sm:w-auto bg-white text-orange-600 hover:bg-orange-50 shadow-xl font-bold"
                                        >
                                            Join Now
                                            <ChevronRight className="w-5 h-5 ml-2" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Journal Prompts */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card className="shadow-lg shadow-gray-200/50 border-gray-200">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <MessageSquare className="w-5 h-5 text-orange-500" />
                                        Today's Reflection
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {journalPrompts.map((prompt, index) => (
                                        <motion.button
                                            key={index}
                                            whileHover={{ x: 4 }}
                                            className="w-full text-left p-4 rounded-xl bg-gradient-to-r from-gray-50 to-orange-50/30 border border-gray-200 hover:border-orange-300 transition-all group"
                                        >
                                            <div className="flex items-center justify-between">
                                                <p className="text-gray-700 font-medium text-sm sm:text-base">{prompt}</p>
                                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors flex-shrink-0" />
                                            </div>
                                        </motion.button>
                                    ))}
                                    <Button
                                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg font-semibold mt-4"
                                        size="lg"
                                    >
                                        <MessageSquare className="w-4 h-4 mr-2" />
                                        Start Free Writing
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Mood Tracker */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Card className="shadow-lg shadow-gray-200/50 border-gray-200">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <TrendingUp className="w-5 h-5 text-orange-500" />
                                        Your Week at a Glance
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-7 gap-2 sm:gap-3">
                                        {moodHistory.map((day, index) => (
                                            <div key={index} className="flex flex-col items-center gap-2">
                                                <div className="text-xs text-gray-500 font-semibold">{day.date}</div>
                                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center border-2 border-orange-200 shadow-sm">
                                                    {getMoodIcon(day.mood)}
                                                </div>
                                                <div className="w-full">
                                                    <div className="flex items-center gap-1 justify-center">
                                                        <Zap className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                                                        <Progress value={day.energy * 10} className="h-1.5 flex-1" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Right Column - Quick Actions & Progress */}
                    <div className="space-y-6 sm:space-y-8">

                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="shadow-lg shadow-gray-200/50 border-gray-200">
                                <CardHeader>
                                    <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start h-auto py-4 border-2 hover:border-orange-300 hover:bg-orange-50 transition-all"
                                    >
                                        <Calendar className="w-5 h-5 mr-3 text-orange-500 flex-shrink-0" />
                                        <div className="text-left">
                                            <div className="font-semibold text-sm">Book Session</div>
                                            <div className="text-xs text-muted-foreground">Schedule with your therapist</div>
                                        </div>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="w-full justify-start h-auto py-4 border-2 hover:border-orange-300 hover:bg-orange-50 transition-all"
                                    >
                                        <MessageSquare className="w-5 h-5 mr-3 text-orange-500 flex-shrink-0" />
                                        <div className="text-left">
                                            <div className="font-semibold text-sm">Message Therapist</div>
                                            <div className="text-xs text-muted-foreground">Secure messaging</div>
                                        </div>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="w-full justify-start h-auto py-4 border-2 hover:border-orange-300 hover:bg-orange-50 transition-all"
                                    >
                                        <Heart className="w-5 h-5 mr-3 text-orange-500 flex-shrink-0" />
                                        <div className="text-left">
                                            <div className="font-semibold text-sm">Wellness Resources</div>
                                            <div className="text-xs text-muted-foreground">Guided exercises</div>
                                        </div>
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Progress Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card className="shadow-lg shadow-green-200/30 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50/30">
                                <CardHeader>
                                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-green-600" />
                                        Your Journey
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-700 font-medium">Sessions Completed</span>
                                            <span className="font-bold text-green-600">8/12</span>
                                        </div>
                                        <Progress value={67} className="h-2.5 bg-green-100" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-700 font-medium">Journal Entries</span>
                                            <span className="font-bold text-green-600">24</span>
                                        </div>
                                        <Progress value={80} className="h-2.5 bg-green-100" />
                                    </div>
                                    <div className="pt-4 border-t border-green-200">
                                        <p className="text-sm text-gray-700 font-medium">
                                            🎉 You're making great progress! Keep it up.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Support Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Card className="shadow-lg shadow-red-200/30 border-2 border-red-200 bg-gradient-to-br from-red-50 to-rose-50/30">
                                <CardContent className="p-6">
                                    <h3 className="font-bold text-red-900 mb-2 text-base">Need Immediate Support?</h3>
                                    <p className="text-sm text-red-700 mb-4">
                                        If you're in crisis, help is available 24/7
                                    </p>
                                    <Button
                                        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg"
                                        size="lg"
                                    >
                                        Crisis Hotline
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}
