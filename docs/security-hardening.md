# Ataraxia — Security Hardening (attacker's-eye view)

> Adversarial hardening for the web frontend + its hosting. Think backdoors, token theft, injection,
> misconfig. Complements `compliance.md` (standards) — this is the practical threat model + checklist.
> Created 2026-05-31.

---

## 0. Attack surface & what protects each
| Surface | Top threats | Defense |
|---|---|---|
| Hosting (Amplify/CloudFront) | TLS downgrade, header gaps, public bucket, clickjacking | HTTPS+HSTS, security headers (`amplify.yml`), Amplify-managed private origin, WAF |
| Frontend bundle | leaked secrets, supply-chain, XSS | no secrets in client, dep scanning, CSP + sanitization |
| Auth (Cognito) | **token theft via XSS**, weak MFA, credential stuffing | CSP, MFA, Cognito advanced security, rotation |
| API (Gateway+Lambda) | broken object-level authz (IDOR), injection, rate abuse | default-deny JWT authorizer, Zod validation, org row-isolation, WAF rate limit |
| Backdoors | dev auth bypass, hidden endpoints, committed creds | scans below; no DEV bypass ships; secret scanning in CI |

---

## 1. Adversarial scan — findings (2026-05-31)
| Check | Result |
|---|---|
| Hardcoded secrets / API keys in `src` | ✅ none found |
| Auth-bypass / mock-login backdoor | ✅ removed (the old `USE_LOCAL_DB` + `devMockUser` mock login is **deleted** — that *was* a real backdoor: a fake login bypassing Cognito) |
| Dangerous XSS sinks (`eval`, `innerHTML`) | ✅ only `chart.tsx` `dangerouslySetInnerHTML` (controlled CSS, not user input) + a test fixture |
| 🟠 **Token storage** | `amazon-cognito-identity-js` stores JWTs in **localStorage** → **XSS-stealable**. The old code explicitly forbade localStorage tokens; the Cognito SDK reintroduces the exposure. **#1 residual risk.** |
| 🟡 Dev role path | `roleConfig.getCurrentRoleConfig()` returns a permissive `dev` config when `import.meta.env.DEV` **or** `VITE_ENVIRONMENT==='development'`. Prod builds set DEV=false, and the **backend JWT is the real authz gate** (client role ≠ access) — but a misconfigured `VITE_ENVIRONMENT` in prod would loosen the *UI*. Harden: never set that var to `development` in prod; consider removing the env-string branch. |
| 🟡 Unused CSP allowance | `cdn.jsdelivr.net` was allowed but unused → **removed**. `accounts.google.com` GSI script still in `index.html` — verify it's needed (Google login now uses Cognito Hosted UI; the GSI `<script>` may be vestigial → remove to shrink surface). |

---

## 2. Hardening done (2026-05-31)
- ✅ **Security headers** via `amplify.yml` `customHeaders`: HSTS (preload), `X-Frame-Options: DENY`,
  `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` (camera/mic = self for video,
  payment = self for Razorpay, geolocation off), COOP, `X-Permitted-Cross-Domain-Policies: none`.
- ✅ **CSP hardened (the big XSS win):** dropped `script-src 'unsafe-inline'` → `script-src 'self'` only.
  Externalized the one inline theme script to `/public/theme-init.js`; removed the vestigial Google GSI
  `<script>` and all `accounts.google.com` / `cdn.jsdelivr.net` origins; added `object-src 'none'`.
  Verified the built `index.html` has **0 inline scripts**. (style-src keeps `unsafe-inline` for React
  `style={{}}` — far lower risk than script injection.)
- ✅ **Token storage hardened:** Cognito now uses **sessionStorage** (custom `Storage` in `lib/cognito.ts`),
  not the SDK-default localStorage → no cross-session persistence, smaller XSS theft window. JWT source is
  still **Cognito** (unchanged).
- ✅ **DOMPurify** available (`utils/sanitization.ts` `sanitizeHTML`) for any rendered HTML.
- ✅ **roleConfig dev-path tightened** — gated on build-time `import.meta.env.DEV` only (removed the
  runtime `VITE_ENVIRONMENT` branch that could be misconfigured in prod).
- ✅ **CI security**: `.github/workflows/ci-security.yml` (gitleaks secret-scan, `npm audit --audit-level=high`,
  CodeQL SAST, typecheck+build gate) and `.github/dependabot.yml` (weekly npm + actions updates).
- ✅ **Mock-login backdoor deleted** (Cognito-only). ✅ **No secrets in client bundle** (verified).
- ✅ Cache headers: immutable hashed assets, no-cache `index.html`.

## 3. Hardening to do (prioritized)
### 🔴 Token-theft (XSS) — the #1 app risk now
- [ ] **Strengthen CSP**: aim to drop `'unsafe-inline'` from `script-src` (biggest XSS weakness) — needs
  runtime testing of the SPA; use nonces/hashes if inline is unavoidable. Add `object-src 'none'`,
  `base-uri 'self'` (have), `frame-ancestors 'none'`.
- [ ] **Sanitize all rendered user content** with DOMPurify (dep present) — enforce, no raw HTML.
- [ ] **Short token lifetimes** (Cognito access 1h; refresh rotation), sign-out on tab close for shared devices.
- [ ] Evaluate storing tokens **in memory** (not localStorage) for the access token, accepting the
  re-auth-on-reload tradeoff — or a service-worker token broker. (Cognito SDK default = localStorage.)

### 🔴 Edge protection
- [ ] **AWS WAF** on the Amplify/CloudFront dist: AWS Managed Rules (Core, Known-Bad-Inputs, SQLi),
  **rate-based rule** (per-IP throttle on login/API), optional Bot Control + geo rules.
- [ ] **API Gateway throttling** + per-route rate limits (brute-force/credential-stuffing defense).

### 🟠 Auth
- [ ] **Enforce MFA** for staff/admin/therapist; offer for clients.
- [ ] **Cognito advanced security** (compromised-credential detection, adaptive risk, IP/device).
- [ ] Strong password policy; `preventUserExistenceErrors` (already on the pool); account-lockout.
- [ ] Remove/rotate the **test users** created for QA before any production launch.

### 🟠 Authorization (IDOR)
- [ ] Backend **object-level authz**: a user/therapist/org can only access *their* records — enforce
  server-side (org `row-level` isolation we specced), never trust client role. Pen-test for IDOR.

### 🟡 Supply chain & CI
- [ ] `npm audit` clean + **Dependabot/Renovate**; lockfile integrity; minimize deps (big tree).
- [ ] **Secret scanning** (gitleaks) + **SAST** in CI; block secrets/criticals on PR.
- [ ] Verify GSI script need; remove if vestigial. Subresource Integrity for any remaining 3rd-party script.

### 🟡 Ops / observability
- [ ] **PHI-safe logging** (no tokens/PHI/response bodies) — `secureLogger` exists; verify backends too.
- [ ] CloudWatch alarms on auth failures/4xx/5xx spikes; CloudTrail; WAF logs.
- [ ] Non-prod branches behind basic-auth; no prod data in preview envs.

---

## 3b. Cross-repo / infra tasks (NOT in this frontend repo — owners noted)
These can't be done from Ataraxia; they live in `backend-initial` (CDK/Cognito) or AWS infra.

**🔴 WAF** (Amplify/CloudFront or the API Gateway) — add to the infra CDK:
```ts
new wafv2.CfnWebACL(this, 'WebAcl', {
  scope: 'CLOUDFRONT', defaultAction: { allow: {} },
  rules: [
    { name: 'AWSCommonRuleSet', priority: 1, overrideAction: { none: {} },
      statement: { managedRuleGroupStatement: { vendorName: 'AWS', name: 'AWSManagedRulesCommonRuleSet' } },
      visibilityConfig: { sampledRequestsEnabled: true, cloudWatchMetricsEnabled: true, metricName: 'common' } },
    { name: 'KnownBadInputs', priority: 2, /* AWSManagedRulesKnownBadInputsRuleSet */ ... },
    { name: 'RateLimit', priority: 3, action: { block: {} },
      statement: { rateBasedStatement: { limit: 1000, aggregateKeyType: 'IP' } }, ... },
  ], ...
});
```
(Associate with the CloudFront dist / API Gateway stage. Add SQLi + Bot Control as needed.)

**🟠 MFA enforcement + Cognito advanced security** — in `backend-initial` auth-stack:
```ts
userPool.mfa = cognito.Mfa.REQUIRED;           // or OPTIONAL with enforcement for staff/therapist
userPool.mfaSecondFactor = { otp: true, sms: false };
// Advanced security (console or L1): set UserPoolAddOns AdvancedSecurityMode = ENFORCED
```
(FE already has the TOTP enrollment flow in `MFASetup`.)

**🟠 IDOR / object-level authz** — backend Lambdas must enforce that the caller can only access **their
own / their org's** rows (derive ownership from the verified Cognito `sub`/role/`custom:organizationId`,
never from a client-supplied id alone). Add org `row-level` isolation; pen-test every `/{id}` route.

**🟠 Purge QA test users (pre-launch, NOT now — testing in progress):**
```bash
# Created/used for QA in pool ap-south-1_KaAJ3JWpR:
aws cognito-idp admin-delete-user --region ap-south-1 --user-pool-id ap-south-1_KaAJ3JWpR --username ataraxia-test@bedrockhealthsolutions.com
# Reset/rotate any QA passwords set on real test users (e.g. test-therapist-payout@...).
```
Add to the launch checklist; keep while iterating on Phase 6.

## 4. "Backdoor" hygiene (explicit)
- ❌ No dev/mock auth bypass in shippable code (removed). ❌ No hidden admin endpoints. ❌ No committed
  secrets/creds. ✅ Auth is Cognito-only; ✅ backend default-deny.
- Guardrails to keep it that way: CI secret-scan + SAST; never gate auth on a client env var; test users
  purged pre-launch; review any `import.meta.env.DEV` branch for prod-misconfig blast radius.

### Caveats
- Not a substitute for a professional penetration test + threat-model review before launch.
- CSP `unsafe-inline` removal and in-memory token storage need runtime verification (could break the SPA);
  test in a non-prod env.
