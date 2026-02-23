/**
 * api/messaging.ts — Secure Messaging thin client
 *
 * ✅ All conversations and messages fetched from backend API.
 * ✅ Zero localStorage storage of messages (PHI must not persist client-side).
 * ✅ Zero mock data — all UI reflects the real database state.
 */

import { get, post } from './client';

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
        return get<Conversation[]>('/api/v1/messages/conversations');
    },

    async getMessages(conversationId: string): Promise<Message[]> {
        return get<Message[]>(`/api/v1/messages/conversations/${conversationId}/messages`);
    },

    async sendMessage(conversationId: string, content: string): Promise<Message> {
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
