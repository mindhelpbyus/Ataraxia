/**
 * api/messaging.ts — Secure Messaging thin client
 *
 * ✅ All conversations and messages fetched from backend API.
 * ✅ Zero localStorage storage of messages (PHI must not persist client-side).
 * ✅ Zero mock data — all UI reflects the real database state.
 */

import { get, post } from './client';

// backend-initial chat REST routes (community-stack):
//   GET  /chat/conversations/{userId}          → list conversations
//   GET  /chat/conversation/{conversationId}   → messages in a conversation
//   POST /chat/conversations/{conversationId}/read

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = 'client' | 'therapist' | 'receptionist' | 'admin' | 'superadmin';

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
    /** @param userId the authenticated user whose conversations to list */
    async getConversations(userId: string): Promise<Conversation[]> {
        return get<Conversation[]>(`/chat/conversations/${userId}`);
    },

    async getMessages(conversationId: string): Promise<Message[]> {
        return get<Message[]>(`/chat/conversation/${conversationId}`);
    },

    async sendMessage(conversationId: string, content: string): Promise<Message> {
        return post<Message>(`/chat/conversation/${conversationId}`, { content });
    },

    async markAsRead(conversationId: string): Promise<void> {
        return post<void>(`/chat/conversations/${conversationId}/read`, undefined);
    },

    // NOTE: backend-initial has no star/archive chat routes yet. These are no-ops
    // until those endpoints exist (TODO(backend): add /chat/.../star, /archive).
    async toggleStar(_conversationId: string): Promise<void> {
        return;
    },

    async archiveConversation(_conversationId: string): Promise<void> {
        return;
    },
};
