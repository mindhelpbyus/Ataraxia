import { IDataService } from '../types';
import { dataService } from '../index';

export interface ChatMessage {
    id: string;
    chatRoomId: string;
    senderId: string;
    senderName: string;
    senderEmail: string;
    recipientId: string;
    recipientName: string;
    message: string;
    timestamp: Date;
    read: boolean;
    type: 'text' | 'file' | 'image' | 'system';
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    reactions?: Record<string, string[]>;
}

export interface TypingStatus {
    chatRoomId: string;
    userId: string;
    userName: string;
    isTyping: boolean;
}

export interface ChatRoom {
    id: string;
    participants: string[];
    participantNames: Record<string, string>;
    participantEmails: Record<string, string>;
    lastMessage?: string;
    lastMessageTime?: Date;
    unreadCount: Record<string, number>;
    createdAt: Date;
    updatedAt: Date;
}

export const MockChatService = {
    async getOrCreateChatRoom(
        user1Id: string,
        user1Name: string,
        user1Email: string,
        user2Id: string,
        user2Name: string,
        user2Email: string
    ): Promise<string> {
        const participants = [user1Id, user2Id].sort();
        const roomId = `${participants[0]}_${participants[1]}`;

        const existing = await dataService.get('chatRooms', roomId);

        if (!existing) {
            await dataService.create('chatRooms', {
                id: roomId,
                participants,
                participantNames: { [user1Id]: user1Name, [user2Id]: user2Name },
                participantEmails: { [user1Id]: user1Email, [user2Id]: user2Email },
                unreadCount: { [user1Id]: 0, [user2Id]: 0 },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }

        return roomId;
    },

    async sendMessage(
        chatRoomId: string,
        senderId: string,
        senderName: string,
        senderEmail: string,
        recipientId: string,
        recipientName: string,
        message: string
    ): Promise<string> {
        const msg = await dataService.create('messages', {
            chatRoomId,
            senderId,
            senderName,
            senderEmail,
            recipientId,
            recipientName,
            message,
            timestamp: new Date().toISOString(),
            read: false,
            type: 'text'
        });

        // Update room
        const room = await dataService.get('chatRooms', chatRoomId);
        if (room) {
            await dataService.update('chatRooms', chatRoomId, {
                lastMessage: message,
                lastMessageTime: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }

        return msg.id;
    },

    subscribeToMessages(chatRoomId: string, callback: (messages: ChatMessage[]) => void): () => void {
        // Polling for mock implementation
        const interval = setInterval(async () => {
            const messages = await dataService.list('messages', { chatRoomId });
            // Sort by timestamp
            messages.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            callback(messages as ChatMessage[]);
        }, 1000);

        return () => clearInterval(interval);
    },

    subscribeToChatRooms(userId: string, callback: (rooms: ChatRoom[]) => void): () => void {
        const interval = setInterval(async () => {
            const allRooms = await dataService.list('chatRooms');
            const userRooms = allRooms.filter((r: any) => r.participants.includes(userId));
            callback(userRooms as ChatRoom[]);
        }, 1000);

        return () => clearInterval(interval);
    }
};
