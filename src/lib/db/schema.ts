/**
 * lib/db/schema.ts — Local Database Schema (TypeScript Types)
 *
 * These types mirror the backend API shapes exactly so the local DB
 * is a drop-in replacement. When the real backend is ready, just flip
 * VITE_USE_LOCAL_DB=false in .env.local — no other code changes needed.
 */

// ─── Auth / Users ─────────────────────────────────────────────────────────────

export type UserRole =
  | 'super_admin'
  | 'org_admin'
  | 'admin'
  | 'therapist'
  | 'client';

export interface DbUser {
  id: string;
  email: string;
  password: string; // hashed (bcrypt) — only used in local auth check
  name: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  account_status: 'registered' | 'pending' | 'active' | 'suspended';
  is_verified: boolean;
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Organizations ────────────────────────────────────────────────────────────

export interface DbOrganization {
  id: string;
  name: string;
  domain: string;
  logoUrl?: string;
  status: 'active' | 'suspended' | 'pending';
  plan: 'starter' | 'professional' | 'enterprise';
  therapistCount: number;
  clientCount: number;
  ownerId: string;
  address?: string;
  phone?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Therapists ───────────────────────────────────────────────────────────────

export interface DbTherapist {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  title: string;
  specialties: string[];
  languages: string[];
  licenseNumber?: string;
  licenseState?: string;
  yearsExperience: number;
  rating: number;
  reviewCount: number;
  sessionFee: number;
  bio?: string;
  organizationId?: string;
  status: 'active' | 'inactive' | 'pending_verification';
  isVerified: boolean;
  color: string; // calendar color
  availability: {
    monday: string[];
    tuesday: string[];
    wednesday: string[];
    thursday: string[];
    friday: string[];
    saturday: string[];
    sunday: string[];
  };
  createdAt: string;
  updatedAt: string;
}

// ─── Clients ──────────────────────────────────────────────────────────────────

export interface DbClient {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  assignedTherapistId?: string;
  organizationId?: string;
  status: 'active' | 'inactive' | 'onboarding';
  insuranceProvider?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Appointments ─────────────────────────────────────────────────────────────

export interface DbAppointment {
  id: string;
  therapistId: string;
  therapistName: string;
  clientId: string;
  clientName: string;
  startTime: string; // ISO 8601
  endTime: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  type: 'video' | 'audio' | 'in-person';
  notes?: string;
  meetingLink?: string;
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Messages / Conversations ─────────────────────────────────────────────────

export interface DbMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface DbConversation {
  id: string;
  participants: { id: string; name: string; role: UserRole }[];
  lastMessage: DbMessage;
  unreadCount: number;
  isStarred: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export interface DbTask {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  assignedToId: string;
  assignedById?: string;
  clientId?: string;
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Notes ───────────────────────────────────────────────────────────────────

export interface DbNote {
  id: string;
  title: string;
  content: string;
  color: string;
  authorId: string;
  clientId?: string;
  appointmentId?: string;
  isPinned: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Support Tickets ─────────────────────────────────────────────────────────

export interface DbSupportTicket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  submittedById: string;
  submittedByName: string;
  assignedToId?: string;
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Billing / Subscriptions ─────────────────────────────────────────────────

export interface DbSubscription {
  id: string;
  userId: string;
  organizationId?: string;
  plan: 'trial' | 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'trial' | 'cancelled' | 'past_due';
  trialDaysRemaining: number | null;
  billingCycle: 'monthly' | 'annual';
  amount: number;
  nextBillingDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbInvoice {
  id: string;
  invoiceNumber: string;
  userId: string;
  organizationId?: string;
  amount: number;
  status: 'paid' | 'unpaid' | 'overdue' | 'cancelled';
  dueDate: string;
  paidAt?: string;
  description: string;
  createdAt: string;
}

// ─── Full Database Shape ──────────────────────────────────────────────────────

export interface LocalDatabase {
  users: DbUser[];
  organizations: DbOrganization[];
  therapists: DbTherapist[];
  clients: DbClient[];
  appointments: DbAppointment[];
  conversations: DbConversation[];
  messages: DbMessage[];
  tasks: DbTask[];
  notes: DbNote[];
  supportTickets: DbSupportTicket[];
  subscriptions: DbSubscription[];
  invoices: DbInvoice[];
  _version: number;
  _seededAt: string;
}
