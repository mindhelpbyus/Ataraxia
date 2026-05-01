import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Video, Plus, User, Users, Hash, Maximize2, AlertCircle, Trash2, Calendar } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { logger } from '../utils/secureLogger';
import { useAuthStore } from '../store/authStore';
import { TherapyVideoRoom } from './TherapyVideoRoom';

interface LiveKitRoomData {
    id: string;
    name: string;
    appointmentId: string;
    createdAt: string;
    host: string;
}

const STORAGE_KEY = 'ataraxia_video_rooms';

export function VideoRoomsView() {
    const [rooms, setRooms] = useState<LiveKitRoomData[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [activeRoom, setActiveRoom] = useState<LiveKitRoomData | null>(null);

    // Form state
    const [newRoomName, setNewRoomName] = useState('');
    const [newAppointmentId, setNewAppointmentId] = useState('');
    const [error, setError] = useState<string | null>(null);

    const user = useAuthStore((s) => s.user);
    const userName = user?.name || 'Guest User';
    const userRole = user?.role || 'client';

    // Load rooms from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setRooms(JSON.parse(saved));
            } catch (e) {
                logger.error('Failed to parse saved rooms', e);
            }
        }
    }, []);

    // Save rooms to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
    }, [rooms]);

    const handleCreateRoom = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRoomName || !newAppointmentId) {
            setError('Please fill all fields');
            return;
        }

        // Check for duplicate appointment ID
        if (rooms.some(r => r.appointmentId === newAppointmentId)) {
            setError('A session with this ID already exists');
            return;
        }

        const newRoom: LiveKitRoomData = {
            id: Date.now().toString(),
            name: newRoomName,
            appointmentId: newAppointmentId,
            createdAt: new Date().toISOString(),
            host: userName,
        };

        setRooms([newRoom, ...rooms]);
        setIsCreating(false);
        setNewRoomName('');
        setNewAppointmentId('');
        setError(null);
        logger.info('Created new LiveKit session', { appointmentId: newAppointmentId });
    };

    const deleteRoom = (id: string) => {
        setRooms(rooms.filter(r => r.id !== id));
    };

    const startSession = (room: LiveKitRoomData) => {
        setError(null);
        setActiveRoom(room);
        logger.info('Starting LiveKit session', { appointmentId: room.appointmentId });
    };

    const handleSessionEnd = (duration: number) => {
        logger.info('Video session ended', { appointmentId: activeRoom?.appointmentId, duration });
        setActiveRoom(null);
    };

    const generateId = () => {
        setNewAppointmentId(`session-${Math.random().toString(36).substring(2, 9)}`);
    };

    // If a room is active, render the full-screen video room
    if (activeRoom) {
        return (
            <div className="fixed inset-0 z-50 bg-black">
                <div className="absolute top-4 right-4 z-[60] flex gap-2">
                    <Button 
                        variant="secondary" 
                        size="sm" 
                        className="bg-white/10 hover:bg-white/20 text-white border-none backdrop-blur-md"
                        onClick={() => setActiveRoom(null)}
                    >
                        Minimize
                    </Button>
                </div>
                <TherapyVideoRoom
                    appointmentId={activeRoom.appointmentId}
                    participantName={userName}
                    role={userRole === 'therapist' ? 'therapist' : 'client'}
                    onSessionEnd={handleSessionEnd}
                    onError={(err) => setError(err)}
                />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 bg-blue-500/10 rounded-lg">
                            <Video className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">LiveKit WebRTC</span>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                        Telehealth Sessions
                    </h1>
                    <p className="text-muted-foreground mt-2">Create and manage HIPAA-compliant video session rooms.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => {
                            setIsCreating(!isCreating);
                            if (!isCreating) generateId();
                        }}
                        className="bg-primary hover:bg-primary/90 shadow-sm transition-all font-medium active:scale-95"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Session
                    </Button>
                </div>
            </div>

            {error && (
                <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {isCreating && (
                <Card className="border-border shadow-xl ring-1 ring-black/5 dark:ring-white/5 bg-gradient-to-b from-card to-muted/20 animate-in zoom-in-95 duration-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Video className="w-5 h-5 text-blue-500" />
                            Initialize New Session
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateRoom} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Session Name</Label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="e.g. Couples Therapy - Mitchell"
                                            className="pl-10 h-11 border-muted-foreground/20 focus:border-blue-500 transition-colors"
                                            value={newRoomName}
                                            onChange={(e) => setNewRoomName(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Room ID (Appointment UUID)</Label>
                                        <button 
                                            type="button" 
                                            onClick={generateId}
                                            className="text-[10px] font-bold text-blue-600 hover:underline"
                                        >
                                            REGENERATE
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="session-xxxx-xxxx"
                                            className="pl-10 h-11 border-muted-foreground/20 focus:border-blue-500 font-mono text-sm"
                                            value={newAppointmentId}
                                            onChange={(e) => setNewAppointmentId(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-border/50 mt-4">
                                <Button variant="ghost" type="button" onClick={() => setIsCreating(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-primary hover:bg-primary/90 px-8">
                                    Start Management
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {rooms.length === 0 && !isCreating && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-muted rounded-3xl">
                        <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Video className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold">No active sessions</h3>
                        <p className="text-muted-foreground max-w-xs mx-auto mt-2">
                            Create a new session to start a HIPAA-compliant video call with a patient.
                        </p>
                        <Button 
                            variant="outline" 
                            className="mt-6"
                            onClick={() => {
                                setIsCreating(true);
                                generateId();
                            }}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Initial Session
                        </Button>
                    </div>
                )}
                
                {rooms.map(room => (
                    <Card key={room.id} className="group hover:shadow-2xl transition-all duration-500 border-border hover:border-blue-500/30 overflow-hidden bg-card/60 backdrop-blur-sm relative">
                        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-indigo-600 opacity-60 group-hover:opacity-100 transition-opacity" />
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                    <h3 className="font-bold text-lg leading-tight text-foreground group-hover:text-blue-600 transition-colors">{room.name}</h3>
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(room.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                                            <User className="w-3 h-3" />
                                            {room.host}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl group-hover:rotate-6 transition-transform">
                                    <Video className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>

                            <div className="bg-muted/30 rounded-xl p-4 mb-6 border border-border/40 group-hover:bg-muted/50 transition-colors">
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="text-muted-foreground font-semibold uppercase tracking-tighter">Connection Identifier</span>
                                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 rounded">STABLE</span>
                                </div>
                                <div className="flex items-center justify-between font-mono text-sm bg-background/80 p-2 rounded border border-border/50">
                                    <Hash className="w-3 h-3 text-muted-foreground" />
                                    <span className="flex-1 ml-2 truncate">{room.appointmentId}</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={() => startSession(room)}
                                    className="flex-1 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all font-semibold active:scale-95"
                                >
                                    <Maximize2 className="w-4 h-4 mr-2" />
                                    Join Room
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteRoom(room.id)}
                                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
