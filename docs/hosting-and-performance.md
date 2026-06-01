# Ataraxia — Hosting & Performance (lightweight, AWS-ready)

> Goal: tier-0 lightweight UI (Google Workspace / Cloud Console feel) on AWS. No multi-MB downloads.
> Companion to `design-system-decision.md`. Created 2026-05-31.

---

## 0. Target & budgets
- **Budgets:** initial JS < ~300 KB gzip; CSS < ~40 KB gzip; no single chunk > ~500 KB; LCP < 2.5s on 4G.
- **Host:** see §5 — and read §0.1 first ("is S3 right?").

## 0.1 Is S3 the right host for a web CRM? (honest answer)
**S3 alone is not a web server — it's object storage.** It only ever serves the *static frontend* (HTML/JS/
CSS). The right question is "what is Ataraxia architecturally," and the answer drives hosting:

- **Ataraxia today = a client-side SPA** (Vite → static assets). Everything dynamic already runs elsewhere:
  API/business logic on **API Gateway + Lambda** (backend-initial/billing), auth on **Cognito**, data on
  **RDS**, realtime on **AppSync/WebSocket**, video on **video-service/LiveKit**. S3 never touches those.
- For an **authenticated SPA**, serving the static shell from **CDN (S3+CloudFront / Amplify)** is exactly
  what tier-0 does — **Google Cloud Console and Google Workspace are themselves CDN-served SPAs**. So a
  static CDN for the app shell is correct *because* it's an authenticated SPA, not a limitation.
- **You're right that S3 ≠ solution for all.** It is only the frontend-delivery layer. It cannot do SSR,
  server logic, or realtime — and it isn't asked to; those are already on Lambda/Cognito/AppSync.

**The real architectural choice is SPA vs SSR, by surface:**
| Surface | SEO need | Right approach |
|---|---|---|
| **Authenticated CRM** (therapist/admin/org dashboards) | none (behind login) | **SPA on CDN** (S3+CloudFront or Amplify) — standard, tier-0 |
| **Public marketing / consumer discovery** | high | **SSR (Next.js)** on Amplify/Lambda — like `Iragu-website` already does |

**Platform precedent:** `Iragu-website` (Next.js SSR) already hosts on **AWS Amplify Hosting** (`amplify.yml`).
Amplify Hosting sits on S3+CloudFront but is **managed** (CI/CD, atomic deploys, preview envs) and supports
**both** static SPA *and* Next.js SSR.

**Recommendation:** host Ataraxia (authenticated SPA) on **AWS Amplify Hosting** (matches our Iragu pattern,
managed pipeline) — or plain S3+CloudFront if we want full control. Either is correct for an authed SPA.
When we build the **public/consumer/marketing** surface, do it as **Next.js SSR on Amplify** (converging with
Iragu). S3/CloudFront stays the delivery layer underneath; it was never meant to be "the whole solution."

---

## 1. What was wrong (diagnosed)
| Problem | Size | Status |
|---|---|---|
| `index.css` pre-compiled Tailwind dump (7,021 lines) | 141 KB+ frozen | ✅ **deleted** — now JIT-compiled, **34.8 KB gzip** |
| `@zoom/meetingsdk` (unused) | 94 MB node_mod | ✅ removed |
| `three.js` (only a decorative unused `PixelSnow`) | 37 MB | ✅ removed (+ PixelSnow) |
| `@countrystatecity/countries` (unused) | 56 MB | ✅ removed |
| `react-slick`/`slick-carousel`/`react-rnd`/`re-resizable`/`india-pincode-lookup` (unused) | — | ✅ removed |
| **`country-state-city` world-city DB bundled** | **8.6 MB chunk** | ⏳ lazy/API (plan §2) |
| **`zipcodes` US-zip DB bundled** | **4.6 MB chunk** | ⏳ remove → API (plan §2) |
| Two icon libs (lucide + phosphor 57 MB) | tree-shaken | re-skin: standardize on lucide |
| Render-blocking Google Fonts `@import` (×2) | external | ⏳ self-host (plan §3) |

> **Key insight:** the 8.6 MB + 4.6 MB chunks are **not code** — they're location databases embedded in JS.
> They are **lazy** (not on first paint: eager entry is only ~346 KB), but any screen with an address form
> downloads 13 MB. Tier-0 apps fetch this from an **API**, never bundle it.

## 2. Location data — the big fix (needs decision)
Used in 5 components (AccountSettings, AddressSection, BasicDetailsStep, BasicInformationStep, LicenseSettings).
These **already** call `api.zippopotam.us` + `api.postalpincode.in` for lookups, so an API path exists.

**Options:**
- **A (recommended): API-driven** cascading country→state→city + PIN/zip lookup. Remove `country-state-city`
  (8.6 MB) and `zipcodes` (4.6 MB) entirely → ~13 MB gone. Matches Google's approach. Most work.
- **B (interim): lazy-load** the libs via `await import('country-state-city')` only when an address form
  mounts, isolated in their own chunk. Removes them from the main/common path; still heavy on those screens.
- **C: hybrid** — drop `zipcodes` now (US-only, API already present, −4.6 MB), lazy-load `country-state-city`
  short-term, migrate to API later.

> **`zipcodes` is US-only in an India-first app** and has an API fallback already → safe to remove regardless.

**DECISION (2026-05-31): Option A — API-driven, remove both libs.** Design:
- **Country** = small bundled list (from `countries-and-timezones`/`iso-3166-1`, already deps; ~few KB).
- **State + City** = **PIN/zip-code-driven auto-fill** (postalpincode.in for India, zippopotam.us for others —
  both already wired) + free-text fallback. No bundled states/cities megadata.
- Net: remove `country-state-city` (8.6MB) + `zipcodes` (4.6MB) via a shared `src/lib/location.ts` helper;
  convert all 5 address components; then `npm uninstall` both. Verify autocomplete after each conversion.

## 3. Fonts
- Today: two render-blocking Google Fonts `@import`s (Inter/Lora/JetBrains + a dup). 
- Fix: **self-host** the brand fonts (Iragu uses Fraunces display + Geist; keep that identity) as `woff2`
  with `font-display: swap`, served from CloudFront. No external font CDN round-trip.

## 4. JS code-splitting
- Keep route-level `lazy()` (already used for LoginPage/DashboardLayout).
- Add `build.rollupOptions.output.manualChunks` to split vendors (react, radix, charts, livekit, framer)
  into cacheable chunks so one heavy feature doesn't bloat a shared chunk.
- Lazy-load heavy, rarely-first features: video (livekit), charts (recharts), calendar, PDF/invoice.

## 5a. Production hosting — CloudFront + S3 + WAF via CDK (India-default, multi-account)

> Implemented in `Ataraxia/infrastructure/` (separate CDK flow, like `billing_payment`; same AWS account
> as backend-initial via deploy creds). Supersedes the simpler `amplify.yml` for production — chosen
> because WAF needs full control and we already standardize on CDK.

**Components (the "right AWS components"):**
| Component | Region | Role |
|---|---|---|
| **S3 bucket** (private, OAC-only, SSE, versioned) | **ap-south-1 (India)** | static SPA origin |
| **CloudFront** (OAC, TLS1.2+, HTTP/2+3, compression, security-headers policy, SPA 403/404→index.html) | global (Mumbai/Chennai edges serve India) | CDN |
| **WAFv2 WebACL** (Common, KnownBadInputs, SQLi, IP-reputation, **rate-limit/IP**, optional geo) | **us-east-1** (AWS-forced for CLOUDFRONT scope; control-plane, not user data) | edge firewall |
| **ACM cert** (custom domain) | us-east-1 (CloudFront req) | TLS |
| Route53 | — | DNS alias → CloudFront |

**India-default:** hosting/storage region = **ap-south-1**; CloudFront is global and serves India from local
edges; only the WAF WebACL + cert sit in us-east-1 because AWS requires it for CloudFront (no PHI there).

**Two stacks** (cross-region wired via CDK `crossRegionReferences`):
- `…-frontend-edge` (us-east-1): WAF (+cert)
- `…-frontend-hosting` (ap-south-1): S3 + CloudFront

**Multi-account lift-and-shift:** nothing is hardcoded — account comes from `CDK_DEFAULT_ACCOUNT` (the deploy
creds), env from `-c environment=`. To deploy to any account:
```bash
cd Ataraxia && npm run build                       # build the SPA → build/
cd infrastructure && npm ci
npx cdk bootstrap aws://<ACCOUNT>/ap-south-1 aws://<ACCOUNT>/us-east-1   # once per account (both regions)
npm run deploy:prod                                # or deploy:dev / deploy:staging
```
Switch AWS profile/creds → same command deploys to a different account. Per-env values (domain, cert, WAF
limits, geo) live in `infrastructure/config/environment.ts`.

> **API also needs WAF (separate, in `backend-initial`):** add a **REGIONAL** WAFv2 WebACL in **ap-south-1**
> on the shared HTTP API Gateway (managed rules + rate limit). The CloudFront WebACL above protects the
> *frontend*; the API has its own regional one. (Snippet in `security-hardening.md` §3b.)

## 5b. AWS hosting architecture (reference diagram)
```
Route53 → CloudFront (TLS, Brotli/gzip, HTTP/2/3)
            ├── S3 (static SPA build: index.html + /assets/*.[hash].js|css)   ← long cache (1y, immutable)
            │      └── index.html: no-cache (so deploys go live immediately)
            └── SPA fallback: 403/404 → /index.html (client routing)
API calls → shared API Gateway (ap-south-1) [backend-initial + billing] — separate origin
Video     → video-service / LiveKit (separate)
```
- **Cache:** hashed assets `Cache-Control: public,max-age=31536000,immutable`; `index.html` `no-cache`.
- **Compression:** CloudFront automatic Brotli + gzip.
- **Security headers:** CSP (already in `index.html`), HSTS, X-Content-Type-Options, frame-ancestors none.
- **Deploy:** `npm run build` → sync `build/` to S3 → CloudFront invalidation of `/index.html`.
- **Region:** ap-south-1 origin; CloudFront edge global.

## 6. Results (measured 2026-05-31)
| Metric | Before | After |
|---|---|---|
| Biggest JS chunk | 8.6 MB (geo data) | **584 KB** (video, lazy) |
| DashboardLayout chunk | 1.69 MB | split into lazy per-tab chunks |
| **Initial entry (gzip)** | eager mega-bundle | **52.5 KB** |
| Total JS (raw) | ~15 MB | **~2.9 MB** |
| CSS (gzip) | 141 KB frozen dump | **34.8 KB** (JIT) |
| Images (build) | ~14 MB | **6.4 MB** (dead removed + 2800px→1400px) |
| node_modules | ~700 MB | ~512 MB (−190 MB dead deps) |
| Build time | ~9 s | **5 s** · 0 type errors |

**Done:** ✅ CSS JIT pipeline (dump deleted) · ✅ dead deps removed (~190 MB) · ✅ location-data 13 MB
removed (→ `lib/location.ts`, PIN-first) · ✅ DashboardLayout code-split + vendor manualChunks ·
✅ images deduped + downscaled.

**Remaining:** ⏳ self-host fonts (kill Google Fonts CDN @import) · ⏳ AWS S3+CloudFront IaC (CDK) ·
⏳ optional WebP conversion of images · ⏳ re-skin screens to Iragu × Google tier-0.

### Caveat
Bundle/dep sizes measured on the current build; re-measure after each change. Location-data refactor touches
functional address forms — verify autocomplete still works after migration.
