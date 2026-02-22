import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  MessageSquare,
  Send,
  Search,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  AlertCircle,
  Clock,
  CheckCheck,
  Star,
  UserCircle2,
  Stethoscope,
  Briefcase,
  ShieldCheck
} from 'lucide-react';
import { messagingService } from '../services/messagingService';
import type { Conversation, Message, UserRole } from '../utils/mockMessagingData';

interface MessagesViewProps {
  currentUserId: string;
  currentUserName: string;
  currentUserEmail: string;
  userRole?: string;
}

export function MessagesView({ currentUserId, currentUserName, currentUserEmail, userRole = 'therapist' }: MessagesViewProps) {
  const CURRENT_USER = {
    id: currentUserId,
    name: currentUserName,
    role: userRole as UserRole
  };

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | UserRole>('all');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize messaging service and load data
  useEffect(() => {
    const initializeMessaging = async () => {
      setIsLoading(true);
      try {
        await messagingService.initialize(currentUserId, currentUserName, userRole as UserRole);
        const loadedConversations = await messagingService.getConversations();
        setConversations(loadedConversations);

        if (loadedConversations.length > 0) {
          setSelectedConversation(loadedConversations[0]);
        }
      } catch (error) {
        console.error('Failed to initialize messaging:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeMessaging();
  }, [currentUserId, currentUserName, userRole]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load messages when conversation changes
  useEffect(() => {
    const loadConversationMessages = async () => {
      if (selectedConversation) {
        try {
          const loadedMessages = await messagingService.getMessages(selectedConversation.id);
          setMessages(loadedMessages);

          await messagingService.markAsRead(selectedConversation.id);
          const updatedConversations = await messagingService.getConversations();
          setConversations(updatedConversations);
        } catch (error) {
          console.error('Failed to load messages:', error);
        }
      }
    };

    loadConversationMessages();
  }, [selectedConversation]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      conversationId: selectedConversation.id,
      senderId: CURRENT_USER.id,
      senderName: CURRENT_USER.name,
      senderRole: CURRENT_USER.role,
      content: newMessage,
      timestamp: new Date(),
      read: false
    };

    try {
      await messagingService.sendMessage(message);
      setMessages(prev => [...prev, message]);
      setNewMessage('');

      const updatedConversations = await messagingService.getConversations();
      setConversations(updatedConversations);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleStar = async (conversationId: string) => {
    try {
      await messagingService.toggleStar(conversationId);
      const updatedConversations = await messagingService.getConversations();
      setConversations(updatedConversations);

      if (selectedConversation?.id === conversationId) {
        const updated = updatedConversations.find(c => c.id === conversationId);
        if (updated) setSelectedConversation(updated);
      }
    } catch (error) {
      console.error('Failed to toggle star:', error);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'therapist':
        return <Stethoscope className="w-3 h-3" />;
      case 'receptionist':
        return <Briefcase className="w-3 h-3" />;
      case 'client':
        return <UserCircle2 className="w-3 h-3" />;
      case 'admin':
      case 'super_admin':
        return <ShieldCheck className="w-3 h-3" />;
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'therapist':
        return 'bg-blue-100 text-blue-700';
      case 'receptionist':
        return 'bg-purple-100 text-purple-700';
      case 'client':
        return 'bg-green-100 text-green-700';
      case 'admin':
        return 'bg-amber-100 text-amber-700';
      case 'super_admin':
        return 'bg-red-100 text-red-700';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const filteredConversations = conversations
    .filter(conv => {
      if (searchQuery) {
        return conv.participants.some(p =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase())
        ) || conv.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    })
    .filter(conv => {
      if (filterRole === 'all') return true;
      if (filterRole === 'therapist') {
        // 'therapist' filter acts as 'Staff' filter
        return conv.participants.some(p =>
          (p.role === 'therapist' || p.role === 'receptionist' || p.role === 'admin' || p.role === 'super_admin') &&
          p.id !== CURRENT_USER.id
        );
      }
      return conv.participants.some(p => p.role === filterRole && p.id !== CURRENT_USER.id);
    })
    .sort((a, b) => {
      if (a.isStarred && !b.isStarred) return -1;
      if (!a.isStarred && b.isStarred) return 1;
      return b.lastMessage.timestamp.getTime() - a.lastMessage.timestamp.getTime();
    });

  const otherParticipant = selectedConversation?.participants.find(p => p.id !== CURRENT_USER.id);

  return (
    <div className="h-full bg-white p-6">
      <div className="max-w-full mx-auto">
        <div className="grid grid-cols-12 gap-6" style={{ height: '800px' }}>
          {/* Conversations List */}
          <div className="col-span-4" style={{ height: '800px' }}>
            <Card className="h-full flex flex-col overflow-hidden">
              <CardHeader className="border-b flex-shrink-0 px-4 py-3 flex flex-col justify-center" style={{ height: '110px' }}>
                <div className="space-y-2.5 w-full">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search conversations..."
                      className="pl-9"
                    />
                  </div>

                  {/* Filter */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={filterRole === 'all' ? 'default' : 'outline'}
                      onClick={() => setFilterRole('all')}
                      className={filterRole === 'all' ? 'bg-[#F97316] hover:bg-[#ea6b0f]' : ''}
                    >
                      All
                    </Button>
                    <Button
                      size="sm"
                      variant={filterRole === 'client' ? 'default' : 'outline'}
                      onClick={() => setFilterRole('client')}
                      className={filterRole === 'client' ? 'bg-[#F97316] hover:bg-[#ea6b0f]' : ''}
                    >
                      <UserCircle2 className="w-3 h-3 mr-1" />
                      Clients
                    </Button>
                    <Button
                      size="sm"
                      variant={filterRole === 'therapist' ? 'default' : 'outline'}
                      onClick={() => setFilterRole('therapist')}
                      className={filterRole === 'therapist' ? 'bg-[#F97316] hover:bg-[#ea6b0f]' : ''}
                    >
                      <Stethoscope className="w-3 h-3 mr-1" />
                      Staff
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-0 min-h-0">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
                    Loading...
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
                    <MessageSquare className="w-12 h-12 mb-2 text-gray-300" />
                    <p className="text-sm">No conversations found</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredConversations.map((conv) => {
                      const participant = conv.participants.find(p => p.id !== CURRENT_USER.id);
                      if (!participant) return null;

                      return (
                        <div
                          key={conv.id}
                          onClick={() => setSelectedConversation(conv)}
                          className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedConversation?.id === conv.id ? 'bg-orange-50 border-l-4 border-[#F97316]' : ''
                            }`}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="flex-shrink-0">
                              <AvatarFallback className={getRoleBadgeColor(participant.role)}>
                                {getInitials(participant.name)}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm text-gray-900 truncate">
                                    {participant.name}
                                  </span>
                                  {conv.isStarred && (
                                    <Star className="w-3 h-3 text-[#F97316] fill-[#F97316]" />
                                  )}
                                </div>
                                <span className="text-xs text-gray-500 flex-shrink-0">
                                  {formatTimestamp(conv.lastMessage.timestamp)}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className={`text-xs ${getRoleBadgeColor(participant.role)} border-0`}>
                                  <span className="mr-1">{getRoleIcon(participant.role)}</span>
                                  {participant.role}
                                </Badge>

                              </div>

                              <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                                {conv.lastMessage.senderId === CURRENT_USER.id ? 'You: ' : ''}
                                {conv.lastMessage.content}
                              </p>

                              {conv.unreadCount > 0 && (
                                <Badge className="bg-[#F97316] text-white text-xs mt-1">
                                  {conv.unreadCount} new
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Message Thread */}
          <div className="col-span-8" style={{ height: '800px' }}>
            {selectedConversation && otherParticipant ? (
              <Card className="h-full flex flex-col overflow-hidden">
                {/* Thread Header */}
                <CardHeader className="border-b flex-shrink-0 px-4 py-3 flex flex-col justify-center" style={{ height: '110px' }}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className={getRoleBadgeColor(otherParticipant.role)}>
                          {getInitials(otherParticipant.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900">{otherParticipant.name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-xs ${getRoleBadgeColor(otherParticipant.role)} border-0`}>
                            <span className="mr-1">{getRoleIcon(otherParticipant.role)}</span>
                            {otherParticipant.role}
                          </Badge>
                          <span className="text-xs text-gray-500">Active now</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStar(selectedConversation.id)}
                      >
                        <Star className={`w-4 h-4 ${selectedConversation.isStarred ? 'text-[#F97316] fill-[#F97316]' : 'text-gray-400'}`} />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Video className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages - Scrollable Area */}
                <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
                  {/* HIPAA Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="flex gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-blue-900">
                        <p className="font-medium">HIPAA-Compliant Messaging</p>
                        <p className="mt-1">
                          This is a secure, encrypted messaging system. Do not share sensitive health information via unsecured channels.
                        </p>
                      </div>
                    </div>
                  </div>

                  {messages.map((message) => {
                    const isCurrentUser = message.senderId === CURRENT_USER.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                          {!isCurrentUser && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-gray-700">
                                {message.senderName}
                              </span>
                              <Badge variant="outline" className={`text-xs ${getRoleBadgeColor(message.senderRole)} border-0`}>
                                {message.senderRole}
                              </Badge>
                            </div>
                          )}
                          <div
                            className={`rounded-lg px-4 py-2 ${isCurrentUser
                              ? 'bg-[#F97316] text-white'
                              : 'bg-gray-100 text-gray-900'
                              }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                          </div>
                          <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                            <Clock className="w-3 h-3" />
                            <span>{formatTimestamp(message.timestamp)}</span>
                            {isCurrentUser && message.read && (
                              <CheckCheck className="w-3 h-3 ml-1 text-blue-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </CardContent>

                {/* Message Input - Fixed at Bottom */}
                <div className="border-t p-4 flex-shrink-0">
                  <div className="flex items-end gap-2">
                    <Button variant="ghost" size="sm" className="flex-shrink-0">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Type your message... (Shift+Enter for new line)"
                      rows={1}
                      className="resize-none min-h-[40px] max-h-[120px]"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-[#F97316] hover:bg-[#ea6b0f] flex-shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Messages are encrypted and HIPAA-compliant. Press Enter to send, Shift+Enter for new line.
                  </p>
                </div>
              </Card>
            ) : (
              <Card className="h-full flex flex-col overflow-hidden">
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Select a conversation</p>
                    <p className="text-sm mt-1">Choose a conversation from the list to start messaging</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
