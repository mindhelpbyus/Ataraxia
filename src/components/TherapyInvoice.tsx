import React, { useState } from "react";

export interface InvoiceData {
  invoiceNumber: string;
  issuedDate: string;
  dueDate: string;
  status: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  organization?: {
    name: string;
    tagline: string;
    email: string;
    gstin?: string;
    website?: string;
  };
  client: {
    name: string;
    email: string;
    phone: string;
    initials: string;
  };
  therapist: {
    name: string;
    credentials?: string;
    clinic?: string;
    email: string;
    license?: string;
  };
  session?: {
    type: string;
    modality: string;
    date: string;
    time: string;
    sessionNo: number;
  };
  lineItems: Array<{
    description: string;
    qty: number;
    rate: number;
    amount: number;
  }>;
  tax: {
    label: string;
    rate: number;
  };
  discount: number;
  currency: string;
}

const defaultInvoice: InvoiceData = {
  invoiceNumber: "INV-2025-00847",
  issuedDate: "April 20, 2025",
  dueDate: "April 20, 2025",
  status: "Paid",
  razorpayPaymentId: "pay_QkT8mN3xWvY2pL",
  razorpayOrderId:   "order_QkT7aB1nKcX9mR",
  organization: {
    name: "Ataraxia Health",
    tagline: "Mental wellness platform",
    email: "billing@ataraxia.health",
    gstin: "27AABCA1234C1Z5",
    website: "ataraxia.health",
  },
  client: {
    name: "Priya Sharma",
    email: "priya.sharma@gmail.com",
    phone: "+91 98765 43210",
    initials: "PS",
  },
  therapist: {
    name: "Dr. Ananya Mehta",
    credentials: "PhD, LMFT · Cognitive Behavioural Therapy",
    clinic: "Mindful Horizons Therapy",
    email: "dr.mehta@mindfulhorizons.in",
    license: "MH-LIC-2019-04821",
  },
  session: {
    type: "Individual Therapy Session",
    modality: "Video Call (50 min)",
    date: "Saturday, April 19, 2025",
    time: "11:00 AM – 11:50 AM IST",
    sessionNo: 8,
  },
  lineItems: [
    { description: "Individual therapy session (50 min)", qty: 1, rate: 2500, amount: 2500 },
    { description: "Platform service fee", qty: 1, rate: 125, amount: 125 },
  ],
  tax: { label: "GST (18%)", rate: 0.18 },
  discount: 0,
  currency: "₹",
};

function statusColor(s: string) {
  if (s.toLowerCase() === "paid") return { bg: "#d1fae5", text: "#065f46", dot: "#10b981" };
  if (s.toLowerCase() === "pending" || s.toLowerCase() === "unpaid") return { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" };
  return { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444" };
}

export function TherapyInvoice({ invoiceData }: { invoiceData?: InvoiceData; compact?: boolean }) {
  const [downloading, setDownloading] = useState(false);
  const invoice = invoiceData || defaultInvoice;

  const subtotal = invoice.lineItems.reduce((s, i) => s + i.amount, 0);
  const taxAmt   = Math.round(subtotal * invoice.tax.rate);
  const total    = subtotal + taxAmt - invoice.discount;
  const sc       = statusColor(invoice.status);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => setDownloading(false), 1800);
  };

  return (
    <div style={styles.page} className="invoice-print-wrapper">
      <style>
        {`
          @media screen {
            .invoice-print-wrapper {
              background: #f1f5f9 !important;
            }
          }
          @media print {
            @page {
              size: A4;
              margin: 0;
            }
            body * {
              visibility: hidden !important;
            }
            .invoice-print-wrapper, .invoice-print-wrapper * {
              visibility: visible !important;
            }
            .invoice-print-wrapper {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              height: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
              background: white !important;
            }
            .invoice-sheet-container {
              width: 210mm !important;
              min-height: 297mm !important;
              margin: 0 !important;
              padding: 20mm !important;
              box-shadow: none !important;
              border: none !important;
              border-radius: 0 !important;
            }
            .invoice-footer-actions, .invoice-grain-overlay {
              display: none !important;
            }
          }
        `}
      </style>
      {/* Background grain texture */}
      <div style={styles.grain} className="invoice-grain-overlay" />

      <div style={styles.sheet} className="invoice-sheet-container">

        {/* ── Header bar ── */}
        <div style={styles.header}>
          <div>
            {invoice.organization ? (
              <>
                <div style={styles.clinicName}>{invoice.organization.name}</div>
                <div style={styles.clinicSub}>{invoice.organization.tagline} · {invoice.organization.website}</div>
                {invoice.organization.gstin && <div style={{ ...styles.clinicSub, marginTop: 2 }}>GSTIN: {invoice.organization.gstin}</div>}
              </>
            ) : (
              <>
                <div style={styles.clinicName}>{invoice.therapist.clinic || "Ataraxia Health"}</div>
                <div style={styles.clinicSub}>{invoice.therapist.credentials || "Professional Therapy"}</div>
              </>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={styles.invLabel}>INVOICE</div>
            <div style={styles.invNum}>{invoice.invoiceNumber}</div>
          </div>
        </div>

        {/* ── Status pill + dates ── */}
        <div style={styles.metaRow}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ ...styles.statusPill, background: sc.bg, color: sc.text }}>
              <span style={{ ...styles.statusDot, background: sc.dot }} />
              {invoice.status.toUpperCase()}
            </span>
            <span style={styles.metaChip}>Card / Stripe</span>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            <div style={styles.datePair}>
              <span style={styles.dateLabel}>Issued</span>
              <span style={styles.dateVal}>{invoice.issuedDate}</span>
            </div>
            <div style={styles.datePair}>
              <span style={styles.dateLabel}>Due / Paid on</span>
              <span style={styles.dateVal}>{invoice.dueDate}</span>
            </div>
          </div>
        </div>

        <div style={styles.divider} />

        {/* ── Parties ── */}
        <div style={{ ...styles.partiesRow, gridTemplateColumns: invoice.organization ? "1fr auto 1fr" : "1fr 1fr" }}>
          <div style={styles.partyCard}>
            <div style={styles.partyLabel}>Bill to</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={styles.avatar}>{invoice.client.initials}</div>
              <div>
                <div style={styles.partyName}>{invoice.client.name}</div>
                <div style={styles.partySub}>{invoice.client.email}</div>
              </div>
            </div>
            <div style={styles.partySub}>{invoice.client.phone}</div>
          </div>

          {/* Org facilitator — centre column */}
          {invoice.organization && (
            <div style={{ ...styles.partyCard, background: "#f5f3ff", border: "0.5px solid #ddd6fe", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 6 }}>
              <div style={styles.partyLabel}>Facilitated by</div>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6d28d9" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <div style={{ ...styles.partyName, fontSize: 13 }}>{invoice.organization.name}</div>
              <div style={styles.partySub}>{invoice.organization.email}</div>
              <div style={{ fontSize: 10, color: "#7c3aed", background: "#ede9fe", padding: "2px 8px", borderRadius: 999, fontFamily: "'Helvetica Neue', sans-serif", marginTop: 2 }}>
                Platform operator
              </div>
            </div>
          )}

          <div style={styles.partyCard}>
            <div style={styles.partyLabel}>{invoice.organization ? "Service provider" : "From"}</div>
            <div style={styles.partyName}>{invoice.therapist.name}</div>
            <div style={styles.partySub}>{invoice.therapist.credentials}</div>
            <div style={styles.partySub}>{invoice.therapist.email}</div>
            <div style={{ ...styles.partySub, marginTop: 6, fontSize: 11 }}>
              License: {invoice.therapist.license || "N/A"}
            </div>
          </div>
        </div>

        <div style={styles.divider} />

        {/* ── Session details ── */}
        {invoice.session && (
          <div style={styles.sessionCard}>
            <div style={styles.sessionIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2">
                <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14"/>
                <rect x="1" y="6" width="14" height="12" rx="2"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={styles.sessionType}>{invoice.session.type}</div>
              <div style={styles.sessionMeta}>{invoice.session.modality} &nbsp;·&nbsp; {invoice.session.date} &nbsp;·&nbsp; {invoice.session.time}</div>
            </div>
            <div style={styles.sessionBadge}>Session #{invoice.session.sessionNo}</div>
          </div>
        )}

        {/* ── Line items table ── */}
        <table style={styles.table}>
          <thead>
            <tr>
              {["Description", "Qty", "Rate", "Amount"].map((h, i) => (
                <th key={h} style={{ ...styles.th, textAlign: i === 0 ? "left" : "right" } as React.CSSProperties}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((item, idx) => (
              <tr key={idx} style={idx % 2 === 0 ? styles.trEven : {}}>
                <td style={styles.td}>{item.description}</td>
                <td style={{ ...styles.td, textAlign: "right" } as React.CSSProperties}>{item.qty}</td>
                <td style={{ ...styles.td, textAlign: "right" } as React.CSSProperties}>{invoice.currency}{item.rate.toLocaleString("en-IN")}</td>
                <td style={{ ...styles.td, textAlign: "right", fontWeight: 500 } as React.CSSProperties}>{invoice.currency}{item.amount.toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── Totals ── */}
        <div style={styles.totalsWrap}>
          <div style={styles.totalsBox}>
            <div style={styles.totalRow}>
              <span style={styles.totalLabel}>Subtotal</span>
              <span style={styles.totalVal}>{invoice.currency}{subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div style={styles.totalRow}>
              <span style={styles.totalLabel}>{invoice.tax.label}</span>
              <span style={styles.totalVal}>{invoice.currency}{taxAmt.toLocaleString("en-IN")}</span>
            </div>
            {invoice.discount > 0 && (
              <div style={styles.totalRow}>
                <span style={{ ...styles.totalLabel, color: "#059669" }}>Discount</span>
                <span style={{ ...styles.totalVal, color: "#059669" }}>−{invoice.currency}{invoice.discount}</span>
              </div>
            )}
            <div style={styles.grandDivider} />
            <div style={styles.totalRow}>
              <span style={styles.grandLabel}>Total</span>
              <span style={styles.grandVal}>{invoice.currency}{total.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        <div style={styles.divider} />

        {/* ── Razorpay payment details ── */}
        {invoice.razorpayPaymentId && (
          <div style={styles.paymentSection}>
            <div style={styles.rzpHeader}>
              <div style={styles.rzpLogo}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4l6.5 16 3-8 5-8H4z" fill="#2563eb"/>
                  <path d="M13.5 12l3.5-8H10l3.5 8z" fill="#60a5fa"/>
                </svg>
                <span style={styles.rzpLabel}>Payment via Card</span>
              </div>
              <span style={{ ...styles.statusPill, background: "#dbeafe", color: "#1e40af", fontSize: 11 }}>
                <span style={{ ...styles.statusDot, background: "#3b82f6" }} />
                Captured
              </span>
            </div>
            <div style={styles.rzpGrid}>
              <div style={styles.rzpField}>
                <span style={styles.rzpFieldLabel}>Payment ID</span>
                <span style={styles.rzpFieldVal}>{invoice.razorpayPaymentId}</span>
              </div>
              <div style={styles.rzpField}>
                <span style={styles.rzpFieldLabel}>Order ID</span>
                <span style={styles.rzpFieldVal}>{invoice.razorpayOrderId}</span>
              </div>
              <div style={styles.rzpField}>
                <span style={styles.rzpFieldLabel}>Method</span>
                <span style={styles.rzpFieldVal}>Credit Card</span>
              </div>
              <div style={styles.rzpField}>
                <span style={styles.rzpFieldLabel}>Amount settled</span>
                <span style={{ ...styles.rzpFieldVal, color: "#065f46", fontWeight: 600 }}>
                  {invoice.currency}{total.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        )}

        <div style={styles.divider} />

        {/* ── Footer ── */}
        <div style={styles.footer}>
          <div style={styles.footerNote}>
            {invoice.organization ? (
              `This invoice is issued by ${invoice.organization.name} on behalf of ${invoice.therapist.name}. For billing queries contact ${invoice.organization.email}`
            ) : (
              `This is a computer-generated invoice. For queries, contact ${invoice.therapist.email}`
            )}
          </div>
          <div style={styles.footerActions} className="invoice-footer-actions">
            <button style={styles.btnSecondary} onClick={() => window.print()}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              Print
            </button>
            <button style={{ ...styles.btnPrimary, opacity: downloading ? 0.7 : 1 }} onClick={() => {
              setDownloading(true);
              setTimeout(() => {
                setDownloading(false);
                window.print();
              }, 1000);
            }}>
              {downloading ? (
                "Preparing PDF…"
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Download PDF
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100%",
    background: "#f1f5f9",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "40px 20px",
    fontFamily: "'Georgia', 'Times New Roman', serif",
    position: "relative" as const,
  },
  grain: {
    position: "absolute" as const,
    inset: 0,
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
    pointerEvents: "none" as const,
    zIndex: 0,
  },
  sheet: {
    background: "#ffffff",
    borderRadius: 8,
    padding: "40px 50px",
    width: "100%",
    maxWidth: "800px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    border: "1px solid #e2e8f0",
    position: "relative" as const,
    zIndex: 1,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  clinicName: {
    fontSize: 20,
    fontWeight: 700,
    color: "#1a1917",
    letterSpacing: "-0.3px",
    marginBottom: 3,
  },
  clinicSub: {
    fontSize: 12,
    color: "#888780",
    fontFamily: "'Helvetica Neue', sans-serif",
  },
  invLabel: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.12em",
    color: "#888780",
    fontFamily: "'Helvetica Neue', sans-serif",
    marginBottom: 2,
  },
  invNum: {
    fontSize: 15,
    fontWeight: 600,
    color: "#1a1917",
    fontFamily: "'Helvetica Neue', sans-serif",
  },
  metaRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    flexWrap: "wrap" as const,
    gap: 12,
  },
  statusPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 500,
    fontFamily: "'Helvetica Neue', sans-serif",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
  },
  metaChip: {
    background: "#eff6ff",
    color: "#1d4ed8",
    fontSize: 11,
    fontWeight: 500,
    padding: "3px 9px",
    borderRadius: 999,
    fontFamily: "'Helvetica Neue', sans-serif",
  },
  datePair: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "flex-end",
    gap: 1,
  },
  dateLabel: {
    fontSize: 11,
    color: "#888780",
    fontFamily: "'Helvetica Neue', sans-serif",
  },
  dateVal: {
    fontSize: 13,
    color: "#1a1917",
    fontWeight: 500,
    fontFamily: "'Helvetica Neue', sans-serif",
  },
  divider: {
    height: "0.5px",
    background: "#e8e6e1",
    margin: "24px 0",
  },
  partiesRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 24,
    marginBottom: 0,
  },
  partyCard: {
    background: "#fafaf8",
    borderRadius: 10,
    padding: "14px 16px",
    border: "0.5px solid #eceae5",
  },
  partyLabel: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.1em",
    color: "#b4b2a9",
    textTransform: "uppercase" as const,
    fontFamily: "'Helvetica Neue', sans-serif",
    marginBottom: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#e0e7ff",
    color: "#3730a3",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "'Helvetica Neue', sans-serif",
    flexShrink: 0,
  },
  partyName: {
    fontSize: 14,
    fontWeight: 600,
    color: "#1a1917",
    marginBottom: 2,
  },
  partySub: {
    fontSize: 12,
    color: "#888780",
    fontFamily: "'Helvetica Neue', sans-serif",
    lineHeight: 1.5,
  },
  sessionCard: {
    background: "#f5f3ff",
    border: "0.5px solid #ddd6fe",
    borderRadius: 10,
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 24,
  },
  sessionIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    background: "#ede9fe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sessionType: {
    fontSize: 13,
    fontWeight: 600,
    color: "#1a1917",
    marginBottom: 3,
  },
  sessionMeta: {
    fontSize: 12,
    color: "#6d28d9",
    fontFamily: "'Helvetica Neue', sans-serif",
  },
  sessionBadge: {
    background: "#ede9fe",
    color: "#5b21b6",
    fontSize: 11,
    fontWeight: 500,
    padding: "3px 10px",
    borderRadius: 999,
    whiteSpace: "nowrap" as const,
    fontFamily: "'Helvetica Neue', sans-serif",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    marginBottom: 0,
    fontFamily: "'Helvetica Neue', sans-serif",
  },
  th: {
    fontSize: 11,
    fontWeight: 600,
    color: "#888780",
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    padding: "8px 12px",
    borderBottom: "0.5px solid #e8e6e1",
  },
  td: {
    fontSize: 13,
    color: "#1a1917",
    padding: "12px 12px",
    borderBottom: "0.5px solid #f0ede8",
    verticalAlign: "middle",
  },
  trEven: {
    background: "#fafaf8",
  },
  totalsWrap: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  totalsBox: {
    width: 260,
    fontFamily: "'Helvetica Neue', sans-serif",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "5px 0",
  },
  totalLabel: {
    fontSize: 13,
    color: "#888780",
  },
  totalVal: {
    fontSize: 13,
    color: "#1a1917",
  },
  grandDivider: {
    height: "0.5px",
    background: "#e8e6e1",
    margin: "8px 0",
  },
  grandLabel: {
    fontSize: 15,
    fontWeight: 700,
    color: "#1a1917",
  },
  grandVal: {
    fontSize: 18,
    fontWeight: 700,
    color: "#1a1917",
    letterSpacing: "-0.3px",
  },
  paymentSection: {
    background: "#eff6ff",
    border: "0.5px solid #bfdbfe",
    borderRadius: 10,
    padding: "16px",
  },
  rzpHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  rzpLogo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  rzpLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: "#1e40af",
    fontFamily: "'Helvetica Neue', sans-serif",
  },
  rzpGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px 24px",
  },
  rzpField: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 2,
  },
  rzpFieldLabel: {
    fontSize: 11,
    color: "#60a5fa",
    fontFamily: "'Helvetica Neue', sans-serif",
    fontWeight: 500,
  },
  rzpFieldVal: {
    fontSize: 12,
    color: "#1e3a8a",
    fontFamily: "'Courier New', monospace",
    fontWeight: 500,
    wordBreak: "break-all" as const,
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap" as const,
    gap: 12,
  },
  footerNote: {
    fontSize: 11,
    color: "#b4b2a9",
    fontFamily: "'Helvetica Neue', sans-serif",
    maxWidth: 340,
    lineHeight: 1.5,
  },
  footerActions: {
    display: "flex",
    gap: 8,
  },
  btnSecondary: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "9px 16px",
    borderRadius: 8,
    border: "0.5px solid #e8e6e1",
    background: "#ffffff",
    color: "#1a1917",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'Helvetica Neue', sans-serif",
  },
  btnPrimary: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "9px 18px",
    borderRadius: 8,
    border: "none",
    background: "#1a1917",
    color: "#ffffff",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'Helvetica Neue', sans-serif",
    transition: "opacity 0.15s",
  },
};
