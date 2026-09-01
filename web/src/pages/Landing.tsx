import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Section,
  IndexStrip,
  FooterStrip,
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
} from "@phosphor-icons/react";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { Badge } from "@/components/ui/badge";

const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};
const stagger = { visible: { transition: { staggerChildren: 0.06 } } };

export function Landing() {
  return (
    <div className="min-h-screen bg-background-base text-accent-black overflow-x-clip">
      <MarketingNav />
      <main id="main-content" tabIndex={-1} className="focus:outline-none">
      <Hero />
      <TrustedBy />
      <Section
        index={1}
        total={6}
        id="features"
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
  return (
    <section className="relative overflow-clip pt-80 lg:pt-88 -mt-12 lg:-mt-12">
      <div className="pcl-container relative">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-3xl text-center"
        >
          <motion.div variants={fadeUp}>
            <Badge tone="heat" className="mb-16">
              Provider-agnostic policy runtime
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-title-h1 text-accent-black tracking-tight"
          >
            Make your coding agents{" "}
            <span className="text-heat-100">obey the rules</span>.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-16 max-w-xl text-body-large text-black-alpha-72 leading-26"
          >
            One{" "}
            <code className="font-mono text-mono-medium bg-black-alpha-4 px-6 py-2 rounded-4 text-accent-black -mt-1 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-border-faint">
              .policyctl.yml
            </code>
            , enforced inside Claude Code, Codex, and Cursor at tool-call time, and again
            as a hard gate in CI.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-32 flex flex-wrap items-center justify-center gap-12">
            <Link to="/signup">
              <Button size="lg" trailingIcon>
                Get started free
              </Button>
            </Link>
            <Link to="/docs">
              <Button size="lg" variant="tertiary">
                Read the docs
              </Button>
            </Link>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-20 flex items-center justify-center gap-20 text-body-small text-black-alpha-48"
          >
            <span className="flex items-center gap-4">
              <Check className="size-4 text-heat-100" /> Free CLI
            </span>
            <span className="flex items-center gap-4">
              <Check className="size-4 text-heat-100" /> MIT licensed
            </span>
            <span className="flex items-center gap-4">
              <Check className="size-4 text-heat-100" /> Local-first
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.4, ease: [0.32, 0.72, 0, 1] }}
          className="relative mx-auto mt-64 max-w-552"
        >
          <div className="relative rounded-xl bg-surface shadow-hero-card p-16">
            <CurvyRect sides="allSides" color="var(--border-muted)" />
            <div className="flex items-center gap-6 border-b border-border-faint pb-12 mb-16">
              <Scramble
                text=".policyctl.yml"
                randomizeChance={0.6}
                className="font-mono text-mono-small text-black-alpha-72"
              />
            </div>
            <pre className="font-mono text-mono-medium leading-22 text-accent-black">
              <span className="text-black-alpha-32"># runtime: cross-agent</span>{"\n"}
              <span className="text-heat-100">rules</span>:{"\n"}
              {"  "}- <span className="text-heat-100">id</span>: migrations-via-generator{"\n"}
              {"    "}<span className="text-heat-100">match</span>:{" "}
              <span className="text-black-alpha-72">path:db/migrations/*</span>{"\n"}
              {"    "}<span className="text-heat-100">enforce</span>: block{"\n"}
              {"  "}- <span className="text-heat-100">id</span>: no-secrets-in-commits{"\n"}
              {"    "}<span className="text-heat-100">match</span>:{" "}
              <span className="text-black-alpha-72">regex:(AKIA|ghp_)</span>{"\n"}
              {"    "}<span className="text-heat-100">enforce</span>: fail
            </pre>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function TrustedBy() {
  const logos = [
    "Claude Code",
    "Cursor",
    "OpenAI Codex",
    "GitHub Actions",
    "Windsurf",
    "Continue.dev",
    "Cody",
    "Aider",
  ];
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
          <Marquee duration={80_000}>
            {logos.map((name, i) => (
              <div
                key={i}
                className="border-r border-border-faint px-32 py-20 flex items-center justify-center h-96 min-w-200"
              >
                <span className="font-mono text-mono-medium text-black-alpha-56">{name}</span>
              </div>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}

const SAMPLES: Record<string, { lang: string; code: string; filename: string }> = {
  rule: {
    lang: "yaml",
    filename: ".policyctl.yml",
    code: `rules:
  - id: migrations-via-generator
    match:
      path: db/migrations/*
    enforce: block
    message: |
      Migration files must be generated by the CLI.
      Run \`policyctl gen migration <name>\` instead.
  - id: no-secrets-in-commits
    match:
      regex: '(AKIA|ghp_|sk-|xox[abp]-)'
    enforce: fail`,
  },
  hook: {
    lang: "bash",
    filename: "hook",
    code: `#!/usr/bin/env bash
# Auto-installed by \`policyctl init\`
exec policyctl check \\
  --provider claude \\
  --tool "$TOOL_NAME" \\
  --input "$TOOL_INPUT"`,
  },
  ci: {
    lang: "yaml",
    filename: ".github/workflows/policy.yml",
    code: `- name: policyctl gate
  run: |
    npx -y @policyctl/cli check \\
      --policy .policyctl.yml \\
      --report json \\
      --fail-on block,fail`,
  },
};

function DeveloperFirst() {
  const [active, setActive] = useState<string>("rule");
  return (
    <div className="pcl-container pb-64 lg:pb-88">
      <div className="grid lg:grid-cols-3 gap-16 lg:gap-24 -mt-1 relative">
        <div className="lg:col-span-2 border border-border-faint rounded-xl bg-surface p-16 lg:p-24 relative">
          <CurvyRect sides="allSides" />
          <FeatureTabs
            active={active}
            onChange={(id) => setActive(id)}
            tabs={[
              {
                id: "rule",
                label: "Author rules",
                description:
                  "Declarative YAML. Procedural rules, not opinions. Every rule is an enforceable assertion.",
              },
              {
                id: "hook",
                label: "Generate hooks",
                description:
                  "One CLI emits the correct hook for Claude, Codex, Cursor, and your CI runner.",
              },
              {
                id: "ci",
                label: "Gate in CI",
                description:
                  "Fail the build on block / fail. Stream violations to the dashboard automatically.",
              },
            ]}
          />
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 12, filter: "blur(2px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -10, filter: "blur(2px)" }}
              transition={{ duration: 0.2 }}
              className="mt-16"
            >
              <CodeBlock code={SAMPLES[active].code} lang={SAMPLES[active].lang} title={SAMPLES[active].filename} />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="border border-border-faint rounded-xl bg-surface p-32 lg:p-64 relative">
          <CurvyRect sides="allSides" />
          <div className="text-mono-x-small text-black-alpha-32 uppercase">// runtime</div>
          <p className="mt-16 text-label-x-large text-accent-black leading-28">
            One engine, four call sites.
          </p>
          <p className="mt-12 text-body-large text-black-alpha-64">
            The same evaluator runs at the hook, in CI, and against historical diffs. No
            re-implementing the rule three times.
          </p>
          <div className="mt-32 grid grid-cols-2 gap-16">
            {[
              { k: "matchers", v: "8" },
              { k: "providers", v: "4" },
              { k: "ms median", v: "12" },
              { k: "license", v: "MIT" },
            ].map((m) => (
              <div key={m.k} className="-mt-1 p-12 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-border-faint">
                <div className="text-mono-x-small text-black-alpha-32 uppercase">{m.k}</div>
                <div className="text-title-h4 text-accent-black mt-4">{m.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentReady() {
  return (
    <div className="pcl-container pb-64 lg:pb-88">
      <div className="grid lg:grid-cols-2 gap-16 -mt-1 relative">
        <TerminalCard
          eyebrow="// one command"
          title="Install in seconds"
          copyText="npx -y @policyctl/cli@latest init --all --browser"
          code={`$ npx -y @policyctl/cli@latest init --all --browser

✓ Detected agents: claude, codex, cursor
✓ Wrote .policyctl.yml
✓ Generated .claude/settings.json hook
✓ Generated .codex/hooks/policyctl.json
✓ Generated .cursor/hooks.json
✓ Configured CI workflow stub

Done. Try: policyctl check --demo`}
        />
        <TerminalCard
          eyebrow="// agent skill"
          title="Tell your agent about us"
          copyText="curl -s https://policyctl.dev/skill.md"
          code={`$ curl -s https://policyctl.dev/skill.md
# policyctl skill manifest

This file tells any coding agent how to use
policyctl: where rules live, how the hook works,
what enforces what, and how to recover from a
block. Read it once, then add it to context.`}
        />
      </div>
    </div>
  );
}

function TerminalCard({
  eyebrow,
  title,
  code,
  copyText,
}: {
  eyebrow: string;
  title: string;
  code: string;
  copyText?: string;
}) {
  return (
    <div className="border border-border-faint rounded-xl bg-background-base relative p-16 lg:p-24">
      <CurvyRect sides="allSides" />
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <span className="pcl-codeblock__dot" />
          <span className="pcl-codeblock__dot" />
          <span className="pcl-codeblock__dot" />
          <span className="pcl-codeblock__title ml-12">{eyebrow}</span>
        </div>
        {copyText && <CopyChip text={copyText} />}
      </div>
      <h3 className="text-title-h4 text-accent-black mt-12">{title}</h3>
      <pre className="mt-16 font-mono text-mono-medium leading-22 text-accent-black whitespace-pre-wrap">
        {code}
      </pre>
    </div>
  );
}

function CopyChip({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      className="text-mono-x-small text-black-alpha-48 hover:text-heat-100 transition-colors flex items-center gap-4 -mt-1 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-border-faint px-6 py-2 before:transition-all before:duration-200"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
    >
      {done ? "copied" : "copy"}
    </button>
  );
}

function BuiltForTrust() {
  return (
    <div className="pcl-container pb-64 lg:pb-88">
      <div className="grid lg:grid-cols-2 gap-16 -mt-1 relative">
        <div className="border border-border-faint rounded-xl bg-surface p-32 lg:p-64 relative">
          <CurvyRect sides="allSides" />
          <div className="text-mono-x-small text-black-alpha-32 uppercase">// deterministic</div>
          <p className="mt-12 text-title-h5 text-accent-black leading-28">
            <span className="contents text-label-x-large text-accent-black">
              Same input, same verdict.
            </span>
            No LLM in the loop.
          </p>
          <div className="mt-32 grid grid-cols-2 gap-16">
            {[
              { value: 1200000, suffix: "+", label: "evaluations / day" },
              { value: 12, suffix: "ms", label: "median runtime" },
              { value: 0, suffix: "", label: "telemetry emitted" },
              { value: 100, suffix: "%", label: "local-first" },
            ].map((m) => (
              <div key={m.label} className="-mt-1 p-12 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-border-faint">
                <div className="text-title-h3 text-accent-black font-medium">
                  <CountUp value={m.value} suffix={m.suffix} />
                </div>
                <div className="text-mono-x-small text-black-alpha-32 uppercase mt-4">
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="border border-border-faint rounded-xl bg-surface p-32 lg:p-64 relative">
          <CurvyRect sides="allSides" />
          <div className="text-mono-x-small text-black-alpha-32 uppercase">// open source</div>
          <p className="mt-12 text-title-h5 text-accent-black leading-28">
            <span className="contents text-label-x-large text-accent-black">
              MIT licensed,
            </span>{" "}
            audited, no telemetry.
          </p>
          <pre className="mt-16 font-mono text-mono-medium leading-22 text-accent-black whitespace-pre-wrap">
            <span className="text-black-alpha-32">$ </span>
            <span className="text-heat-100">git clone</span> github.com/policyctl/cli{"\n"}
            <span className="text-black-alpha-32">$ </span>
            <span className="text-heat-100">cd</span> cli && make test{"\n"}
            {"  →  117 tests pass, 0 network calls"}
          </pre>
        </div>
      </div>
    </div>
  );
}

const USE_CASES = [
  {
    id: "migrations",
    title: "Migrations via generator",
    body:
      "Block any commit that edits db/migrations/* without the generated signature. Encoded once, enforced at hook time and in CI.",
    icon: GitBranch,
  },
  {
    id: "secrets",
    title: "No secrets in commits",
    body:
      "Regex-detect AWS, GitHub, OpenAI, and Slack tokens. Fail the build. Surface the offending file in the violation feed.",
    icon: Lock,
  },
  {
    id: "protected",
    title: "Protected paths",
    body:
      "Prevent agents from touching README, package.json, .github/, or any path that should require a human. Block by default, allow by exception.",
    icon: ShieldCheck,
  },
  {
    id: "tests",
    title: "Tests for source",
    body:
      "Warn when a src/ change ships without a matching test/. The agent gets the hint in the same turn, not three PR comments later.",
    icon: Database,
  },
  {
    id: "ai-rules",
    title: "AI rule author",
    body:
      "Describe a rule in plain English; get a typed policy. The CLI ships the matcher you wrote; the dashboard shows you the violations.",
    icon: Sparkle,
  },
];

function UseCases() {
  const [active, setActive] = useState(USE_CASES[0].id);
  const current = USE_CASES.find((u) => u.id === active)!;
  const Icon = current.icon;

  return (
    <div className="pcl-container pb-64 lg:pb-88">
      <div className="grid lg:grid-cols-[300px_1fr] gap-16 lg:gap-24 -mt-1 relative">
        <div className="border border-border-faint rounded-xl bg-surface p-12 relative">
          <CurvyRect sides="allSides" />
          {USE_CASES.map((u) => {
            const Ic = u.icon;
            const isActive = u.id === active;
            return (
              <button
                key={u.id}
                onClick={() => setActive(u.id)}
                className={`w-full text-left flex items-center gap-12 rounded-md p-16 transition-colors -mt-1 relative before:absolute before:inset-0 before:rounded-inherit before:border before:transition-all before:duration-200 ${
                  isActive
                    ? "bg-heat-4 text-accent-black before:border-heat-12"
                    : "text-black-alpha-72 hover:text-accent-black hover:bg-black-alpha-4 before:border-border-faint"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-12 bottom-12 w-2 bg-heat-100" />
                )}
                <Ic className={`size-4 relative ${isActive ? "text-heat-100" : "text-black-alpha-48"}`} />
                <span className="relative text-label-medium">{u.title}</span>
              </button>
            );
          })}
        </div>
        <div className="border border-border-faint rounded-xl bg-surface p-32 lg:p-64 relative">
          <CurvyRect sides="allSides" />
          <div className="flex items-center gap-12">
            <span className="size-40 inline-flex items-center justify-center rounded-md bg-heat-4 text-heat-100 -mt-1 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-heat-12">
              <Icon className="size-4" />
            </span>
            <span className="text-mono-x-small text-black-alpha-32 uppercase">
              [ use-case / {current.id} ]
            </span>
          </div>
          <h3 className="mt-16 text-title-h4 text-accent-black">
            {current.title}
          </h3>
          <p className="mt-12 text-body-large text-black-alpha-64 leading-26 max-w-369">
            {current.body}
          </p>
          <Link
            to="/docs"
            className="mt-24 inline-flex items-center gap-4 text-label-large text-heat-100 hover:opacity-80 transition-opacity"
          >
            Learn more <ArrowUpRight className="size-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

const TESTIMONIALS = [
  {
    name: "Ravi Anand",
    handle: "@raviand",
    quote:
      "policyctl replaced 3 vendor-specific configs with one file. The CI gate alone caught a leaked AWS key in a commit last week.",
    bg: "var(--heat-12)",
    initials: "RA",
  },
  {
    name: "Lin Wei",
    handle: "@linw",
    quote:
      "The hook fires before the agent writes the file. We stopped fighting PR comments and started enforcing at the source.",
    bg: "var(--black-alpha-8)",
    initials: "LW",
  },
  {
    name: "Sam Otieno",
    handle: "@samotieno",
    quote:
      "I described 'no manual migrations' once and it works across Claude, Codex, and CI. That's the dream.",
    bg: "var(--heat-12)",
    initials: "SO",
  },
  {
    name: "Jordan Mehta",
    handle: "@jmehta",
    quote:
      "Audit log shows exactly which agent did what, with diff and rule attached. Compliance finally has something to point at.",
    bg: "var(--black-alpha-8)",
    initials: "JM",
  },
  {
    name: "Kim Sato",
    handle: "@kimsato",
    quote:
      "The CLI is just a single static binary. We vendored it into our runner image and stopped thinking about governance.",
    bg: "var(--heat-12)",
    initials: "KS",
  },
  {
    name: "Drew Patel",
    handle: "@drewp",
    quote:
      "Open source, no telemetry, no cloud lock-in. We replaced a paid tool that did half of this for twice the price.",
    bg: "var(--black-alpha-8)",
    initials: "DP",
  },
];

function CommunityMarquee() {
  return (
    <div className="pb-64 lg:pb-88 overflow-hidden">
      <Marquee duration={50_000}>
        {TESTIMONIALS.map((t) => (
          <TestimonialCard key={t.handle} {...t} />
        ))}
      </Marquee>
      <div className="h-16" />
      <Marquee duration={50_000} reverse>
        {TESTIMONIALS.map((t) => (
          <TestimonialCard key={t.handle} {...t} />
        ))}
      </Marquee>
    </div>
  );
}

function TestimonialCard({
  name,
  handle,
  quote,
  bg,
  initials,
}: {
  name: string;
  handle: string;
  quote: string;
  bg: string;
  initials: string;
}) {
  return (
    <div className="w-320 lg:w-360 shrink-0 mr-16 border border-border-faint rounded-xl bg-surface hover:bg-black-alpha-4 transition-colors duration-200 group relative">
      <div className="absolute left-0 top-32 bottom-32 w-2 bg-heat-100 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
      <div className="px-20 py-20 lg:pl-32 lg:p-24 border-b border-border-faint flex items-center gap-12">
        <span
          className="size-40 rounded-full inline-flex items-center justify-center text-label-medium -mt-1 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-border-faint"
          style={{ background: bg }}
        >
          {initials}
        </span>
        <div>
          <div className="text-label-medium text-accent-black">{name}</div>
          <div className="text-body-small text-black-alpha-56">{handle}</div>
        </div>
      </div>
      <div className="p-28 lg:px-32 lg:py-24 text-body-large text-accent-black leading-26 h-144">
        {quote}
      </div>
    </div>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="pcl-section--compact py-80 lg:py-143 relative -mt-1">
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
        <div className="grid lg:grid-cols-2 gap-16 -mt-1">
          <div className="border border-border-faint rounded-xl bg-surface p-32 lg:p-64 relative">
            <CurvyRect sides="allSides" />
            <div className="text-mono-x-small text-black-alpha-32 uppercase">// cli</div>
            <h3 className="mt-12 text-title-h4 text-accent-black">Free forever</h3>
            <div className="mt-12 text-title-h2 text-accent-black">
              $0
              <span className="text-body-large text-black-alpha-48 ml-8">/ forever</span>
            </div>
            <ul className="mt-32 space-y-12 text-body-large text-black-alpha-72">
              <li className="flex gap-8">
                <Check className="size-4 text-heat-100 shrink-0 mt-2" />
                All 12 CLI commands
              </li>
              <li className="flex gap-8">
                <Check className="size-4 text-heat-100 shrink-0 mt-2" />
                Hooks for Claude, Codex, Cursor
              </li>
              <li className="flex gap-8">
                <Check className="size-4 text-heat-100 shrink-0 mt-2" />
                CI gate + 8 matchers
              </li>
              <li className="flex gap-8">
                <Check className="size-4 text-heat-100 shrink-0 mt-2" />
                MIT licensed, no telemetry
              </li>
            </ul>
            <Link to="/signup" className="mt-32 block">
              <Button variant="secondary" className="w-full">
                Get started free
              </Button>
            </Link>
          </div>
          <div className="border border-border-faint rounded-xl bg-surface p-32 lg:p-64 relative">
            <CurvyRect sides="allSides" />
            <div className="absolute top-24 right-24">
              <Badge tone="heat">Paid</Badge>
            </div>
            <div className="text-mono-x-small text-black-alpha-32 uppercase">// cloud</div>
            <h3 className="mt-12 text-title-h4 text-accent-black">Control plane</h3>
            <div className="mt-12 text-title-h2 text-accent-black">
              $5
              <span className="text-body-large text-black-alpha-48 ml-8">/ seat / month</span>
            </div>
            <ul className="mt-32 space-y-12 text-body-large text-black-alpha-72">
              <li className="flex gap-8">
                <Check className="size-4 text-heat-100 shrink-0 mt-2" />
                Cross-repo policy versioning
              </li>
              <li className="flex gap-8">
                <Check className="size-4 text-heat-100 shrink-0 mt-2" />
                Live enforcement sessions
              </li>
              <li className="flex gap-8">
                <Check className="size-4 text-heat-100 shrink-0 mt-2" />
                AI rule author + analyzer
              </li>
              <li className="flex gap-8">
                <Check className="size-4 text-heat-100 shrink-0 mt-2" />
                Daily compliance report + CSV export
              </li>
            </ul>
            <Link to="/signup" className="mt-32 block">
              <Button className="w-full" trailingIcon>
                Start free trial
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  {
    cat: "General",
    items: [
      {
        q: "What is policyctl?",
        a: "A provider-agnostic policy runtime for coding agents. One .policyctl.yml file is evaluated at hook time and in CI across Claude Code, OpenAI Codex, Cursor, and any tool that can shell out.",
      },
      {
        q: "Why not just CLAUDE.md?",
        a: "Prompt files are advisory. Agents skip them under context pressure. policyctl rules are evaluated deterministically and block at tool-call time — the agent literally cannot ignore a block enforcement.",
      },
      {
        q: "Is the cloud control plane required?",
        a: "No. The CLI is fully local-first and MIT licensed. The cloud adds cross-repo versioning, the violation feed, the audit dashboard, and the daily report — useful, but not required.",
      },
    ],
  },
  {
    cat: "How it works",
    items: [
      {
        q: "What does a rule look like?",
        a: "A rule is a YAML object: an id, a match block (path, regex, globs, content), and an enforce level (block / fail / warn / log). Rules are procedural assertions, not opinions.",
      },
      {
        q: "How do hooks get installed?",
        a: "`policyctl init` detects which agent you're using (Claude / Codex / Cursor), writes the right hook config, and points it at the local `policyctl check` binary. Re-run it any time.",
      },
      {
        q: "What about CI?",
        a: "Same binary, same engine. `policyctl check --report json --fail-on block,fail` exits non-zero on violations. Stream results to the dashboard with one extra flag.",
      },
    ],
  },
];

function FAQ() {
  const [open, setOpen] = useState<string | null>("0-0");
  return (
    <section className="pcl-section--compact py-80 lg:py-109 relative -mt-1">
      <CurvyRect sides="allSides" />
      <div className="pcl-container">
        <div className="grid lg:grid-cols-2 gap-32 lg:gap-64 -mt-1">
          <div>
            <span className="pcl-section__badge">FAQ</span>
            <h2 className="pcl-section__title lg:!text-start lg:!pt-0 lg:!mx-0">
              Frequently asked{" "}
              <span className="text-heat-100">questions</span>
            </h2>
            <p className="pcl-section__subtitle lg:!text-start lg:!max-w-none lg:!mx-0">
              Everything you need to know before you wire up the first repo.
            </p>
          </div>
          <div>
            {FAQS.map((group, gi) => (
              <div key={group.cat} className="-mt-1">
                <div className="text-title-h5 text-accent-black px-16 lg:px-32 py-24 lg:py-40 -mt-1 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-border-faint">
                  {group.cat}
                </div>
                {group.items.map((it, i) => {
                  const id = `${gi}-${i}`;
                  const isOpen = open === id;
                  return (
                    <div key={i} className="-mt-1">
                      <button
                        onClick={() => setOpen(isOpen ? null : id)}
                        className="w-full text-label-large text-accent-black flex items-center justify-between gap-16 px-16 lg:px-32 py-20 hover:bg-black-alpha-4 transition-colors -mt-1 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-border-faint"
                      >
                        <span className="text-start">{it.q}</span>
                        <motion.span
                          animate={{ rotate: isOpen ? 45 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Plus className="size-4 text-black-alpha-48" />
                        </motion.span>
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } }}
                            exit={{ height: 0, opacity: 0, transition: { duration: 0.3 } }}
                            className="overflow-hidden -mt-1"
                          >
                            <div className="px-16 lg:px-32 py-20 border-t border-border-faint -mt-1 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-border-faint">
                              <p className="text-body-large text-black-alpha-64 leading-26">
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
            ))}
          </div>
        </div>
      </div>
      <IndexStrip index={6} total={6} label="Frequently asked" />
    </section>
  );
}

function CTA() {
  return (
    <section className="py-64 lg:py-88">
      <div className="pcl-container">
        <div className="border border-border-faint rounded-xl bg-surface p-32 lg:p-64 text-center relative">
          <CurvyRect sides="allSides" />
          <div className="size-48 mx-auto rounded-full bg-heat-4 inline-flex items-center justify-center text-heat-100 -mt-1 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-heat-12">
            <Sparkle className="size-5" />
          </div>
          <h2 className="mt-24 text-title-h3 text-accent-black tracking-tight">
            Ready to enforce?
          </h2>
          <p className="mt-12 text-body-large text-black-alpha-72 max-w-369 mx-auto">
            <span className="contents text-label-large text-accent-black">
              No credit card.
            </span>{" "}
            The CLI is free forever.
          </p>
          <div className="mt-32 flex flex-wrap justify-center gap-12">
            <Link to="/signup">
              <Button size="lg" trailingIcon>
                Get started free
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}