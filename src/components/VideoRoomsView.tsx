import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Video, Plus, User, Key, Users, Hash, Maximize2, AlertCircle, Settings } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import ZoomMtgEmbedded from '@zoom/meetingsdk/embedded';
import { logger } from '../services/secureLogger';
import { KJUR } from 'jsrsasign';

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
    const [userName, setUserName] = useState('Guest User'); // Could pull from context
    const [error, setError] = useState<string | null>(null);
    const [isAudioMuted, setIsAudioMuted] = useState(true);
    const [isVideoMuted, setIsVideoMuted] = useState(true);

    const [showSettings, setShowSettings] = useState(false);
    const [sdkKeyInput, setSdkKeyInput] = useState(localStorage.getItem('zoomSdkKey') || '');
    const [sdkSecretInput, setSdkSecretInput] = useState(localStorage.getItem('zoomSdkSecret') || '');

    const zoomMeetingRef = useRef<HTMLDivElement>(null);
    const zoomClient = useRef<any>(null);

    useEffect(() => {
        // Initialize the Zoom client once
        try {
            if (!zoomClient.current) {
                zoomClient.current = ZoomMtgEmbedded.createClient();
            }
        } catch (e) {
            logger.error('Failed to initialize Zoom Embedded Client:', e);
        }

        return () => {
            // Cleanup zoom resources conditionally if active
        };
    }, []);

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

    const handleSaveSettings = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem('zoomSdkKey', sdkKeyInput);
        localStorage.setItem('zoomSdkSecret', sdkSecretInput);
        setShowSettings(false);
        setError(null);
    };

    const getSignature = async (meetingNumber: string, role: number) => {
        const sdkKey = localStorage.getItem('zoomSdkKey');
        const sdkSecret = localStorage.getItem('zoomSdkSecret');

        if (!sdkKey || !sdkSecret) {
            throw new Error("Missing Zoom SDK Key or Secret in settings. Please configure via the Settings button.");
        }

        const iat = Math.round(new Date().getTime() / 1000) - 30;
        const exp = iat + 60 * 60 * 2;

        const oHeader = { alg: 'HS256', typ: 'JWT' };

        // Meeting SDK payload format (differ from Video SDK)
        const oPayload = {
            appKey: sdkKey, // Used over sdkKey for >= v3
            mn: meetingNumber,
            role: role,
            iat: iat,
            exp: exp,
            tokenExp: exp
        };

        const sHeader = JSON.stringify(oHeader);
        const sPayload = JSON.stringify(oPayload);
        const signature = KJUR.jws.JWS.sign('HS256', sHeader, sPayload, sdkSecret);

        return signature;
    };

    const startMeeting = async (meetingNumber: string, passcode: string) => {
        setError(null);
        if (!zoomClient.current || !zoomMeetingRef.current) {
            setError('Zoom Meeting SDK client failed to initialize');
            return;
        }

        setActiveMeetingInfo({ meetingNumber, passcode });

        try {
            const signature = await getSignature(meetingNumber, 0); // 0 = attendee, 1 = host
            const sdkKey = localStorage.getItem('zoomSdkKey');

            await zoomClient.current.init({
                zoomAppRoot: zoomMeetingRef.current,
                language: 'en-US',
                customize: {
                    video: {
                        isResizable: true,
                        viewSizes: {
                            default: {
                                width: 800,
                                height: 600
                            }
                        }
                    }
                }
            });

            await zoomClient.current.join({
                signature: signature,
                meetingNumber: meetingNumber,
                password: passcode,
                userName: userName,
                userEmail: '', // optional
            });

            logger.info('Successfully joined video session');

        } catch (err: any) {
            console.error(err);
            setError('Failed to join the meeting. Ensure your Zoom credentials and JWT SDK Signature are properly configured in the backend.');
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
                console.error("Error leaving meeting", e);
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
                    <p className="text-muted-foreground mt-2">Manage multiple Zoom meeting rooms or join video calls effortlessly.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => { setIsCreating(false); setShowSettings(!showSettings); }}
                        variant="outline"
                        className="shadow-sm font-medium"
                    >
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                    </Button>
                    <Button
                        onClick={() => { setShowSettings(false); setIsCreating(!isCreating); }}
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

            {showSettings && !activeMeetingInfo && (
                <Card className="border-border shadow-xl ring-1 ring-black/5 dark:ring-white/5 bg-gradient-to-b from-card to-muted/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="w-5 h-5 text-gray-500" />
                            Zoom SDK Settings (Local Sandbox)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSaveSettings} className="space-y-4">
                            <Alert className="bg-amber-50 text-amber-900 border-amber-200">
                                <AlertCircle className="h-4 w-4 text-amber-600" />
                                <AlertDescription>
                                    These credentials are saved securely in your browser's local storage for development. Make sure you use a <b>Video SDK</b> app's credentials.
                                </AlertDescription>
                            </Alert>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Zoom SDK Key</Label>
                                    <div className="relative">
                                        <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Your Client ID / SDK Key"
                                            className="pl-9"
                                            value={sdkKeyInput}
                                            onChange={(e) => setSdkKeyInput(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Zoom SDK Secret</Label>
                                    <div className="relative">
                                        <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Your Client Secret / SDK Secret"
                                            type="password"
                                            className="pl-9"
                                            value={sdkSecretInput}
                                            onChange={(e) => setSdkSecretInput(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="outline" type="button" onClick={() => setShowSettings(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white shadow-sm transition-colors font-medium">
                                    Save Locally
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

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
