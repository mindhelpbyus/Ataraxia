// Messaging service - abstraction layer for data access
// Switch between mock data and real API by changing implementation here

import {
  Conversation,
  Message,
  UserRole,
  initializeMockData,
  loadConversations,
  saveConversations,
  loadMessages,
  saveMessages
} from '../utils/mockMessagingData';

// Configuration flag - set to false when API is ready
const USE_MOCK_DATA = true;

export class MessagingService {
  private static instance: MessagingService;
  private conversationsCache: Conversation[] = [];
  private messagesCache: { [key: string]: Message[] } = {};

  private constructor() {}

  static getInstance(): MessagingService {
    if (!MessagingService.instance) {
      MessagingService.instance = new MessagingService();
    }
    return MessagingService.instance;
  }

  // Initialize data for current user
  async initialize(currentUserId: string, currentUserName: string, userRole: UserRole): Promise<void> {
    if (USE_MOCK_DATA) {
      // Try to load from localStorage first
      const savedConversations = loadConversations();
      const savedMessages = loadMessages();

      if (savedConversations && savedMessages) {
        this.conversationsCache = savedConversations;
        this.messagesCache = savedMessages;
      } else {
        // Initialize with mock data
        const { mockConversations, mockMessages } = initializeMockData(
          currentUserId,
          currentUserName,
          userRole
        );
        this.conversationsCache = mockConversations;
        this.messagesCache = mockMessages;
        
        // Save to localStorage
        saveConversations(mockConversations);
        saveMessages(mockMessages);
      }
    } else {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/conversations');
      // this.conversationsCache = await response.json();
    }
  }

  // Get all conversations
  async getConversations(): Promise<Conversation[]> {
    if (USE_MOCK_DATA) {
      return this.conversationsCache;
    } else {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/conversations');
      // return await response.json();
      return [];
    }
  }

  // Get messages for a conversation
  async getMessages(conversationId: string): Promise<Message[]> {
    if (USE_MOCK_DATA) {
      return this.messagesCache[conversationId] || [];
    } else {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/conversations/${conversationId}/messages`);
      // return await response.json();
      return [];
    }
  }

  // Send a message
  async sendMessage(message: Message): Promise<Message> {
    if (USE_MOCK_DATA) {
      // Add to messages cache
      if (!this.messagesCache[message.conversationId]) {
        this.messagesCache[message.conversationId] = [];
      }
      this.messagesCache[message.conversationId].push(message);

      // Update conversation's last message
      const convIndex = this.conversationsCache.findIndex(
        c => c.id === message.conversationId
      );
      if (convIndex !== -1) {
        this.conversationsCache[convIndex].lastMessage = message;
      }

      // Save to localStorage
      saveMessages(this.messagesCache);
      saveConversations(this.conversationsCache);

      return message;
    } else {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/messages', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(message)
      // });
      // return await response.json();
      return message;
    }
  }

  // Mark conversation as read
  async markAsRead(conversationId: string): Promise<void> {
    if (USE_MOCK_DATA) {
      const convIndex = this.conversationsCache.findIndex(c => c.id === conversationId);
      if (convIndex !== -1) {
        this.conversationsCache[convIndex].unreadCount = 0;
        saveConversations(this.conversationsCache);
      }
    } else {
      // TODO: Replace with actual API call
      // await fetch(`/api/conversations/${conversationId}/read`, { method: 'POST' });
    }
  }

  // Toggle star on conversation
  async toggleStar(conversationId: string): Promise<void> {
    if (USE_MOCK_DATA) {
      const convIndex = this.conversationsCache.findIndex(c => c.id === conversationId);
      if (convIndex !== -1) {
        this.conversationsCache[convIndex].isStarred = !this.conversationsCache[convIndex].isStarred;
        saveConversations(this.conversationsCache);
      }
    } else {
      // TODO: Replace with actual API call
      // await fetch(`/api/conversations/${conversationId}/star`, { method: 'POST' });
    }
  }

  // Archive conversation
  async archiveConversation(conversationId: string): Promise<void> {
    if (USE_MOCK_DATA) {
      const convIndex = this.conversationsCache.findIndex(c => c.id === conversationId);
      if (convIndex !== -1) {
        this.conversationsCache[convIndex].isArchived = true;
        saveConversations(this.conversationsCache);
      }
    } else {
      // TODO: Replace with actual API call
      // await fetch(`/api/conversations/${conversationId}/archive`, { method: 'POST' });
    }
  }

  // Clear cache (useful for logout)
  clearCache(): void {
    this.conversationsCache = [];
    this.messagesCache = {};
  }
}

export const messagingService = MessagingService.getInstance();
