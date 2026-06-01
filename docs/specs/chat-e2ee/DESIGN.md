# Chat End-to-End Encryption (E2EE) — design stub

> Status: **PLANNED (not started)** · Created 2026-05-31 · Owner: platform
> Captures the encryption requirement raised during the AppSync real-time work so
> it isn't lost. **No code yet.** This is a cross-app project, not web-only.

## Why this is deferred (and must be cross-app)

The real-time chat transport now in place (web `src/api/appsyncEvents.ts`) matches
the mobile apps (`community-app`, `therapistApp`): AppSync **Event API** over
**WSS + Cognito ID-token auth**, channels `chat/channel/{conversationId}`.

**Today, message *content* is plaintext** at the application layer on all clients
(security is transport TLS/WSS + Cognito + backend access control; PHI is not
persisted in the browser). The mobile apps do **not** encrypt content.

Therefore, encrypting content **on the web only would break web↔mobile chat**
(mobile can't decrypt). Real E2EE must land in **web + community-app +
therapistApp + backend together**.

## Current protection (what we have now)
- **In transit:** TLS for REST, WSS for AppSync subscriptions.
- **Auth:** Cognito ID token on every publish/subscribe (default-deny gateway).
- **At rest (client):** web stores no message bodies in localStorage (PHI rule).
- **At rest (server):** backend DB access-controlled; DPDP obligations apply.

## E2EE scope (when pursued)
- **Key model:** per-user keypair (e.g. X25519); per-conversation symmetric key
  (AES-GCM) wrapped to each participant's public key. Decide: device-bound vs
  account-bound keys; multi-device story.
- **Key exchange & storage:** publish public keys (backend), store private keys
  securely per platform (web: non-extractable WebCrypto / IndexedDB; mobile:
  secure storage / keychain).
- **Message format:** versioned envelope `{ v, alg, iv, ciphertext, keyRefs }`;
  backend stores ciphertext only; search/preview implications.
- **Rollout:** feature-flag; mixed-version handling (plaintext fallback window);
  migration of existing history (likely leave historical plaintext as-is).
- **Apps to change together:** web (`appsyncEvents` + messaging), community-app,
  therapistApp, backend chat-handler + storage.
- **Compliance:** aligns with DPDP / MHA confidentiality; document key-recovery
  policy (lost device = lost history unless escrow, which weakens E2EE).

## Open questions
1. Device-bound vs account-bound keys (recovery vs security trade-off)?
2. Do we need server-side search over message content? (E2EE forbids it.)
3. Backward compatibility window for plaintext during rollout?
4. Who owns the cross-repo rollout sequencing?
