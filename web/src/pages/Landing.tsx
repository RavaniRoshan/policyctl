import { Link } from "react-router-dom";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";
import { useTheme } from "@/lib/theme";
import {
  ShieldCheck, Database, Sparkles, FileBarChart, GitBranch, Cpu,
  Check, ChevronDown, ChevronUp, Zap, Lock, Eye,
} from "lucide-react";
import { useState } from "react";

export function Landing() {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-bg-primary">
      <MarketingNav />

      {/* Hero — split screen */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(35,131,226,0.04)_0%,transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(0,112,243,0.06)_0%,transparent_50%)]" />
        <div className="relative mx-auto max-w-content px-6 py-20 sm:py-28 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Badge tone="brand" className="mb-6">Provider-agnostic policy runtime</Badge>
              <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-fg-primary sm:text-5xl lg:text-6xl">
                Make your coding agents <span className="text-brand">obey the rules.</span>
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-fg-secondary">
                One <code className="font-mono text-sm bg-bg-surface px-1.5 py-0.5 rounded-md text-fg-primary">.policyctl.yml</code>, enforced inside Claude Code, Codex, and Cursor at tool-call time, and again as a hard gate in CI.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link to="/signup">
                  <Button size="lg" className="h-12 px-6">Get started free</Button>
                </Link>
                <Link to="/docs">
                  <Button size="lg" variant="ghost" className="h-12 px-6">Read the docs</Button>
                </Link>
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm text-fg-muted">
                <span className="flex items-center gap-1"><Check className="size-4 text-success" /> Free CLI</span>
                <span className="flex items-center gap-1"><Check className="size-4 text-success" /> MIT licensed</span>
                <span className="flex items-center gap-1"><Check className="size-4 text-success" /> Local-first</span>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-bg-elevated p-0 shadow-md">
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <span className="size-3 rounded-full bg-danger/70" />
                <span className="size-3 rounded-full bg-warning/70" />
                <span className="size-3 rounded-full bg-success/70" />
                <span className="ml-2 font-mono text-xs text-fg-muted">policyctl check</span>
              </div>
              <pre className="overflow-x-auto p-5 font-mono text-sm leading-relaxed text-fg-secondary">
{`$ policyctl check --from main

✓ PASS  no-secrets-in-commits
⚠ WARN  tests-for-source
✗ FAIL  migrations-via-generator

2 blocking · 1 warning`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Trust logos */}
      <section className="border-b border-border py-12">
        <div className="mx-auto max-w-content px-6">
          <p className="text-center text-sm font-medium text-fg-muted mb-8">Works with the tools you already use</p>
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12">
            {["Claude Code", "Codex", "Cursor", "GitHub Actions", "D1", "Workers AI"].map((name) => (
              <span key={name} className="text-base font-medium text-fg-muted">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features — bento grid */}
      <section id="features" className="border-b border-border py-20 sm:py-28">
        <div className="mx-auto max-w-content px-6">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold tracking-tight text-fg-primary sm:text-4xl">Everything you can enforce.</h2>
            <p className="mt-4 text-lg text-fg-secondary">Encode procedural rules once. policyctl generates the hook for each provider and enforces the same engine in CI.</p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "Migrations via generator", desc: "Block migrations lacking the generator signature, at hook time and in CI." },
              { icon: Database, title: "No protected edits", desc: "Prevent agents touching README, package.json, or any path you define." },
              { icon: Cpu, title: "No secrets in commits", desc: "Regex-detect AWS, GitHub, OpenAI keys, then fail the build." },
              { icon: GitBranch, title: "Tests for source", desc: "Warn when a src/ change ships without a matching test file." },
              { icon: Eye, title: "Live enforcement sessions", desc: "Stream agent tool calls and kill a session on violation." },
              { icon: Sparkles, title: "AI rule author", desc: "Describe a rule in plain English and get a typed policy back." },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="rounded-xl border border-border bg-bg-elevated p-6 hover:border-brand/30 transition-colors">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-4 font-display text-base font-semibold text-fg-primary">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-fg-secondary">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison — side by side */}
      <section className="border-b border-border py-20 sm:py-28">
        <div className="mx-auto max-w-content px-6">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold tracking-tight text-fg-primary sm:text-4xl">Prompt files are advisory.</h2>
            <p className="mt-4 text-lg text-fg-secondary">policyctl is deterministic. The same rule, every agent, every repo.</p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-danger/30 bg-danger/5 p-6">
              <div className="flex items-center gap-2 font-semibold text-danger">
                <span className="size-5 rounded-full bg-danger/20 flex items-center justify-center text-xs">✕</span>
                Soft guardrails (prompt files)
              </div>
              <ul className="mt-4 space-y-3 text-sm text-fg-secondary">
                <li className="flex gap-2"><span className="text-danger">✗</span> CLAUDE.md, .cursorrules — suggestions agents skip</li>
                <li className="flex gap-2"><span className="text-danger">✗</span> No state survives a context reset</li>
                <li className="flex gap-2"><span className="text-danger">✗</span> Vendor-locked: one file per agent</li>
              </ul>
            </div>
            <div className="rounded-xl border border-success/30 bg-success/5 p-6">
              <div className="flex items-center gap-2 font-semibold text-success">
                <span className="size-5 rounded-full bg-success/20 flex items-center justify-center text-xs">✓</span>
                policyctl (deterministic)
              </div>
              <ul className="mt-4 space-y-3 text-sm text-fg-secondary">
                <li className="flex gap-2"><span className="text-success">✓</span> Hard block at tool-call time (hook)</li>
                <li className="flex gap-2"><span className="text-success">✓</span> Hard gate in CI — build stops</li>
                <li className="flex gap-2"><span className="text-success">✓</span> Audit trail + live session feed</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial — full width */}
      <section className="border-b border-border py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-lg leading-relaxed text-fg-primary">
            "We encode 'migrations only via CLI codegen' once and it's enforced in Claude, Codex, and CI."
          </p>
          <p className="mt-4 text-sm text-fg-muted">Staff Engineer, infrastructure platform team</p>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-b border-border py-20 sm:py-28">
        <div className="mx-auto max-w-content px-6">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold tracking-tight text-fg-primary sm:text-4xl">Free CLI. Paid control plane.</h2>
            <p className="mt-4 text-lg text-fg-secondary">The CLI is free forever and complete on its own. The hosted control plane adds cross-repo versioning, AI, and reports.</p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-bg-elevated p-8">
              <div className="font-display text-xl font-semibold text-fg-primary">CLI</div>
              <div className="mt-3 font-display text-4xl font-bold text-fg-primary">$0<span className="text-lg text-fg-muted font-normal"> / forever</span></div>
              <ul className="mt-6 space-y-3 text-sm text-fg-secondary">
                <li className="flex gap-2"><Check className="size-5 text-success shrink-0" /> All 12 commands, local-first</li>
                <li className="flex gap-2"><Check className="size-5 text-success shrink-0" /> Hooks for Claude, Codex, Cursor</li>
                <li className="flex gap-2"><Check className="size-5 text-success shrink-0" /> CI gate + 8 matchers</li>
                <li className="flex gap-2"><Check className="size-5 text-success shrink-0" /> MIT licensed</li>
              </ul>
              <Link to="/docs" className="mt-8 block">
                <Button variant="outline" className="w-full">Read the docs</Button>
              </Link>
            </div>
            <div className="rounded-xl border border-brand/30 bg-brand/5 p-8 relative">
              <div className="absolute top-4 right-4"><Badge tone="brand">Paid</Badge></div>
              <div className="font-display text-xl font-semibold text-fg-primary">Control plane</div>
              <div className="mt-3 font-display text-4xl font-bold text-fg-primary">Usage-based</div>
              <ul className="mt-6 space-y-3 text-sm text-fg-secondary">
                <li className="flex gap-2"><Check className="size-5 text-brand shrink-0" /> Cross-repo policy versioning</li>
                <li className="flex gap-2"><Check className="size-5 text-brand shrink-0" /> Live enforcement sessions</li>
                <li className="flex gap-2"><Check className="size-5 text-brand shrink-0" /> AI rule author + analyzer</li>
                <li className="flex gap-2"><Check className="size-5 text-brand shrink-0" /> Daily compliance reports</li>
              </ul>
              <Link to="/signup" className="mt-8 block">
                <Button className="w-full">Start free trial</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-border py-20 sm:py-28">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="font-display text-3xl font-bold tracking-tight text-fg-primary text-center">Frequently asked questions</h2>
          <div className="mt-10 space-y-0 divide-y divide-border">
            {[
              { q: "What is policyctl?", a: "A provider-agnostic policy runtime for coding AI agents. You write one .policyctl.yml file and it enforces rules inside Claude Code, Codex, Cursor, and CI." },
              { q: "Is the CLI really free?", a: "Yes. All 12 commands, the hook engine, and the CI gate are free and MIT-licensed. The hosted control plane (dashboard, versioning, AI) is the paid tier." },
              { q: "How does it work with Claude Code?", a: "Run policyctl gen claude to generate a hook. The hook calls policyctl eval --hook at tool-call time, blocking violations before they happen." },
              { q: "Can I try the control plane for free?", a: "Yes. The control plane has a free tier so you can try policy versioning, live sessions, and AI rule authoring before committing." },
            ].map((item) => (
              <FAQItem key={item.q} question={item.q} answer={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-fg-primary sm:text-4xl">Stop shipping agent accidents.</h2>
          <p className="mt-4 text-lg text-fg-secondary">One file, every agent, every repo. The CLI is free forever.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/signup"><Button size="lg" className="h-12 px-6">Get started free</Button></Link>
            <Link to="/docs"><Button size="lg" variant="ghost" className="h-12 px-6">Read the docs</Button></Link>
          </div>
        </div>
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
            <div className="text-sm text-fg-muted">MIT License</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="py-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="font-medium text-fg-primary">{question}</span>
        {open ? <ChevronUp className="size-5 text-fg-muted shrink-0" /> : <ChevronDown className="size-5 text-fg-muted shrink-0" />}
      </button>
      {open && <p className="mt-3 text-sm leading-relaxed text-fg-secondary">{answer}</p>}
    </div>
  );
}
