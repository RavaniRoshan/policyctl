import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { useReveal } from "@/lib/use-reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";
import {
  ShieldCheck, Database, Sparkles, FileBarChart, GitBranch, Cpu,
  Check, X, Quote, ArrowRight, Zap, Lock, Eye,
} from "lucide-react";

function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const { ref, className: rc } = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`${rc} ${className}`}>
      {children}
    </div>
  );
}

function SectionHead({ eyebrow, title, lede }: { eyebrow: string; title: string; lede?: string }) {
  return (
    <Reveal>
      <div style={{ maxWidth: "60ch" }}>
        <div className="font-mono text-xs uppercase tracking-[0.16em] text-brand">{eyebrow}</div>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl text-fg-primary">{title}</h2>
        {lede && <p className="mt-3 text-fg-secondary leading-relaxed">{lede}</p>}
      </div>
    </Reveal>
  );
}

export function Landing() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <MarketingNav />

      {/* Hero */}
      <section className="relative overflow-hidden py-24 sm:py-32 lg:py-40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(45,212,191,0.08)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(249,115,22,0.05)_0%,transparent_50%)]" />
        <div className="relative mx-auto max-w-content px-6">
          <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-pill border border-brand/30 bg-brand/10 px-4 py-1.5 font-mono text-xs text-brand">
                <span className="size-2 rounded-full bg-brand animate-pulse" />
                Provider-agnostic policy runtime
              </span>
              <h1 className="mt-6 font-display text-5xl font-bold leading-[1.02] tracking-tight text-fg-primary sm:text-6xl lg:text-7xl">
                Make your coding agents <span className="bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">obey the rules.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-fg-secondary">
                One <code className="font-mono text-brand">.policyctl.yml</code>, enforced inside Claude Code, Codex, and Cursor
                at tool-call time — and again as a hard gate in CI. Not prompt text. Not a vendor denylist.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-bg-elevated px-4 py-3 font-mono text-sm text-fg-primary">
                  <span className="text-fg-muted">$</span> npm i -g @policyctl/cli
                  <button
                    onClick={() => navigator.clipboard.writeText("npm i -g @policyctl/cli")}
                    className="ml-2 text-brand hover:text-brand-hover"
                    aria-label="Copy install command"
                  >
                    copy
                  </button>
                </span>
                <Link to="/docs" className="text-fg-secondary hover:text-brand text-sm font-medium flex items-center gap-1">
                  Read the docs <ArrowRight className="size-4" />
                </Link>
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm text-fg-muted">
                <span className="flex items-center gap-1"><Check className="size-4 text-success" /> Free</span>
                <span className="flex items-center gap-1"><Check className="size-4 text-success" /> MIT</span>
                <span className="flex items-center gap-1"><Check className="size-4 text-success" /> Local-first</span>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-bg-elevated/80 p-0 shadow-2xl backdrop-blur-sm">
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <span className="size-3 rounded-full bg-danger/80" />
                <span className="size-3 rounded-full bg-warning/80" />
                <span className="size-3 rounded-full bg-success/80" />
                <span className="ml-2 font-mono text-xs text-fg-muted">policyctl check</span>
              </div>
              <pre className="overflow-x-auto p-5 font-mono text-[0.82rem] leading-relaxed text-fg-secondary">
{`$ policyctl check --from main

✓ PASS  no-secrets-in-commits     no secret patterns detected
⚠ WARN  tests-for-source          src/auth.ts changed without a test
✗ FAIL  migrations-via-generator  db/migrations/0004.sql lacks
                                    generator signature

2 blocking · 1 warning — build stopped`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Stats — asymmetric bento style */}
      <section className="mx-auto max-w-content px-6 pb-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { value: "12", label: "CLI commands", icon: Cpu },
            { value: "3", label: "agent providers", icon: GitBranch },
            { value: "8", label: "rule matchers", icon: ShieldCheck },
            { value: "∞", label: "custom rules", icon: Sparkles },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.label} className="rounded-xl border border-border bg-bg-surface p-6 text-center hover:border-brand/30 transition-colors">
                <Icon className="mx-auto size-5 text-brand" />
                <div className="mt-3 font-display text-3xl font-bold text-brand">{s.value}</div>
                <div className="mt-1 text-xs text-fg-muted">{s.label}</div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* How it works — numbered cards with code */}
      <section id="how" className="mx-auto max-w-content px-6 py-20">
        <SectionHead eyebrow="How it works" title="Three commands. One file. No backend required." lede="The CLI is local-first and offline. The hosted control plane (optional) adds cross-repo policy versioning and an audit trail." />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { n: "01", t: "Scaffold", d: "Start from a template that encodes procedural rules, not opinions.", c: "policyctl init --template full", icon: Database },
            { n: "02", t: "Generate hooks", d: "Write the exact glue for each provider — no hand-rolled per-model plugin.", c: "policyctl gen claude\npolicyctl gen codex\npolicyctl gen cursor", icon: GitBranch },
            { n: "03", t: "Gate the diff", d: "Fail CI on violations and stream them to the dashboard feed.", c: "policyctl check\npolicyctl check --report", icon: Lock },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.t} className="group rounded-xl border border-border bg-bg-surface p-6 hover:border-brand/30 transition-all hover:shadow-lg hover:shadow-brand/5">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand font-display font-bold">{s.n}</div>
                  <Icon className="size-5 text-fg-muted" />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold text-fg-primary">{s.t}</h3>
                <p className="mt-2 text-sm text-fg-secondary">{s.d}</p>
                <CodeBlock code={s.c} lang="bash" className="mt-5" />
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* One file → three agents — visual flow */}
      <section className="mx-auto max-w-content px-6 py-16">
        <SectionHead eyebrow="The thesis" title="One policy file. Every agent." lede="Encode a rule once. policyctl generates the hook for each provider and enforces the same engine in CI." />
        <Reveal className="mt-10 rounded-xl border border-border bg-bg-surface p-8 lg:p-12">
          <div className="flex flex-col items-center gap-6 lg:flex-row lg:justify-center lg:gap-8">
            <div className="rounded-lg border border-brand/40 bg-brand/10 px-6 py-4 text-center font-mono text-sm text-brand font-semibold">
              .policyctl.yml
            </div>
            <ArrowRight className="size-6 text-fg-muted rotate-90 lg:rotate-0" />
            <div className="flex flex-wrap items-center justify-center gap-4">
              {["Claude Code", "Codex", "Cursor"].map((name) => (
                <div key={name} className="rounded-lg border border-border bg-bg-elevated px-5 py-3 text-sm text-fg-primary font-medium">
                  {name}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* Hard vs soft — comparison cards */}
      <section id="enforce" className="mx-auto max-w-content px-6 py-16">
        <SectionHead eyebrow="What you can enforce" title="Encode the rules prompts can't." lede="Prompt files are advisory and get ignored. policyctl is deterministic — at hook time and in CI." />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Reveal className="rounded-xl border border-danger/30 bg-danger/5 p-6">
            <div className="flex items-center gap-2 font-semibold text-danger"><X className="size-5" /> Soft guardrails (prompt files)</div>
            <ul className="mt-4 space-y-3 text-sm text-fg-secondary">
              <li className="flex gap-2"><span className="text-danger">✗</span> CLAUDE.md, .cursorrules — suggestions agents skip</li>
              <li className="flex gap-2"><span className="text-danger">✗</span> Over-specified rule files get ignored</li>
              <li className="flex gap-2"><span className="text-danger">✗</span> No state survives a context reset</li>
              <li className="flex gap-2"><span className="text-danger">✗</span> Vendor-locked: one file per agent</li>
            </ul>
          </Reveal>
          <Reveal className="rounded-xl border border-brand/30 bg-brand/5 p-6">
            <div className="flex items-center gap-2 font-semibold text-brand"><Check className="size-5" /> policyctl (deterministic)</div>
            <ul className="mt-4 space-y-3 text-sm text-fg-secondary">
              <li className="flex gap-2"><span className="text-success">✓</span> Hard block at tool-call time (hook)</li>
              <li className="flex gap-2"><span className="text-success">✓</span> Hard gate in CI — build stops</li>
              <li className="flex gap-2"><span className="text-success">✓</span> One engine, every provider</li>
              <li className="flex gap-2"><span className="text-success">✓</span> Audit trail + live session feed</li>
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Feature grid — bento with varied sizes */}
      <section className="mx-auto max-w-content px-6 py-16">
        <SectionHead eyebrow="Capabilities" title="Everything you can enforce." />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ShieldCheck, t: "Migrations via generator", d: "Block migrations lacking the generator signature — hook + CI.", tag: "block · both" },
            { icon: Database, t: "No protected edits", d: "Prevent agents touching README, package.json, or any path.", tag: "block · hook" },
            { icon: Cpu, t: "No secrets in commits", d: "Regex-detect AWS/GitHub/OpenAI keys, then fail the build.", tag: "fail · ci" },
            { icon: GitBranch, t: "Tests for source", d: "Warn when a src/ change ships without a matching test.", tag: "warn · ci" },
            { icon: Eye, t: "Live enforcement sessions", d: "Stream agent tool calls; kill a session on violation.", tag: "realtime" },
            { icon: Sparkles, t: "AI rule author", d: "Describe a rule in plain English; get a typed policy.", tag: "paid" },
            { icon: FileBarChart, t: "Daily compliance report", d: "Per-repo posture delivered to your inbox at 9am UTC.", tag: "paid" },
            { icon: Zap, t: "Allowlisted exceptions", d: "Reviewed exceptions that don't weaken the policy.", tag: "core" },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <Reveal key={f.t} className="rounded-xl border border-border bg-bg-surface p-5 hover:border-brand/30 transition-colors">
                <div className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand"><Icon className="size-5" /></div>
                <h3 className="mt-4 font-display text-base font-semibold text-fg-primary">{f.t}</h3>
                <p className="mt-1.5 text-sm text-fg-secondary">{f.d}</p>
                <Badge tone="muted" className="mt-4">{f.tag}</Badge>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Social proof — quote + logos */}
      <section className="mx-auto max-w-content px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] items-center">
          <Reveal>
            <Quote className="size-8 text-brand/40" />
            <p className="mt-4 text-xl leading-relaxed text-fg-primary font-display">
              "We encode 'migrations only via CLI codegen' once and it's enforced in Claude, Codex, and CI. The audit trail alone is worth it."
            </p>
            <p className="mt-4 font-mono text-sm text-fg-muted">&mdash; Staff Engineer, infra platform team (early access)</p>
          </Reveal>
          <Reveal>
            <p className="text-sm font-mono uppercase tracking-wider text-fg-muted mb-4">Trusted in production with</p>
            <div className="flex flex-wrap gap-4">
              {["Claude Code", "Codex", "Cursor", "D1", "Workers AI", "Durable Objects"].map((name) => (
                <span key={name} className="rounded-pill border border-border bg-bg-surface px-4 py-2 text-sm text-fg-secondary font-medium">
                  {name}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-content px-6 py-16">
        <SectionHead eyebrow="Pricing" title="Free CLI. Paid control plane." lede="The CLI is free forever and complete on its own. The hosted control plane adds cross-repo versioning, AI, and reports." />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Reveal className="rounded-xl border border-border bg-bg-surface p-8">
            <div className="font-display text-xl font-semibold text-fg-primary">CLI</div>
            <div className="mt-3 font-display text-4xl font-bold text-fg-primary">$0<span className="text-lg text-fg-muted font-normal"> / forever</span></div>
            <ul className="mt-6 space-y-3 text-sm text-fg-secondary">
              <li className="flex gap-2"><Check className="size-5 text-success shrink-0" /> All 12 commands, local-first</li>
              <li className="flex gap-2"><Check className="size-5 text-success shrink-0" /> Hooks for Claude / Codex / Cursor</li>
              <li className="flex gap-2"><Check className="size-5 text-success shrink-0" /> CI gate + 8 matchers</li>
              <li className="flex gap-2"><Check className="size-5 text-success shrink-0" /> MIT licensed</li>
            </ul>
            <Link to="/docs" className="mt-8 block"><Button variant="outline" className="w-full">Read the docs</Button></Link>
          </Reveal>
          <Reveal className="rounded-xl border border-brand/40 bg-brand/5 p-8 relative overflow-hidden">
            <div className="absolute top-4 right-4"><Badge tone="brand">Paid</Badge></div>
            <div className="font-display text-xl font-semibold text-fg-primary">Control plane</div>
            <div className="mt-3 font-display text-4xl font-bold text-fg-primary">Usage-based</div>
            <ul className="mt-6 space-y-3 text-sm text-fg-secondary">
              <li className="flex gap-2"><Check className="size-5 text-brand shrink-0" /> Cross-repo policy versioning</li>
              <li className="flex gap-2"><Check className="size-5 text-brand shrink-0" /> Live enforcement sessions</li>
              <li className="flex gap-2"><Check className="size-5 text-brand shrink-0" /> AI rule author + analyzer</li>
              <li className="flex gap-2"><Check className="size-5 text-brand shrink-0" /> Daily compliance reports</li>
            </ul>
            <Link to="/signup" className="mt-8 block"><Button className="w-full">Start free trial</Button></Link>
          </Reveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-content px-6 py-20">
        <Reveal className="rounded-2xl border border-border bg-gradient-to-br from-bg-surface to-bg-elevated p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.06)_0%,transparent_70%)]" />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl text-fg-primary">Stop shipping agent accidents.</h2>
            <p className="mx-auto mt-4 max-w-lg text-fg-secondary">One file, every agent, every repo. The CLI is free forever.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a href="https://www.npmjs.com/package/@policyctl/cli" target="_blank" rel="noreferrer"><Button size="lg">Install policyctl</Button></a>
              <Link to="/docs"><Button size="lg" variant="ghost">Read the docs</Button></Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-content px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2 text-fg-primary">
              <span className="text-brand text-lg">◆</span>
              <span className="font-display font-semibold">policyctl</span>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm text-fg-muted">
              <Link to="/docs" className="hover:text-fg-primary transition-colors">Docs</Link>
              <a href="https://github.com/RavaniRoshan/policyctl" target="_blank" rel="noreferrer" className="hover:text-fg-primary transition-colors">GitHub</a>
              <a href="https://www.npmjs.com/package/@policyctl/cli" target="_blank" rel="noreferrer" className="hover:text-fg-primary transition-colors">npm</a>
            </div>
            <div className="text-sm text-fg-muted">MIT License &middot; 2026</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
