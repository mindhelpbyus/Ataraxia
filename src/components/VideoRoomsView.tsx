import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Video, Plus, User, Key, Users, Hash, Maximize2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { logger } from '../utils/secureLogger';
import { post } from '../api/client';
import { useAuthStore } from '../store/authStore';
// ✅ PERFORMANCE (Chief Architect §4.1): Zoom SDK (2.5MB) is NOT imported statically.
// It is dynamically imported ONLY when a user clicks "Join" — preventing it from
// inflating the initial bundle for every page load, even for non-video users.

// ✅ SECURITY: jsrsasign REMOVED.
// Client-side JWT signing exposed the Zoom SDK Secret to every user's browser —
// any user could open DevTools, extract the secret, and sign their own tokens to
// impersonate hosts or join any meeting. The secret now lives ONLY in the
// backend environment variables and is never transmitted to the frontend.

interface Room {
    id: string;
    name: string;
    meetingNumber: string;
    passcode: string;
    host: string;
}

// Temporary mock rooms for demonstration.
const initialRooms: Room[] = [
    {
        id: '1',
        name: 'General Therapy Room',
        meetingNumber: '1234567890',
        passcode: '123456',
        host: 'Dr. Jane Smith',
    },
    {
        id: '2',
        name: 'Group Session A',
        meetingNumber: '0987654321',
        passcode: 'password',
        host: 'Dr. Alan Wake',
    }
];

export function VideoRoomsView() {
    const [rooms, setRooms] = useState<Room[]>(initialRooms);
    const [isCreating, setIsCreating] = useState(false);
    const [activeMeetingInfo, setActiveMeetingInfo] = useState<{ meetingNumber: string; passcode: string } | null>(null);

    // Form state
    const [newRoomName, setNewRoomName] = useState('');
    const [newMeetingNumber, setNewMeetingNumber] = useState('');
    const [newPasscode, setNewPasscode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const zoomMeetingRef = useRef<HTMLDivElement>(null);
    const zoomClient = useRef<any>(null);

    // ✅ Wire auth store — replaces hardcoded 'Guest User'
    const userName = useAuthStore((s) => s.user?.name ?? 'Guest User');

    // ✅ PERFORMANCE: Zoom client is lazily initialized on first join — not on mount.
    // This removes 2.5MB from the initial bundle for users who never open a video room.

    const handleCreateRoom = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRoomName || !newMeetingNumber || !newPasscode) {
            setError('Please fill all fields');
            return;
        }

        const newRoom: Room = {
            id: Date.now().toString(),
            name: newRoomName,
            meetingNumber: newMeetingNumber,
            passcode: newPasscode,
            host: 'Current User', // Placeholder
        };

        setRooms([...rooms, newRoom]);
        setIsCreating(false);
        setNewRoomName('');
        setNewMeetingNumber('');
        setNewPasscode('');
        setError(null);
    };

    // ✅ SECURITY FIX: Signature is now generated on the backend.
    // The backend holds ZOOM_SDK_KEY and ZOOM_SDK_SECRET as environment variables.
    // The frontend only receives a short-lived, meeting-scoped signature token.
    // Attack vector eliminated: no user can DevTools-extract a secret and forge host tokens.
    //
    // Backend endpoint: POST /api/v1/zoom/signature
    // Request:  { meetingNumber: string, role: 0 | 1 }
    // Response: { signature: string, sdkKey: string }  ← sdkKey is public, secret is not returned
    const getSignature = async (meetingNumber: string, role: 0 | 1): Promise<{ signature: string; sdkKey: string }> => {
        const result = await post<{ signature: string; sdkKey: string }>(
            '/api/v1/zoom/signature',
            { meetingNumber, role }
        );
        return result;
    };

    const startMeeting = async (meetingNumber: string, passcode: string) => {
        setError(null);
        try {
            // ✅ PERFORMANCE: Dynamically import the 2.5MB Zoom SDK only when joining
            const { default: ZoomMtgEmbedded } = await import('@zoom/meetingsdk/embedded');
            if (!zoomClient.current) {
                zoomClient.current = ZoomMtgEmbedded.createClient();
            }
            if (!zoomClient.current || !zoomMeetingRef.current) {
                setError('Video session client failed to initialize. Please refresh the page.');
                return;
            }

            setActiveMeetingInfo({ meetingNumber, passcode });

            // ✅ SECURITY: Signature and sdkKey come from backend — never from localStorage
            const { signature, sdkKey } = await getSignature(meetingNumber, 0); // 0=attendee, 1=host

            await zoomClient.current.init({
                zoomAppRoot: zoomMeetingRef.current,
                language: 'en-US',
                customize: {
                    video: {
                        isResizable: true,
                        viewSizes: {
                            default: { width: 800, height: 600 }
                        }
                    }
                }
            });

            await zoomClient.current.join({
                signature,
                sdkKey,
                meetingNumber,
                password: passcode,
                userName,
                userEmail: '',
            });

            // ✅ AUDIT LOG: Session join logged server-side via apiFetch interceptor
            logger.info('Successfully joined video session');

        } catch (err: unknown) {
            // ✅ SECURITY: Never log err details to console — could contain meeting tokens
            logger.error('Video session join failed', err);
            setError('Failed to join the session. Please contact support if this persists.');
            setActiveMeetingInfo(null);
        }
    };


    const leaveMeeting = async () => {
        if (zoomClient.current) {
            try {
                const mediaStream = zoomClient.current.getMediaStream();
                if (mediaStream) {
                    const canvas = document.querySelector('#video-canvas') as HTMLCanvasElement;
                    const userId = zoomClient.current.getCurrentUserInfo()?.userId;
                    if (canvas && userId) {
                        try {
                            await mediaStream.stopRenderVideo(canvas, userId);
                        } catch (e) { }
                    }
                    await mediaStream.stopAudio();
                    await mediaStream.stopVideo();
                }
                await zoomClient.current.leave();
            } catch (e) {
                // ✅ Route through secureLogger — not console.error
                logger.error('Error leaving video session', e);
            }
        }
        setActiveMeetingInfo(null);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                        Video Rooms
                    </h1>
                    <p className="text-muted-foreground mt-2">Manage Zoom meeting rooms and join secure video sessions.</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* ✅ SECURITY: Settings panel removed — SDK credentials are backend-only config */}
                    <Button
                        onClick={() => setIsCreating(!isCreating)}
                        className="bg-primary hover:bg-primary/90 shadow-sm transition-colors font-medium"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Room
                    </Button>
                </div>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Conditionally render the Embedded Zoom Container */}
            <div
                className={`w-full bg-black/90 rounded-2xl overflow-hidden shadow-2xl border border-gray-800 transition-all duration-500 ${activeMeetingInfo ? 'h-[700px] opacity-100 mb-8' : 'h-0 opacity-0 mb-0 invisible'}`}
            >
                <div className="flex items-center justify-between px-6 py-4 bg-gray-900/50 backdrop-blur-sm border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Video className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-medium">Active Session</h3>
                            <p className="text-sm text-gray-400">Meeting: {activeMeetingInfo?.meetingNumber}</p>
                        </div>
                    </div>
                    <Button
                        variant="destructive"
                        onClick={leaveMeeting}
                        className="shadow-lg shadow-red-500/20"
                    >
                        Leave Session
                    </Button>
                </div>
                <div
                    ref={zoomMeetingRef}
                    className="w-full h-[calc(100%-73px)] relative zoom-meeting-container flex flex-col items-center justify-center bg-gray-950"
                >
                    {/* Zoom Embedded injects its HTML here */}
                </div>
            </div>

            {/* ✅ SECURITY: Zoom SDK Settings panel permanently removed.
                ZOOM_SDK_KEY and ZOOM_SDK_SECRET are backend environment variables only.
                They are set in Cloud Run secrets/environment and never exposed to the browser. */}


            {isCreating && !activeMeetingInfo && (
                <Card className="border-border shadow-xl ring-1 ring-black/5 dark:ring-white/5 bg-gradient-to-b from-card to-muted/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Video className="w-5 h-5 text-blue-500" />
                            New Video Room
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateRoom} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Room Name</Label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="e.g. Weekly Group Therapy"
                                            className="pl-9"
                                            value={newRoomName}
                                            onChange={(e) => setNewRoomName(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Meeting Number (Zoom ID)</Label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="e.g. 123 456 7890"
                                            className="pl-9"
                                            value={newMeetingNumber}
                                            onChange={(e) => setNewMeetingNumber(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Passcode</Label>
                                    <div className="relative">
                                        <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Meeting Password"
                                            className="pl-9"
                                            value={newPasscode}
                                            onChange={(e) => setNewPasscode(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="outline" type="button" onClick={() => setIsCreating(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-primary hover:bg-primary/90 shadow-sm transition-colors font-medium">
                                    Add Room
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {!activeMeetingInfo && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {rooms.map(room => (
                        <Card key={room.id} className="group hover:shadow-xl transition-all duration-300 border-border hover:border-blue-500/30 overflow-hidden bg-card/60 backdrop-blur-sm">
                            <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-indigo-500 opacity-80 group-hover:opacity-100 transition-opacity" />
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-lg leading-tight text-foreground">{room.name}</h3>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                            <User className="w-3.5 h-3.5" /> {room.host}
                                        </p>
                                    </div>
                                    <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:scale-110 transition-transform">
                                        <Video className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6 bg-muted/40 rounded-lg p-3 border border-border/50">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground font-medium flex items-center gap-1.5 min-w-0">
                                            <Hash className="w-3.5 h-3.5" /> ID:
                                        </span>
                                        <span className="font-mono bg-background px-2 py-0.5 rounded text-foreground border border-border shadow-sm truncate ml-2">
                                            {room.meetingNumber}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground font-medium flex items-center gap-1.5 min-w-0">
                                            <Key className="w-3.5 h-3.5" /> Passcode:
                                        </span>
                                        <span className="font-mono bg-background px-2 py-0.5 rounded text-foreground border border-border shadow-sm truncate ml-2">
                                            {room.passcode}
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => startMeeting(room.meetingNumber, room.passcode)}
                                    className="w-full bg-primary hover:bg-primary/90 shadow-sm transition-colors font-medium"
                                >
                                    <Maximize2 className="w-4 h-4 mr-2" />
                                    Join Video Session
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
