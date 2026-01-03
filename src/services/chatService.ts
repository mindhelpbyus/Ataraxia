/**
 * Chat Service - Refactored to use API Abstraction Layer
 */

import { chatService } from '../api';
import { ChatMessage, ChatRoom, TypingStatus } from '../api/mock/chat';

export type { ChatMessage, ChatRoom, TypingStatus };

export async function getOrCreateChatRoom(
  user1Id: string,
  user1Name: string,
  user1Email: string,
  user2Id: string,
  user2Name: string,
  user2Email: string
): Promise<string> {
  return chatService.getOrCreateChatRoom(
    user1Id, user1Name, user1Email,
    user2Id, user2Name, user2Email
  );
}

export async function sendMessage(
  chatRoomId: string,
  senderId: string,
  senderName: string,
  senderEmail: string,
  recipientId: string,
  recipientName: string,
  message: string
): Promise<string> {
  return chatService.sendMessage(
    chatRoomId, senderId, senderName, senderEmail,
    recipientId, recipientName, message
  );
}

export async function sendFileMessage(
  chatRoomId: string,
  senderId: string,
  senderName: string,
  senderEmail: string,
  recipientId: string,
  recipientName: string,
  file: File
): Promise<string> {
  // Mock file upload
  return chatService.sendMessage(
    chatRoomId, senderId, senderName, senderEmail,
    recipientId, recipientName, `[File: ${file.name}]`
  );
}

export function subscribeToMessages(
  chatRoomId: string,
  callback: (messages: ChatMessage[]) => void
): () => void {
  return chatService.subscribeToMessages(chatRoomId, callback);
}

export function subscribeToChatRooms(
  userId: string,
  callback: (rooms: ChatRoom[]) => void
): () => void {
  return chatService.subscribeToChatRooms(userId, callback);
}

export async function markMessagesAsRead(chatRoomId: string, userId: string): Promise<void> {
  // No-op for mock
}

export async function updateTypingStatus(
  chatRoomId: string,
  userId: string,
  userName: string,
  isTyping: boolean
): Promise<void> {
  // No-op for mock
}

export function subscribeToTyping(
  chatRoomId: string,
  currentUserId: string,
  callback: (typing: TypingStatus[]) => void
): () => void {
  return () => { };
}

export async function addReaction(messageId: string, userId: string, emoji: string): Promise<void> {
  // No-op for mock
}

export async function removeReaction(messageId: string, userId: string, emoji: string): Promise<void> {
  // No-op for mock
}

export async function getUnreadCount(userId: string): Promise<number> {
  return 0;
}