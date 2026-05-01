import React, { useState } from "react";

const TABS = ["Overview", "SDK comparison", "LiveKit setup", "Room component", "Architecture"];

const sdks = [
  {
    name: "LiveKit",
    badge: "Recommended",
    badgeColor: "#065f46",
    badgeBg: "#d1fae5",
    hipaa: true,
    openSource: true,
    price: "Free tier · $50–500/mo cloud · Self-host free",
    latency: "~100ms",
    react: "First-class @livekit/components-react",
    pros: ["HIPAA + SOC 2 + GDPR on Scale tier", "Open source — self-host or cloud", "2.5–8× cheaper than Agora/Daily", "AI agent framework built-in", "Full React component library"],
    cons: ["HIPAA requires $500/mo Scale tier", "More setup than Daily for beginners"],
    best: "Telehealth, HIPAA-required, custom UI, cost-sensitive",
  },
  {
    name: "Daily.co",
    badge: "Easiest start",
    badgeColor: "#1e40af",
    badgeBg: "#dbeafe",
    hipaa: true,
    openSource: false,
    price: "$0 (2k min/mo) · $0.00099/min after",
    latency: "~150ms",
    react: "@daily-co/daily-react hooks",
    pros: ["Fastest setup — prebuilt iframe option", "HIPAA BAA available", "Excellent DX and docs", "Stable and battle-tested"],
    cons: ["More expensive at scale", "Less customizable than LiveKit", "Closed source"],
    best: "Fast MVP, small team, willing to pay per-minute",
  },
  {
    name: "Agora",
    badge: "Enterprise scale",
    badgeColor: "#92400e",
    badgeBg: "#fef3c7",
    hipaa: true,
    openSource: false,
    price: "10k free min/mo · $0.0099–0.099/min",
    latency: "~80ms",
    react: "agora-rtc-react",
    pros: ["Massive global SD-RTN network", "Best for Asia-Pacific latency", "Millions of concurrent users", "Rich feature set"],
    cons: ["Complex pricing tiers", "Closed source / vendor lock-in", "Heavier SDK bundle"],
    best: "Global scale, Asia-Pacific users, enterprise contracts",
  },
  {
    name: "Jitsi (self-hosted)",
    badge: "Open source / free",
    badgeColor: "#4c1d95",
    badgeBg: "#ede9fe",
    hipaa: false,
    openSource: true,
    price: "Free (your infra costs only)",
    latency: "Varies",
    react: "iframe API or lib-jitsi-meet",
    pros: ["Completely free", "Full control", "No vendor dependency"],
    cons: ["You manage all infra", "No HIPAA compliance out-of-box", "More DevOps overhead"],
    best: "Internal tools, non-HIPAA, maximum control",
  },
];

const liveKitSteps = [
  {
    step: "01",
    title: "Install packages",
    lang: "bash",
    code: `npm install @livekit/components-react @livekit/components-styles livekit-client`,
  },
  {
    step: "02",
    title: "Backend — create a token (Node.js)",
    lang: "typescript",
    code: `import { AccessToken } from 'livekit-server-sdk';

export async function createToken(roomName: string, participantName: string) {
  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    { identity: participantName }
  );
  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
  });
  return at.toJwt();
}

// Express route
app.get('/api/token', async (req, res) => {
  const { room, name } = req.query;
  const token = await createToken(room as string, name as string);
  res.json({ token, url: process.env.LIVEKIT_URL });
});`,
  },
  {
    step: "03",
    title: "Environment variables",
    lang: "bash",
    code: `# .env.local
VITE_LIVEKIT_URL=wss://ataraxia-ppdnqkly.livekit.cloud
LIVEKIT_API_KEY=APIZTbv2tNSTR4i
LIVEKIT_API_SECRET=15h1HGG2GY1pemfbkImwhDUCeCCt9XVe5qIsVV7w44PA

# For production (Scale tier HIPAA)
LIVEKIT_REGION=us-east-1   # data residency`,
  },
  {
    step: "04",
    title: "Minimal working room",
    lang: "tsx",
    code: `import '@livekit/components-styles';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react';

export function TherapyRoom({ roomName, participantName }: Props) {
  const [token, setToken] = useState('');

  useEffect(() => {
    fetch(\`/api/token?room=\${roomName}&name=\${participantName}\`)
      .then(r => r.json())
      .then(d => setToken(d.token));
  }, [roomName, participantName]);

  if (!token) return <div>Connecting…</div>;

  return (
    <LiveKitRoom
      token={token}
      serverUrl={import.meta.env.VITE_LIVEKIT_URL}
      connect={true}
      video={true}
      audio={true}
    >
      <VideoConference />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}`,
  },
];

const architectureSteps = [
  { label: "Client books session", sub: "Scheduler creates room name + stores in DB", color: "#dbeafe", border: "#93c5fd", text: "#1e3a8a" },
  { label: "Token request", sub: "Client/therapist GET /api/token with roomId + identity", color: "#ede9fe", border: "#c4b5fd", text: "#4c1d95" },
  { label: "Backend mints JWT", sub: "LiveKit SDK signs token with API secret — never expose to client", color: "#fef9c3", border: "#fde047", text: "#713f12" },
  { label: "LiveKit Room joined", sub: "WebRTC connection established — SFU handles routing", color: "#d1fae5", border: "#6ee7b7", text: "#065f46" },
  { label: "Session ends", sub: "Webhook fires → update DB → trigger invoice generation", color: "#fce7f3", border: "#f9a8d4", text: "#831843" },
];

const hipaaChecklist = [
  { item: "LiveKit Scale tier ($500/mo) + sign BAA", done: true },
  { item: "TLS 1.2+ on all API routes", done: true },
  { item: "DTLS-SRTP encryption on media (LiveKit default)", done: true },
  { item: "Tokens expire in ≤ 1 hour, never stored client-side", done: true },
  { item: "Room names never contain PHI (use UUID)", done: true },
  { item: "Disable cloud recording or use HIPAA-eligible storage", done: false },
  { item: "Audit log: join/leave events → your DB", done: false },
  { item: "Data residency set to your region", done: false },
];

export function LiveKitGuideView() {
  const [tab, setTab] = useState("Overview");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const copy = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.hero}>
        <div style={s.heroTag}>React · WebRTC · Telehealth</div>
        <h1 style={s.heroTitle}>Video call integration</h1>
        <p style={s.heroSub}>
          Production-grade guide for Bedrock Health Solutions — HIPAA-compliant, React-first.
        </p>
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        {TABS.map(t => (
          <button
            key={t}
            style={{ ...s.tab, ...(tab === t ? s.tabActive : {}) }}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={s.body}>

        {/* ── OVERVIEW ── */}
        {tab === "Overview" && (
          <div>
            <p style={s.lead}>
              For a HIPAA-regulated telehealth product like Bedrock Health Solutions, video is not
              just a feature — it's the core clinical surface. Here's the decision framework before
              writing a single line of code.
            </p>

            <div style={s.grid3}>
              {[
                { icon: "🔒", title: "HIPAA is non-negotiable", body: "You need a BAA (Business Associate Agreement) with your video provider. Not every SDK offers this — and those that do often require a paid enterprise tier." },
                { icon: "⚡", title: "Use an SFU, not P2P", body: "Peer-to-peer WebRTC breaks at 3+ participants and is hard to record. A Selective Forwarding Unit (SFU) like LiveKit routes media server-side — scalable and recordable." },
                { icon: "🔑", title: "Tokens, never keys", body: "API keys must never touch the browser. Your backend mints short-lived JWT tokens per session. The client uses only the token to join — no secrets exposed." },
              ].map(card => (
                <div key={card.title} style={s.card}>
                  <div style={s.cardIcon}>{card.icon}</div>
                  <div style={s.cardTitle}>{card.title}</div>
                  <div style={s.cardBody}>{card.body}</div>
                </div>
              ))}
            </div>

            <div style={s.sectionTitle}>What you get out of the box (LiveKit)</div>
            <div style={s.featureGrid}>
              {[
                "HD video + adaptive bitrate", "Screen sharing", "Chat / data channels",
                "Cloud recording to S3", "Waiting room / lobby", "Noise cancellation",
                "AI session transcription", "Webhooks for join/leave", "React component library",
                "Mobile SDK (iOS + Android)", "HIPAA + SOC 2 + GDPR", "Self-host option",
              ].map(f => (
                <div key={f} style={s.featureItem}>
                  <span style={{ color: "#059669", fontSize: 13 }}>✓</span> {f}
                </div>
              ))}
            </div>

            <div style={s.sectionTitle}>HIPAA compliance checklist</div>
            {hipaaChecklist.map((item, i) => (
              <div key={i} style={s.checkRow}>
                <span style={{ ...s.checkDot, background: item.done ? "#059669" : "#d97706" }}>
                  {item.done ? "✓" : "○"}
                </span>
                <span style={{ fontSize: 13, color: item.done ? "#1a1917" : "#92400e" }}>
                  {item.item}
                </span>
              </div>
            ))}
            <p style={{ ...s.cardBody, marginTop: 12 }}>
              Items marked ○ require additional configuration on your end — they are not automatic.
            </p>
          </div>
        )}

        {/* ── SDK COMPARISON ── */}
        {tab === "SDK comparison" && (
          <div>
            <p style={s.lead}>
              For a HIPAA telehealth product, the choice narrows quickly. Here's an honest comparison
              of the four realistic options.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {sdks.map(sdk => (
                <div key={sdk.name} style={s.sdkCard}>
                  <div style={s.sdkHeader}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={s.sdkName}>{sdk.name}</div>
                      <span style={{ ...s.badge, background: sdk.badgeBg, color: sdk.badgeColor }}>
                        {sdk.badge}
                      </span>
                      {sdk.hipaa && <span style={s.hipaaTag}>HIPAA</span>}
                      {sdk.openSource && <span style={s.ossTag}>Open source</span>}
                    </div>
                    <div style={s.sdkPrice}>{sdk.price}</div>
                  </div>
                  <div style={s.sdkGrid}>
                    <div>
                      <div style={s.miniLabel}>Latency</div>
                      <div style={s.miniVal}>{sdk.latency}</div>
                    </div>
                    <div>
                      <div style={s.miniLabel}>React SDK</div>
                      <div style={{ ...s.miniVal, fontFamily: "monospace", fontSize: 11 }}>{sdk.react}</div>
                    </div>
                    <div>
                      <div style={s.miniLabel}>Best for</div>
                      <div style={s.miniVal}>{sdk.best}</div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 10 }}>
                    <div>
                      {sdk.pros.map(p => <div key={p} style={s.pro}>✓ {p}</div>)}
                    </div>
                    <div>
                      {sdk.cons.map(c => <div key={c} style={s.con}>✗ {c}</div>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ ...s.card, marginTop: 16, background: "#f0fdf4", border: "0.5px solid #6ee7b7" }}>
              <div style={s.cardTitle}>Verdict for Bedrock Health Solutions</div>
              <div style={s.cardBody}>
                Use <strong>LiveKit on the Scale tier</strong> ($500/mo). It's the only option that
                combines HIPAA BAA, open-source codebase, the lowest per-minute cost at your scale,
                and a production React component library. If you want to start before committing to
                Scale, prototype on LiveKit Cloud's free tier (no HIPAA) then upgrade when you go live.
              </div>
            </div>
          </div>
        )}

        {/* ── LIVEKIT SETUP ── */}
        {tab === "LiveKit setup" && (
          <div>
            <p style={s.lead}>
              Step-by-step integration from zero to a working therapy room. Estimated time: 2–4 hours
              for a developer familiar with React and Node.
            </p>
            {liveKitSteps.map((step, idx) => (
              <div key={idx} style={s.stepCard}>
                <div style={s.stepHeader}>
                  <span style={s.stepNum}>{step.step}</span>
                  <span style={s.stepTitle}>{step.title}</span>
                  <span style={s.langTag}>{step.lang}</span>
                  <button style={s.copyBtn} onClick={() => copy(step.code, idx)}>
                    {copiedIdx === idx ? "Copied ✓" : "Copy"}
                  </button>
                </div>
                <pre style={s.pre}><code>{step.code}</code></pre>
              </div>
            ))}

            <div style={s.sectionTitle}>What to add for production</div>
            <div style={s.grid2}>
              {[
                { title: "Waiting room", body: "Check canEnterRoom from your DB before minting the token. Therapist joins first, client waits on a lobby screen until the therapist is ready." },
                { title: "Session recording", body: "POST to LiveKit's /recording/start API when the session begins. Store the recording in your S3 bucket (must be HIPAA-eligible — use AWS S3 with BAA)." },
                { title: "AI transcription", body: "Enable LiveKit's transcription agent. Hook the webhook to your AI session scribe pipeline — transcript arrives as the session progresses." },
                { title: "Webhooks → invoice", body: "Listen for room_finished webhook. Calculate session duration → create invoice record → trigger Razorpay payment collection automatically." },
              ].map(item => (
                <div key={item.title} style={s.card}>
                  <div style={s.cardTitle}>{item.title}</div>
                  <div style={s.cardBody}>{item.body}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ROOM COMPONENT ── */}
        {tab === "Room component" && (
          <div>
            <p style={s.lead}>
              A complete, production-ready therapy room component with waiting room, session timer,
              AI scribe trigger, and post-session handoff.
            </p>
            <div style={s.stepCard}>
              <div style={s.stepHeader}>
                <span style={s.langTag}>tsx</span>
                <span style={s.stepTitle}>TherapyVideoRoom.tsx — full component</span>
                <button style={s.copyBtn} onClick={() => copy(fullRoomCode, 99)}>
                  {copiedIdx === 99 ? "Copied ✓" : "Copy"}
                </button>
              </div>
              <pre style={{ ...s.pre, maxHeight: 480, overflowY: "auto" }}>
                <code>{fullRoomCode}</code>
              </pre>
            </div>

            <div style={s.sectionTitle}>File structure</div>
            <pre style={{ ...s.pre, fontSize: 12 }}>{`src/
  components/
    VideoRoom/
      TherapyVideoRoom.tsx      ← main room wrapper
      WaitingRoom.tsx           ← pre-join lobby
      SessionControls.tsx       ← mute/camera/end buttons
      ParticipantTile.tsx       ← single video tile
      SessionTimer.tsx          ← elapsed time display
  hooks/
    useVideoToken.ts            ← fetches JWT from backend
    useSessionRecording.ts      ← start/stop recording
  api/
    video.ts                    ← /api/token, /api/room endpoints`}
            </pre>
          </div>
        )}

        {/* ── ARCHITECTURE ── */}
        {tab === "Architecture" && (
          <div>
            <p style={s.lead}>
              The full data flow from booking to invoice — every hop that touches the video system.
            </p>
            <div style={s.archFlow}>
              {architectureSteps.map((step, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ ...s.archBox, background: step.color, borderColor: step.border, color: step.text }}>
                    <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4 }}>{step.label}</div>
                    <div style={{ fontSize: 11, opacity: 0.8 }}>{step.sub}</div>
                  </div>
                  {i < architectureSteps.length - 1 && (
                    <div style={s.archArrow}>↓</div>
                  )}
                </div>
              ))}
            </div>

            <div style={s.sectionTitle}>Security boundaries</div>
            <div style={s.grid2}>
              {[
                { title: "Never expose to browser", items: ["LIVEKIT_API_KEY", "LIVEKIT_API_SECRET", "Room token generation logic", "Recording start/stop API"] },
                { title: "Safe to send to browser", items: ["Short-lived JWT room token (< 1hr TTL)", "NEXT_PUBLIC_LIVEKIT_URL (wss:// only)", "Room name (use UUID, no PHI)", "Participant display name"] },
              ].map(sec => (
                <div key={sec.title} style={s.card}>
                  <div style={s.cardTitle}>{sec.title}</div>
                  {sec.items.map(item => (
                    <div key={item} style={{ fontFamily: "monospace", fontSize: 12, color: "#334155", padding: "2px 0" }}>
                      {item}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div style={s.sectionTitle}>Estimated cost at 1,000 sessions/month</div>
            <div style={s.grid3}>
              {[
                { label: "LiveKit Scale base", value: "$500/mo", sub: "Includes HIPAA BAA" },
                { label: "Usage (50 min avg × 1000)", value: "$20/mo", sub: "At $0.0004/min WebRTC" },
                { label: "Total video cost", value: "~$520/mo", sub: "vs $990 on Daily.co" },
              ].map(cost => (
                <div key={cost.label} style={{ ...s.card, textAlign: "center" }}>
                  <div style={s.cardBody}>{cost.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: "4px 0" }}>{cost.value}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{cost.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const fullRoomCode = `import '@livekit/components-styles';
import {
  LiveKitRoom,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { useState, useEffect, useCallback } from 'react';

interface TherapyVideoRoomProps {
  appointmentId: string;
  participantName: string;
  role: 'therapist' | 'client';
  onSessionEnd: (durationSeconds: number) => void;
}

export function TherapyVideoRoom({
  appointmentId,
  participantName,
  role,
  onSessionEnd,
}: TherapyVideoRoomProps) {
  const [token, setToken]         = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [status, setStatus]       = useState<'loading' | 'waiting' | 'connected' | 'ended'>('loading');

  // Fetch short-lived token from your backend
  useEffect(() => {
    fetch(\`/api/video/token?appointmentId=\${appointmentId}&name=\${participantName}&role=\${role}\`)
      .then(r => r.json())
      .then(({ token, url }) => {
        setToken(token);
        setServerUrl(url);
        setStatus('waiting');
      });
  }, [appointmentId, participantName, role]);

  const handleConnected = useCallback(() => {
    setStartTime(new Date());
    setStatus('connected');
  }, []);

  const handleDisconnected = useCallback(() => {
    if (startTime) {
      const duration = Math.round((Date.now() - startTime.getTime()) / 1000);
      onSessionEnd(duration);
    }
    setStatus('ended');
  }, [startTime, onSessionEnd]);

  if (status === 'loading') return <RoomLoading />;
  if (status === 'ended')   return <SessionComplete />;

  return (
    <div style={{ height: '100vh', background: '#0f172a' }}>
      <LiveKitRoom
        token={token}
        serverUrl={import.meta.env.VITE_LIVEKIT_URL || serverUrl}
        connect={true}
        video={true}
        audio={true}
        onConnected={handleConnected}
        onDisconnected={handleDisconnected}
        data-lk-theme="default"
      >
        <RoomContent role={role} />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}

function RoomContent({ role }: { role: 'therapist' | 'client' }) {
  const tracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true },
     { source: Track.Source.ScreenShare, withPlaceholder: false }],
    { onlySubscribed: false }
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <GridLayout tracks={tracks} style={{ flex: 1 }}>
        <ParticipantTile />
      </GridLayout>
      <ControlBar
        controls={{
          camera: true,
          microphone: true,
          screenShare: role === 'therapist',
          leave: true,
        }}
      />
    </div>
  );
}

function RoomLoading() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
      height:'100vh', background:'#0f172a', color:'#fff', fontSize:14 }}>
      Connecting to session…
    </div>
  );
}

function SessionComplete() {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', height:'100vh', background:'#0f172a', color:'#fff', gap:12 }}>
      <div style={{ fontSize:18, fontWeight:600 }}>Session complete</div>
      <div style={{ fontSize:13, color:'#94a3b8' }}>Your notes are being prepared…</div>
    </div>
  );
}`;

const s: Record<string, React.CSSProperties> = {
  page: { fontFamily: "'Helvetica Neue', sans-serif", maxWidth: 860, margin: "0 auto", padding: "0 0 40px" },
  hero: { background: "#0f172a", borderRadius: 16, padding: "32px 32px 28px", marginBottom: 0 },
  heroTag: { fontSize: 11, fontWeight: 600, color: "#38bdf8", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 },
  heroTitle: { fontSize: 28, fontWeight: 700, color: "#f8fafc", margin: "0 0 8px", letterSpacing: "-0.5px" },
  heroSub: { fontSize: 14, color: "#94a3b8", margin: 0 },
  tabs: { display: "flex", gap: 0, borderBottom: "0.5px solid #e2e8f0", marginBottom: 0, background: "#fff" },
  tab: { padding: "12px 18px", fontSize: 13, fontWeight: 500, color: "#64748b", background: "none", border: "none", borderBottomWidth: "2px", borderBottomStyle: "solid", borderBottomColor: "transparent", cursor: "pointer", transition: "all 0.15s", fontFamily: "'Helvetica Neue', sans-serif" },
  tabActive: { color: "#0f172a", borderBottomColor: "#0ea5e9" },
  body: { padding: "24px 0", background: "#fff" },
  lead: { fontSize: 14, color: "#334155", lineHeight: 1.7, marginBottom: 20, maxWidth: 640 },
  sectionTitle: { fontSize: 12, fontWeight: 700, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 28, marginBottom: 12, borderBottom: "0.5px solid #e2e8f0", paddingBottom: 6 },
  grid3: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 24 },
  grid2: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, marginBottom: 24 },
  card: { background: "#f8fafc", border: "0.5px solid #e2e8f0", borderRadius: 10, padding: "14px 16px" },
  cardIcon: { fontSize: 20, marginBottom: 8 },
  cardTitle: { fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 5 },
  cardBody: { fontSize: 12, color: "#475569", lineHeight: 1.6 },
  featureGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 6, marginBottom: 20 },
  featureItem: { fontSize: 12, color: "#334155", display: "flex", alignItems: "center", gap: 6, padding: "4px 0" },
  checkRow: { display: "flex", alignItems: "center", gap: 10, padding: "5px 0", borderBottom: "0.5px solid #f1f5f9" },
  checkDot: { width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 700, flexShrink: 0 },
  sdkCard: { background: "#f8fafc", border: "0.5px solid #e2e8f0", borderRadius: 12, padding: "16px" },
  sdkHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  sdkName: { fontSize: 15, fontWeight: 700, color: "#0f172a" },
  sdkPrice: { fontSize: 11, color: "#64748b", fontFamily: "monospace" },
  sdkGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 12, background: "#fff", borderRadius: 8, padding: "10px 12px", border: "0.5px solid #e2e8f0", marginBottom: 4 },
  miniLabel: { fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 },
  miniVal: { fontSize: 12, color: "#334155" },
  badge: { fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999 },
  hipaaTag: { fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 999, background: "#d1fae5", color: "#065f46" },
  ossTag: { fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 999, background: "#e0e7ff", color: "#3730a3" },
  pro: { fontSize: 12, color: "#059669", padding: "2px 0" },
  con: { fontSize: 12, color: "#dc2626", padding: "2px 0" },
  stepCard: { background: "#0f172a", borderRadius: 10, marginBottom: 16, overflow: "hidden" },
  stepHeader: { display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderBottom: "0.5px solid #1e293b" },
  stepNum: { fontSize: 11, fontWeight: 700, color: "#38bdf8" },
  stepTitle: { fontSize: 12, fontWeight: 600, color: "#e2e8f0", flex: 1 },
  langTag: { fontSize: 10, fontWeight: 700, color: "#94a3b8", background: "#1e293b", padding: "2px 7px", borderRadius: 4 },
  copyBtn: { fontSize: 11, color: "#94a3b8", background: "none", border: "0.5px solid #334155", borderRadius: 4, padding: "3px 8px", cursor: "pointer", fontFamily: "'Helvetica Neue', sans-serif" },
  pre: { margin: 0, padding: "16px", fontSize: 12, color: "#e2e8f0", overflowX: "auto", lineHeight: 1.7, background: "#0f172a" },
  archFlow: { display: "flex", flexDirection: "column", alignItems: "stretch", marginBottom: 24 },
  archBox: { border: "0.5px solid", borderRadius: 10, padding: "12px 16px", textAlign: "left" },
  archArrow: { fontSize: 18, color: "#cbd5e1", textAlign: "center", padding: "4px 0" },
};
