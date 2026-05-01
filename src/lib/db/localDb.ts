/**
 * lib/db/localDb.ts — localStorage CRUD Adapter
 *
 * A fully plug-and-play local database backed by localStorage.
 * Seed data is loaded once on first use and all mutations are persisted.
 *
 * Usage:
 *   import { localDb } from '@/lib/db/localDb';
 *   const appointments = await localDb.appointments.findMany();
 */
import type { LocalDatabase, DbAppointment, DbClient, DbTherapist, DbUser, DbConversation, DbMessage, DbTask, DbNote, DbSupportTicket, DbOrganization, DbSubscription, DbInvoice } from './schema';
import { SEED_DATA, DASHBOARD_STATS } from './seed';

const DB_KEY = 'ataraxia_local_db';
const DB_VERSION = 3;

// ─── Core Storage ─────────────────────────────────────────────────────────────

function loadDb(): LocalDatabase {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      const db = JSON.parse(raw) as LocalDatabase;
      // Migrate if schema version changed
      if (db._version === DB_VERSION) return db;
    }
  } catch { /* fallthrough to seed */ }
  // First load — seed the database
  saveDb(SEED_DATA);
  return SEED_DATA;
}

function saveDb(db: LocalDatabase): void {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

/** Reset to seed data — useful for demo resets */
export function resetLocalDb(): void {
  const fresh = { ...SEED_DATA, _seededAt: new Date().toISOString() };
  saveDb(fresh);
}

// ─── Generic Collection Helper ────────────────────────────────────────────────

function collection<T extends { id: string }>(key: keyof LocalDatabase) {
  const delay = () => new Promise<void>(res => setTimeout(res, 60));
  const items = (db: LocalDatabase) => db[key] as unknown as T[];

  return {
    async findMany(predicate?: (item: T) => boolean): Promise<T[]> {
      await delay();
      const db = loadDb();
      const arr = items(db);
      return predicate ? arr.filter(predicate) : [...arr];
    },

    async findOne(id: string): Promise<T | null> {
      await delay();
      const db = loadDb();
      return items(db).find(i => i.id === id) ?? null;
    },

    async create(item: T): Promise<T> {
      await delay();
      const db = loadDb();
      items(db).push(item);
      saveDb(db);
      return item;
    },

    async update(id: string, updates: Partial<T>): Promise<T> {
      await delay();
      const db = loadDb();
      const arr = items(db);
      const idx = arr.findIndex(i => i.id === id);
      if (idx === -1) throw new Error(`${String(key)}: record ${id} not found`);
      arr[idx] = { ...arr[idx], ...updates, updatedAt: new Date().toISOString() } as T;
      saveDb(db);
      return arr[idx];
    },

    async delete(id: string): Promise<void> {
      await delay();
      const db = loadDb();
      const arr = items(db);
      const filtered = arr.filter(i => i.id !== id);
      (db[key] as unknown as T[]) = filtered;
      saveDb(db);
    },
  };
}

// ─── Local Auth ───────────────────────────────────────────────────────────────

export const localAuth = {
  async login(email: string, password: string) {
    await new Promise(r => setTimeout(r, 400));
    const db = loadDb();
    const user = db.users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) throw new Error('Invalid email or password');
    // Store session in sessionStorage (matches real app behavior)
    sessionStorage.setItem('localDb_userId', user.id);
    const { password: _pw, ...safeUser } = user;
    return safeUser;
  },

  async getCurrentUser() {
    await new Promise(r => setTimeout(r, 100));
    const userId = sessionStorage.getItem('localDb_userId');
    if (!userId) throw new Error('Not authenticated');
    const db = loadDb();
    const user = db.users.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    const { password: _pw, ...safeUser } = user;
    return safeUser;
  },

  async logout() {
    sessionStorage.removeItem('localDb_userId');
  },

  async register(data: { email: string; password: string; firstName: string; lastName: string; role?: string; phoneNumber?: string }) {
    await new Promise(r => setTimeout(r, 500));
    const db = loadDb();
    if (db.users.find(u => u.email === data.email)) {
      throw new Error('An account with this email already exists');
    }
    const newUser: DbUser = {
      id: `user-${Date.now()}`,
      email: data.email,
      password: data.password,
      name: `${data.firstName} ${data.lastName}`,
      first_name: data.firstName,
      last_name: data.lastName,
      role: (data.role as DbUser['role']) ?? 'therapist',
      phone: data.phoneNumber,
      account_status: 'pending',
      is_verified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    saveDb(db);
    sessionStorage.setItem('localDb_userId', newUser.id);
    const { password: _pw, ...safeUser } = newUser;
    return safeUser;
  },
};

// ─── Exported Collections ─────────────────────────────────────────────────────

export const localDb = {
  appointments: collection<DbAppointment>('appointments'),
  clients:      collection<DbClient>('clients'),
  therapists:   collection<DbTherapist>('therapists'),
  users:        collection<DbUser>('users'),
  conversations: collection<DbConversation>('conversations'),
  messages:     collection<DbMessage>('messages'),
  tasks:        collection<DbTask>('tasks'),
  notes:        collection<DbNote>('notes'),
  supportTickets: collection<DbSupportTicket>('supportTickets'),
  organizations: collection<DbOrganization>('organizations'),
  subscriptions: collection<DbSubscription>('subscriptions'),
  invoices:     collection<DbInvoice>('invoices'),

  /** Reset to seed data (call from dev UI) */
  reset: resetLocalDb,

  /** Precomputed dashboard stats from seed */
  async getDashboardStats() {
    await new Promise(r => setTimeout(r, 80));
    const db = loadDb();
    const completed = (db.appointments as DbAppointment[]).filter(a => a.status === 'completed').length;
    const active    = (db.clients as DbClient[]).filter(c => c.status === 'active').length;
    const upcoming  = (db.appointments as DbAppointment[]).filter(a => a.status === 'scheduled' || a.status === 'confirmed').length;
    const pending   = (db.notes as DbNote[]).filter(n => !n.isPinned).length;
    return { ...DASHBOARD_STATS, sessionsCompleted: completed, activeClients: active, totalAppointments: upcoming, pendingNotes: pending };
  },

  /** Consolidated org invoices — all clients in org */
  async getOrgInvoices(orgId: string) {
    await new Promise(r => setTimeout(r, 80));
    const db = loadDb();
    const orgClients = (db.clients as DbClient[]).filter(c => c.organizationId === orgId).map(c => c.userId);
    return (db.invoices as DbInvoice[]).filter(i => i.organizationId === orgId || orgClients.includes(i.userId));
  },

  /** Per-therapist invoices within an org */
  async getTherapistInvoices(therapistId: string) {
    await new Promise(r => setTimeout(r, 80));
    const db = loadDb();
    const clients = (db.clients as DbClient[]).filter(c => c.assignedTherapistId === therapistId).map(c => c.userId);
    return (db.invoices as DbInvoice[]).filter(i => clients.includes(i.userId));
  },

  /** Available time slots for a therapist on a given date */
  async getTherapistSlots(therapistId: string, date: string) {
    await new Promise(r => setTimeout(r, 60));
    const db = loadDb();
    const therapist = (db.therapists as DbTherapist[]).find(t => t.id === therapistId);
    if (!therapist) return [];
    const d = new Date(date);
    const dayKey = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][d.getDay()] as keyof typeof therapist.availability;
    const slots = therapist.availability[dayKey] ?? [];
    // Remove already-booked slots
    const booked = (db.appointments as DbAppointment[])
      .filter(a => a.therapistId === therapistId && a.startTime.startsWith(date.slice(0,10)) && a.status !== 'cancelled')
      .map(a => new Date(a.startTime).toTimeString().slice(0,5));
    return slots.filter(s => !booked.includes(s));
  },
};

