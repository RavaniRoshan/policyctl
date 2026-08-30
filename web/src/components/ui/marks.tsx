export function PolicyctlMark({ className = "", size = 48 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <rect width="48" height="48" rx="12" fill="currentColor" className="text-brand" />
      <path d="M14 18h20M14 24h14M14 30h18" stroke="currentColor" className="text-fg-inverse" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="35" cy="30" r="4" fill="currentColor" className="text-success" />
    </svg>
  );
}

export function AgentMark({ className = "", variant = "shield" }: { className?: string; variant?: "shield" | "check" | "lock" | "code" }) {
  const marks: Record<string, JSX.Element> = {
    shield: (
      <>
        <circle cx="24" cy="24" r="20" fill="currentColor" className="text-brand/10" />
        <path d="M24 14l8 4v8c0 6-4 10-8 12-4-2-8-6-8-12v-8l8-4z" fill="currentColor" className="text-brand" />
        <path d="M20 24l3 3 6-6" stroke="currentColor" className="text-fg-inverse" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    check: (
      <>
        <circle cx="24" cy="24" r="20" fill="currentColor" className="text-success/10" />
        <circle cx="24" cy="24" r="14" fill="currentColor" className="text-success" />
        <path d="M19 24l4 4 8-8" stroke="currentColor" className="text-fg-inverse" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    lock: (
      <>
        <circle cx="24" cy="24" r="20" fill="currentColor" className="text-accent-warm/10" />
        <rect x="16" y="22" width="16" height="12" rx="3" fill="currentColor" className="text-accent-warm" />
        <path d="M19 22v-4a5 5 0 0110 0v4" stroke="currentColor" className="text-accent-warm" strokeWidth="2" fill="none" />
      </>
    ),
    code: (
      <>
        <circle cx="24" cy="24" r="20" fill="currentColor" className="text-accent-sky/10" />
        <path d="M18 20l-6 4 6 4M30 24l6-4-6-4M22 18l4 12" stroke="currentColor" className="text-accent-sky" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  };

  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      {marks[variant]}
    </svg>
  );
}

export function ProductMockup({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-xl border border-border bg-bg-subtle overflow-hidden shadow-lg ${className}`}>
      <div className="flex items-center gap-2 border-b border-border bg-bg-surface px-4 py-3">
        <span className="size-3 rounded-full bg-danger/70" />
        <span className="size-3 rounded-full bg-warning/70" />
        <span className="size-3 rounded-full bg-success/70" />
        <span className="ml-2 font-mono text-xs text-fg-muted">terminal</span>
      </div>
      <pre className="p-5 font-mono text-sm leading-relaxed text-fg-secondary">
{`$ policyctl init --template full
✓ Created .policyctl.yml
✓ Detected 3 rule templates

$ policyctl gen claude
✓ Generated .claude/settings.json
✓ Hook registered: eval --hook

$ policyctl check
✓ All checks passed (0 violations)`}
      </pre>
    </div>
  );
}

export function CliPanel({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-xl border border-border bg-bg-subtle font-mono text-sm ${className}`}>
      <div className="flex items-center gap-2 border-b border-border bg-bg-surface px-4 py-2">
        <span className="size-3 rounded-full bg-danger/70" />
        <span className="size-3 rounded-full bg-warning/70" />
        <span className="size-3 rounded-full bg-success/70" />
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
