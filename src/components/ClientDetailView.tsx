import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
    ArrowLeft, Calendar, Video, Phone, Mail, MapPin, AlertTriangle,
    FileText, Pill, Target, TrendingUp, TrendingDown, Activity,
    DollarSign, MessageSquare, Brain, Shield, User, Heart,
    Clock, CheckCircle2, XCircle, Download, ExternalLink,
    Edit, Plus, Minus, ChevronRight
} from 'lucide-react';
import { Line } from 'recharts';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export interface ClientDetailData {
    clientId: string;
    profile: {
        identity: {
            firstName: string;
            lastName: string;
            preferredName: string;
            avatarUrl?: string;
            dob: string;
            age: number;
            pronouns: string;
            gender: string;
        };
        status: {
            accountStatus: string;
            riskLevel: string;
            riskColor: string;
            riskBanner?: string;
            therapyStatus: string;
        };
        contact: {
            email: string;
            phone: string;
            emergencyContact: {
                name: string;
                relationship: string;
                phone: string;
            };
            location: {
                country: string;
                addressLine1: string;
                addressLine2?: string | null;
                city: string;
                state: string;
                postalCode: string;
                timezone: string;
            };
        };
    };
    sessions: {
        nextSession?: {
            sessionId: string;
            date: string;
            startTime: string;
            mode: string;
            joinUrl: string;
            status: string;
        };
        lastSession?: {
            sessionId: string;
            date: string;
            startTime: string;
            summary: string;
            goalsDiscussed: string[];
            actionItems: string[];
            fullNoteUrl: string;
        };
        stats: {
            totalSessions: number;
            cancelled: number;
            noShows: number;
            frequency: string;
        };
    };
    clinical: {
        diagnoses: {
            primary: {
                code: string;
                description: string;
            };
            secondary: Array<{
                code: string;
                description: string;
            }>;
            provisional: Array<{
                code: string;
                description: string;
            }>;
        };
        medications: Array<{
            name: string;
            dosage: string;
            prescribedBy: string;
            lastUpdated: string;
        }>;
        treatmentPlan: {
            mainGoal: string;
            subGoals: string[];
            modality: string;
            progress: string;
            progressPercent: number;
        };
        safety: {
            riskLevel: string;
            lastSafetyAssessment: {
                type: string;
                date: string;
                score: number;
                suicidalIdeation: string;
            };
            safetyPlanUrl: string;
        };
    };
    assessments: {
        latest: {
            PHQ9: {
                score: number;
                lastUpdated: string;
                trend: string;
            };
            GAD7: {
                score: number;
                lastUpdated: string;
                trend: string;
            };
        };
        history: {
            PHQ9: number[];
            GAD7: number[];
            dates: string[];
        };
    };
    background: {
        presentingProblem: string;
        clientHistory: {
            previousTherapy: string;
            traumaHistory: string;
            medicalConditions: string[];
            substanceUse: string;
        };
        personalContext: {
            relationshipStatus: string;
            household: string;
            employment: {
                status: string;
                occupation: string;
            };
        };
    };
    documents: {
        notesCount: number;
        documentsCount: number;
        assessmentsCount: number;
        links: {
            notes: string;
            documents: string;
            assessments: string;
        };
    };
    billing: {
        insuranceProvider: string;
        copay: number;
        claims: Array<{
            claimId: string;
            status: string;
            date: string;
            amount: number;
        }>;
        outstandingBalance: number;
    };
    communication: {
        unreadMessages: number;
        threadsUrl: string;
    };
    aiInsights: {
        progressSummary: string;
        documentationAlerts: string[];
        trendAlerts: Array<{
            type: string;
            message: string;
        }>;
    };
}

interface ClientDetailViewProps {
    clientData: ClientDetailData;
    onBack: () => void;
}

export function ClientDetailView({ clientData, onBack }: ClientDetailViewProps) {
    const [activeTab, setActiveTab] = useState('overview');

    const getRiskBadge = (level: string) => {
        const colors = {
            low: 'bg-green-100 text-green-800',
            medium: 'bg-orange-100 text-orange-800',
            high: 'bg-red-100 text-red-800'
        };
        return (
            <Badge className={colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
                {level.toUpperCase()}
            </Badge>
        );
    };

    const getTrendIcon = (trend: string) => {
        if (trend === 'increasing') return <TrendingUp className="h-4 w-4 text-red-500" />;
        if (trend === 'decreasing') return <TrendingDown className="h-4 w-4 text-green-500" />;
        return <Activity className="h-4 w-4 text-blue-500" />;
    };

    const getStatusBadge = (status: string) => {
        const colors = {
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-gray-100 text-gray-800',
            suspended: 'bg-red-100 text-red-800'
        };
        return (
            <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
                {status.replace('_', ' ').toUpperCase()}
            </Badge>
        );
    };

    // Prepare chart data
    const chartData = clientData.assessments.history.dates.map((date, index) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        PHQ9: clientData.assessments.history.PHQ9[index],
        GAD7: clientData.assessments.history.GAD7[index]
    }));

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onBack}
                            className="gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Clients
                        </Button>
                        <Separator orientation="vertical" className="h-6" />
                        <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={clientData.profile.identity.avatarUrl} />
                                <AvatarFallback>
                                    {clientData.profile.identity.firstName[0]}
                                    {clientData.profile.identity.lastName[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-2xl font-semibold">
                                    {clientData.profile.identity.firstName} {clientData.profile.identity.lastName}
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    {clientData.profile.identity.pronouns} • {clientData.profile.identity.age} years old • ID: {clientData.clientId}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Profile
                        </Button>
                        <Button className="bg-[#F97316] hover:bg-[#ea580c] text-white rounded-full">
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule Session
                        </Button>
                    </div>
                </div>

                {/* Risk Banner */}
                {clientData.profile.status.riskBanner && (
                    <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-orange-900">Risk Alert: {clientData.profile.status.riskLevel.toUpperCase()}</h3>
                            <p className="text-sm text-orange-800 mt-1">{clientData.profile.status.riskBanner}</p>
                            <Button
                                variant="link"
                                className="text-orange-600 p-0 h-auto mt-2"
                                onClick={() => window.open(clientData.clinical.safety.safetyPlanUrl, '_blank')}
                            >
                                View Safety Plan <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* AI Insights Card */}
                {(clientData.aiInsights.documentationAlerts.length > 0 || clientData.aiInsights.trendAlerts.length > 0) && (
                    <Card className="border-blue-200 bg-blue-50">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Brain className="h-4 w-4 text-blue-600" />
                                AI Insights & Alerts
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-blue-900">{clientData.aiInsights.progressSummary}</p>

                            {clientData.aiInsights.documentationAlerts.length > 0 && (
                                <div className="space-y-1">
                                    {clientData.aiInsights.documentationAlerts.map((alert, i) => (
                                        <div key={i} className="flex items-start gap-2 text-sm text-orange-800">
                                            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                            {alert}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {clientData.aiInsights.trendAlerts.length > 0 && (
                                <div className="space-y-1">
                                    {clientData.aiInsights.trendAlerts.map((alert, i) => (
                                        <div key={i} className="flex items-start gap-2 text-sm text-red-800">
                                            <TrendingUp className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                            <span><strong>{alert.type}:</strong> {alert.message}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Account Status</p>
                                    <div className="mt-2">
                                        {getStatusBadge(clientData.profile.status.accountStatus)}
                                    </div>
                                </div>
                                <CheckCircle2 className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Risk Level</p>
                                    <div className="mt-2">
                                        {getRiskBadge(clientData.profile.status.riskLevel)}
                                    </div>
                                </div>
                                <Shield className="h-8 w-8 text-orange-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Sessions</p>
                                    <p className="text-2xl font-semibold mt-1">{clientData.sessions.stats.totalSessions}</p>
                                </div>
                                <Calendar className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Unread Messages</p>
                                    <p className="text-2xl font-semibold mt-1">{clientData.communication.unreadMessages}</p>
                                </div>
                                <MessageSquare className="h-8 w-8 text-purple-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-6">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="clinical">Clinical</TabsTrigger>
                        <TabsTrigger value="sessions">Sessions</TabsTrigger>
                        <TabsTrigger value="assessments">Assessments</TabsTrigger>
                        <TabsTrigger value="documents">Documents</TabsTrigger>
                        <TabsTrigger value="billing">Billing</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Contact Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <User className="h-5 w-5 text-[#F97316]" />
                                        Contact Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Email</p>
                                            <p className="text-sm font-medium">{clientData.profile.contact.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Phone</p>
                                            <p className="text-sm font-medium">{clientData.profile.contact.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Address</p>
                                            <p className="text-sm font-medium">
                                                {clientData.profile.contact.location.addressLine1}
                                                {clientData.profile.contact.location.addressLine2 && `, ${clientData.profile.contact.location.addressLine2}`}
                                            </p>
                                            <p className="text-sm font-medium">
                                                {clientData.profile.contact.location.city}, {clientData.profile.contact.location.state} {clientData.profile.contact.location.postalCode}
                                            </p>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div>
                                        <p className="text-sm font-semibold mb-2">Emergency Contact</p>
                                        <div className="space-y-1">
                                            <p className="text-sm">
                                                <span className="text-muted-foreground">Name:</span> {clientData.profile.contact.emergencyContact.name}
                                            </p>
                                            <p className="text-sm">
                                                <span className="text-muted-foreground">Relationship:</span> {clientData.profile.contact.emergencyContact.relationship}
                                            </p>
                                            <p className="text-sm">
                                                <span className="text-muted-foreground">Phone:</span> {clientData.profile.contact.emergencyContact.phone}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Next Session */}
                            {clientData.sessions.nextSession && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Calendar className="h-5 w-5 text-[#F97316]" />
                                            Next Session
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Date & Time</p>
                                                <p className="font-semibold">{clientData.sessions.nextSession.date} at {clientData.sessions.nextSession.startTime}</p>
                                            </div>
                                            <Badge className="bg-blue-100 text-blue-800">
                                                {clientData.sessions.nextSession.mode.toUpperCase()}
                                            </Badge>
                                        </div>
                                        <Separator />
                                        <Button className="w-full bg-[#F97316] hover:bg-[#ea580c] text-white rounded-full">
                                            <Video className="h-4 w-4 mr-2" />
                                            Join Session
                                        </Button>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" className="flex-1">
                                                <Edit className="h-4 w-4 mr-2" />
                                                Reschedule
                                            </Button>
                                            <Button variant="outline" size="sm" className="flex-1 text-red-600 hover:text-red-700">
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Cancel
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Last Session Summary */}
                            {clientData.sessions.lastSession && (
                                <Card className="lg:col-span-2">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-[#F97316]" />
                                            Last Session Summary
                                        </CardTitle>
                                        <CardDescription>
                                            {clientData.sessions.lastSession.date} at {clientData.sessions.lastSession.startTime}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <p className="text-sm font-semibold mb-1">Session Notes</p>
                                            <p className="text-sm text-muted-foreground">{clientData.sessions.lastSession.summary}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold mb-2">Goals Discussed</p>
                                            <ul className="space-y-1">
                                                {clientData.sessions.lastSession.goalsDiscussed.map((goal, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm">
                                                        <ChevronRight className="h-4 w-4 text-[#F97316] flex-shrink-0 mt-0.5" />
                                                        {goal}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold mb-2">Action Items</p>
                                            <ul className="space-y-1">
                                                {clientData.sessions.lastSession.actionItems.map((item, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm">
                                                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <Button variant="link" className="p-0 h-auto text-[#F97316]">
                                            View Full Note <ExternalLink className="h-3 w-3 ml-1" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>

                    {/* Clinical Tab */}
                    <TabsContent value="clinical" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Diagnoses */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Heart className="h-5 w-5 text-[#F97316]" />
                                        Diagnoses
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <p className="text-sm font-semibold mb-2">Primary Diagnosis</p>
                                        <div className="bg-blue-50 p-3 rounded-lg">
                                            <p className="text-sm font-medium">{clientData.clinical.diagnoses.primary.code}</p>
                                            <p className="text-sm text-muted-foreground">{clientData.clinical.diagnoses.primary.description}</p>
                                        </div>
                                    </div>
                                    {clientData.clinical.diagnoses.secondary.length > 0 && (
                                        <div>
                                            <p className="text-sm font-semibold mb-2">Secondary Diagnoses</p>
                                            <div className="space-y-2">
                                                {clientData.clinical.diagnoses.secondary.map((diagnosis, i) => (
                                                    <div key={i} className="bg-gray-50 p-3 rounded-lg">
                                                        <p className="text-sm font-medium">{diagnosis.code}</p>
                                                        <p className="text-sm text-muted-foreground">{diagnosis.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Medications */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Pill className="h-5 w-5 text-[#F97316]" />
                                        Current Medications
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {clientData.clinical.medications.map((med, i) => (
                                        <div key={i} className="border-l-2 border-[#F97316] pl-3 py-2">
                                            <p className="font-semibold">{med.name}</p>
                                            <p className="text-sm text-muted-foreground">{med.dosage}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Prescribed by {med.prescribedBy} • Last updated {med.lastUpdated}
                                            </p>
                                        </div>
                                    ))}
                                    <Button variant="outline" size="sm" className="w-full mt-2">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Medication
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Treatment Plan */}
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Target className="h-5 w-5 text-[#F97316]" />
                                        Treatment Plan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm font-semibold">Overall Progress</p>
                                            <Badge className="bg-green-100 text-green-800">{clientData.clinical.treatmentPlan.progress.replace('_', ' ').toUpperCase()}</Badge>
                                        </div>
                                        <Progress value={clientData.clinical.treatmentPlan.progressPercent} className="h-2" />
                                        <p className="text-xs text-muted-foreground mt-1">{clientData.clinical.treatmentPlan.progressPercent}% Complete</p>
                                    </div>
                                    <Separator />
                                    <div>
                                        <p className="text-sm font-semibold mb-1">Main Goal</p>
                                        <p className="text-sm text-muted-foreground">{clientData.clinical.treatmentPlan.mainGoal}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold mb-2">Sub-Goals</p>
                                        <ul className="space-y-1">
                                            {clientData.clinical.treatmentPlan.subGoals.map((goal, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm">
                                                    <CheckCircle2 className="h-4 w-4 text-[#F97316] flex-shrink-0 mt-0.5" />
                                                    {goal}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Badge className="bg-purple-100 text-purple-800">
                                            {clientData.clinical.treatmentPlan.modality}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Safety Assessment */}
                            <Card className="lg:col-span-2 border-orange-200">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-orange-500" />
                                        Safety Assessment
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Risk Level</p>
                                            <div className="mt-1">{getRiskBadge(clientData.clinical.safety.riskLevel)}</div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Assessment Type</p>
                                            <p className="font-semibold mt-1">{clientData.clinical.safety.lastSafetyAssessment.type}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Score</p>
                                            <p className="font-semibold mt-1">{clientData.clinical.safety.lastSafetyAssessment.score}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Last Updated</p>
                                            <p className="font-semibold mt-1">{clientData.clinical.safety.lastSafetyAssessment.date}</p>
                                        </div>
                                    </div>
                                    {clientData.clinical.safety.lastSafetyAssessment.suicidalIdeation === 'yes' && (
                                        <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                                            <p className="text-sm font-semibold text-red-900 mb-1">⚠️ Suicidal Ideation Reported</p>
                                            <p className="text-sm text-red-800">Immediate review recommended. Ensure safety plan is active and up to date.</p>
                                        </div>
                                    )}
                                    <Button
                                        variant="outline"
                                        onClick={() => window.open(clientData.clinical.safety.safetyPlanUrl, '_blank')}
                                    >
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        View Safety Plan
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Sessions Tab */}
                    <TabsContent value="sessions" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Session Statistics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Sessions</p>
                                        <p className="text-3xl font-semibold mt-1">{clientData.sessions.stats.totalSessions}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Cancelled</p>
                                        <p className="text-3xl font-semibold mt-1 text-orange-500">{clientData.sessions.stats.cancelled}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">No-Shows</p>
                                        <p className="text-3xl font-semibold mt-1 text-red-500">{clientData.sessions.stats.noShows}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Frequency</p>
                                        <p className="text-xl font-semibold mt-1 capitalize">{clientData.sessions.stats.frequency}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Assessments Tab */}
                    <TabsContent value="assessments" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* PHQ-9 Score */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center justify-between">
                                        <span>PHQ-9 (Depression)</span>
                                        {getTrendIcon(clientData.assessments.latest.PHQ9.trend)}
                                    </CardTitle>
                                    <CardDescription>Last updated: {clientData.assessments.latest.PHQ9.lastUpdated}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center">
                                        <p className="text-5xl font-bold text-[#F97316]">{clientData.assessments.latest.PHQ9.score}</p>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Trend: <span className="font-semibold capitalize">{clientData.assessments.latest.PHQ9.trend}</span>
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* GAD-7 Score */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center justify-between">
                                        <span>GAD-7 (Anxiety)</span>
                                        {getTrendIcon(clientData.assessments.latest.GAD7.trend)}
                                    </CardTitle>
                                    <CardDescription>Last updated: {clientData.assessments.latest.GAD7.lastUpdated}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center">
                                        <p className="text-5xl font-bold text-[#F59E0B]">{clientData.assessments.latest.GAD7.score}</p>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Trend: <span className="font-semibold capitalize">{clientData.assessments.latest.GAD7.trend}</span>
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Assessment Trends Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Assessment Trends</CardTitle>
                                <CardDescription>Historical scores over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis domain={[0, 27]} />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="PHQ9" stroke="#F97316" strokeWidth={2} name="PHQ-9" />
                                        <Line type="monotone" dataKey="GAD7" stroke="#F59E0B" strokeWidth={2} name="GAD-7" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Documents Tab */}
                    <TabsContent value="documents" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Session Notes</p>
                                            <p className="text-3xl font-semibold mt-1">{clientData.documents.notesCount}</p>
                                        </div>
                                        <FileText className="h-8 w-8 text-blue-500" />
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full mt-4"
                                        onClick={() => window.open(clientData.documents.links.notes, '_blank')}
                                    >
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        View All Notes
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Documents</p>
                                            <p className="text-3xl font-semibold mt-1">{clientData.documents.documentsCount}</p>
                                        </div>
                                        <Download className="h-8 w-8 text-green-500" />
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full mt-4"
                                        onClick={() => window.open(clientData.documents.links.documents, '_blank')}
                                    >
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        View Documents
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Assessments</p>
                                            <p className="text-3xl font-semibold mt-1">{clientData.documents.assessmentsCount}</p>
                                        </div>
                                        <Activity className="h-8 w-8 text-purple-500" />
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full mt-4"
                                        onClick={() => window.open(clientData.documents.links.assessments, '_blank')}
                                    >
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        View Assessments
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Billing Tab */}
                    <TabsContent value="billing" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-[#F97316]" />
                                        Insurance Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Provider</p>
                                        <p className="font-semibold">{clientData.billing.insuranceProvider}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Copay</p>
                                        <p className="font-semibold">${clientData.billing.copay}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                                        <p className={`font-semibold ${clientData.billing.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            ${clientData.billing.outstandingBalance}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <DollarSign className="h-5 w-5 text-[#F97316]" />
                                        Recent Claims
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {clientData.billing.claims.map((claim) => (
                                            <div key={claim.claimId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="text-sm font-medium">{claim.claimId}</p>
                                                    <p className="text-xs text-muted-foreground">{claim.date}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold">${claim.amount}</p>
                                                    <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                                        {claim.status.toUpperCase()}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Background Information (Always visible at bottom) */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Background & History</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-semibold mb-1">Presenting Problem</p>
                            <p className="text-sm text-muted-foreground">{clientData.background.presentingProblem}</p>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-semibold mb-2">Clinical History</p>
                                <div className="space-y-2 text-sm">
                                    <p><span className="text-muted-foreground">Previous Therapy:</span> {clientData.background.clientHistory.previousTherapy}</p>
                                    <p><span className="text-muted-foreground">Trauma History:</span> {clientData.background.clientHistory.traumaHistory}</p>
                                    <p><span className="text-muted-foreground">Medical Conditions:</span> {clientData.background.clientHistory.medicalConditions.join(', ')}</p>
                                    <p><span className="text-muted-foreground">Substance Use:</span> {clientData.background.clientHistory.substanceUse}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-semibold mb-2">Personal Context</p>
                                <div className="space-y-2 text-sm">
                                    <p><span className="text-muted-foreground">Relationship Status:</span> {clientData.background.personalContext.relationshipStatus}</p>
                                    <p><span className="text-muted-foreground">Household:</span> {clientData.background.personalContext.household}</p>
                                    <p><span className="text-muted-foreground">Employment:</span> {clientData.background.personalContext.employment.occupation} ({clientData.background.personalContext.employment.status})</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
