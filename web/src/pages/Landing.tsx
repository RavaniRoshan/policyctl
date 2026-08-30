import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, ShieldCheck, Database, Sparkle, GitBranch, Cpu, Eye, Check, Lock, ChartBar } from "@phosphor-icons/react";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";
import { DoppelCard } from "@/components/ui/card";
import { ProductMockup } from "@/components/ui/marks";

const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

export function Landing() {
  return (
    <div className="min-h-screen bg-bg-primary selection:bg-brand/20">
      <MarketingNav />

      {/* Hero — massive typography + radial mesh gradient */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Radial mesh gradient background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-brand/[0.03] blur-[120px]" />
          <div className="absolute right-0 top-1/4 h-[400px] w-[400px] rounded-full bg-accent-warm/[0.02] blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-content px-6 pt-24 pb-32 sm:pt-32 sm:pb-40">
          <motion.div variants={stagger} initial="hidden" animate="visible" className="mx-auto max-w-3xl text-center">
            <motion.div variants={fadeUp}>
              <Badge tone="brand" className="mb-8">Provider-agnostic policy runtime</Badge>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-sans text-5xl font-bold leading-[1.05] tracking-tight text-fg-primary sm:text-6xl lg:text-7xl"
            >
              Make your coding agents{" "}
              <span className="text-brand">obey the rules.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-fg-secondary">
              One <code className="font-mono text-sm bg-bg-subtle px-1.5 py-0.5 rounded-md text-fg-primary border border-border">.policyctl.yml</code>, enforced inside Claude Code, Codex, and Cursor at tool-call time, and again as a hard gate in CI.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" trailingIcon>Get started free</Button>
              </Link>
              <Link to="/docs">
                <Button size="lg" variant="ghost">Read the docs</Button>
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-6 flex items-center justify-center gap-6 text-sm text-fg-muted">
              <span className="flex items-center gap-1.5"><Check className="size-4 text-success" /> Free CLI</span>
              <span className="flex items-center gap-1.5"><Check className="size-4 text-success" /> MIT licensed</span>
              <span className="flex items-center gap-1.5"><Check className="size-4 text-success" /> Local-first</span>
            </motion.div>
          </motion.div>

          {/* Product mockup with Z-axis cascade */}
          <motion.div
            initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className="relative mx-auto mt-20 max-w-2xl"
          >
            <div className="absolute -left-12 -top-6 rotate-[-8deg] opacity-50 blur-[2px]">
              <div className="w-44 rounded-xl border border-border bg-bg-elevated p-3 shadow-md">
                <div className="font-mono text-[10px] text-fg-muted">$ policyctl init --template full</div>
              </div>
            </div>
            <div className="absolute -right-10 -top-4 rotate-[5deg] opacity-40 blur-[2px]">
              <div className="w-36 rounded-xl border border-border bg-bg-elevated p-3 shadow-md">
                <div className="font-mono text-[10px] text-fg-muted">$ policyctl gen claude</div>
              </div>
            </div>
            <ProductMockup className="relative z-10" />
          </motion.div>
        </div>
      </section>

      {/* Trust logos */}
      <section className="border-b border-border py-14">
        <div className="mx-auto max-w-content px-6">
          <p className="text-center text-sm font-medium text-fg-muted mb-10">Works with the tools you already use</p>
          <div className="flex flex-wrap items-center justify-center gap-10">
            {["Claude Code", "Codex", "Cursor", "GitHub Actions", "D1", "Workers AI"].map((name) => (
              <span key={name} className="text-base font-medium text-fg-muted">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features — Asymmetrical Bento Grid */}
      <section id="features" className="border-b border-border py-28 sm:py-40">
        <div className="mx-auto max-w-content px-6">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="max-w-2xl">
            <motion.div variants={fadeUp}>
              <Badge tone="warm" className="mb-6">Capabilities</Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} className="font-sans text-3xl font-bold tracking-tight text-fg-primary sm:text-4xl">
              Everything you can enforce.
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 text-lg text-fg-secondary">
              Encode procedural rules once. policyctl generates the hook for each provider and enforces the same engine in CI.
            </motion.p>
          </motion.div>

          {/* Bento grid — varying sizes */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {[
              { icon: ShieldCheck, title: "Migrations via generator", desc: "Block migrations lacking the generator signature, at hook time and in CI.", span: "col-span-2", tone: "brand" as const },
              { icon: Database, title: "No protected edits", desc: "Prevent agents touching README, package.json, or any path.", span: "col-span-1", tone: "warm" as const },
              { icon: Cpu, title: "No secrets in commits", desc: "Regex-detect AWS, GitHub, OpenAI keys, then fail the build.", span: "col-span-1", tone: "coral" as const },
              { icon: GitBranch, title: "Tests for source", desc: "Warn when a src/ change ships without a matching test.", span: "col-span-1", tone: "sky" as const },
              { icon: Eye, title: "Live enforcement sessions", desc: "Stream agent tool calls; kill a session on violation.", span: "col-span-1", tone: "brand" as const },
              { icon: Sparkle, title: "AI rule author", desc: "Describe a rule in plain English; get a typed policy.", span: "col-span-2", tone: "warm" as const },
              { icon: ChartBar, title: "Daily compliance report", desc: "Per-repo posture delivered to your inbox at 9am UTC.", span: "col-span-1", tone: "coral" as const },
              { icon: Lock, title: "Allowlisted exceptions", desc: "Reviewed exceptions that don't weaken the policy.", span: "col-span-1", tone: "sky" as const },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.title} variants={fadeUp} className={f.span}>
                  <DoppelCard className="h-full">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="mt-4 font-sans text-base font-semibold text-fg-primary">{f.title}</h3>
                    <p className="mt-2 text-sm text-fg-secondary">{f.desc}</p>
                    <Badge tone={f.tone} className="mt-4">{f.tone}</Badge>
                  </DoppelCard>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How it works — 3 steps */}
      <section className="border-b border-border py-28 sm:py-40">
        <div className="mx-auto max-w-content px-6">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="max-w-2xl">
            <motion.div variants={fadeUp}>
              <Badge tone="sky" className="mb-6">How it works</Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} className="font-sans text-3xl font-bold tracking-tight text-fg-primary sm:text-4xl">
              Three commands. One file. No backend required.
            </motion.h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="mt-16 grid gap-6 md:grid-cols-3"
          >
            {[
              { n: "01", t: "Scaffold", d: "Start from a template that encodes procedural rules, not opinions.", c: "policyctl init --template full" },
              { n: "02", t: "Generate hooks", d: "Write the exact glue for each provider.", c: "policyctl gen claude\npolicyctl gen codex\npolicyctl gen cursor" },
              { n: "03", t: "Gate the diff", d: "Fail CI on violations and stream them to the dashboard.", c: "policyctl check\npolicyctl check --report" },
            ].map((s) => (
              <motion.div key={s.t} variants={fadeUp}>
                <DoppelCard className="h-full">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand font-sans font-bold">{s.n}</div>
                  <h3 className="mt-4 font-sans text-xl font-semibold text-fg-primary">{s.t}</h3>
                  <p className="mt-2 text-sm text-fg-secondary">{s.d}</p>
                  <CodeBlock code={s.c} lang="bash" className="mt-5" />
                </DoppelCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Comparison */}
      <section className="border-b border-border py-28 sm:py-40">
        <div className="mx-auto max-w-content px-6">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="grid gap-6 lg:grid-cols-2">
            <motion.div variants={fadeUp}>
              <DoppelCard className="h-full border-danger/20">
                <div className="flex items-center gap-2 font-semibold text-danger">
                  <span className="size-5 rounded-full bg-danger/20 flex items-center justify-center text-xs">✕</span>
                  Soft guardrails (prompt files)
                </div>
                <ul className="mt-4 space-y-3 text-sm text-fg-secondary">
                  <li className="flex gap-2"><span className="text-danger">✗</span> CLAUDE.md, .cursorrules — suggestions agents skip</li>
                  <li className="flex gap-2"><span className="text-danger">✗</span> No state survives a context reset</li>
                  <li className="flex gap-2"><span className="text-danger">✗</span> Vendor-locked: one file per agent</li>
                </ul>
              </DoppelCard>
            </motion.div>
            <motion.div variants={fadeUp}>
              <DoppelCard className="h-full border-success/20">
                <div className="flex items-center gap-2 font-semibold text-success">
                  <span className="size-5 rounded-full bg-success/20 flex items-center justify-center text-xs">✓</span>
                  policyctl (deterministic)
                </div>
                <ul className="mt-4 space-y-3 text-sm text-fg-secondary">
                  <li className="flex gap-2"><span className="text-success">✓</span> Hard block at tool-call time (hook)</li>
                  <li className="flex gap-2"><span className="text-success">✓</span> Hard gate in CI — build stops</li>
                  <li className="flex gap-2"><span className="text-success">✓</span> Audit trail + live session feed</li>
                </ul>
              </DoppelCard>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Social proof */}
      <section className="border-b border-border py-28 sm:py-40">
        <div className="mx-auto max-w-content px-6">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="grid gap-12 lg:grid-cols-2 items-center">
            <motion.div variants={fadeUp}>
              <p className="text-lg leading-relaxed text-fg-primary">
                "We encode 'migrations only via CLI codegen' once and it's enforced in Claude, Codex, and CI."
              </p>
              <p className="mt-4 text-sm text-fg-muted">Staff Engineer, infrastructure platform team</p>
            </motion.div>
            <motion.div variants={fadeUp}>
              <p className="text-sm font-mono uppercase tracking-wider text-fg-muted mb-6">Trusted in production with</p>
              <div className="flex flex-wrap gap-3">
                {["Claude Code", "Codex", "Cursor", "D1", "Workers AI", "Durable Objects"].map((name) => (
                  <span key={name} className="rounded-full border border-border bg-bg-surface px-4 py-2 text-sm text-fg-secondary font-medium">{name}</span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-b border-border py-28 sm:py-40">
        <div className="mx-auto max-w-content px-6">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="max-w-2xl">
            <motion.div variants={fadeUp}>
              <Badge tone="coral" className="mb-6">Pricing</Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} className="font-sans text-3xl font-bold tracking-tight text-fg-primary sm:text-4xl">
              Free CLI. Paid control plane.
            </motion.h2>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="mt-16 grid gap-6 lg:grid-cols-2">
            <motion.div variants={fadeUp}>
              <DoppelCard className="h-full">
                <div className="font-sans text-xl font-semibold text-fg-primary">CLI</div>
                <div className="mt-3 font-sans text-4xl font-bold text-fg-primary">$0<span className="text-lg text-fg-muted font-normal"> / forever</span></div>
                <ul className="mt-6 space-y-3 text-sm text-fg-secondary">
                  <li className="flex gap-2"><Check className="size-5 text-success shrink-0" /> All 12 commands, local-first</li>
                  <li className="flex gap-2"><Check className="size-5 text-success shrink-0" /> Hooks for Claude, Codex, Cursor</li>
                  <li className="flex gap-2"><Check className="size-5 text-success shrink-0" /> CI gate + 8 matchers</li>
                </ul>
                <Link to="/docs" className="mt-8 block"><Button variant="outline" className="w-full">Read the docs</Button></Link>
              </DoppelCard>
            </motion.div>
            <motion.div variants={fadeUp}>
              <DoppelCard variant="glow" className="h-full border-brand/20">
                <div className="absolute top-4 right-4"><Badge tone="brand">Paid</Badge></div>
                <div className="font-sans text-xl font-semibold text-fg-primary">Control plane</div>
                <div className="mt-3 font-sans text-4xl font-bold text-fg-primary">Usage-based</div>
                <ul className="mt-6 space-y-3 text-sm text-fg-secondary">
                  <li className="flex gap-2"><Check className="size-5 text-brand shrink-0" /> Cross-repo policy versioning</li>
                  <li className="flex gap-2"><Check className="size-5 text-brand shrink-0" /> Live enforcement sessions</li>
                  <li className="flex gap-2"><Check className="size-5 text-brand shrink-0" /> AI rule author + analyzer</li>
                </ul>
                <Link to="/signup" className="mt-8 block"><Button className="w-full" trailingIcon>Start free trial</Button></Link>
              </DoppelCard>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-28 sm:py-40">
        <div className="mx-auto max-w-content px-6">
          <motion.div
            initial={{ opacity: 0, y: 32, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
            className="rounded-2xl border border-border bg-bg-elevated p-12 text-center"
          >
            <h2 className="font-sans text-3xl font-bold tracking-tight text-fg-primary sm:text-4xl">Stop shipping agent accidents.</h2>
            <p className="mt-4 text-lg text-fg-secondary">One file, every agent, every repo. The CLI is free forever.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link to="/signup"><Button size="lg" trailingIcon>Get started free</Button></Link>
              <Link to="/docs"><Button size="lg" variant="ghost">Read the docs</Button></Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-14">
        <div className="mx-auto max-w-content px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2 text-fg-primary">
              <span className="text-brand text-lg">◆</span>
              <span className="font-sans font-semibold">policyctl</span>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm text-fg-muted">
              <Link to="/docs" className="hover:text-fg-primary transition-colors duration-400">Docs</Link>
              <a href="https://github.com/RavaniRoshan/policyctl" target="_blank" rel="noreferrer" className="hover:text-fg-primary transition-colors duration-400">GitHub</a>
              <a href="https://www.npmjs.com/package/@policyctl/cli" target="_blank" rel="noreferrer" className="hover:text-fg-primary transition-colors duration-400">npm</a>
            </div>
            <div className="text-sm text-fg-muted">MIT License</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
