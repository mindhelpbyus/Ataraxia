/**
 * Chat Service - Refactored to use API Abstraction Layer
 */

// Define types locally since mock files are removed
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
  isRead: boolean;
  reactions?: { [emoji: string]: string[] };
}

export interface ChatRoom {
  id: string;
  user1Id: string;
  user1Name: string;
  user1Email: string;
  user2Id: string;
  user2Name: string;
  user2Email: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
}

export interface TypingStatus {
  userId: string;
  userName: string;
  isTyping: boolean;
}

// TODO: Implement real chat service when needed
// For now, these are placeholder functions

export async function getOrCreateChatRoom(
  user1Id: string,
  user1Name: string,
  user1Email: string,
  user2Id: string,
  user2Name: string,
  user2Email: string
): Promise<string> {
  console.warn('Chat service not implemented yet - getOrCreateChatRoom');
  return 'placeholder-room-id';
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
  console.warn('Chat service not implemented yet - sendMessage');
  return 'placeholder-message-id';
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
  console.warn('Chat service not implemented yet - sendFileMessage');
  return 'placeholder-file-message-id';
}

export function subscribeToMessages(
  chatRoomId: string,
  callback: (messages: ChatMessage[]) => void
): () => void {
  // Return a no-op unsubscribe function for now
  console.warn('Chat service not implemented yet - subscribeToMessages');
  // Call callback with empty array to prevent errors
  callback([]);
  return () => {};
}

export function subscribeToChatRooms(
  userId: string,
  callback: (rooms: ChatRoom[]) => void
): () => void {
  // Return a no-op unsubscribe function for now
  console.warn('Chat service not implemented yet - subscribeToChatRooms');
  // Call callback with empty array to prevent errors
  callback([]);
  return () => {};
}

export async function markMessagesAsRead(chatRoomId: string, userId: string): Promise<void> {
  console.warn('Chat service not implemented yet - markMessagesAsRead');
  // No-op for now
}

export async function updateTypingStatus(
  chatRoomId: string,
  userId: string,
  userName: string,
  isTyping: boolean
): Promise<void> {
  console.warn('Chat service not implemented yet - updateTypingStatus');
  // No-op for now
}

export function subscribeToTyping(
  chatRoomId: string,
  currentUserId: string,
  callback: (typing: TypingStatus[]) => void
): () => void {
  console.warn('Chat service not implemented yet - subscribeToTyping');
  // Call callback with empty array to prevent errors
  callback([]);
  return () => {};
}

export async function addReaction(messageId: string, userId: string, emoji: string): Promise<void> {
  console.warn('Chat service not implemented yet - addReaction');
  // No-op for now
}

export async function removeReaction(messageId: string, userId: string, emoji: string): Promise<void> {
  console.warn('Chat service not implemented yet - removeReaction');
  // No-op for now
}

export async function getUnreadCount(userId: string): Promise<number> {
  console.warn('Chat service not implemented yet - getUnreadCount');
  return 0;
}