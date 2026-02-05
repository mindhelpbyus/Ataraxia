
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle2, Circle, ArrowRight, User, FileText,
    Settings, Shield, ChevronRight, LogOut
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { authService } from '../services/authService';
import { logger } from '../services/secureLogger';

// Milestone definitions
const MILESTONES = [
    {
        id: 1,
        title: 'Identity & Basics',
        description: 'Personal details and identity verification',
        steps: [1, 2, 3],
        icon: User
    },
    {
        id: 2,
        title: 'Professional Profile',
        description: 'Credentials, license, and experience',
        steps: [4, 5, 6, 7],
        icon: FileText
    },
    {
        id: 3,
        title: 'Practice Logistics',
        description: 'Availability, rates, and preferences',
        steps: [8, 9, 10],
        icon: Settings
    }
];

interface DashboardState {
    currentStep: number;
    completedSteps: number[];
    verificationStatus: string;
    firstName: string;
    isLoading: boolean;
}

interface Props {
    onNavigate: (view: string, data?: any) => void;
    onLogout: () => void;
}

export function TherapistWelcomeDashboard({ onNavigate, onLogout }: Props) {
    const [state, setState] = useState<DashboardState>({
        currentStep: 2, // Default to step 2 (after signup)
        completedSteps: [1],
        verificationStatus: 'PENDING',
        firstName: 'Therapist',
        isLoading: true
    });

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            // 1. Check Auth
            const user = await authService.getCurrentUser();
            // Even if user is null locally, we might rely on localStorage for now until backend catchup
            const localName = localStorage.getItem('userName') || 'Therapist';

            // 2. Fetch Onboarding Status
            // For now, recovering from localStorage for continuity with existing flow
            const savedStep = localStorage.getItem('therapistOnboardingStep');
            const step = savedStep ? parseInt(savedStep) : 2;

            // Calculate completed steps based on current step
            const completed = Array.from({ length: step - 1 }, (_, i) => i + 1);

            setState({
                currentStep: step,
                completedSteps: completed,
                verificationStatus: 'PENDING', // Mock status
                firstName: user?.firstName || localName,
                isLoading: false
            });
        } catch (error) {
            logger.error('Failed to load dashboard:', error);
            setState(prev => ({ ...prev, isLoading: false }));
        }
    };

    const calculateProgress = () => {
        return Math.round((state.completedSteps.length / 10) * 100);
    };

    const handleContinue = () => {
        // Navigate to the onboarding wizard at the specific step
        onNavigate('register', { step: state.currentStep });
    };

    const handleLogoutAction = async () => {
        await authService.logout();
        onLogout();
    };

    if (state.isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <header className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Welcome, {state.firstName}!</h1>
                        <p className="text-gray-500">Let's get your practice set up.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={handleLogoutAction} size="sm">
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                        </Button>
                    </div>
                </header>

                {/* Progress Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Progress Card */}
                    <Card className="md:col-span-2 border-blue-100 bg-gradient-to-br from-white to-blue-50">
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                <span>Application Progress</span>
                                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                    {calculateProgress()}% Complete
                                </Badge>
                            </CardTitle>
                            <CardDescription>
                                Complete your profile to start accepting appointments.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Progress value={calculateProgress()} className="h-3 mb-6" />

                            <div className="flex gap-4">
                                <Button onClick={handleContinue} className="bg-blue-600 hover:bg-blue-700" size="lg">
                                    Continue Application
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                                {state.verificationStatus === 'VERIFIED' && (
                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 px-3 py-1">
                                        <CheckCircle2 className="w-4 h-4 mr-1" /> Verified
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats / Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Account Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Shield className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="font-medium text-sm">Background Check</p>
                                    <p className="text-xs text-gray-500">Pending submission</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                                <div>
                                    <p className="font-medium text-sm">Email Verified</p>
                                    <p className="text-xs text-gray-500">Access granted</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Milestones */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800">Application Steps</h2>

                    <div className="grid gap-4">
                        {MILESTONES.map((milestone) => {
                            const isCompleted = milestone.steps.every(s => state.completedSteps.includes(s));
                            const isCurrent = milestone.steps.includes(state.currentStep);
                            const isLocked = !isCompleted && !isCurrent && milestone.steps[0] > state.currentStep;

                            return (
                                <motion.div
                                    key={milestone.id}
                                    whileHover={{ scale: isLocked ? 1 : 1.01 }}
                                    className={`p-5 rounded-xl border transition-all ${isCurrent
                                        ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-100'
                                        : isCompleted
                                            ? 'bg-gray-50 border-gray-200 opacity-75'
                                            : 'bg-white border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-full ${isCompleted ? 'bg-green-100 text-green-600' :
                                            isCurrent ? 'bg-blue-100 text-blue-600' :
                                                'bg-gray-100 text-gray-400'
                                            }`}>
                                            {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <milestone.icon className="w-6 h-6" />}
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">{milestone.title}</h3>
                                            <p className="text-sm text-gray-500">{milestone.description}</p>
                                        </div>

                                        {isCurrent && (
                                            <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={handleContinue}>
                                                Continue <ChevronRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}
