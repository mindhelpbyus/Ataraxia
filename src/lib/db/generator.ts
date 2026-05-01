/**
 * lib/db/generator.ts — Deterministic seed data factory
 * Generates all demo data programmatically — no hardcoded arrays.
 */
import type {
  DbUser, DbOrganization, DbTherapist, DbClient,
  DbAppointment, DbConversation, DbMessage,
  DbInvoice, DbTask, DbNote, DbSupportTicket, DbSubscription,
} from './schema';

// ─── Deterministic helpers ────────────────────────────────────────────────────
const FIRST_NAMES = ['Sarah','James','Emma','Marcus','Olivia','Liam','Ava','Noah','Sophia','Elijah','Isabella','Lucas','Mia','Mason','Charlotte','Ethan','Amelia','Aiden','Harper','Logan','Evelyn','Jackson','Abigail','Sebastian','Emily','Mateo','Elizabeth','Jack','Sofia','Owen'];
const LAST_NAMES  = ['Mitchell','Chen','Davis','Thompson','Wilson','Garcia','Martinez','Anderson','Taylor','Moore','Jackson','White','Harris','Martin','Lee','Walker','Hall','Allen','Young','King','Wright','Scott','Torres','Nguyen','Hill','Flores','Green','Adams','Nelson','Baker'];
const SPECIALTIES = ['CBT','Anxiety','Depression','Trauma','EMDR','Couples Therapy','Family Systems','ADHD','Mindfulness','Grief','Addiction','OCD','PTSD','Child Therapy','Adolescent Therapy'];
const LANGUAGES   = ['English','Spanish','Mandarin','French','Portuguese','Hindi','Arabic','Korean'];
const CITIES      = ['San Francisco, CA','Austin, TX','New York, NY','Chicago, IL','Seattle, WA','Boston, MA','Denver, CO','Portland, OR','Miami, FL','Atlanta, GA'];
const INSURANCES  = ['Blue Cross Blue Shield','Aetna','UnitedHealth','Cigna','Humana','Kaiser','Magellan','Beacon Health'];
const GENDERS     = ['Male','Female','Non-binary','Prefer not to say'];
const COLORS      = ['#1E7048','#3B82F6','#8B5CF6','#EC4899','#F59E0B','#EF4444','#06B6D4','#84CC16','#14B8A6','#F97316'];
const ORG_NAMES   = ['Wellness Care Center','MindBridge Therapy','Serenity Health Group','Harmony Behavioral Health'];
const ORG_PLANS: ('starter'|'professional'|'enterprise')[] = ['professional','starter','enterprise','professional'];

function pick<T>(arr: T[], seed: number): T { return arr[seed % arr.length]; }
function rng(seed: number, min: number, max: number) { return min + (seed * 2654435761 >>> 0) % (max - min + 1); }
function uid(prefix: string, n: number) { return `${prefix}-${n}`; }

const daysAgo = (d: number, h = 9, m = 0) => {
  const dt = new Date();
  dt.setDate(dt.getDate() - d);
  dt.setHours(h, m, 0, 0);
  return dt.toISOString();
};
const daysFromNow = (d: number, h = 10, m = 0) => {
  const dt = new Date();
  dt.setDate(dt.getDate() + d);
  dt.setHours(h, m, 0, 0);
  return dt.toISOString();
};

// ─── Entity builders ─────────────────────────────────────────────────────────

export function makeUser(n: number, role: DbUser['role'], orgId?: string): DbUser {
  const fn = pick(FIRST_NAMES, n);
  const ln = pick(LAST_NAMES, n + 7);
  return {
    id: uid('user', n),
    email: `${fn.toLowerCase()}.${ln.toLowerCase()}${n}@demo.com`,
    password: 'demo1234',
    name: `${fn} ${ln}`,
    first_name: fn,
    last_name: ln,
    role,
    phone: `+1-555-${String(n).padStart(3,'0')}-${String(rng(n,1000,9999))}`,
    account_status: 'active',
    is_verified: true,
    organizationId: orgId,
    createdAt: daysAgo(rng(n,10,180)),
    updatedAt: daysAgo(rng(n,0,10)),
  };
}

export function makeOrg(n: number, ownerId: string): DbOrganization {
  const therapistCount = rng(n, 4, 10);
  const clientCount    = rng(n, 10, 20) * therapistCount;
  return {
    id: uid('org', n),
    name: ORG_NAMES[n % ORG_NAMES.length],
    domain: `${ORG_NAMES[n % ORG_NAMES.length].toLowerCase().replace(/\s+/g,'-')}.ataraxia.com`,
    status: 'active',
    plan: ORG_PLANS[n % ORG_PLANS.length],
    therapistCount,
    clientCount,
    ownerId,
    address: `${rng(n,100,9999)} Main St, ${pick(CITIES, n)}`,
    phone: `+1-555-${String(n + 300).padStart(3,'0')}-0000`,
    email: `info@org${n}.com`,
    createdAt: daysAgo(rng(n,60,365)),
    updatedAt: daysAgo(rng(n,1,30)),
  };
}

export function makeTherapist(n: number, userId: string, orgId?: string): DbTherapist {
  const user = { name: `Dr. ${pick(FIRST_NAMES, n)} ${pick(LAST_NAMES, n+3)}`, email: `therapist${n}@demo.com` };
  const specs = [pick(SPECIALTIES, n), pick(SPECIALTIES, n+4), pick(SPECIALTIES, n+9)];
  return {
    id: uid('therapist', n),
    userId,
    name: user.name,
    email: user.email,
    phone: `+1-555-${String(n+100).padStart(3,'0')}-${String(rng(n,1000,9999))}`,
    title: ['Licensed Clinical Psychologist','Licensed Professional Counselor','Marriage & Family Therapist','Licensed Social Worker','Psychiatrist'][n % 5],
    specialties: specs,
    languages: [pick(LANGUAGES, n), 'English'].filter((v,i,a)=>a.indexOf(v)===i),
    licenseNumber: `LIC-${String(n).padStart(5,'0')}`,
    licenseState: pick(['CA','TX','NY','FL','WA'],n),
    yearsExperience: rng(n, 3, 20),
    rating: Number((3.8 + (n % 12) * 0.1).toFixed(1)),
    reviewCount: rng(n, 10, 200),
    sessionFee: [120,140,160,180,200][n % 5],
    bio: `Specializing in ${specs[0]} and ${specs[1]} with ${rng(n,3,20)} years of experience.`,
    organizationId: orgId,
    status: 'active',
    isVerified: true,
    color: COLORS[n % COLORS.length],
    availability: {
      monday:    ['09:00','10:00','11:00','14:00','15:00'].slice(0, rng(n,2,5)),
      tuesday:   ['09:00','10:00','14:00','15:00'].slice(0, rng(n+1,2,4)),
      wednesday: ['10:00','11:00','14:00','15:00','16:00'].slice(0, rng(n+2,2,5)),
      thursday:  ['09:00','11:00','14:00'].slice(0, rng(n+3,1,3)),
      friday:    ['09:00','10:00','11:00'].slice(0, rng(n+4,1,3)),
      saturday:  n % 3 === 0 ? ['09:00','10:00'] : [],
      sunday:    [],
    },
    createdAt: daysAgo(rng(n,30,200)),
    updatedAt: daysAgo(rng(n,0,14)),
  };
}

export function makeClient(n: number, userId: string, therapistId: string, orgId?: string): DbClient {
  return {
    id: uid('client', n),
    userId,
    name: `${pick(FIRST_NAMES, n+15)} ${pick(LAST_NAMES, n+20)}`,
    email: `client${n}@demo.com`,
    phone: `+1-555-${String(n+200).padStart(3,'0')}-${String(rng(n,1000,9999))}`,
    dateOfBirth: `${1970+rng(n,0,35)}-${String(rng(n,1,12)).padStart(2,'0')}-${String(rng(n,1,28)).padStart(2,'0')}`,
    gender: pick(GENDERS, n),
    address: `${rng(n,10,999)} ${pick(['Oak','Elm','Pine','Maple','Cedar'],n)} St, ${pick(CITIES, n+2)}`,
    emergencyContact: {
      name: `${pick(FIRST_NAMES, n+5)} ${pick(LAST_NAMES, n+8)}`,
      phone: `+1-555-999-${String(rng(n,1000,9999))}`,
      relationship: pick(['Spouse','Parent','Sibling','Friend','Partner'],n),
    },
    assignedTherapistId: therapistId,
    organizationId: orgId,
    status: 'active',
    insuranceProvider: pick(INSURANCES, n),
    createdAt: daysAgo(rng(n,10,150)),
    updatedAt: daysAgo(rng(n,0,10)),
  };
}

export function makeAppointment(n: number, therapistId: string, therapistName: string, clientId: string, clientName: string, orgId?: string, offsetDays = 0): DbAppointment {
  const isPast = offsetDays < 0;
  const hour = [9,10,11,14,15,16][n % 6];
  return {
    id: uid('appt', n),
    therapistId,
    therapistName,
    clientId,
    clientName,
    startTime: isPast ? daysAgo(-offsetDays, hour) : daysFromNow(offsetDays, hour),
    endTime:   isPast ? daysAgo(-offsetDays, hour+1) : daysFromNow(offsetDays, hour+1),
    status: isPast ? (n % 5 === 0 ? 'cancelled' : 'completed') : (n % 4 === 0 ? 'confirmed' : 'scheduled'),
    type: (['video','audio','in-person'] as const)[n % 3],
    notes: isPast ? `Session ${n} — good progress noted.` : undefined,
    meetingLink: `https://meet.ataraxia.com/session/${uid('appt',n)}`,
    organizationId: orgId,
    createdAt: daysAgo(rng(n,2,30)),
    updatedAt: daysAgo(rng(n,0,5)),
  };
}

export function makeInvoice(n: number, userId: string, orgId: string|undefined, amount: number, offsetMonths: number): DbInvoice {
  const due = new Date();
  due.setMonth(due.getMonth() - offsetMonths);
  const isPaid = offsetMonths > 0;
  return {
    id: uid('inv', n),
    invoiceNumber: `INV-2024-${String(n).padStart(3,'0')}`,
    userId,
    organizationId: orgId,
    amount,
    status: isPaid ? 'paid' : (n % 8 === 0 ? 'overdue' : 'unpaid'),
    dueDate: due.toISOString(),
    paidAt: isPaid ? new Date(due.getTime() - 86400000 * rng(n,0,3)).toISOString() : undefined,
    description: `${['Professional Plan','Starter Plan','Enterprise Plan'][n%3]} — ${due.toLocaleString('default',{month:'long'})} ${due.getFullYear()}`,
    createdAt: new Date(due.getTime() - 86400000 * 5).toISOString(),
  };
}

export function makeTask(n: number, assignedToId: string, clientId?: string, orgId?: string): DbTask {
  const titles = [
    'Complete intake form review','Send session notes','Monthly billing reconciliation',
    'Schedule follow-up appointment','Update client records','Review insurance claim',
    'Complete progress report','Prepare therapy plan','Respond to client message','Team supervision notes',
  ];
  return {
    id: uid('task', n),
    title: pick(titles, n),
    description: `Task ${n}: requires attention before end of week.`,
    status: (['pending','in_progress','completed'] as const)[n % 3],
    priority: (['low','medium','high'] as const)[n % 3],
    dueDate: daysFromNow(rng(n,1,14)),
    assignedToId,
    clientId,
    organizationId: orgId,
    createdAt: daysAgo(rng(n,0,14)),
    updatedAt: daysAgo(rng(n,0,5)),
  };
}

export function makeNote(n: number, authorId: string, clientId?: string): DbNote {
  const colors = ['#FEF3C7','#DBEAFE','#D1FAE5','#FCE7F3','#EDE9FE','#FEE2E2'];
  const titles = ['Session Notes','Follow-up Reminder','Progress Update','Billing Note','Treatment Plan','Risk Assessment'];
  return {
    id: uid('note', n),
    title: `${pick(titles,n)} — ${pick(FIRST_NAMES,n+2)}`,
    content: `Note ${n}: Client showing steady improvement. Continue with current approach. Review next session.`,
    color: pick(colors, n),
    authorId,
    clientId,
    isPinned: n % 5 === 0,
    tags: [pick(['progress','billing','admin','clinical','followup'],n)],
    createdAt: daysAgo(rng(n,0,60)),
    updatedAt: daysAgo(rng(n,0,10)),
  };
}

export function makeTicket(n: number, submitterId: string, submitterName: string, orgId?: string): DbSupportTicket {
  const subjects = [
    'Video session not connecting','Invoice PDF download broken','Request: bulk client import',
    'Calendar sync issue','Password reset not working','Client portal access denied',
    'Billing discrepancy','Two-factor authentication issue',
  ];
  return {
    id: uid('ticket', n),
    subject: pick(subjects, n),
    description: `Ticket ${n}: User reported this issue. Needs investigation and resolution.`,
    status: (['open','in_progress','resolved','closed'] as const)[n % 4],
    priority: (['low','medium','high','urgent'] as const)[n % 4],
    category: pick(['Technical','Billing','Feature Request','Account'],n),
    submittedById: submitterId,
    submittedByName: submitterName,
    organizationId: orgId,
    createdAt: daysAgo(rng(n,0,30)),
    updatedAt: daysAgo(rng(n,0,5)),
  };
}

export function makeSubscription(n: number, userId: string, orgId?: string): DbSubscription {
  const plans: DbSubscription['plan'][] = ['trial','starter','professional','enterprise'];
  const plan = plans[n % plans.length];
  const isTrial = plan === 'trial';
  return {
    id: uid('sub', n),
    userId,
    organizationId: orgId,
    plan,
    status: isTrial ? 'trial' : 'active',
    trialDaysRemaining: isTrial ? rng(n,5,30) : null,
    billingCycle: n % 2 === 0 ? 'monthly' : 'annual',
    amount: [0,79,149,399][n % 4],
    nextBillingDate: daysFromNow(rng(n,1,30)),
    createdAt: daysAgo(rng(n,10,180)),
    updatedAt: daysAgo(rng(n,0,10)),
  };
}

export function makeConversation(n: number, t: {id:string;name:string}, c: {id:string;name:string}, lastMsg: DbMessage): DbConversation {
  return {
    id: uid('conv', n),
    participants: [
      { id: t.id, name: t.name, role: 'therapist' },
      { id: c.id, name: c.name, role: 'client' },
    ],
    lastMessage: lastMsg,
    unreadCount: n % 3 === 0 ? rng(n,1,5) : 0,
    isStarred: n % 7 === 0,
    isArchived: false,
    createdAt: daysAgo(rng(n,5,90)),
    updatedAt: lastMsg.timestamp,
  };
}

export function makeMessage(n: number, convId: string, senderId: string, senderName: string, senderRole: 'therapist'|'client'): DbMessage {
  const msgs = [
    'Looking forward to our next session!',
    'I have been practicing the breathing exercises you recommended.',
    'Could we reschedule our Thursday appointment?',
    'Thank you for the resources you shared.',
    'I had a difficult week but feel better after our talk.',
    'The homework assignment really helped me reflect.',
    'Can we discuss the anxiety management techniques again?',
    'I completed the journal exercise you assigned.',
    'See you at our next session. Have a great week!',
    'I wanted to share that I had a breakthrough this week.',
  ];
  return {
    id: uid('msg', n),
    conversationId: convId,
    senderId,
    senderName,
    senderRole,
    content: pick(msgs, n),
    timestamp: daysAgo(rng(n,0,7), rng(n,8,18)),
    read: n % 4 !== 0,
  };
}
