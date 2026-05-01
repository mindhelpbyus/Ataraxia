/**
 * lib/db/seed.ts — Full Demo Dataset
 *
 * Generated programmatically via generator.ts.
 * 4 organizations (4-10 therapists, 10-20 clients each)
 * 5 individual therapists (10 clients each)
 * Appointments, invoices, conversations, tasks, notes for all.
 */
import type { LocalDatabase } from './schema';
import {
  makeUser, makeOrg, makeTherapist, makeClient, makeAppointment,
  makeInvoice, makeTask, makeNote, makeTicket, makeSubscription,
  makeConversation, makeMessage,
} from './generator';

// ─── Counters (globally unique IDs across all entities) ───────────────────────
let U = 0;   // user counter
let T = 0;   // therapist counter
let C = 0;   // client counter
let A = 0;   // appointment counter
let I = 0;   // invoice counter
let TK = 0;  // task counter
let N = 0;   // note counter
let TI = 0;  // ticket counter
let SB = 0;  // subscription counter
let CV = 0;  // conversation counter
let MG = 0;  // message counter

// ─── Accumulators ─────────────────────────────────────────────────────────────
const users: ReturnType<typeof makeUser>[]               = [];
const organizations: ReturnType<typeof makeOrg>[]        = [];
const therapists: ReturnType<typeof makeTherapist>[]     = [];
const clients: ReturnType<typeof makeClient>[]           = [];
const appointments: ReturnType<typeof makeAppointment>[] = [];
const invoices: ReturnType<typeof makeInvoice>[]         = [];
const tasks: ReturnType<typeof makeTask>[]               = [];
const notes: ReturnType<typeof makeNote>[]               = [];
const supportTickets: ReturnType<typeof makeTicket>[]    = [];
const subscriptions: ReturnType<typeof makeSubscription>[] = [];
const conversations: ReturnType<typeof makeConversation>[] = [];
const messages: ReturnType<typeof makeMessage>[]           = [];

// ─── Super Admin ──────────────────────────────────────────────────────────────
const superAdmin = makeUser(U++, 'super_admin');
superAdmin.email = 'admin@ataraxia.com';
superAdmin.name  = 'Alex Rivera';
superAdmin.first_name = 'Alex';
superAdmin.last_name  = 'Rivera';
users.push(superAdmin);

// ─── Injection of Demo Personas (matching devMockUser.ts) ──────────────────────
// This ensures that when you log in as admin@ataraxia.dev or therapist@ataraxia.dev,
// you actually see data.

const demoAdminUser = makeUser(U++, 'admin');
demoAdminUser.id = 'mock-admin-001';
demoAdminUser.email = 'admin@ataraxia.dev';
demoAdminUser.name = 'Alex Morgan';
demoAdminUser.first_name = 'Alex';
demoAdminUser.last_name = 'Morgan';
demoAdminUser.organization_id = 'ORG-0';
users.push(demoAdminUser);

const demoTherapistUser = makeUser(U++, 'therapist');
demoTherapistUser.id = 'mock-therapist-001';
demoTherapistUser.email = 'therapist@ataraxia.dev';
demoTherapistUser.name = 'Dr. Sarah Chen';
demoTherapistUser.first_name = 'Sarah';
demoTherapistUser.last_name = 'Chen';
demoTherapistUser.organization_id = 'ORG-0';
users.push(demoTherapistUser);

const demoTherapist = makeTherapist(T++, demoTherapistUser.id, 'ORG-0');
demoTherapist.name = 'Dr. Sarah Chen';
demoTherapist.email = 'therapist@ataraxia.dev';
therapists.push(demoTherapist);

const demoClientUser = makeUser(U++, 'client');
demoClientUser.id = 'mock-client-001';
demoClientUser.email = 'client@ataraxia.dev';
demoClientUser.name = 'Jamie Rivera';
demoClientUser.first_name = 'Jamie';
demoClientUser.last_name = 'Rivera';
demoClientUser.organization_id = 'ORG-0';
users.push(demoClientUser);

const demoClient = makeClient(C++, demoClientUser.id, demoTherapist.id, 'ORG-0');
demoClient.name = 'Jamie Rivera';
demoClient.email = 'client@ataraxia.dev';
clients.push(demoClient);

// Busy schedule for Dr. Sarah Chen (Today)
const today = new Date();
for (let h = 9; h <= 17; h++) {
  if (h === 12) continue; // Lunch
  const apt = makeAppointment(A++, demoTherapist.id, demoTherapist.name, demoClient.id, demoClient.name, 'ORG-0', 0);
  const start = new Date(today);
  start.setHours(h, 0, 0, 0);
  const end = new Date(today);
  end.setHours(h, 50, 0, 0);
  apt.startTime = start.toISOString();
  apt.endTime = end.toISOString();
  apt.status = h < 12 ? 'completed' : 'confirmed';
  appointments.push(apt);

  // Invoices for these sessions
  if (h < 12) {
    invoices.push(makeInvoice(I++, demoClientUser.id, 'ORG-0', 150, 0));
  }
}

// ─── 4 Organizations ──────────────────────────────────────────────────────────
const ORG_THERAPIST_COUNTS = [6, 8, 5, 7];
const ORG_CLIENT_PER_T     = [3, 2, 3, 2]; // clients per therapist

for (let o = 0; o < 4; o++) {
  // Org Admin
  const adminUser = makeUser(U++, 'org_admin');
  adminUser.email = `orgadmin${o}@org${o}.com`;
  users.push(adminUser);

  const org = makeOrg(o, o === 0 ? demoAdminUser.id : adminUser.id);
  org.therapistCount = o === 0 ? ORG_THERAPIST_COUNTS[o] + 1 : ORG_THERAPIST_COUNTS[o];
  org.clientCount    = org.therapistCount * ORG_CLIENT_PER_T[o];
  organizations.push(org);

  subscriptions.push(makeSubscription(SB++, o === 0 ? demoAdminUser.id : adminUser.id, org.id));
  supportTickets.push(makeTicket(TI++, o === 0 ? demoAdminUser.id : adminUser.id, o === 0 ? demoAdminUser.name : adminUser.name, org.id));

  // Therapists for this org
  for (let t = 0; t < ORG_THERAPIST_COUNTS[o]; t++) {
    const tUser = makeUser(U++, 'therapist', org.id);
    users.push(tUser);
    const therapist = makeTherapist(T, tUser.id, org.id);
    therapist.name  = `Dr. ${tUser.first_name} ${tUser.last_name}`;
    therapist.email = tUser.email;
    therapists.push(therapist);
    subscriptions.push(makeSubscription(SB++, tUser.id, org.id));
    tasks.push(makeTask(TK++, tUser.id, undefined, org.id));
    notes.push(makeNote(N++, tUser.id));
    T++;

    // Clients per therapist
    for (let c = 0; c < ORG_CLIENT_PER_T[o]; c++) {
      const cUser = makeUser(U++, 'client', org.id);
      users.push(cUser);
      const client = makeClient(C, cUser.id, therapist.id, org.id);
      client.name  = cUser.name;
      client.email = cUser.email;
      clients.push(client);
      C++;

      // Past appointments (3 per client)
      for (let p = 1; p <= 3; p++) {
        appointments.push(makeAppointment(A++, therapist.id, therapist.name, client.id, client.name, org.id, -(p * 7)));
      }
      // Future appointments (1-2 per client)
      appointments.push(makeAppointment(A++, therapist.id, therapist.name, client.id, client.name, org.id, c + 1));

      // Monthly invoices (client paying therapist) — 4 months
      for (let m = 0; m < 4; m++) {
        invoices.push(makeInvoice(I++, cUser.id, org.id, therapist.sessionFee, m));
      }

      // Notes per client
      notes.push(makeNote(N++, tUser.id, client.id));
      tasks.push(makeTask(TK++, tUser.id, client.id, org.id));

      // Conversation + messages
      const convId = `conv-${CV}`;
      const msg1 = makeMessage(MG++, convId, cUser.id, client.name, 'client');
      messages.push(msg1);
      const msg2 = makeMessage(MG++, convId, tUser.id, therapist.name, 'therapist');
      messages.push(msg2);
      conversations.push(makeConversation(CV++, { id: tUser.id, name: therapist.name }, { id: cUser.id, name: client.name }, msg2));
    }
  }
}

// ─── 5 Individual Therapists (no org) ────────────────────────────────────────
for (let t = 0; t < 5; t++) {
  const tUser = makeUser(U++, 'therapist');
  tUser.email = `solo.therapist${t}@demo.com`;
  users.push(tUser);

  const therapist = makeTherapist(T, tUser.id, undefined);
  therapist.name  = `Dr. ${tUser.first_name} ${tUser.last_name}`;
  therapist.email = tUser.email;
  therapists.push(therapist);
  subscriptions.push(makeSubscription(SB++, tUser.id, undefined));
  supportTickets.push(makeTicket(TI++, tUser.id, therapist.name, undefined));
  T++;

  for (let c = 0; c < 10; c++) {
    const cUser = makeUser(U++, 'client');
    users.push(cUser);
    const client = makeClient(C, cUser.id, therapist.id, undefined);
    client.name  = cUser.name;
    client.email = cUser.email;
    clients.push(client);
    C++;

    for (let p = 1; p <= 3; p++) {
      appointments.push(makeAppointment(A++, therapist.id, therapist.name, client.id, client.name, undefined, -(p * 7)));
    }
    appointments.push(makeAppointment(A++, therapist.id, therapist.name, client.id, client.name, undefined, c + 1));
    for (let m = 0; m < 4; m++) {
      invoices.push(makeInvoice(I++, cUser.id, undefined, therapist.sessionFee, m));
    }
    notes.push(makeNote(N++, tUser.id, client.id));
    tasks.push(makeTask(TK++, tUser.id, client.id, undefined));

    const convId = `conv-${CV}`;
    const msg1 = makeMessage(MG++, convId, cUser.id, client.name, 'client');
    messages.push(msg1);
    const msg2 = makeMessage(MG++, convId, tUser.id, therapist.name, 'therapist');
    messages.push(msg2);
    conversations.push(makeConversation(CV++, { id: tUser.id, name: therapist.name }, { id: cUser.id, name: client.name }, msg2));
  }
}

// ─── Dashboard stats ─────────────────────────────────────────────────────────
const completedAppts = appointments.filter(a => a.status === 'completed').length;
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const completionRateByMonth = months.map((month, i) => ({
  month,
  rate: 45 + Math.round(Math.sin(i / 2) * 20 + i * 2),
}));

export const DASHBOARD_STATS = {
  sessionsCompleted: completedAppts,
  activeClients: clients.filter(c => c.status === 'active').length,
  totalAppointments: appointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length,
  pendingNotes: notes.filter(n => !n.isPinned).length,
  completionRateByMonth,
  totalRevenue: invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0),
  totalOrganizations: organizations.length,
  totalTherapists: therapists.length,
  totalClients: clients.length,
};

// ─── Assembled DB ─────────────────────────────────────────────────────────────
export const SEED_DATA: LocalDatabase = {
  _version: 3, // Bump version to force re-seed with injected personas
  _seededAt: new Date().toISOString(),
  users,
  organizations,
  therapists,
  clients,
  appointments,
  conversations,
  messages,
  tasks,
  notes,
  supportTickets,
  subscriptions,
  invoices,
};
