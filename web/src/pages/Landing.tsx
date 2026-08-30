import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { GradientWave } from "@/components/ui/gradient-wave";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { useReveal } from "@/lib/use-reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";
import {
  ShieldCheck, Database, Sparkles, FileBarChart, GitBranch, Cpu,
  Check, X, Quote, ArrowRight,
} from "lucide-react";

/** Safe reveal-on-scroll wrapper (hook lives at component top level). */
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
        <div className="font-mono text-xs uppercase tracking-[0.16em] text-pc-400">{eyebrow}</div>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
        {lede && <p className="mt-3 text-n-300 leading-relaxed">{lede}</p>}
      </div>
    </Reveal>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-n-800 bg-n-900/70 p-6 text-center">
      <div className="font-display text-3xl font-bold text-pc-300">{value}</div>
      <div className="mt-1 text-xs text-n-400">{label}</div>
    </div>
  );
}

export function Landing() {
  return (
    <div className="pc-mesh min-h-screen">
      <MarketingNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <GradientWave
            colors={["#34d399", "#F59E0B", "#2dd4bf", "#f59e0b", "#a7f3d0", "#0ea5e9"]}
            darkenTop
            shadowPower={6}
            noiseSpeed={0.00001}
            noiseFrequency={[0.0001, 0.0009]}
            deform={{ incline: 0.4, noiseAmp: 260, noiseFlow: 5 }}
          />
        </div>
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(7,10,9,.15) 0%, rgba(7,10,9,.05) 40%, rgba(7,10,9,.08) 70%, rgba(7,10,9,.35) 100%)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-content px-6 pt-20 pb-16 sm:pt-28">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-pill border border-pc-700/50 bg-pc-500/10 px-3 py-1 font-mono text-xs text-pc-300">
                <span className="size-1.5 rounded-full bg-pc-400 shadow-glow" />
                Provider-agnostic policy runtime
              </span>
              <h1
                className="mt-5 font-display text-5xl font-semibold leading-[1.04] tracking-tight text-white sm:text-6xl"
                style={{ textShadow: "0 1px 14px rgba(7,10,9,.55)" }}
              >
                Make your coding agents <span className="bg-gradient-to-r from-pc-300 to-ac-400 bg-clip-text text-transparent">obey the rules.</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-n-100" style={{ textShadow: "0 1px 10px rgba(7,10,9,.5)" }}>
                One <code className="font-mono text-pc-200">.policyctl.yml</code>, enforced inside Claude Code, Codex, and Cursor
                at tool-call time — and again as a hard gate in CI. Not prompt text. Not a vendor denylist.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-md border border-n-700 bg-n-1000 px-4 py-2.5 font-mono text-sm text-n-100">
                  <span className="text-n-500">$</span> npm i -g @policyctl/cli
                  <button
                    onClick={() => navigator.clipboard.writeText("npm i -g @policyctl/cli")}
                    className="ml-2 text-pc-300 hover:text-pc-200"
                    aria-label="Copy install command"
                  >
                    copy
                  </button>
                </span>
                <Link to="/docs" className="text-n-200 hover:text-pc-300 text-sm font-medium">Read the docs →</Link>
              </div>
              <div className="mt-4 text-xs text-n-300">Free · MIT · local-first · optional hosted control plane</div>
            </div>

            <div className="rounded-lg border border-n-800 bg-n-1000/85 p-0 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-2 border-b border-n-800 px-4 py-2.5">
                <span className="size-3 rounded-full bg-[#ff5f57]" />
                <span className="size-3 rounded-full bg-[#febc2e]" />
                <span className="size-3 rounded-full bg-[#28c840]" />
                <span className="ml-2 font-mono text-xs text-n-500">policyctl check</span>
              </div>
              <pre className="overflow-x-auto p-4 font-mono text-[0.82rem] leading-relaxed text-n-200">
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

      {/* Stats */}
      <section className="mx-auto max-w-content px-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat value="12" label="CLI commands" />
          <Stat value="3" label="agent providers" />
          <Stat value="8" label="rule matchers" />
          <Stat value="∞" label="custom rules" />
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-content px-6 py-20">
        <SectionHead eyebrow="How it works" title="Three commands. One file. No backend required." lede="The CLI is local-first and offline. The hosted control plane (optional) adds cross-repo policy versioning and an audit trail." />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { n: "01 · INIT", t: "Scaffold", d: "Start from a template that encodes procedural rules, not opinions.", c: "policyctl init --template full" },
            { n: "02 · WIRE", t: "Generate hooks", d: "Write the exact glue for each provider — no hand-rolled per-model plugin.", c: "policyctl gen claude\npolicyctl gen codex\npolicyctl gen cursor" },
            { n: "03 · CHECK", t: "Gate the diff", d: "Fail CI on violations and stream them to the dashboard feed.", c: "policyctl check\npolicyctl check --report" },
          ].map((s) => (
            <Reveal key={s.t} className="rounded-lg border border-n-800 bg-n-900/70 p-5">
              <div className="font-mono text-xs text-pc-400">{s.n}</div>
              <h3 className="mt-3 font-display text-lg font-semibold">{s.t}</h3>
              <p className="mt-1 text-sm text-n-400">{s.d}</p>
              <CodeBlock code={s.c} lang="bash" className="mt-4" />
            </Reveal>
          ))}
        </div>
      </section>

      {/* One file → three agents */}
      <section className="mx-auto max-w-content px-6 py-12">
        <SectionHead eyebrow="The thesis" title="One policy file. Every agent." lede="Encode a rule once. policyctl generates the hook for each provider and enforces the same engine in CI." />
        <Reveal className="mt-8 grid items-center gap-6 rounded-lg border border-n-800 bg-n-900/70 p-8 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          <FileChip name=".policyctl.yml" />
          <ArrowRight className="hidden md:block size-5 text-pc-400" />
          <AgentChip name="Claude Code" />
          <ArrowRight className="hidden md:block size-5 text-pc-400" />
          <AgentChip name="Codex" />
          <ArrowRight className="hidden md:block size-5 text-pc-400" />
          <AgentChip name="Cursor" />
        </Reveal>
      </section>

      {/* Hard vs soft */}
      <section id="enforce" className="mx-auto max-w-content px-6 py-12">
        <SectionHead eyebrow="What you can enforce" title="Encode the rules prompts can't." lede="Prompt files are advisory and get ignored. policyctl is deterministic — at hook time and in CI." />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Reveal className="rounded-lg border border-danger/30 bg-danger/5 p-6">
            <div className="flex items-center gap-2 font-semibold text-danger"><X className="size-4" /> Soft guardrails (prompt files)</div>
            <ul className="mt-3 space-y-2 text-sm text-n-300">
              <li>CLAUDE.md, .cursorrules — suggestions agents skip</li>
              <li>Over-specified rule files get ignored</li>
              <li>No state survives a context reset</li>
              <li>Vendor-locked: one file per agent</li>
            </ul>
          </Reveal>
          <Reveal className="rounded-lg border border-pc-700/50 bg-pc-500/5 p-6">
            <div className="flex items-center gap-2 font-semibold text-pc-300"><Check className="size-4" /> policyctl (deterministic)</div>
            <ul className="mt-3 space-y-2 text-sm text-n-300">
              <li>Hard block at tool-call time (hook)</li>
              <li>Hard gate in CI — build stops</li>
              <li>One engine, every provider</li>
              <li>Audit trail + live session feed</li>
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Feature grid */}
      <section className="mx-auto max-w-content px-6 py-12">
        <SectionHead eyebrow="Capabilities" title="Everything you can enforce." />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ShieldCheck, t: "Migrations via generator", d: "Block migrations lacking the generator signature — hook + CI.", tag: "block · both" },
            { icon: Database, t: "No protected edits", d: "Prevent agents touching README, package.json, or any path.", tag: "block · hook" },
            { icon: Cpu, t: "No secrets in commits", d: "Regex-detect AWS/GitHub/OpenAI keys, then fail the build.", tag: "fail · ci" },
            { icon: GitBranch, t: "Tests for source", d: "Warn when a src/ change ships without a matching test.", tag: "warn · ci" },
            { icon: Cpu, t: "Live enforcement sessions", d: "Stream agent tool calls; kill a session on violation.", tag: "realtime" },
            { icon: Sparkles, t: "AI rule author", d: "Describe a rule in plain English; get a typed policy.", tag: "paid" },
            { icon: FileBarChart, t: "Daily compliance report", d: "Per-repo posture delivered to your inbox at 9am UTC.", tag: "paid" },
            { icon: Check, t: "Allowlisted exceptions", d: "Reviewed exceptions that don't weaken the policy.", tag: "core" },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <Reveal key={f.t} className="rounded-lg border border-n-800 bg-n-900/70 p-5">
                <div className="flex size-9 items-center justify-center rounded-md bg-pc-500/10 text-pc-300"><Icon className="size-4" /></div>
                <h3 className="mt-3 font-display text-base font-semibold">{f.t}</h3>
                <p className="mt-1 text-sm text-n-400">{f.d}</p>
                <Badge tone="muted" className="mt-3">{f.tag}</Badge>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Without losing control */}
      <section className="mx-auto max-w-content px-6 py-12">
        <Reveal className="rounded-lg border border-n-800 bg-gradient-to-br from-n-900 to-n-1000 p-10 text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Move fast with agents — without losing control.</h2>
          <p className="mx-auto mt-3 max-w-xl text-n-300">The market's dominant anxiety is agents shipping broken code. policyctl is the deterministic answer: the same rule, every agent, every repo.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/signup"><Button size="lg">Get started free</Button></Link>
            <a href="https://github.com/RavaniRoshan/policyctl" target="_blank" rel="noreferrer"><Button size="lg" variant="ghost">Star on GitHub</Button></a>
          </div>
        </Reveal>
      </section>

      {/* Social proof */}
      <section className="mx-auto max-w-content px-6 py-12">
        <SectionHead eyebrow="Trusted by" title="Built for staff engineers running mixed-agent stacks." />
        <Reveal className="mt-8 rounded-lg border border-n-800 bg-n-900/70 p-8">
          <Quote className="size-6 text-pc-400" />
          <p className="mt-3 text-lg leading-relaxed text-n-100">
            "We encode 'migrations only via CLI codegen' once and it's enforced in Claude, Codex, and CI. The audit trail alone is worth it."
          </p>
          <p className="mt-3 font-mono text-xs text-n-500">— Staff Engineer, infra platform team (early access)</p>
        </Reveal>
        <div className="mt-6 flex flex-wrap items-center gap-6 text-n-500 font-mono text-sm">
          <span>Claude Code</span><span>Codex</span><span>Cursor</span><span>D1</span><span>R2</span><span>Workers AI</span>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-content px-6 py-12">
        <SectionHead eyebrow="Pricing" title="Free CLI. Paid control plane." lede="The CLI is free forever and complete on its own. The hosted control plane adds cross-repo versioning, AI, and reports." />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Reveal className="rounded-lg border border-n-800 bg-n-900/70 p-6">
            <div className="font-display text-lg font-semibold">CLI</div>
            <div className="mt-2 font-display text-3xl font-bold">$0<span className="text-base text-n-400 font-normal"> / forever</span></div>
            <ul className="mt-4 space-y-2 text-sm text-n-300">
              <li className="flex gap-2"><Check className="size-4 text-pc-400" /> All 12 commands, local-first</li>
              <li className="flex gap-2"><Check className="size-4 text-pc-400" /> Hooks for Claude / Codex / Cursor</li>
              <li className="flex gap-2"><Check className="size-4 text-pc-400" /> CI gate + 8 matchers</li>
              <li className="flex gap-2"><Check className="size-4 text-pc-400" /> MIT licensed</li>
            </ul>
            <Link to="/docs" className="mt-5 block"><Button variant="outline" className="w-full">Read the docs</Button></Link>
          </Reveal>
          <Reveal className="rounded-lg border border-pc-700/60 bg-pc-500/5 p-6">
            <div className="flex items-center justify-between">
              <div className="font-display text-lg font-semibold">Control plane</div>
              <Badge tone="pc">Paid</Badge>
            </div>
            <div className="mt-2 font-display text-3xl font-bold">Usage-based</div>
            <ul className="mt-4 space-y-2 text-sm text-n-300">
              <li className="flex gap-2"><Check className="size-4 text-pc-400" /> Cross-repo policy versioning</li>
              <li className="flex gap-2"><Check className="size-4 text-pc-400" /> Live enforcement sessions</li>
              <li className="flex gap-2"><Check className="size-4 text-pc-400" /> AI rule author + analyzer</li>
              <li className="flex gap-2"><Check className="size-4 text-pc-400" /> Daily compliance reports</li>
            </ul>
            <Link to="/signup" className="mt-5 block"><Button className="w-full">Start free trial</Button></Link>
          </Reveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-content px-6 py-16">
        <Reveal className="rounded-lg border border-n-800 bg-n-900/70 p-10 text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Stop shipping agent accidents.</h2>
          <p className="mt-3 text-n-300">One file, every agent, every repo. The CLI is free forever.</p>
          <div className="mt-6 flex justify-center gap-3">
            <a href="https://www.npmjs.com/package/@policyctl/cli" target="_blank" rel="noreferrer"><Button size="lg">Install policyctl</Button></a>
            <Link to="/docs"><Button size="lg" variant="ghost">Read the docs</Button></Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

function FileChip({ name }: { name: string }) {
  return (
    <div className="rounded-md border border-pc-700/50 bg-pc-500/10 px-4 py-3 text-center font-mono text-sm text-pc-200">
      {name}
    </div>
  );
}
function AgentChip({ name }: { name: string }) {
  return (
    <div className="rounded-md border border-n-800 bg-n-900 px-4 py-3 text-center text-sm text-n-100">
      {name}
    </div>
  );
}
