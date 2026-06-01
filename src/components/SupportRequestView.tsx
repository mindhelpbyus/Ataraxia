import React, { useState } from 'react';
import { toast } from 'sonner';
import { Paperclip, X, Loader2, UploadCloud } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface SupportRequestViewProps {
  /** Logged-in user's email — prefilled. */
  userEmail: string;
}

/**
 * Topics and their dependent "What aspect…?" sub-questions, mirroring
 * SimplePractice's request form (India-adapted: no insurance-claims topic).
 */
const TOPICS: Record<string, string[]> = {
  'New account setup': [
    'Setting up my practice profile',
    'Adding team members',
    'Configuring services & rates',
    'Client portal setup',
    'Something else',
  ],
  'Scheduling & appointments': [
    'Creating or editing appointments',
    'Calendar sync',
    'Availability & online booking',
    'Reminders',
  ],
  'Billing & payments': [
    'Invoices & statements',
    'Online payments (Razorpay)',
    'Refunds',
    'Payouts',
  ],
  'Documentation': [
    'Notes & templates',
    'Intake forms & e-sign',
    'Treatment plans',
  ],
  'Telehealth': [
    'Joining a session',
    'Audio / video issues',
    'Sharing the join link',
  ],
  'Account & login': [
    'Sign-in problems',
    'Password / MFA',
    'Profile & security',
  ],
  'Technical issue': [
    'Something is broken',
    'Performance / loading',
    'Error message',
  ],
  Other: ['General question'],
};

const PERTAINS = ['No', 'Yes — a specific client', 'Not sure'];
const BROWSERS = ['Chrome', 'Safari', 'Firefox', 'Edge', 'Other'];
const OPERATING_SYSTEMS = ['Windows', 'macOS', 'Linux', 'ChromeOS', 'Other'];
const MOBILE_OS = ['Not using mobile', 'Android', 'iOS'];

const MAX_ATTACHMENT_MB = 10;

/**
 * SimplePractice-style "Submit a request" form, rendered as a full content view
 * in the main panel (like Clients / Messages). Shown to any signed-in user
 * (clients, therapists, org staff) via Help & Support.
 *
 * NOTE: No support-ticket backend endpoint exists yet — Submit is a UI-only
 * stub that validates and confirms but does not persist/send. Wire `handleSubmit`
 * to a real `POST /support/tickets` (multipart for attachments) once available.
 */
export function SupportRequestView({ userEmail }: SupportRequestViewProps) {
  const [topic, setTopic] = useState<string>('');
  const [aspect, setAspect] = useState<string>('');
  const [email, setEmail] = useState(userEmail);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [pertains, setPertains] = useState<string>('');
  const [browser, setBrowser] = useState<string>('');
  const [os, setOs] = useState<string>('');
  const [mobileOs, setMobileOs] = useState<string>('');
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const aspectOptions = topic ? TOPICS[topic] ?? [] : [];

  const reset = () => {
    setTopic(''); setAspect(''); setEmail(userEmail); setSubject('');
    setDescription(''); setPertains(''); setBrowser(''); setOs('');
    setMobileOs(''); setFiles([]);
  };

  const addFiles = (incoming: FileList | File[]) => {
    const picked = Array.from(incoming);
    const tooBig = picked.find((f) => f.size > MAX_ATTACHMENT_MB * 1024 * 1024);
    if (tooBig) {
      toast.error(`"${tooBig.name}" is larger than ${MAX_ATTACHMENT_MB} MB.`);
      return;
    }
    setFiles((prev) => [...prev, ...picked]);
  };

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const canSubmit =
    topic && aspect && email.trim() && subject.trim() && description.trim() && pertains;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    // TODO: replace with real POST /support/tickets (multipart for attachments).
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    toast.success("Request submitted — we'll get back to you by email.");
    reset();
  };

  return (
    <div className="mx-auto max-w-2xl px-6 pb-12">
      <p className="text-base text-muted-foreground mb-6">
        Our support team will get back to you by email.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Info banner — system green (Ink on Parchment) */}
        <div className="rounded-r-lg border-l-4 border-[color:var(--action)] bg-[color:var(--action)]/10 px-4 py-3.5">
          <p className="text-base text-[color:var(--action)]">
            Aim to include as much information and detail in your request as possible to reduce delays
            between replies.
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          Fields marked with an asterisk (<span className="text-rose-500">*</span>) are required.
        </p>

        {/* Topic */}
        <Field label="Select the topic of your question" required>
          <Select value={topic} onValueChange={(v) => { setTopic(v); setAspect(''); }}>
            <SelectTrigger><SelectValue placeholder="Choose a topic" /></SelectTrigger>
            <SelectContent>
              {Object.keys(TOPICS).map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {/* Email */}
        <Field label="Your email address" required>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </Field>

        {/* Dependent sub-question */}
        {topic && (
          <Field label={`What aspect of ${topic.toLowerCase()} do you need help with?`} required>
            <Select value={aspect} onValueChange={setAspect}>
              <SelectTrigger><SelectValue placeholder="-" /></SelectTrigger>
              <SelectContent>
                {aspectOptions.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}

        {/* Subject */}
        <Field label="Subject" required>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Brief summary of your request"
            maxLength={150}
            required
          />
        </Field>

        {/* Description with no-PHI warning */}
        <Field
          label="Description (Do not include PHI or treatment information)"
          required
          hint="Provide as much detail as needed so we can work with you."
        >
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue — what you did, what you expected, and what happened."
            rows={6}
            required
          />
        </Field>

        {/* Pertains to a client */}
        <Field label="Does this pertain to a specific client?" required>
          <Select value={pertains} onValueChange={setPertains}>
            <SelectTrigger><SelectValue placeholder="-" /></SelectTrigger>
            <SelectContent>
              {PERTAINS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>

        {/* Environment */}
        <Field label="Browser" hint="What browser are you using? This helps us get you the right answer faster.">
          <Select value={browser} onValueChange={setBrowser}>
            <SelectTrigger><SelectValue placeholder="-" /></SelectTrigger>
            <SelectContent>
              {BROWSERS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Operating System" hint="What operating system do you have?">
          <Select value={os} onValueChange={setOs}>
            <SelectTrigger><SelectValue placeholder="-" /></SelectTrigger>
            <SelectContent>
              {OPERATING_SYSTEMS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Mobile OS" hint="If you're using the app on a mobile device, what kind of operating system does it have?">
          <Select value={mobileOs} onValueChange={setMobileOs}>
            <SelectTrigger><SelectValue placeholder="-" /></SelectTrigger>
            <SelectContent>
              {MOBILE_OS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>

        {/* Attachments — drag & drop */}
        <Field label="Attachments" hint={`Optional — up to ${MAX_ATTACHMENT_MB} MB each.`}>
          <label
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
            }}
            className={`flex flex-col items-center justify-center gap-2 cursor-pointer rounded-xl border-2 border-dashed px-4 py-8 text-sm transition-colors ${
              dragOver ? 'border-primary bg-primary/5' : 'border-rule hover:bg-muted/40'
            }`}
          >
            <UploadCloud className="h-6 w-6 text-muted-foreground" />
            <span className="text-muted-foreground">Choose a file or drag and drop here</span>
            <input
              type="file"
              multiple
              className="sr-only"
              onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }}
            />
          </label>
          {files.length > 0 && (
            <ul className="space-y-1 pt-2">
              {files.map((f, i) => (
                <li
                  key={`${f.name}-${i}`}
                  className="flex items-center justify-between rounded-md bg-muted/40 px-2.5 py-1.5 text-xs"
                >
                  <span className="flex items-center gap-1.5 truncate text-foreground">
                    <Paperclip className="h-3.5 w-3.5 shrink-0" /> {f.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="text-muted-foreground hover:text-rose-500 ml-2 shrink-0"
                    aria-label={`Remove ${f.name}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Field>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2 pb-8">
          <Button type="submit" disabled={!canSubmit || submitting} className="min-w-[120px]">
            {submitting ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting…</>
            ) : (
              'Submit'
            )}
          </Button>
          <Button type="button" variant="ghost" onClick={reset} disabled={submitting}>
            Clear
          </Button>
        </div>
      </form>
    </div>
  );
}

/** Labelled field wrapper matching the SimplePractice form layout. */
function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-base font-semibold text-foreground">
        {label} {required && <span className="text-rose-500">*</span>}
      </Label>
      {hint && <p className="text-sm text-muted-foreground -mt-1">{hint}</p>}
      {children}
    </div>
  );
}
