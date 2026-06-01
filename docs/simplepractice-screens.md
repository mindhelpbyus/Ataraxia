# SimplePractice — Screen-by-Screen Blueprint vs Ataraxia

> Studied from SimplePractice's public docs/reviews (their support pages with screenshots are 403-blocked to
> automated fetch, so this is compiled from their features page, plan comparison, and detailed review
> walkthroughs — verify exact UI before pixel-matching). Goal: map **every SimplePractice screen** to what
> Ataraxia has, and what we must build/polish to reach that level.
>
> Status: ✅ have · 🟡 partial/needs depth · ❌ gap. Component = our existing screen.

Created 2026-05-31. Sources at bottom.

---

## The headline
**Ataraxia already covers ~80% of SimplePractice's screens.** The gap to "that level" is mostly **depth +
polish on existing screens** (note templates, structured treatment plans, reports depth, client-portal
completeness) plus **3 missing modules** (treatment plans, web assessments, AI notes). Insurance-claims
screens are US-specific (N/A India now). So this is a *finishing* job, not a *rebuild*.

---

## Screen-by-screen map

| # | SimplePractice screen | What it contains | Ataraxia | Our component | To reach their level |
|---|---|---|---|---|---|
| 1 | **Home dashboard** | Snapshot: income, appts, notes, outstanding balances (month/yr/period) | ✅ | `DashboardView` / `HomeView` / role dashboards | add the **income + outstanding-balance** snapshot cards |
| 2 | **Calendar** | Day/Week/Month, color-coded by status, waiting list, client search, "New appointment" (client/event/OOO), recurring, group | ✅ | `CalendarContainer` (`DayView`/`WeekView`/`MonthView`/`AgendaView`) | add **waitlist**, recurring, group, OOO; status color legend |
| 3 | **Clients list** | Sortable, filters (recent/inactive/waitlist), +new, client card (contact, reminder prefs, billing type) | ✅ | `ProfessionalClientsView`, `EnhancedTherapistsTable` | add filters + reminder-pref + billing-type on the card |
| 4 | **Client overview/profile** | Tabs (overview, billing, notes/docs); send intake, attach docs (≤50MB) | ✅ | `ClientDetailView` / `ClientDetailsSidebar` | tabbed layout; **send-intake** + doc attach |
| 5 | **Clinical notes editor** | New → progress note, **diagnosis/treatment plan**, mental status exam, **scored measure**, good-faith estimate; templates (Simple/Basic/Advanced/Wiley/custom blocks) | 🟡 | `SessionNotesView` | **note-template library** + custom block builder (MVP1-D) |
| 6 | **Treatment plans** | Structured goals/objectives/interventions | ❌ | — | **build** (MVP1-F) |
| 7 | **Assessments / scored measures** | PHQ-9/GAD-7 etc., auto-score, track over time (MBC) | 🟡 (Manam only) | — (web) | **build web** (MVP1-C) |
| 8 | **Intake forms** | Paperless, **e-signature**, sent from client view | ✅ | `PatientIntakeForm` | **e-signature** (MVP1-F) |
| 9 | **Billing** | Recent activity, invoices (from appt card), payment types, AutoPay, superbills, statements, export | ✅ | `BillingView` / `InvoicesView` / `TherapyInvoice` | add **AutoPay**, statements; (RBI invoicing we already exceed) |
| 10 | **Insurance claims** | CMS-1500, e-file to 2000+ payers, tracking, ERA/EOB | 🚫 **OUT OF SCOPE** | — | India therapists/counsellors **cannot file insurance claims** — do not build |
| — | **E-prescribing** (SimplePractice add-on) | medication renewal/Rx | 🚫 **OUT OF SCOPE** | — | India: only registered medical practitioners (psychiatrists) may prescribe; **counsellors/therapists cannot** — do not build |
| 11 | **Telehealth session** | Launch from appt card, timer, in-session chat, **whiteboard**, screen-share, **waiting room**, group host controls | ✅ | `VideoCallRoom` / `TherapyVideoRoom` / `VideoRoomsView` | add **waiting room**, whiteboard, session timer |
| 12 | **Client portal** | Self-book, intake, billing/payment history, balance, messaging, telehealth join (iOS/Android) | 🟡 | Manam (mobile) | **web client portal** depth + e-sign + self-book |
| 13 | **Secure messaging** | Client + team, HIPAA | ✅ | `MessagesView` | parity (have `/chat`) |
| 14 | **Settings / account** | Availability, services, reminders, templates, billing settings | ✅ | `SettingsView` / `AccountSettings` | add **reminder settings**, template mgmt |
| 15 | **Team / permissions** | Multi-practitioner, roles, supervision/co-sign | ✅/🟡 | RBAC + org track | **supervision/co-sign** (MVP2 org track) |
| 16 | **Reports / Analytics** | Analytics dashboard + **17 reports** (Income, Billing, Clients & Appts, Insurance), CSV/Excel export | 🟡 | `ReportsView` / role reports | add **structured report set** + CSV/Excel export |
| 17 | **AI Therapy Notes** | Session summary → AI draft SOAP/DAP → edit → save | ❌ | — | **build** (MVP1-D, our highest-ROI AI) |
| 18 | **Mobile apps** | Clinician + client | ✅ | Iragu+ + Manam | parity (we have both) |

---

## What it takes to "accommodate that level" (prioritized)
1. **Depth on existing screens** (we have the screen, need the substance):
   - Clinical notes → **template library + treatment plans + scored measures** (#5,6,7)
   - Reports → **structured report set + export** (#16)
   - Client profile → **tabs + send-intake + docs** (#4); Calendar → **waitlist/recurring/group** (#2)
   - Telehealth → **waiting room + whiteboard + timer** (#11)
2. **Missing modules**: **AI notes** (#17), **treatment plans** (#6), **web assessments** (#7), **intake e-sign** (#8).
3. **Client portal (web)** depth (#12) — we have mobile (Manam); add the web portal surface.
4. **OUT OF SCOPE (India regulation — do NOT build):** insurance claims (#10) and **e-prescribing** —
   therapists/counsellors in India are not permitted to file claims or prescribe. (A future *psychiatrist*
   persona would be a separate, medically-regulated flow — not part of the therapist/counsellor product.)

> These map 1:1 onto the existing `tier0-roadmap.md` (MVP1-C MBC, MVP1-D AI notes + templates, MVP1-F
> treatment-plans/e-sign/reminders, MVP2 org supervision). So no new roadmap — this is the **screen-level
> acceptance criteria** for those items.

## Design level (the "elegant/professional" bar)
SimplePractice's screens read elegant because of: **calm whitespace, one clear primary action per screen,
quiet color (status-only), clean tables, tabbed client records, consistent left-nav.** Apply our Ink-on-
Parchment × Google tier-0 system with those layout principles (see `design-system-decision.md §2.4`).

---

### Sources
- [SimplePractice — Features](https://www.simplepractice.com/features/)
- [SimplePractice — homepage](https://www.simplepractice.com/)
- [Comparing features by plan (support)](https://support.simplepractice.com/hc/en-us/articles/360034957931-Comparing-SimplePractice-features-by-plan)
- [Medesk — SimplePractice Review 2026 (screen walkthrough)](https://www.medesk.net/en/blog/simple-practice-review/)
- [ChoosingTherapy — SimplePractice Review 2026](https://www.choosingtherapy.com/simplepractice-review/)

> Caveat: compiled from public marketing + third-party reviews (their screenshot docs are access-blocked);
> verify exact screens against a live SimplePractice trial before pixel-level matching.
