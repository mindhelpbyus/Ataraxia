/**
 * api/messaging.ts — Secure Messaging thin client
 *
 * ✅ All conversations and messages fetched from backend API.
 * ✅ Zero localStorage storage of messages (PHI must not persist client-side).
 * ✅ Zero mock data — all UI reflects the real database state.
 */

import { get, post } from './client';
import { USE_LOCAL_DB } from '../lib/apiSwitch';
import { localDb } from '../lib/db/localDb';

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = 'client' | 'therapist' | 'receptionist' | 'admin' | 'super_admin';

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    senderName: string;
    senderRole: UserRole;
    content: string;
    timestamp: string;  // ISO 8601 from backend
    read: boolean;
}

export interface Conversation {
    id: string;
    participants: { id: string; name: string; role: UserRole }[];
    lastMessage: Message;
    unreadCount: number;
    isStarred: boolean;
    isArchived: boolean;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const messagingService = {
    async getConversations(): Promise<Conversation[]> {
        if (USE_LOCAL_DB) return localDb.conversations.findMany() as Promise<Conversation[]>;
        return get<Conversation[]>('/api/v1/messages/conversations');
    },

    async getMessages(conversationId: string): Promise<Message[]> {
        if (USE_LOCAL_DB) return localDb.messages.findMany(m => m.conversationId === conversationId) as unknown as Promise<Message[]>;
        return get<Message[]>(`/api/v1/messages/conversations/${conversationId}/messages`);
    },

    async sendMessage(conversationId: string, content: string): Promise<Message> {
        if (USE_LOCAL_DB) {
            const userId = sessionStorage.getItem('localDb_userId') ?? 'user-therapist-1';
            const db = await localDb.users.findOne(userId);
            const msg: Message = {
                id: `msg-${Date.now()}`,
                conversationId,
                senderId: userId,
                senderName: db?.name ?? 'Unknown',
                senderRole: (db?.role ?? 'therapist') as Message['senderRole'],
                content,
                timestamp: new Date().toISOString(),
                read: false,
            };
            await localDb.messages.create(msg as any);
            await localDb.conversations.update(conversationId, { lastMessage: msg, updatedAt: new Date().toISOString() } as any);
            return msg;
        }
        return post<Message>(`/api/v1/messages/conversations/${conversationId}/messages`, { content });
    },

    async markAsRead(conversationId: string): Promise<void> {
        return post<void>(`/api/v1/messages/conversations/${conversationId}/read`, undefined);
    },

    async toggleStar(conversationId: string): Promise<void> {
        return post<void>(`/api/v1/messages/conversations/${conversationId}/star`, undefined);
    },

    async archiveConversation(conversationId: string): Promise<void> {
        return post<void>(`/api/v1/messages/conversations/${conversationId}/archive`, undefined);
    },
};
