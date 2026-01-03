import { dataService } from '../index';

export interface CallLog {
    id: string;
    callType: 'video' | 'audio';
    roomName: string;
    initiatorId: string;
    initiatorName: string;
    participantIds: string[];
    participantNames: Record<string, string>;
    startTime: Date;
    endTime?: Date;
    duration?: number;
    status: 'initiated' | 'ongoing' | 'completed' | 'missed' | 'cancelled';
    appointmentId?: string;
    recordingUrl?: string;
    notes?: string;
}

export interface CallInvitation {
    id: string;
    callType: 'video' | 'audio';
    roomName: string;
    initiatorId: string;
    initiatorName: string;
    recipientId: string;
    recipientName: string;
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'expired';
    createdAt: Date;
    expiresAt: Date;
    appointmentId?: string;
}

export const MockCallService = {
    async createCallLog(data: Omit<CallLog, 'id' | 'startTime' | 'status'>): Promise<string> {
        const log = await dataService.create('callLogs', {
            ...data,
            startTime: new Date().toISOString(),
            status: 'initiated'
        });
        return log.id;
    },

    async updateCallStatus(callId: string, status: CallLog['status']): Promise<void> {
        const updateData: any = { status };
        if (status === 'completed') {
            updateData.endTime = new Date().toISOString();
        }
        await dataService.update('callLogs', callId, updateData);
    },

    async endCall(callId: string, recordingUrl?: string): Promise<void> {
        const log = await dataService.get('callLogs', callId);
        if (log) {
            const endTime = new Date();
            const startTime = new Date(log.startTime);
            const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

            await dataService.update('callLogs', callId, {
                status: 'completed',
                endTime: endTime.toISOString(),
                duration,
                recordingUrl
            });
        }
    },

    async createCallInvitation(data: Omit<CallInvitation, 'id' | 'createdAt' | 'expiresAt' | 'status'>): Promise<string> {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 60000); // 1 minute expiry

        const invitation = await dataService.create('callInvitations', {
            ...data,
            status: 'pending',
            createdAt: now.toISOString(),
            expiresAt: expiresAt.toISOString()
        });

        return invitation.id;
    },

    subscribeToCallLogs(userId: string, callback: (logs: CallLog[]) => void): () => void {
        const interval = setInterval(async () => {
            const allLogs = await dataService.list('callLogs');
            const userLogs = allLogs.filter((l: any) => l.participantIds.includes(userId));
            // Sort by startTime desc
            userLogs.sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
            callback(userLogs as CallLog[]);
        }, 1000);
        return () => clearInterval(interval);
    },

    subscribeToCallInvitations(userId: string, callback: (invitations: CallInvitation[]) => void): () => void {
        const interval = setInterval(async () => {
            const allInvitations = await dataService.list('callInvitations');
            const now = new Date();

            const userInvitations = allInvitations.filter((inv: any) => {
                const expiresAt = new Date(inv.expiresAt);
                return inv.recipientId === userId &&
                    inv.status === 'pending' &&
                    expiresAt > now;
            });

            callback(userInvitations as CallInvitation[]);
        }, 1000);
        return () => clearInterval(interval);
    }
};
