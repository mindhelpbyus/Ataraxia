# Design Direction — Iragu-website vs Ataraxia (which design, or a new one?)

> Question: whose design is best — `Iragu-website` or `Ataraxia` — or do we need a new design to
> accommodate all features (4 personas, full tier-0 surface)?
> Verified from both codebases on 2026-05-31.

---

## 0. The decisive finding

**Both apps already share the same design language — Iragu's "Ink on Parchment" tokens.**
- Iragu **defines** them in `app/globals.css` (`--canvas`, `--ink`, `--sage`, `--action`, `--terra`, Fraunces display font).
- Ataraxia **reuses the same vocabulary** (`var(--canvas)`, `var(--ink)`, `var(--action)`, `--surface`, `--rule`, …).

➡️ So this is **not** "pick one design and discard the other," and **not** "invent a brand-new look."
It's: **one design language already exists — adopt Iragu's clean token system as canonical, and grow it
into a shared design system rich enough for the whole feature surface.**

---

## 1. Side-by-side

| | **Iragu-website** | **Ataraxia** |
|---|---|---|
| Purpose | Admin / back-office (Bedrock team) | Multi-role app (therapist + client + admin) |
| Stack | **Next.js 16 + React 19** (SSR/RSC, Server Actions, Zod) | **Vite + React 18 SPA** (react-router) |
| Styling | Tailwind v4, **lean** (139-line globals.css) | Tailwind v4, **bloated** (~8,000-line index.css incl. full raw palette) |
| Components | 8 (intentionally minimal; no shadcn/framer "until needed") | 64 shadcn/radix UI + 197 total; framer-motion, recharts |
| Design discipline | **High** — single source of truth, premium, restrained | **Mixed** — rich but sprawling/inconsistent (logo issues, dead variants) |
| Feature surface | Narrow (admin: clients, therapists, payouts, disputes, pricing) | Broad (calendar, video, chat, dashboards, billing, all roles) |
| SEO / first-load | **Strong** (SSR) | Weak (client-rendered SPA) |
| Animation / richness | Minimal | Rich |

### Honest verdict on "whose design is best"
- **Iragu's design system is better** — cleaner, more disciplined, more premium ("tier-0" feel), single
  source of truth. *But its scope is narrow (admin only) and its component set is tiny.*
- **Ataraxia has the breadth** — 64 UI components, calendar, charts, the multi-persona surface — *but the
  design is bloated and inconsistent*, and it's a non-SSR SPA (bad for the consumer/marketing funnel).

Neither is "done." **Best design discipline = Iragu. Most feature coverage = Ataraxia.**

---

## 2. Recommendation

**Do NOT invent a new design.** Adopt a **single shared design system** built on Iragu's "Ink on Parchment"
tokens, expanded to cover every feature/persona, and applied across all surfaces.

### 2.1 Design language (settled)
- **Canonical tokens = Iragu "Ink on Parchment"** (`--canvas/--ink/--sage/--action/--terra` + Fraunces).
- Promote them to a **shared package / single source of truth** consumed by Ataraxia (web), Iragu admin,
  and mirrored as token values in Manam + Iragu+ (Flutter) for cross-app brand consistency.
- **Prune Ataraxia's CSS bloat** (drop the inlined raw Tailwind palette; keep only semantic tokens).

### 2.2 Component system (expand, don't restart)
- Keep Ataraxia's useful components (calendar, charts, data tables, dialogs) but **re-skin onto the
  canonical tokens** and delete dead/duplicate variants.
- Build the **new component patterns the feature set demands**: clinical note editor + templates,
  treatment-plan builder, assessment/score cards + trajectory charts, scheduling/availability grids,
  data tables (rosters, payouts, disputes), dashboard widgets, AI-copilot panels, org/clinic admin shells.
- One component library, **themeable per persona** (client = warm/calming; therapist & admin = dense/efficient;
  org = management cockpit).

### 2.3 The real strategic fork — **architecture** (needs your call)
The design choice is easy; the **framework** choice is the consequential one:

| Option | What | Pros | Cons |
|---|---|---|---|
| **A. Consolidate web on Next.js** (Iragu's stack) | Rebuild Ataraxia's surface as Next.js app(s) sharing Iragu's foundation | SSR/SEO for consumer funnel, performance, one web stack, server actions, Iragu's discipline | Larger migration of Ataraxia's 197 components |
| **B. Keep Ataraxia SPA, unify tokens only** | Ataraxia stays Vite SPA; just adopt shared tokens + prune | Less migration now | Two web stacks; SPA stays weak for SEO/marketing/consumer funnel |
| **C. Split by surface (recommended)** | **Consumer/marketing + booking funnel on Next.js** (SEO, speed); **authenticated app dashboards stay/upgrade in the SPA** or also move to Next over time | Best of both: SEO where it matters, reuse app breadth | Two stacks during transition |

> **Recommendation: C → trending to A.** The tier-0 **consumer funnel** (discovery/booking/marketing) is
> where SEO + first-load speed directly drive acquisition — that belongs on **Next.js (Iragu's stack)**.
> Authenticated dashboards (therapist/admin/org) can stay in the upgraded SPA short-term, then converge on
> Next.js. Either way, **one design system** spans them all.

---

## 2.4 Design direction (locked) — Iragu × Google tier-0, lightweight

**Anchor = Iragu "Ink on Parchment."** Do not deviate from its brand: warm parchment canvas
(`--canvas #F8F5F0`), ink-brown text (`--ink #1C1812`), green action (`--action #1E7048`), sage/terra
accents, Fraunces display. This is our identity.

**Blend with Google tier-0 UI principles** (Workspace / Cloud Console — what "premium + lightweight" looks
like in practice):
- **Clarity over decoration** — generous whitespace, strong typographic hierarchy, one primary action per view.
- **Restraint** — color used for meaning (status/action), not flourish; few shadows; thin rules over heavy borders.
- **Density done calmly** — Google fits a lot in (tables, nav, panels) without clutter: consistent spacing
  scale, aligned grids, quiet dividers. Our clinical/admin/org surfaces need this.
- **Speed = design** — instant nav, skeleton loaders, no layout shift, no heavy hero animations. Performance
  is a design feature (hence the lightweight work below).
- **Functional motion** — subtle, purposeful transitions (≤150ms), never decorative/heavy.

> **Formula:** Iragu's *warmth & brand* + Google's *clarity, spacing, hierarchy, speed*. Warm where Google
> is cold; disciplined where Ataraxia was sprawling. Calm, fast, premium — not flashy.

**Lightweight is non-negotiable** (AWS S3+CloudFront target): JIT CSS (done), code-split JS, trimmed deps,
self-hosted fonts, no multi-MB bundles. A tier-0 app feels instant.

## 3. Why not a brand-new design?
- We already have a real, premium brand language (Ink on Parchment) used in two apps — a rewrite throws
  away brand equity + working tokens for no gain.
- "Accommodating all features" is a **breadth/components** problem, not a **visual-identity** problem.
  The token system scales; we add components, not a new look.
- Consistency across 4 personas + 3+ apps is worth more than novelty. Tier-0 products feel **coherent**.

---

## 4. Action items (feed into roadmap MVP1-B "shared design system")
- [ ] Extract Iragu "Ink on Parchment" tokens into a **shared design-tokens source** (CSS vars + Flutter mirror)
- [ ] Ataraxia: replace bloated `index.css` with the semantic token set; delete raw-palette dump
- [ ] Re-skin Ataraxia's keeper components onto canonical tokens; remove dead variants
- [ ] Define the **component inventory** needed for the full feature set (per §2.2) + persona theming
- [ ] **Decide architecture fork (A/B/C)** — this gates how the consumer funnel is built
- [ ] Build new consumer funnel on the chosen stack with the shared system (MVP1-B)

### Caveats
- Stack/architecture choice (A/B/C) has real migration cost — size it before committing.
- Token sharing across web (CSS) + Flutter (Dart) needs a small build step or manual mirror to stay in sync.
