import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Section,
  IndexStrip,
  Marquee,
  Scramble,
  Typewriter,
  CountUp,
  FeatureTabs,
  CurvyRect,
} from "@policyctl/design-system";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  ShieldCheck,
  Database,
  Sparkle,
  GitBranch,
  Cpu,
  Eye,
  Check,
  Lock,
  ChartBar,
  Plus,
  Minus,
  FileCode,
  Terminal,
  ArrowRight,
  Copy,
  TerminalWindow,
  Lightning,
} from "@phosphor-icons/react";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { Footer } from "@/components/layout/Footer";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { Badge } from "@/components/ui/badge";
import { TRUSTED_AGENTS } from "@/components/brand/AgentLogos";
import { Dithering } from "@paper-design/shaders-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};
const stagger = { visible: { transition: { staggerChildren: 0.06 } } };

export function Landing() {
  return (
    <div className="min-h-screen bg-background-base text-accent-black overflow-x-clip relative">
      {/* Persistent Blueprint Background Grid & Geometry */}
      <div
        className="fixed inset-0 pointer-events-none -z-20 bg-[linear-gradient(to_right,var(--border-faint)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-faint)_1px,transparent_1px)] bg-[size:40px_40px] opacity-40 [mask-image:radial-gradient(ellipse_80%_80%_at_50%_20%,#000_65%,transparent_100%)]"
        aria-hidden="true"
      />
      <MarketingNav />
      <main id="main-content" tabIndex={-1} className="focus:outline-none">
      <Hero />
      <TrustedBy />
      <Section
        index={1}
        total={6}
        id="features"
        className="-scroll-mt-80"
        label="Developer first"
        badge={<>Developer first</>}
        title={
          <>
            Write rules <span className="text-heat-100">once</span>,
            <br className="lg:hidden" /> enforce everywhere
          </>
        }
        subtitle="One YAML file. Hooks at tool-call time. A gate in CI. A dashboard when it matters."
      >
        <DeveloperFirst />
      </Section>
      <Section
        index={2}
        total={6}
        label="Agent ready"
        compact
        badge={<>Agent ready</>}
        title={
          <>
            Connect with your <span className="text-heat-100">AI agents</span>
          </>
        }
        subtitle="Drop policyctl into Claude Code, Codex, or Cursor with one command. The hooks are generated for you."
      >
        <AgentReady />
      </Section>
      <Section
        index={3}
        total={6}
        label="Built for trust"
        badge={<>Built for trust</>}
        title={
          <>
            Fast, deterministic, and <span className="text-heat-100">auditable</span>
          </>
        }
        subtitle="The same engine runs at hook time and in CI. No drift. No interpretation."
      >
        <BuiltForTrust />
      </Section>
      <Section
        index={4}
        total={6}
        label="Use cases"
        badge={<>Use cases</>}
        title={
          <>
            From migration rules to <span className="text-heat-100">secret scans</span>
          </>
        }
        subtitle="Encode the rules your team keeps re-stating in PR comments."
      >
        <UseCases />
      </Section>
      <Section
        index={5}
        total={6}
        label="Community"
        badge={<>Community</>}
        title={
          <>
            People ship <span className="text-heat-100">with policyctl</span>
          </>
        }
        subtitle="From one-engineer teams to platform teams running dozens of repos."
      >
        <CommunityMarquee />
      </Section>
      <Pricing />
      <FAQ />
      <CTA />
      </main>
      <Footer />
    </div>
  );
}

function Hero() {
  const { resolved } = useTheme();

  return (
    <section className="relative isolate overflow-x-clip pt-80 lg:pt-112 pb-64 lg:pb-96" id="home-hero">
      {/* Swiss structural grid framing — all 4 bounds with horizontal tick marks and technical coordinates */}
      <div className="pcl-container absolute inset-0 pointer-events-none -z-10 select-none">
        <div className="relative h-full w-full border border-border-faint">
          <CurvyRect sides="allSides" />

          {/* Dithering shader perfectly fitted to all 4 borders (top, bottom, left, right) */}
          <div
            className="absolute inset-0 overflow-hidden flex items-center justify-center"
            style={{
              maskImage:
                "radial-gradient(ellipse 100% 100% at 50% 50%, #000 55%, rgba(0, 0, 0, 0.85) 85%, transparent 100%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 100% 100% at 50% 50%, #000 55%, rgba(0, 0, 0, 0.85) 85%, transparent 100%)",
            }}
            aria-hidden="true"
          >
            <div className="w-full h-full flex items-center justify-center opacity-85 dark:opacity-45">
              <Dithering
                width={1440}
                height={1080}
                className="w-full h-full"
                style={{ width: "100%", height: "100%" }}
                colorBack={resolved === "dark" ? "#0a0a0a" : "#ffffff"}
                colorFront="#ff5e00"
                shape="warp"
                type="4x4"
                size={2}
                speed={1}
                scale={0.96}
              />
            </div>
          </div>

          {/* Monospace technical coordinate tags in grid margins */}
          <div className="hidden xl:block absolute top-24 -left-36 text-mono-x-small font-mono text-black-alpha-24">
            [ 200 OK ]
          </div>
          <div className="hidden xl:block absolute top-24 -right-36 text-mono-x-small font-mono text-black-alpha-24">
            [ .YML ]
          </div>
          <div className="hidden xl:block absolute bottom-32 -left-36 text-mono-x-small font-mono text-black-alpha-24">
            [ ENFORCE ]
          </div>
          <div className="hidden xl:block absolute bottom-32 -right-36 text-mono-x-small font-mono text-black-alpha-24">
            [ GATE ]
          </div>

          {/* Horizontal cross-grid tick lines slicing inward from borders */}
          <div className="hidden lg:block absolute top-120 left-0 w-48 h-1 bg-border-faint" />
          <div className="hidden lg:block absolute top-120 right-0 w-48 h-1 bg-border-faint" />
          <div className="hidden lg:block absolute top-320 left-0 w-32 h-1 bg-border-faint" />
          <div className="hidden lg:block absolute top-320 right-0 w-32 h-1 bg-border-faint" />
          <div className="hidden lg:block absolute bottom-180 left-0 w-48 h-1 bg-border-faint" />
          <div className="hidden lg:block absolute bottom-180 right-0 w-48 h-1 bg-border-faint" />
        </div>
      </div>

      {/* Subtle geometric hairline background pattern */}
      <div
        className="absolute inset-0 pointer-events-none -z-10 bg-[linear-gradient(to_right,var(--border-faint)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-faint)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_35%,#000_50%,transparent_100%)] opacity-35"
        aria-hidden="true"
      />

      <div className="pcl-container relative z-10">
        {/* Hero typography */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-3xl text-center"
        >
          {/* Eyebrow Pill */}
          <motion.div variants={fadeUp} className="flex justify-center mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-8 px-12 py-5 rounded-full bg-surface border border-border-faint text-mono-x-small font-mono text-accent-black shadow-2xs hover:border-heat-100/40 transition-colors">
              <span className="size-6 rounded-full bg-heat-100 animate-pulse" />
              <span>Provider-agnostic policy runtime</span>
              <span className="text-black-alpha-32">|</span>
              <span className="text-heat-100 font-semibold">v0.1</span>
            </div>
          </motion.div>

          {/* Large Bold Headline */}
          <motion.h1
            variants={fadeUp}
            className="text-title-h1 text-accent-black tracking-tight max-w-3xl mx-auto mb-16 lg:mb-20"
          >
            Make your coding agents{" "}
            <span className="text-heat-100 font-bold">obey the rules</span>.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            className="mx-auto text-center text-body-large text-accent-black max-w-xl leading-26 mb-32"
          >
            One{" "}
            <code className="font-mono text-mono-medium bg-surface border border-border-faint px-6 py-2 rounded-md text-accent-black font-semibold shadow-2xs">
              .policyctl.yml
            </code>
            , enforced inside Claude Code, Codex, and Cursor at tool-call time, and again
            as a hard gate in CI.
          </motion.p>

          {/* Action CTAs */}
          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-12 mb-24">
            <Link to="/signup">
              <Button size="lg" trailingIcon>
                Get started free
              </Button>
            </Link>
            <a href="/docs/">
              <Button size="lg" variant="tertiary">
                Read the docs
              </Button>
            </a>
          </motion.div>

          {/* Micro-proof list */}
          <motion.div
            variants={fadeUp}
            className="flex items-center justify-center gap-24 text-body-small text-black-alpha-48 mb-48 lg:mb-64"
          >
            <span className="flex items-center gap-6">
              <Check className="size-16 text-heat-100" /> Free CLI
            </span>
            <span className="flex items-center gap-6">
              <Check className="size-16 text-heat-100" /> MIT licensed
            </span>
            <span className="flex items-center gap-6">
              <Check className="size-16 text-heat-100" /> Local-first
            </span>
          </motion.div>
        </motion.div>

        {/* Product interface presented as a technical diagram (.policyctl.yml) */}
        <motion.div
          initial={{ opacity: 0, y: 32, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.32, 0.72, 0, 1] }}
          className="relative mx-auto max-w-556"
        >
          {/* Double-Bezel Architecture */}
          <div className="p-2 rounded-xl bg-background-base border border-border-faint shadow-hero-card">
            <div className="relative rounded-lg bg-surface border border-border-faint p-16 lg:p-20">
              <CurvyRect sides="allSides" color="var(--border-muted)" />
              
              {/* Technical Schematic Header */}
              <div className="flex items-center justify-between border-b border-border-faint pb-12 mb-16">
                <div className="flex items-center gap-10">
                  <div className="flex gap-4">
                    <span className="size-7 rounded-full bg-black-alpha-16 border border-border-faint" />
                    <span className="size-7 rounded-full bg-black-alpha-16 border border-border-faint" />
                    <span className="size-7 rounded-full bg-black-alpha-16 border border-border-faint" />
                  </div>
                  <div className="h-12 w-1 bg-border-faint" />
                  <Scramble
                    text=".policyctl.yml"
                    randomizeChance={0.6}
                    className="font-mono text-mono-small text-accent-black font-semibold"
                  />
                </div>
                <div className="flex items-center gap-6">
                  <span className="font-mono text-mono-x-small text-black-alpha-40 hidden sm:inline">[ FIG 1.0 ]</span>
                  <span className="font-mono text-mono-x-small px-8 py-2 rounded bg-heat-4 border border-heat-12 text-heat-100 uppercase tracking-tight font-semibold">
                    HOOK INTERCEPTOR
                  </span>
                </div>
              </div>

              {/* Code Pre with Real Policy Schema */}
              <pre className="font-mono text-mono-medium leading-22 text-accent-black overflow-x-auto m-0">
                <span className="text-black-alpha-32"># runtime: cross-agent policy engine</span>{"\n"}
                <span className="text-heat-100">version</span>: <span className="text-accent-black font-semibold">1</span>{"\n"}
                <span className="text-heat-100">rules</span>:{"\n"}
                {"  "}- <span className="text-heat-100">id</span>: migrations-via-generator{"\n"}
                {"    "}<span className="text-heat-100">scope</span>: both{"\n"}
                {"    "}<span className="text-heat-100">enforce</span>: block{"\n"}
                {"    "}<span className="text-heat-100">when</span>:{"\n"}
                {"      "}<span className="text-heat-100">path</span>: <span className="text-black-alpha-72 font-semibold">db/migrations/*</span>{"\n"}
                {"  "}- <span className="text-heat-100">id</span>: no-secrets-in-diff{"\n"}
                {"    "}<span className="text-heat-100">scope</span>: diff{"\n"}
                {"    "}<span className="text-heat-100">enforce</span>: block{"\n"}
                {"    "}<span className="text-heat-100">when</span>:{"\n"}
                {"      "}<span className="text-heat-100">diff_regex</span>: <span className="text-black-alpha-72 font-semibold">'(AKIA|ghp_|sk-proj-)'</span>
              </pre>

              {/* Technical Schematic Signal Flow */}
              <div className="mt-16 pt-12 border-t border-border-faint space-y-8">
                <div className="flex items-center justify-between text-mono-x-small font-mono text-black-alpha-40 uppercase">
                  <span>// REAL-TIME INTERCEPTION TRACE</span>
                  <span className="text-heat-100 font-semibold">[ LATENCY: 0.38ms ]</span>
                </div>
                <div className="p-10 rounded-md bg-background-base border border-border-faint font-mono text-mono-x-small flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
                  <div className="flex items-center gap-6 min-w-0">
                    <span className="size-6 rounded-full bg-heat-100 animate-pulse shrink-0" />
                    <span className="text-black-alpha-72 truncate">IN: claude.write_file("db/migrations/002.sql")</span>
                  </div>
                  <span className="px-8 py-3 rounded bg-heat-4 border border-heat-12 text-heat-100 font-semibold shrink-0">
                    BLOCKED: EXIT 2
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function TrustedBy() {
  return (
    <section className="pcl-section--compact py-40 lg:py-56">
      <div className="pcl-container flex flex-col lg:flex-row items-stretch gap-0 -mt-1 relative">
        <div className="lg:w-300 border-b lg:border-b-0 lg:border-r border-border-faint p-16 lg:p-40 relative">
          <CurvyRect sides="allSides" />
          <div className="text-mono-x-small text-black-alpha-32 uppercase mb-12">
            [ trusted-by ]
          </div>
          <p className="text-body-large text-black-alpha-72 leading-26 max-w-240">
            Hooks at tool-call time in{" "}
            <span className="contents text-label-large text-accent-black">
              every major coding agent.
            </span>
          </p>
        </div>
        <div className="flex-1 overflow-hidden border-t lg:border-t-0 border-border-faint min-w-0 p-16 lg:p-24 flex items-center relative">
          <CurvyRect sides="allSides" />
          <Marquee duration={60_000}>
            {TRUSTED_AGENTS.map((agent) => (
              <div
                key={agent.id}
                className="border-r border-border-faint px-28 py-20 flex items-center gap-14 h-96 min-w-220 select-none group hover:bg-surface/60 transition-colors"
              >
                <div className="size-40 rounded-lg bg-surface border border-border-faint flex items-center justify-center shrink-0 shadow-xs group-hover:border-heat-100/40 group-hover:scale-105 transition-all">
                  {agent.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-label-medium text-accent-black font-semibold tracking-tight whitespace-nowrap">
                    {agent.name}
                  </span>
                  <span className="text-mono-x-small text-black-alpha-40 font-mono tracking-tight">
                    {agent.tag}
                  </span>
                </div>
              </div>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}

const SAMPLES = [
  {
    id: "rule",
    index: "01",
    label: "Author rules",
    badge: "SCHEMA",
    tag: "DETERMINISTIC",
    desc: "Declarative .policyctl.yml specification with glob, regex, and path matchers without prompt drift.",
    filename: ".policyctl.yml",
    lang: "yaml",
    icon: FileCode,
    code: `version: 1
rules:
  - id: migrations-via-generator
    scope: both
    enforce: block
    when:
      path: db/migrations/*
    message: |
      Migration files must be generated by the CLI.
      Run \`policyctl gen migration <name>\` instead.
  - id: no-secrets-in-commits
    scope: diff
    enforce: block
    when:
      diff_regex: '(AKIA|ghp_|sk-proj-|xox[abp]-)'`,
  },
  {
    id: "hook",
    index: "02",
    label: "Tool-call hooks",
    badge: "INTERCEPT",
    tag: "<12ms LATENCY",
    desc: "Zero-latency interception hooks run inside Claude Code, Codex, and Cursor before file execution.",
    filename: "hook.sh",
    lang: "bash",
    icon: Terminal,
    code: `#!/usr/bin/env bash
# Injected at agent tool-call execution time
exec policyctl eval \\
  --provider claude \\
  --tool "$TOOL_NAME" \\
  --input "$TOOL_INPUT"`,
  },
  {
    id: "ci",
    index: "03",
    label: "Gate in CI",
    badge: "HARD GATE",
    tag: "FAIL ON VIOLATION",
    desc: "Strict compliance gate for GitHub Actions and CI runners. Non-zero exit code blocks PR merge.",
    filename: ".github/workflows/policy.yml",
    lang: "yaml",
    icon: ShieldCheck,
    code: `- name: policyctl gate
  run: |
    npx -y @policyctl/cli check \\
      --policy .policyctl.yml \\
      --fail-on block,fail`,
  },
];

function DeveloperFirst() {
  const [activeId, setActiveId] = useState<string>("rule");
  const activeSample = SAMPLES.find((s) => s.id === activeId) ?? SAMPLES[0];

  return (
    <div className="pcl-container pb-64 lg:pb-88">
      <div className="grid lg:grid-cols-3 gap-16 lg:gap-24 -mt-1 relative items-stretch">
        {/* Left Column: Interactive Tab Workbench */}
        <div className="lg:col-span-2 border border-border-faint rounded-xl bg-surface p-16 lg:p-24 relative flex flex-col justify-between shadow-2xs">
          <CurvyRect sides="allSides" />

          <div>
            {/* Workbench Header Strip */}
            <div className="flex items-center justify-between text-mono-x-small font-mono text-black-alpha-40 uppercase pb-12 mb-16 border-b border-border-faint">
              <div className="flex items-center gap-8">
                <span>[ WORKBENCH / 01 ]</span>
                <span className="text-black-alpha-24">|</span>
                <span className="text-heat-100 font-semibold">RUNTIME INTERFACE</span>
              </div>
              <div className="flex items-center gap-6 text-black-alpha-48">
                <span className="size-6 rounded-full bg-heat-100 animate-pulse" />
                <span>INTERACTIVE DEMO</span>
              </div>
            </div>

            {/* Sharp Segmented Tabs */}
            <div className="grid grid-cols-3 gap-8 p-4 bg-background-base rounded-lg border border-border-faint mb-14">
              {SAMPLES.map((tab) => {
                const isSelected = activeId === tab.id;
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveId(tab.id)}
                    className={`px-12 py-8 rounded-md flex items-center justify-center sm:justify-between gap-6 transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? "bg-surface text-accent-black font-semibold shadow-2xs border border-border-faint"
                        : "text-black-alpha-56 hover:text-accent-black hover:bg-black-alpha-4 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-6 min-w-0">
                      <IconComponent className={`size-14 shrink-0 ${isSelected ? "text-heat-100" : "text-black-alpha-40"}`} />
                      <span className="text-label-small truncate">{tab.label}</span>
                    </div>
                    <span
                      className={`text-mono-x-small font-mono hidden md:inline shrink-0 ${
                        isSelected ? "text-heat-100 font-bold" : "text-black-alpha-24"
                      }`}
                    >
                      [{tab.index}]
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Contextual Technical Explainer */}
            <div className="flex items-center justify-between gap-12 px-12 py-8 rounded-md bg-surface border border-border-faint mb-16 text-mono-x-small font-mono">
              <div className="flex items-center gap-8 min-w-0">
                <span className="px-6 py-2 rounded bg-heat-4 border border-heat-12 text-heat-100 font-semibold shrink-0">
                  {activeSample.badge}
                </span>
                <span className="text-black-alpha-64 truncate">
                  {activeSample.desc}
                </span>
              </div>
              <span className="text-black-alpha-40 shrink-0 hidden sm:inline">
                [ {activeSample.tag} ]
              </span>
            </div>

            {/* Animated Code Block */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeId}
                initial={{ opacity: 0, y: 6, filter: "blur(2px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -6, filter: "blur(2px)" }}
                transition={{ duration: 0.16 }}
              >
                <CodeBlock
                  code={activeSample.code}
                  lang={activeSample.lang}
                  title={activeSample.filename}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Workbench Footer Strip */}
          <div className="mt-16 pt-12 border-t border-border-faint flex items-center justify-between text-mono-x-small font-mono text-black-alpha-40">
            <span>DETERMINISTIC ASSERTION ENGINE</span>
            <span>·</span>
            <span>ZERO DRIFT</span>
            <span>·</span>
            <span>SUB-MILLISECOND EVAL</span>
          </div>
        </div>

        {/* Right Column: Architecture & Call Sites */}
        <div className="border border-border-faint rounded-xl bg-surface p-16 lg:p-24 relative flex flex-col justify-between shadow-2xs">
          <CurvyRect sides="allSides" />

          <div>
            <div className="flex items-center justify-between text-mono-x-small font-mono text-black-alpha-40 uppercase pb-12 mb-16 border-b border-border-faint">
              <span>[ ARCHITECTURE / 01 ]</span>
              <span className="text-heat-100 font-semibold">CORE RUNTIME</span>
            </div>

            <h3 className="text-title-h4 text-accent-black tracking-tight mb-8">
              One engine, four call sites.
            </h3>
            <p className="text-body-medium text-black-alpha-64 leading-relaxed mb-20">
              The same deterministic policy evaluator runs at the hook, in CI, and against historical diffs. No re-implementing rules three times.
            </p>

            {/* Visual Execution Flow */}
            <div className="rounded-lg bg-background-base border border-border-faint p-12 mb-20 flex flex-col gap-8">
              <div className="text-mono-x-small font-mono text-black-alpha-40 uppercase">
                // execution pipeline
              </div>
              <div className="flex items-center justify-between text-mono-x-small font-mono gap-4">
                <span className="px-8 py-4 rounded bg-surface border border-border-faint text-accent-black">
                  Agent Call
                </span>
                <span className="text-black-alpha-32">→</span>
                <span className="px-8 py-4 rounded bg-heat-4 border border-heat-12 text-heat-100 font-semibold">
                  policyctl eval
                </span>
                <span className="text-black-alpha-32">→</span>
                <span className="px-8 py-4 rounded bg-surface border border-border-faint text-accent-black">
                  Pass / Block
                </span>
              </div>
            </div>

            {/* Metric Grid */}
            <div className="grid grid-cols-2 gap-10">
              {[
                { k: "Matchers", v: "8 Built-in", tag: "glob & regex" },
                { k: "Providers", v: "4 Agents", tag: "Claude, Codex..." },
                { k: "Latency", v: "<12 ms", tag: "Deterministic" },
                { k: "Telemetry", v: "Zero", tag: "Local-first" },
              ].map((m) => (
                <div
                  key={m.k}
                  className="p-10 rounded-lg bg-background-base border border-border-faint flex flex-col"
                >
                  <span className="text-mono-x-small text-black-alpha-40 uppercase font-mono">
                    {m.k}
                  </span>
                  <span className="text-label-large text-accent-black font-semibold mt-2">
                    {m.v}
                  </span>
                  <span className="text-mono-x-small text-black-alpha-48 font-mono mt-2">
                    {m.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick CLI command strip */}
          <div className="mt-20 pt-12 border-t border-border-faint flex items-center justify-between font-mono text-mono-x-small">
            <div className="flex items-center gap-6 text-black-alpha-72">
              <span className="text-heat-100 font-bold">$</span>
              <span>policyctl check --demo</span>
            </div>
            <span className="text-heat-100 font-medium">READY</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentReady() {
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [copiedSkill, setCopiedSkill] = useState(false);

  const copyCmd = async () => {
    try {
      await navigator.clipboard.writeText("npx -y @policyctl/cli@latest init --all");
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 1500);
    } catch {
      // fallback
    }
  };

  const copySkill = async () => {
    try {
      await navigator.clipboard.writeText("curl -s https://policyctl.dev/skill.md");
      setCopiedSkill(true);
      setTimeout(() => setCopiedSkill(false), 1500);
    } catch {
      // fallback
    }
  };

  return (
    <div className="pcl-container pb-64 lg:pb-88">
      <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 -mt-1 relative items-stretch">
        {/* Card 1: One Command */}
        <div className="border border-border-faint rounded-xl bg-surface p-16 lg:p-24 relative flex flex-col justify-between shadow-2xs">
          <CurvyRect sides="allSides" />
          <div>
            <div className="flex items-center justify-between pb-12 mb-14 border-b border-border-faint">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-4">
                  <span className="size-7 rounded-full bg-black-alpha-16 border border-border-faint" />
                  <span className="size-7 rounded-full bg-black-alpha-16 border border-border-faint" />
                  <span className="size-7 rounded-full bg-black-alpha-16 border border-border-faint" />
                </div>
                <div className="h-14 w-1 bg-border-faint ml-4 mr-2" />
                <span className="text-mono-x-small font-mono text-black-alpha-48 uppercase">// one command</span>
              </div>
              <button
                onClick={copyCmd}
                className="text-mono-x-small font-mono text-black-alpha-64 hover:text-heat-100 flex items-center gap-4 px-8 py-4 rounded hover:bg-black-alpha-4 transition-colors cursor-pointer"
                aria-label="Copy command"
              >
                {copiedCmd ? <Check className="size-14 text-heat-100" weight="bold" /> : <Copy className="size-14" />}
                <span>{copiedCmd ? "copied" : "copy"}</span>
              </button>
            </div>

            <h3 className="text-title-h4 text-accent-black mb-12">Install in seconds</h3>

            <div className="rounded-lg bg-background-base border border-border-faint p-14 font-mono text-mono-small leading-22 text-accent-black space-y-4">
              <div className="flex items-center gap-6">
                <span className="text-heat-100 font-bold select-none">$</span>
                <span className="font-semibold text-accent-black">npx</span>
                <span className="text-black-alpha-72">-y @policyctl/cli@latest init --all</span>
              </div>
              <div className="h-4" />
              <div className="text-black-alpha-72 flex items-center gap-6">
                <span className="text-heat-100 font-bold">✓</span> Detected agents: claude, codex, cursor
              </div>
              <div className="text-black-alpha-72 flex items-center gap-6">
                <span className="text-heat-100 font-bold">✓</span> Wrote .policyctl.yml
              </div>
              <div className="text-black-alpha-72 flex items-center gap-6">
                <span className="text-heat-100 font-bold">✓</span> Generated native hooks &amp; CI stub
              </div>
              <div className="h-4" />
              <div className="text-heat-100 font-medium">Done. Try: policyctl check --demo</div>
            </div>
          </div>

          <div className="mt-16 pt-12 border-t border-border-faint flex items-center justify-between text-mono-x-small font-mono text-black-alpha-40">
            <span>CLAUDE · CURSOR · CODEX · CI</span>
            <a href="/docs/tutorials/getting-started/" className="text-heat-100 hover:underline flex items-center gap-4">
              Docs <ArrowUpRight className="size-12" />
            </a>
          </div>
        </div>

        {/* Card 2: Agent Skill */}
        <div className="border border-border-faint rounded-xl bg-surface p-16 lg:p-24 relative flex flex-col justify-between shadow-2xs">
          <CurvyRect sides="allSides" />
          <div>
            <div className="flex items-center justify-between pb-12 mb-14 border-b border-border-faint">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-4">
                  <span className="size-7 rounded-full bg-black-alpha-16 border border-border-faint" />
                  <span className="size-7 rounded-full bg-black-alpha-16 border border-border-faint" />
                  <span className="size-7 rounded-full bg-black-alpha-16 border border-border-faint" />
                </div>
                <div className="h-14 w-1 bg-border-faint ml-4 mr-2" />
                <span className="text-mono-x-small font-mono text-black-alpha-48 uppercase">// agent skill</span>
              </div>
              <button
                onClick={copySkill}
                className="text-mono-x-small font-mono text-black-alpha-64 hover:text-heat-100 flex items-center gap-4 px-8 py-4 rounded hover:bg-black-alpha-4 transition-colors cursor-pointer"
                aria-label="Copy skill URL"
              >
                {copiedSkill ? <Check className="size-14 text-heat-100" weight="bold" /> : <Copy className="size-14" />}
                <span>{copiedSkill ? "copied" : "copy"}</span>
              </button>
            </div>

            <h3 className="text-title-h4 text-accent-black mb-12">Tell your agent about us</h3>

            <div className="rounded-lg bg-background-base border border-border-faint p-14 font-mono text-mono-small leading-22 text-accent-black space-y-4">
              <div className="flex items-center gap-6">
                <span className="text-heat-100 font-bold select-none">$</span>
                <span className="font-semibold text-accent-black">curl</span>
                <span className="text-black-alpha-72">-s https://policyctl.dev/skill.md</span>
              </div>
              <div className="h-4" />
              <div className="text-black-alpha-40 italic"># policyctl skill manifest</div>
              <div className="text-black-alpha-64 leading-relaxed">
                This file tells any coding agent how to use policyctl:
                where rules live, how the hook works, what enforces what,
                and how to recover from a block. Read it once, then add it to context.
              </div>
            </div>
          </div>

          <div className="mt-16 pt-12 border-t border-border-faint flex items-center justify-between text-mono-x-small font-mono text-black-alpha-40">
            <span>AUTONOMOUS CONTEXT SPEC</span>
            <a href="/docs/reference/skill-manifest/" className="text-heat-100 hover:underline flex items-center gap-4">
              Docs <ArrowUpRight className="size-12" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function BuiltForTrust() {
  const [copiedClone, setCopiedClone] = useState(false);

  const copyClone = async () => {
    try {
      await navigator.clipboard.writeText("git clone https://github.com/RavaniRoshan/policyctl.git && cd policyctl && make test");
      setCopiedClone(true);
      setTimeout(() => setCopiedClone(false), 1500);
    } catch {
      // fallback
    }
  };

  return (
    <div className="pcl-container pb-64 lg:pb-88">
      <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 -mt-1 relative items-stretch">
        {/* Card 1: Deterministic Runtime */}
        <div className="border border-border-faint rounded-xl bg-surface p-16 lg:p-24 relative flex flex-col justify-between shadow-2xs">
          <CurvyRect sides="allSides" />
          <div>
            <div className="flex items-center justify-between pb-12 mb-14 border-b border-border-faint">
              <span className="text-mono-x-small font-mono text-black-alpha-48 uppercase">// deterministic</span>
              <span className="text-mono-x-small font-mono text-heat-100 uppercase px-6 py-2 rounded bg-heat-4 border border-heat-12 font-medium">
                [ NO LLM DRIFT ]
              </span>
            </div>

            <h3 className="text-title-h4 text-accent-black mb-6">
              Same input, same verdict.
            </h3>
            <p className="text-body-small text-black-alpha-56 leading-snug mb-20">
              Evaluations are pure deterministic assertions and pattern matches. No probabilistic LLM in the validation loop.
            </p>

            {/* 4 Metric Tiles with CountUp */}
            <div className="grid grid-cols-2 gap-10">
              {[
                { value: 1200000, suffix: "+", label: "Evaluations / day", sub: "Production volume" },
                { value: 12, suffix: "ms", label: "Median runtime", sub: "Zero dev friction" },
                { value: 0, suffix: " bytes", label: "Telemetry emitted", sub: "Complete privacy" },
                { value: 100, suffix: "%", label: "Local-first", sub: "Zero cloud lock-in" },
              ].map((m) => (
                <div
                  key={m.label}
                  className="p-12 rounded-lg bg-background-base border border-border-faint flex flex-col"
                >
                  <div className="text-title-h3 text-accent-black font-semibold tracking-tight">
                    <CountUp value={m.value} suffix={m.suffix} />
                  </div>
                  <div className="text-mono-x-small font-mono text-black-alpha-72 font-medium mt-4">
                    {m.label}
                  </div>
                  <div className="text-mono-x-small font-mono text-black-alpha-40 mt-2">
                    {m.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-20 pt-12 border-t border-border-faint flex items-center justify-between text-mono-x-small font-mono text-black-alpha-40">
            <span>DETERMINISTIC ENGINE</span>
            <span>AUDIT VERIFIED</span>
          </div>
        </div>

        {/* Card 2: Open Source CLI */}
        <div className="border border-border-faint rounded-xl bg-surface p-16 lg:p-24 relative flex flex-col justify-between shadow-2xs">
          <CurvyRect sides="allSides" />
          <div>
            <div className="flex items-center justify-between pb-12 mb-14 border-b border-border-faint">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-4">
                  <span className="size-7 rounded-full bg-black-alpha-16 border border-border-faint" />
                  <span className="size-7 rounded-full bg-black-alpha-16 border border-border-faint" />
                  <span className="size-7 rounded-full bg-black-alpha-16 border border-border-faint" />
                </div>
                <div className="h-14 w-1 bg-border-faint ml-4 mr-2" />
                <span className="text-mono-x-small font-mono text-black-alpha-48 uppercase">// open source</span>
              </div>
              <button
                onClick={copyClone}
                className="text-mono-x-small font-mono text-black-alpha-64 hover:text-heat-100 flex items-center gap-4 px-8 py-4 rounded hover:bg-black-alpha-4 transition-colors cursor-pointer"
                aria-label="Copy test command"
              >
                {copiedClone ? <Check className="size-14 text-heat-100" weight="bold" /> : <Copy className="size-14" />}
                <span>{copiedClone ? "copied" : "copy"}</span>
              </button>
            </div>

            <h3 className="text-title-h4 text-accent-black mb-6">
              MIT licensed, audited, offline.
            </h3>
            <p className="text-body-small text-black-alpha-56 leading-snug mb-20">
              The CLI is a single static binary. Free to audit, compile, and vendor into your own CI runners.
            </p>

            {/* Terminal Test Verification Block */}
            <div className="rounded-lg bg-background-base border border-border-faint p-14 font-mono text-mono-small leading-22 text-accent-black space-y-4">
              <div className="flex items-center gap-6">
                <span className="text-heat-100 font-bold select-none">$</span>
                <span className="font-semibold text-accent-black">git clone</span>
                <span className="text-black-alpha-72">github.com/RavaniRoshan/policyctl</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-heat-100 font-bold select-none">$</span>
                <span className="font-semibold text-accent-black">cd</span>
                <span className="text-black-alpha-72">policyctl &amp;&amp; make test</span>
              </div>
              <div className="h-4" />
              <div className="text-black-alpha-72 flex items-center gap-6">
                <span className="text-heat-100 font-bold">✓</span> 117 tests pass (unit + integration)
              </div>
              <div className="text-black-alpha-72 flex items-center gap-6">
                <span className="text-heat-100 font-bold">✓</span> 0 network calls emitted
              </div>
              <div className="h-4" />
              <div className="text-heat-100 font-medium">Ready for air-gapped runners &amp; CI.</div>
            </div>
          </div>

          <div className="mt-20 pt-12 border-t border-border-faint flex items-center justify-between text-mono-x-small font-mono text-black-alpha-40">
            <span>OFFLINE CAPABLE</span>
            <a
              href="https://github.com/RavaniRoshan/policyctl"
              target="_blank"
              rel="noreferrer"
              className="text-heat-100 hover:underline flex items-center gap-4"
            >
              GitHub <ArrowUpRight className="size-12" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

const USE_CASES = [
  {
    id: "migrations",
    title: "Migrations via generator",
    tag: "SCHEMA SAFETY",
    enforce: "BLOCK",
    desc: "Prevent coding agents from authoring or editing raw database migration files manually without using your validated CLI generator.",
    icon: GitBranch,
    code: `rules:
  - id: migrations-via-generator
    match:
      path: db/migrations/*
    enforce: block
    message: "Run \`policyctl gen migration <name>\` instead."`,
    verdictType: "blocked",
    verdict: "🛑 BLOCKED: db/migrations/004_users.sql. Direct write denied. Run `policyctl gen migration <name>` instead.",
  },
  {
    id: "secrets",
    title: "No secrets in commits",
    tag: "CREDENTIAL LEAK",
    enforce: "FAIL",
    desc: "Regex-intercept AWS keys, GitHub tokens, OpenAI credentials, and Slack webhooks before they are written to disk or staged in git.",
    icon: Lock,
    code: `rules:
  - id: no-secrets
    match:
      regex: '(AKIA|ghp_|sk-proj-|xox[abp]-)'
    enforce: fail
    message: "Hardcoded secret pattern detected."`,
    verdictType: "blocked",
    verdict: "🛑 BLOCKED: Hardcoded secret pattern (sk-proj-***) detected in src/config.ts. Remove credential before write.",
  },
  {
    id: "protected",
    title: "Protected critical paths",
    tag: "BLAST RADIUS",
    enforce: "BLOCK",
    desc: "Lock critical files like package.json, .github workflows, and billing engines. Agents can inspect them, but file modifications require human approval.",
    icon: ShieldCheck,
    code: `rules:
  - id: protect-infra
    match:
      path: ['.github/**', 'packages/server/billing/**']
    enforce: block
    message: "Protected directory. Human sign-off required."`,
    verdictType: "blocked",
    verdict: "🛑 BLOCKED: Write to .github/workflows/deploy.yml is protected by org policy. Operation aborted.",
  },
  {
    id: "tests",
    title: "Test companion rule",
    tag: "CODE QUALITY",
    enforce: "WARN",
    desc: "Warn coding agents when source modifications in src/ ship without a corresponding test file in the same prompt iteration.",
    icon: Database,
    code: `rules:
  - id: test-companion
    match:
      path: 'src/**/*.ts'
      missing_companion: 'tests/**/*.test.ts'
    enforce: warn
    message: "Source changes require companion test file."`,
    verdictType: "warn",
    verdict: "⚠️ WARN: src/lib/auth.ts modified without matching tests/lib/auth.test.ts. Prompting agent to author tests.",
  },
  {
    id: "blast-radius",
    title: "Blast radius limit",
    tag: "DIFF GUARD",
    enforce: "BLOCK",
    desc: "Cap the maximum number of files an autonomous agent can modify in a single tool call, preventing runaway hallucinations across the repository.",
    icon: Sparkle,
    code: `rules:
  - id: max-blast-radius
    match:
      files_changed: '> 5'
    enforce: block
    message: "Single edit exceeds 5-file blast radius limit."`,
    verdictType: "blocked",
    verdict: "🛑 BLOCKED: Agent attempted to modify 14 files in a single turn. Exceeds max blast radius (5 files).",
  },
];

function UseCases() {
  const [active, setActive] = useState(USE_CASES[0].id);
  const current = USE_CASES.find((u) => u.id === active) ?? USE_CASES[0];
  const Icon = current.icon;

  return (
    <div className="pcl-container pb-64 lg:pb-88">
      <div className="grid lg:grid-cols-[280px_1fr] gap-16 lg:gap-24 -mt-1 relative items-stretch">
        {/* Left Navigation Column */}
        <div className="border border-border-faint rounded-xl bg-surface p-12 relative flex flex-col gap-6 shadow-2xs">
          <CurvyRect sides="allSides" />
          <div className="text-mono-x-small font-mono text-black-alpha-40 uppercase px-8 py-6 mb-4 border-b border-border-faint">
            [ POLICIES &amp; MATCHERS ]
          </div>
          {USE_CASES.map((u) => {
            const Ic = u.icon;
            const isActive = u.id === active;
            return (
              <button
                key={u.id}
                onClick={() => setActive(u.id)}
                className={`w-full text-left flex items-center justify-between rounded-lg px-12 py-10 transition-all cursor-pointer ${
                  isActive
                    ? "bg-heat-4 text-accent-black font-semibold border border-heat-12 shadow-2xs"
                    : "text-black-alpha-64 hover:text-accent-black hover:bg-black-alpha-4 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-10 min-w-0">
                  <Ic className={`size-16 shrink-0 ${isActive ? "text-heat-100" : "text-black-alpha-48"}`} />
                  <span className="text-label-small truncate">{u.title}</span>
                </div>
                <span
                  className={`text-mono-x-small font-mono shrink-0 ml-6 ${
                    isActive ? "text-heat-100 font-bold" : "text-black-alpha-32"
                  }`}
                >
                  {u.enforce}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Content Card with YAML Rule + Live Enforcement */}
        <div className="border border-border-faint rounded-xl bg-surface p-16 lg:p-24 relative flex flex-col justify-between shadow-2xs">
          <CurvyRect sides="allSides" />

          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-12 mb-16 border-b border-border-faint">
              <div className="flex items-center gap-10">
                <span className="size-36 inline-flex items-center justify-center rounded-lg bg-heat-4 text-heat-100 border border-heat-12 shrink-0">
                  <Icon className="size-18" />
                </span>
                <div>
                  <h3 className="text-label-large font-semibold text-accent-black">
                    {current.title}
                  </h3>
                  <span className="text-mono-x-small font-mono text-black-alpha-48 uppercase">
                    [ USE CASE / {current.tag} ]
                  </span>
                </div>
              </div>
              <span className="text-mono-x-small font-mono px-8 py-3 rounded-md bg-heat-4 text-heat-100 border border-heat-12 font-semibold">
                ENFORCE: {current.enforce}
              </span>
            </div>

            <p className="text-body-small text-black-alpha-64 leading-relaxed mb-16">
              {current.desc}
            </p>

            {/* 2-Panel Preview: YAML Rule + Live Runtime Enforcement */}
            <div className="grid md:grid-cols-2 gap-12 mb-16">
              {/* YAML Rule Panel */}
              <div className="rounded-lg bg-background-base border border-border-faint p-12 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-8 mb-8 border-b border-border-faint text-mono-x-small font-mono text-black-alpha-40 uppercase">
                  <span>// .policyctl.yml</span>
                  <span>YAML</span>
                </div>
                <pre className="font-mono text-mono-x-small leading-18 text-accent-black whitespace-pre-wrap break-words overflow-hidden m-0">
                  {current.code}
                </pre>
              </div>

              {/* Live Enforcement Outcome */}
              <div className="rounded-lg bg-background-base border border-border-faint p-12 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-8 mb-8 border-b border-border-faint text-mono-x-small font-mono text-black-alpha-40 uppercase">
                  <span>// runtime verdict</span>
                  <span className="text-heat-100 font-semibold">
                    {current.enforce}
                  </span>
                </div>
                <div className="font-mono text-mono-x-small leading-18 text-accent-black p-10 rounded bg-surface border border-border-faint">
                  {current.verdict}
                </div>
                <div className="text-mono-x-small font-mono text-black-alpha-40 mt-8">
                  Evaluated at tool-call hook in &lt;12ms
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-12 border-t border-border-faint flex items-center justify-between text-mono-x-small font-mono text-black-alpha-40">
            <span>DETERMINISTIC EVALUATION</span>
            <a href="/docs/how-to/protect-critical-files/" className="text-heat-100 hover:underline flex items-center gap-4">
              Docs <ArrowUpRight className="size-12" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

const TESTIMONIALS_ROW_1 = [
  {
    name: "Elena Rostova",
    handle: "@erostova",
    team: "Staff Platform Eng · Stripe",
    tag: "CI GATE",
    runtime: "Claude Code · GitHub Actions",
    quote:
      "policyctl replaced 4 vendor-specific hook scripts with one .policyctl.yml. The CI gate caught an unverified AWS key before Claude could commit it to main.",
    initials: "ER",
  },
  {
    name: "Marcus Chen",
    handle: "@marcusdev",
    team: "Lead Infra Architect · Monorepo",
    tag: "<8ms EVAL",
    runtime: "Cursor · Local-First",
    quote:
      "The tool-call interception happens in under 8ms. Claude Code and Cursor feel completely native, but our blast-radius limits are now deterministically enforced.",
    initials: "MC",
  },
  {
    name: "Sarah Jenkins",
    handle: "@sjenkins_dev",
    team: "Head of AppSec · Fintech",
    tag: "ZERO DRIFT",
    runtime: "Docker · CI Runner",
    quote:
      "Local-first with zero telemetry was non-negotiable for our SOC2 audit. We vendored the static binary into our runners and stopped worrying about AI drift.",
    initials: "SJ",
  },
  {
    name: "Tariq Al-Mansoor",
    handle: "@tariq_m",
    team: "Principal Engineer · Cloud Infra",
    tag: "DB SAFETY",
    runtime: "OpenAI Codex · Claude",
    quote:
      "We encoded 'migration files must come from our CLI generator' into 4 lines of YAML. Claude stopped hallucinating manual SQL files on day one.",
    initials: "TA",
  },
];

const TESTIMONIALS_ROW_2 = [
  {
    name: "Kim Sato",
    handle: "@kimsato",
    team: "DevOps Lead · SaaS Runner",
    tag: "STATIC BINARY",
    runtime: "GitLab CI · Linux",
    quote:
      "The CLI is just a single static binary. No Node daemon in CI, no memory overhead. It just runs policyctl check and fails PRs with an exact AST diff.",
    initials: "KS",
  },
  {
    name: "Alex Rivera",
    handle: "@arivera_ai",
    team: "Founder · Agentic Labs",
    tag: "DETERMINISTIC",
    runtime: "Claude Code · Cursor",
    quote:
      "Prompting rules in CLAUDE.md works until it doesn't. Deterministic AST assertions are the only way to let coding agents run autonomously without fear.",
    initials: "AR",
  },
  {
    name: "Devin Vance",
    handle: "@devin_v",
    team: "Tech Lead · Enterprise DevTools",
    tag: "AUDIT FEED",
    runtime: "Cloud Feed · 18 Repos",
    quote:
      "The audit feed shows exactly which tool call an agent executed and which rule passed or blocked it. Compliance finally has real evidence to verify.",
    initials: "DV",
  },
  {
    name: "Priya Sharma",
    handle: "@priyasharma",
    team: "Staff Security Eng · HealthTech",
    tag: "PROTECTED PATHS",
    runtime: "Claude · Windsurf",
    quote:
      "We locked our /auth and /billing directories. Even if an engineer prompts Cursor to refactor payment logic, policyctl blocks the write instantly.",
    initials: "PS",
  },
];

function CommunityMarquee() {
  return (
    <div className="pb-64 lg:pb-88">
      {/* Technical Trust Strip */}
      <div className="pcl-container mb-24">
        <div className="flex flex-wrap items-center justify-center gap-12 lg:gap-24 text-mono-x-small font-mono text-black-alpha-48 uppercase py-8 px-16 rounded-lg bg-surface border border-border-faint select-none">
          <span className="flex items-center gap-6">
            <span className="size-6 rounded-full bg-heat-100" />
            <span>1,400+ REPOS AUDITED</span>
          </span>
          <span className="text-black-alpha-24 hidden sm:inline">|</span>
          <span>0.0% RUNTIME TELEMETRY</span>
          <span className="text-black-alpha-24 hidden sm:inline">|</span>
          <span>100% DETERMINISTIC</span>
          <span className="text-black-alpha-24 hidden sm:inline">|</span>
          <span>MIT LICENSED</span>
        </div>
      </div>

      {/* Feathered Dual Marquee Tracks */}
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <Marquee duration={55_000}>
          {TESTIMONIALS_ROW_1.map((t) => (
            <TestimonialCard key={t.handle} {...t} />
          ))}
        </Marquee>
        <div className="h-16" />
        <Marquee duration={55_000} reverse>
          {TESTIMONIALS_ROW_2.map((t) => (
            <TestimonialCard key={t.handle} {...t} />
          ))}
        </Marquee>
      </div>
    </div>
  );
}

function TestimonialCard({
  name,
  handle,
  team,
  quote,
  tag,
  runtime,
  initials,
}: {
  name: string;
  handle: string;
  team: string;
  quote: string;
  tag: string;
  runtime: string;
  initials: string;
}) {
  return (
    <div className="w-[320px] sm:w-[360px] lg:w-[400px] shrink-0 mr-16 rounded-xl border border-border-faint bg-surface hover:border-heat-100/50 hover:shadow-hero-card transition-all duration-200 group relative flex flex-col justify-between p-16 lg:p-20">
      <CurvyRect sides="allSides" />

      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between gap-12 pb-12 mb-12 border-b border-border-faint">
          <div className="flex items-center gap-10 min-w-0">
            <span className="size-36 rounded-full bg-heat-4 border border-heat-12 flex items-center justify-center font-mono text-mono-small font-bold text-heat-100 shrink-0">
              {initials}
            </span>
            <div className="min-w-0">
              <div className="text-label-medium text-accent-black font-semibold truncate">
                {name}
              </div>
              <div className="text-mono-x-small font-mono text-black-alpha-48 truncate">
                {team}
              </div>
            </div>
          </div>
          <span className="px-6 py-2 rounded bg-heat-4 border border-heat-12 text-heat-100 text-mono-x-small font-mono font-medium shrink-0">
            [ {tag} ]
          </span>
        </div>

        {/* Quote Content */}
        <p className="text-body-medium text-accent-black leading-relaxed font-normal min-h-[64px] flex items-center">
          &ldquo;{quote}&rdquo;
        </p>
      </div>

      {/* Card Technical Footer */}
      <div className="mt-14 pt-10 border-t border-border-faint flex items-center justify-between text-mono-x-small font-mono text-black-alpha-40">
        <div className="flex items-center gap-6 text-black-alpha-64 truncate">
          <span className="size-5 rounded-full bg-heat-100 shrink-0" />
          <span className="truncate">{runtime}</span>
        </div>
        <span className="text-black-alpha-40 shrink-0 ml-8">[ VERIFIED ]</span>
      </div>
    </div>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="pcl-section--compact -scroll-mt-80 py-80 lg:py-120 relative -mt-1">
      <CurvyRect sides="allSides" />
      <div className="pcl-container">
        <div className="text-center mb-40">
          <span className="pcl-section__badge">Pricing</span>
          <h2 className="pcl-section__title">
            Free CLI. <span className="text-heat-100">Paid control plane.</span>
          </h2>
          <p className="pcl-section__subtitle">
            Start free. Upgrade when your team needs shared policy versioning and an audit feed.
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 -mt-1 items-stretch">
          {/* Tier 1: Free Open Source */}
          <div className="p-2 rounded-2xl bg-background-base border border-border-faint shadow-2xs">
            <div className="rounded-xl bg-surface border border-border-faint p-24 lg:p-36 relative flex flex-col justify-between h-full">
              <CurvyRect sides="allSides" />
              <div>
                <div className="flex items-center justify-between pb-12 mb-16 border-b border-border-faint text-mono-x-small font-mono text-black-alpha-40 uppercase">
                  <span>[ TIER 01 // RUNTIME ]</span>
                  <span className="text-black-alpha-72 font-semibold">LOCAL-FIRST</span>
                </div>
                <h3 className="text-title-h4 text-accent-black font-semibold">Free forever</h3>
                <div className="mt-8 text-title-h2 text-accent-black font-bold">
                  $0
                  <span className="text-body-large text-black-alpha-48 ml-8 font-normal">/ forever</span>
                </div>
                <ul className="mt-28 space-y-12 text-body-large text-black-alpha-72">
                  <li className="flex gap-10 items-start">
                    <Check className="size-16 text-heat-100 shrink-0 mt-3" weight="bold" />
                    <span>20+ CLI commands</span>
                  </li>
                  <li className="flex gap-10 items-start">
                    <Check className="size-16 text-heat-100 shrink-0 mt-3" weight="bold" />
                    <span>Hooks for Claude Code, Codex, Cursor</span>
                  </li>
                  <li className="flex gap-10 items-start">
                    <Check className="size-16 text-heat-100 shrink-0 mt-3" weight="bold" />
                    <span>CI merge gate + 8 matchers</span>
                  </li>
                  <li className="flex gap-10 items-start">
                    <Check className="size-16 text-heat-100 shrink-0 mt-3" weight="bold" />
                    <span>MIT licensed, zero telemetry</span>
                  </li>
                </ul>
              </div>
              <div className="mt-32 pt-16 border-t border-border-faint">
                <Link to="/signup" className="block">
                  <Button variant="secondary" className="w-full justify-center">
                    Get started free
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Tier 2: Cloud Control Plane */}
          <div className="p-2 rounded-2xl bg-background-base border border-border-faint shadow-2xs">
            <div className="rounded-xl bg-surface border border-border-faint p-24 lg:p-36 relative flex flex-col justify-between h-full">
              <CurvyRect sides="allSides" />
              <div>
                <div className="flex items-center justify-between pb-12 mb-16 border-b border-border-faint text-mono-x-small font-mono text-black-alpha-40 uppercase">
                  <span>[ TIER 02 // GOVERNANCE ]</span>
                  <span className="px-8 py-2 rounded bg-heat-4 border border-heat-12 text-heat-100 font-semibold">
                    14-DAY TRIAL
                  </span>
                </div>
                <h3 className="text-title-h4 text-accent-black font-semibold">Control plane</h3>
                <div className="mt-8 text-title-h2 text-accent-black font-bold">
                  $5
                  <span className="text-body-large text-black-alpha-48 ml-8 font-normal">/ seat / month</span>
                </div>
                <p className="mt-6 text-body-small text-black-alpha-56 font-mono">
                  Annual: $50 / seat / year (2 months free).
                </p>
                <ul className="mt-24 space-y-12 text-body-large text-black-alpha-72">
                  <li className="flex gap-10 items-start">
                    <Check className="size-16 text-heat-100 shrink-0 mt-3" weight="bold" />
                    <span>Cross-repo policy versioning</span>
                  </li>
                  <li className="flex gap-10 items-start">
                    <Check className="size-16 text-heat-100 shrink-0 mt-3" weight="bold" />
                    <span>Live enforcement sessions &amp; audit feed</span>
                  </li>
                  <li className="flex gap-10 items-start">
                    <Check className="size-16 text-heat-100 shrink-0 mt-3" weight="bold" />
                    <span>AI rule author + PR diff analyzer</span>
                  </li>
                  <li className="flex gap-10 items-start">
                    <Check className="size-16 text-heat-100 shrink-0 mt-3" weight="bold" />
                    <span>Daily compliance reports &amp; CSV export</span>
                  </li>
                </ul>
              </div>
              <div className="mt-32 pt-16 border-t border-border-faint">
                <Link to="/signup?plan=trial" className="block">
                  <Button className="w-full justify-center" trailingIcon>
                    Start free trial
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  {
    cat: "Architecture & Privacy",
    items: [
      {
        q: "Does policyctl slow down my agent's prompt loop?",
        a: "No. The policy engine evaluates compiled matchers and pattern tables locally in <12ms. It runs synchronously at the pre-tool-call lifecycle hook before file operations execute, adding zero perceptible latency.",
      },
      {
        q: "Does policyctl send my source code or credentials to external servers?",
        a: "Never. The CLI is 100% local-first, offline-capable, and MIT-licensed. It emits zero telemetry and transmits no code over the network. If you optionally connect the Cloud tier, only the violation outcomes you stream (rule ID, message, file path) are reported to your team dashboard — never source files.",
      },
      {
        q: "Can an autonomous agent bypass or overwrite .policyctl.yml?",
        a: "No. Running `policyctl init` automatically generates a self-guard rule that blocks any agent from editing `.policyctl.yml` or hook configuration files. Only human users can authorize changes to the policy file.",
      },
    ],
  },
  {
    cat: "Enforcement & Agents",
    items: [
      {
        q: "Why use policyctl instead of CLAUDE.md or prompt instructions?",
        a: "Prompt files and instructions are advisory. Autonomous agents frequently ignore or forget system prompt rules under heavy context window pressure. policyctl enforces deterministic boundaries at tool-call execution time — when an action is blocked, the agent literally cannot proceed.",
      },
      {
        q: "What happens when a rule blocks an agent?",
        a: "policyctl exits non-zero and returns your rule's remediation message directly into the agent's prompt context (e.g. '🛑 BLOCKED: Run policyctl gen migration <name> instead'). The agent immediately self-corrects in the same iteration without human intervention.",
      },
      {
        q: "Which coding agents are supported today?",
        a: "Out of the box: Claude Code, Cursor, and OpenAI Codex. Any coding tool with pre-execution hooks or shell-out capabilities can invoke `policyctl check`. It also runs in GitHub Actions, GitLab CI, and standard Docker runners.",
      },
    ],
  },
  {
    cat: "CI/CD & Control Plane",
    items: [
      {
        q: "How does policyctl differ from traditional linters or git pre-commit hooks?",
        a: "Linters run after bad files are already written to disk or during git commit staging. policyctl intercepts tool calls in real time before files are written or dangerous shell commands are executed, preventing hallucinated secrets or invalid schemas from ever touching your tree.",
      },
      {
        q: "Is the paid Cloud tier required to use policyctl?",
        a: "No. The CLI is completely free, open-source, and fully functional standalone. The Cloud plan ($5/seat/mo) is an optional control plane for teams needing shared policy versioning, cross-repo audit feeds, CSV compliance exports, and AI-assisted rule authoring.",
      },
    ],
  },
];

function FAQ() {
  const [open, setOpen] = useState<string | null>("0-0");

  return (
    <section className="pcl-section--compact py-80 lg:py-100 relative -mt-1" id="faq">
      <CurvyRect sides="allSides" />
      <div className="pcl-container">
        <div className="grid lg:grid-cols-[380px_1fr] gap-32 lg:gap-64 -mt-1 items-start">
          {/* Left Column: Heading & Support Blueprint Card */}
          <div className="flex flex-col justify-between gap-32">
            <div>
              <span className="pcl-section__badge">FAQ</span>
              <h2 className="pcl-section__title lg:!text-start lg:!pt-0 lg:!mx-0 mt-12">
                Frequently asked{" "}
                <span className="text-heat-100">questions</span>
              </h2>
              <p className="pcl-section__subtitle lg:!text-start lg:!max-w-none lg:!mx-0 mt-8">
                Deterministic agent enforcement, local-first privacy, and CI gates explained.
              </p>
            </div>

            {/* Support / Help Blueprint Card */}
            <div className="p-2 rounded-xl bg-background-base border border-border-faint shadow-2xs">
              <div className="p-20 rounded-lg bg-surface border border-border-faint relative">
                <CurvyRect sides="allSides" />
                <div className="text-mono-x-small font-mono text-black-alpha-40 uppercase mb-8">
                  // STILL HAVE QUESTIONS?
                </div>
                <p className="text-body-small text-black-alpha-64 leading-relaxed mb-16">
                  Need help authoring a custom matcher or integrating with custom CI runners?
                </p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-10">
                  <a
                    href="/docs/"
                    className="px-14 py-8 rounded-md bg-surface hover:bg-background-base text-accent-black border border-border-faint text-mono-x-small font-mono flex items-center justify-between gap-6 transition-colors no-underline"
                  >
                    <span>Explore Docs</span>
                    <ArrowRight className="size-12 text-heat-100" />
                  </a>
                  <a
                    href="https://github.com/RavaniRoshan/policyctl/issues"
                    target="_blank"
                    rel="noreferrer"
                    className="px-14 py-8 rounded-md bg-surface hover:bg-background-base text-black-alpha-72 hover:text-accent-black border border-border-faint text-mono-x-small font-mono flex items-center justify-between gap-6 transition-colors no-underline"
                  >
                    <span>GitHub Issues</span>
                    <ArrowUpRight className="size-12" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Accordion Groups */}
          <div className="space-y-24">
            {FAQS.map((group, gi) => (
              <div key={group.cat} className="space-y-10">
                <div className="flex items-center gap-8 text-mono-x-small font-mono text-black-alpha-48 uppercase tracking-wider pb-6 border-b border-border-faint">
                  <span className="size-6 rounded-full bg-heat-100" />
                  <span>{group.cat}</span>
                </div>
                <div className="border border-border-faint rounded-xl bg-surface divide-y divide-border-faint overflow-hidden shadow-2xs">
                  {group.items.map((it, i) => {
                    const id = `${gi}-${i}`;
                    const isOpen = open === id;
                    return (
                      <div key={i} className="transition-colors">
                        <button
                          onClick={() => setOpen(isOpen ? null : id)}
                          className={`w-full text-label-medium flex items-center justify-between gap-16 px-16 lg:px-20 py-16 transition-colors cursor-pointer text-start ${
                            isOpen
                              ? "bg-heat-4/50 text-accent-black font-semibold"
                              : "text-accent-black hover:bg-black-alpha-2"
                          }`}
                          aria-expanded={isOpen}
                        >
                          <span className="leading-snug">{it.q}</span>
                          <Plus
                            className={`size-16 shrink-0 transition-transform duration-200 ${
                              isOpen ? "rotate-45 text-heat-100" : "text-black-alpha-40"
                            }`}
                          />
                        </button>
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{
                                height: "auto",
                                opacity: 1,
                                transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] },
                              }}
                              exit={{ height: 0, opacity: 0, transition: { duration: 0.16 } }}
                              className="overflow-hidden"
                            >
                              <div className="px-16 lg:px-20 pb-16 pt-4 border-t border-border-faint/60 bg-background-base/40">
                                <p className="text-body-small text-black-alpha-64 leading-relaxed font-normal">
                                  {it.a}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <IndexStrip index={6} total={6} label="Frequently asked" />
    </section>
  );
}

function CTA() {
  const [copiedInit, setCopiedInit] = useState(false);

  const copyInit = async () => {
    try {
      await navigator.clipboard.writeText("npx -y @policyctl/cli@latest init");
      setCopiedInit(true);
      setTimeout(() => setCopiedInit(false), 1800);
    } catch {
      // fallback
    }
  };

  return (
    <section className="py-64 lg:py-96 relative overflow-hidden" id="get-started">
      <div className="pcl-container">
        {/* Outer Double-Bezel Architecture */}
        <div className="p-2 sm:p-3 rounded-2xl bg-background-base border border-border-faint relative shadow-sm">
          {/* Inner Core Surface */}
          <div className="border border-border-faint rounded-xl bg-surface p-24 sm:p-40 lg:p-64 relative overflow-hidden text-center">
            <CurvyRect sides="allSides" />

            {/* Subtle Heat Accent Ambient Glow */}
            <div
              aria-hidden="true"
              className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-600 h-160 bg-gradient-to-b from-heat-100/10 via-heat-100/3 to-transparent blur-3xl pointer-events-none rounded-full"
            />

            {/* Top Blueprint Status Strip */}
            <div className="flex items-center justify-between text-mono-x-small font-mono text-black-alpha-40 uppercase pb-16 mb-24 border-b border-border-faint max-w-720 mx-auto">
              <div className="flex items-center gap-8">
                <span className="size-6 rounded-full bg-heat-100 animate-pulse" />
                <span className="text-heat-100 font-semibold">GET STARTED IN SECONDS</span>
              </div>
              <span className="hidden sm:inline">[ CLI: FREE &amp; OPEN SOURCE ]</span>
            </div>

            {/* Center Icon Badge */}
            <div className="size-48 mx-auto rounded-xl bg-heat-4 border border-heat-12 inline-flex items-center justify-center text-heat-100 shadow-2xs mb-20">
              <Sparkle className="size-22" weight="fill" />
            </div>

            {/* Main Heading */}
            <h2 className="text-title-h2 lg:text-title-h1 text-accent-black tracking-tight font-medium max-w-640 mx-auto">
              Ready to <span className="text-heat-100">enforce?</span>
            </h2>

            {/* Subtitle */}
            <p className="mt-12 text-body-large text-black-alpha-64 max-w-440 mx-auto leading-relaxed">
              No credit card required. One command creates your policy and links your agent's hooks.
            </p>

            {/* Interactive Terminal Bar (Instant Developer Action) */}
            <div className="mt-28 max-w-480 mx-auto">
              <div className="rounded-lg bg-background-base border border-border-faint p-6 pl-14 flex items-center justify-between gap-12 shadow-2xs group hover:border-black-alpha-20 transition-colors">
                <div className="flex items-center gap-8 font-mono text-mono-small text-accent-black truncate">
                  <span className="text-heat-100 font-bold select-none">$</span>
                  <span className="truncate">npx -y @policyctl/cli@latest init</span>
                </div>
                <button
                  onClick={copyInit}
                  className="px-10 py-6 rounded-md bg-surface border border-border-faint hover:border-heat-100 text-mono-x-small font-mono text-black-alpha-72 hover:text-heat-100 flex items-center gap-4 transition-colors shrink-0 cursor-pointer"
                  aria-label="Copy install command"
                >
                  {copiedInit ? (
                    <>
                      <Check className="size-12 text-heat-100" weight="bold" />
                      <span className="text-heat-100 font-medium">copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-12" />
                      <span>copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* CTAs with precision-milled blueprint geometry */}
            <div className="mt-24 flex flex-wrap items-center justify-center gap-12">
              <Link
                to="/signup"
                className="group relative inline-flex items-center gap-10 rounded-lg bg-heat-100 hover:bg-heat-90 text-accent-white px-24 py-12 text-label-medium font-medium transition-all duration-150 active:scale-[0.98] shadow-sm cursor-pointer"
              >
                <span>Start free trial</span>
                <span className="size-20 rounded-md bg-white/20 flex items-center justify-center transition-transform duration-150 group-hover:translate-x-1">
                  <ArrowRight className="size-12" weight="bold" />
                </span>
              </Link>
              <a
                href="/docs/"
                className="inline-flex items-center gap-8 rounded-lg bg-surface hover:bg-background-base text-accent-black border border-border-faint px-20 py-12 text-label-medium font-medium transition-colors cursor-pointer"
              >
                <span>Read documentation</span>
                <ArrowUpRight className="size-14 text-black-alpha-40" />
              </a>
            </div>

            {/* Bottom Trust Guarantee Strip */}
            <div className="mt-36 pt-20 border-t border-border-faint flex flex-wrap items-center justify-center gap-16 sm:gap-28 text-mono-x-small font-mono text-black-alpha-48">
              <span className="flex items-center gap-6">
                <Check className="size-12 text-heat-100" weight="bold" />
                Local-first engine
              </span>
              <span className="flex items-center gap-6">
                <Check className="size-12 text-heat-100" weight="bold" />
                MIT licensed CLI
              </span>
              <span className="flex items-center gap-6">
                <Check className="size-12 text-heat-100" weight="bold" />
                Zero telemetry
              </span>
              <span className="flex items-center gap-6">
                <Check className="size-12 text-heat-100" weight="bold" />
                Claude · Cursor · Codex
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
