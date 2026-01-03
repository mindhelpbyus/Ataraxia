import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar,
    Video,
    MessageSquare,
    Heart,
    TrendingUp,
    Sparkles,
    Sun,
    Moon,
    Cloud,
    Zap,
    Smile,
    Meh,
    Frown,
    ChevronRight,
    Bell,
    Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface ClientDashboardViewProps {
    userId: string;
    userEmail: string;
    userName: string;
    onNavigate: (tab: string) => void;
}

// Mock data - replace with real API calls
const upcomingSession = {
    therapist: 'Dr. Sarah Johnson',
    therapistImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    date: 'Tomorrow',
    time: '2:00 PM',
    type: 'Video Session',
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

export function ClientDashboardView({ userId, userEmail, userName, onNavigate }: ClientDashboardViewProps) {
    const [selectedMood, setSelectedMood] = useState<string | null>(null);

    const getMoodIcon = (mood: string) => {
        switch (mood) {
            case 'happy': return <Smile className="w-6 h-6 text-green-500" />;
            case 'neutral': return <Meh className="w-6 h-6 text-yellow-500" />;
            case 'sad': return <Frown className="w-6 h-6 text-orange-500" />;
            default: return <Meh className="w-6 h-6 text-gray-400" />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30 p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
                            Welcome back, {userName?.split(' ')[0] || 'there'}
                        </h1>
                        <p className="text-muted-foreground mt-1">How are you feeling today?</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
                        </Button>
                        <Button variant="ghost" size="icon">
                            <Settings className="w-5 h-5" />
                        </Button>
                    </div>
                </motion.div>

                {/* Quick Mood Check */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="border-2 border-orange-100 bg-gradient-to-br from-white to-orange-50/30 shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Heart className="w-5 h-5 text-orange-500" />
                                How are you feeling right now?
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-5 gap-4">
                                {[
                                    { mood: 'Amazing', icon: <Sparkles className="w-8 h-8" />, color: 'from-green-400 to-emerald-500', value: 5 },
                                    { mood: 'Good', icon: <Smile className="w-8 h-8" />, color: 'from-blue-400 to-cyan-500', value: 4 },
                                    { mood: 'Okay', icon: <Meh className="w-8 h-8" />, color: 'from-yellow-400 to-orange-400', value: 3 },
                                    { mood: 'Low', icon: <Cloud className="w-8 h-8" />, color: 'from-orange-400 to-red-400', value: 2 },
                                    { mood: 'Struggling', icon: <Frown className="w-8 h-8" />, color: 'from-red-400 to-rose-500', value: 1 },
                                ].map((item) => (
                                    <motion.button
                                        key={item.mood}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedMood(item.mood)}
                                        className={`
                                            flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all
                                            ${selectedMood === item.mood
                                                ? `bg-gradient-to-br ${item.color} text-white border-transparent shadow-lg`
                                                : 'bg-white border-gray-200 hover:border-orange-300 text-gray-600'
                                            }
                                        `}
                                    >
                                        {item.icon}
                                        <span className="text-sm font-medium">{item.mood}</span>
                                    </motion.button>
                                ))}
                            </div>
                            {selectedMood && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-200"
                                >
                                    <p className="text-sm text-orange-900">
                                        ✨ Thank you for sharing. Your mood has been logged.
                                    </p>
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-6">

                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Next Session */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-2xl">
                                <CardContent className="p-8">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-4 flex-1">
                                            <div className="flex items-center gap-2">
                                                <Badge className="bg-white/20 text-white border-white/30">
                                                    <Video className="w-3 h-3 mr-1" />
                                                    Upcoming
                                                </Badge>
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold mb-2">Your Next Session</h3>
                                                <p className="text-orange-100 text-lg">{upcomingSession.date} at {upcomingSession.time}</p>
                                            </div>
                                            <div className="flex items-center gap-4 pt-4">
                                                <Avatar className="w-16 h-16 border-4 border-white/30">
                                                    <AvatarImage src={upcomingSession.therapistImage} />
                                                    <AvatarFallback>SJ</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold text-lg">{upcomingSession.therapist}</p>
                                                    <p className="text-orange-100 text-sm">{upcomingSession.duration} session</p>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            size="lg"
                                            className="bg-white text-orange-600 hover:bg-orange-50 shadow-xl"
                                        >
                                            Join Session
                                            <ChevronRight className="w-5 h-5 ml-2" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Journal Prompts */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card className="shadow-lg border-gray-200">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5 text-orange-500" />
                                        Today's Reflection
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {journalPrompts.map((prompt, index) => (
                                        <motion.button
                                            key={index}
                                            whileHover={{ x: 4 }}
                                            className="w-full text-left p-4 rounded-xl bg-gradient-to-r from-gray-50 to-orange-50/30 border border-gray-200 hover:border-orange-300 transition-all group"
                                        >
                                            <div className="flex items-center justify-between">
                                                <p className="text-gray-700 font-medium">{prompt}</p>
                                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                                            </div>
                                        </motion.button>
                                    ))}
                                    <Button
                                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
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
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Card className="shadow-lg border-gray-200">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-orange-500" />
                                        Your Week at a Glance
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-7 gap-3">
                                        {moodHistory.map((day, index) => (
                                            <div key={index} className="flex flex-col items-center gap-2">
                                                <div className="text-xs text-gray-500 font-medium">{day.date}</div>
                                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center border-2 border-orange-200">
                                                    {getMoodIcon(day.mood)}
                                                </div>
                                                <div className="space-y-1 w-full">
                                                    <div className="flex items-center gap-1">
                                                        <Zap className="w-3 h-3 text-yellow-500" />
                                                        <Progress value={day.energy * 10} className="h-1" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Right Column - Quick Actions */}
                    <div className="space-y-6">

                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="shadow-lg border-gray-200">
                                <CardHeader>
                                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start h-auto py-4 border-2 hover:border-orange-300 hover:bg-orange-50"
                                    >
                                        <Calendar className="w-5 h-5 mr-3 text-orange-500" />
                                        <div className="text-left">
                                            <div className="font-semibold">Book Session</div>
                                            <div className="text-xs text-muted-foreground">Schedule with your therapist</div>
                                        </div>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="w-full justify-start h-auto py-4 border-2 hover:border-orange-300 hover:bg-orange-50"
                                    >
                                        <MessageSquare className="w-5 h-5 mr-3 text-orange-500" />
                                        <div className="text-left">
                                            <div className="font-semibold">Message Therapist</div>
                                            <div className="text-xs text-muted-foreground">Secure messaging</div>
                                        </div>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="w-full justify-start h-auto py-4 border-2 hover:border-orange-300 hover:bg-orange-50"
                                    >
                                        <Heart className="w-5 h-5 mr-3 text-orange-500" />
                                        <div className="text-left">
                                            <div className="font-semibold">Wellness Resources</div>
                                            <div className="text-xs text-muted-foreground">Guided exercises</div>
                                        </div>
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Progress Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card className="shadow-lg border-gray-200 bg-gradient-to-br from-green-50 to-emerald-50/30">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-green-600" />
                                        Your Journey
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-600">Sessions Completed</span>
                                            <span className="font-bold text-green-600">8/12</span>
                                        </div>
                                        <Progress value={67} className="h-2" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-600">Journal Entries</span>
                                            <span className="font-bold text-green-600">24</span>
                                        </div>
                                        <Progress value={80} className="h-2" />
                                    </div>
                                    <div className="pt-4 border-t">
                                        <p className="text-sm text-gray-600">
                                            🎉 You're making great progress! Keep it up.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Support Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Card className="shadow-lg border-2 border-red-200 bg-gradient-to-br from-red-50 to-rose-50/30">
                                <CardContent className="p-6">
                                    <h3 className="font-bold text-red-900 mb-2">Need Immediate Support?</h3>
                                    <p className="text-sm text-red-700 mb-4">
                                        If you're in crisis, help is available 24/7
                                    </p>
                                    <Button
                                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                                        size="lg"
                                    >
                                        Crisis Hotline
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
