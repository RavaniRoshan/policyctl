import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import { useEffect, useState } from "react";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { Footer } from "@/components/layout/Footer";
import { MagnifyingGlass, ArrowUpRight } from "@phosphor-icons/react";
import { Section } from "@policyctl/design-system";

const DOCS: { slug: string; title: string; section: string; content: string }[] = [
  {
    slug: "intro",
    title: "Introduction",
    section: "Getting started",
    content: `# Introduction

policyctl is a **provider-agnostic policy runtime** for coding agents.

Encode procedural rules in \`.policyctl.yml\`. The same file is evaluated at tool-call time in Claude Code, OpenAI Codex, Cursor, and any tool that can shell out — and as a hard gate in CI.

## Why policyctl?

- **Prompt files are advisory.** Agents skip them under context pressure.
- **Vendor denylists are per-model.** One rule per agent, no sharing.
- **policyctl is deterministic.** A block enforcement cannot be ignored.

## The model

A rule is a YAML object: an \`id\`, a \`match\` block, and an \`enforce\` level.

\`\`\`yaml
rules:
  - id: migrations-via-generator
    match:
      path: db/migrations/*
    enforce: block
\`\`\`

The engine is a single static binary. No telemetry. No network calls. MIT licensed.`,
  },
  {
    slug: "install",
    title: "Install",
    section: "Getting started",
    content: `# Install

The CLI is a single static binary.

\`\`\`bash
npm install -g @policyctl/cli
\`\`\`

Or with Homebrew:

\`\`\`bash
brew install policyctl/tap/policyctl
\`\`\`

Or download the binary directly from the [GitHub releases](https://github.com/RavaniRoshan/policyctl/releases) page.

Verify the install:

\`\`\`bash
policyctl --version
# policyctl 0.4.2
\`\`\``,
  },
  {
    slug: "init",
    title: "Initialize a project",
    section: "Getting started",
    content: `# Initialize a project

Run \`policyctl init\` inside any repo. The CLI detects which agents are configured, writes the right hook, and scaffolds a starter \`.policyctl.yml\`.

\`\`\`bash
cd my-app
policyctl init
\`\`\`

You'll see:

\`\`\`
✓ Detected agents: claude, codex, cursor
✓ Wrote .policyctl.yml
✓ Generated .claude/settings.json hook
✓ Generated .codex/hooks/policyctl.json
✓ Generated .cursor/hooks.json
\`\`\`

The init command is **idempotent** — re-running it won't clobber your rules.`,
  },
  {
    slug: "rules",
    title: "Writing rules",
    section: "Authoring",
    content: `# Writing rules

A rule has three parts:

| Field | Purpose |
| --- | --- |
| \`id\` | Stable identifier. Shown in violation feed and audit log. |
| \`match\` | What to evaluate. Path, regex, glob, or content predicate. |
| \`enforce\` | What to do: \`block / fail / warn / log\`. |

## Match types

\`\`\`yaml
rules:
  - id: protect-readme
    match:
      path: README.md
    enforce: block
  - id: no-secrets
    match:
      regex: '(AKIA|ghp_|sk-[A-Za-z0-9]{20,})'
    enforce: fail
  - id: tests-for-src
    match:
      glob: src/**
    enforce: warn
\`\`\`

Combine matchers with \`all\` and \`any\`:

\`\`\`yaml
match:
  all:
    - path: db/migrations/*
    - regex: '(?i)manual edit'
  enforce: block
\`\`\``,
  },
  {
    slug: "enforcement",
    title: "Enforcement levels",
    section: "Authoring",
    content: `# Enforcement levels

| Level | Behavior at hook | Behavior in CI |
| --- | --- | --- |
| \`block\` | Hook returns non-zero. Agent cannot proceed. | Build fails. |
| \`fail\` | Hook warns. Agent may continue. | Build fails. |
| \`warn\` | Hook warns. | Build passes. |
| \`log\`  | Recorded only. | Recorded only. |

## Choosing a level

- **block** when the rule is non-negotiable (secrets, protected paths, generated-only migrations).
- **fail** when the rule should be visible in CI but not block agents mid-task.
- **warn** for soft guidance (e.g. "did you add a test?").
- **log** when you're experimenting with a matcher and don't want noise yet.`,
  },
  {
    slug: "ci",
    title: "Wiring CI",
    section: "Operations",
    content: `# Wiring CI

\`\`\`yaml
- name: policyctl gate
  run: |
    npx -y @policyctl/cli check \\
      --policy .policyctl.yml \\
      --report json \\
      --fail-on block,fail
\`\`\`

Stream violations to the dashboard by exporting the control-plane token:

\`\`\`bash
export POLICYCTL_TOKEN=pc_live_••••••••
\`\`\`

The \`check\` command emits a JSON report to \`--report\` and POSTs a summary to \`/api/violations\` when \`POLICYCTL_TOKEN\` is set.`,
  },
  {
    slug: "cloud",
    title: "Control plane",
    section: "Operations",
    content: `# Control plane

The CLI is the source of truth. The cloud control plane adds:

- **Cross-repo policy versioning** — diff history, author attribution, rollback.
- **Live violation feed** — every check that runs anywhere, streamed in.
- **Compliance ring** — at-a-glance posture for the last 7 / 30 / 90 days.
- **Daily report** — delivered to your inbox at 09:00 UTC.
- **AI rule author** — describe a rule in plain English, get a typed policy.

## When to upgrade

Most teams start with the CLI and upgrade when:

- More than 2 repos need to share the same policy.
- Compliance asks for an audit trail.
- You want the daily report + CSV export.`,
  },
];

export function Docs() {
  const [active, setActive] = useState(DOCS[0].slug);
  const [q, setQ] = useState("");

  const filtered = q
    ? DOCS.filter(
        (d) =>
          d.title.toLowerCase().includes(q.toLowerCase()) ||
          d.section.toLowerCase().includes(q.toLowerCase()),
      )
    : DOCS;

  const current = DOCS.find((d) => d.slug === active) ?? DOCS[0];

  return (
    <div className="min-h-screen bg-background-base text-accent-black">
      <MarketingNav />
      <main id="main-content" tabIndex={-1} className="focus:outline-none">
      <div className="pcl-container pt-32 pb-64 lg:pb-88">
        <div className="grid lg:grid-cols-[280px_1fr] gap-32 lg:gap-64 -mt-1">
          <aside className="hidden lg:block">
            <div className="-mt-1 relative">
              <div className="flex items-center gap-8 px-12 py-8 -mt-1 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-border-faint">
                <MagnifyingGlass className="size-3 text-black-alpha-32" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search docs"
                  className="bg-transparent outline-none text-body-small flex-1 placeholder:text-black-alpha-32"
                />
              </div>
            </div>
            <nav className="mt-16 space-y-2">
              {Array.from(new Set(filtered.map((d) => d.section))).map((section) => (
                <div key={section}>
                  <div className="text-mono-x-small text-black-alpha-32 uppercase px-12 py-8 mt-16">
                    {section}
                  </div>
                  {filtered
                    .filter((d) => d.section === section)
                    .map((d) => (
                      <button
                        key={d.slug}
                        onClick={() => setActive(d.slug)}
                        className={`w-full text-left text-label-medium px-12 py-8 rounded-md transition-colors -mt-1 relative before:absolute before:inset-0 before:rounded-inherit before:border before:transition-all before:duration-200 ${
                          active === d.slug
                            ? "bg-heat-4 text-accent-black before:border-heat-12"
                            : "text-black-alpha-72 hover:text-accent-black hover:bg-black-alpha-4 before:border-border-faint"
                        }`}
                      >
                        {d.title}
                      </button>
                    ))}
                </div>
              ))}
            </nav>
          </aside>

          <article className="prose-custom max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSlug, rehypeHighlight]}
            >
              {current.content}
            </ReactMarkdown>
          </article>
        </div>
      </div>
      <Footer />

      <style>{`
        .prose-custom h1 { font-size: 40px; line-height: 44px; font-weight: 500; letter-spacing: -0.4px; margin-bottom: 16px; }
        .prose-custom h2 { font-size: 24px; line-height: 32px; font-weight: 500; letter-spacing: -0.24px; margin-top: 32px; margin-bottom: 12px; padding-top: 16px; border-top: 1px solid var(--border-faint); }
        .prose-custom h3 { font-size: 18px; line-height: 28px; font-weight: 500; margin-top: 24px; margin-bottom: 8px; }
        .prose-custom p { font-size: 16px; line-height: 26px; color: var(--black-alpha-72); margin-bottom: 12px; }
        .prose-custom code { font-family: var(--font-mono); font-size: 14px; background: var(--black-alpha-4); padding: 2px 6px; border-radius: 4px; }
        .prose-custom pre { background: var(--background-base); border: 1px solid var(--border-faint); border-radius: 12px; padding: 16px; overflow-x: auto; font-family: var(--font-mono); font-size: 13px; line-height: 22px; margin: 16px 0; }
        .prose-custom pre code { background: transparent; padding: 0; font-size: 13px; }
        .prose-custom table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        .prose-custom th, .prose-custom td { padding: 12px 16px; border: 1px solid var(--border-faint); text-align: left; font-size: 14px; }
        .prose-custom th { background: var(--black-alpha-4); font-weight: 450; }
        .prose-custom ul, .prose-custom ol { padding-left: 24px; margin: 12px 0; }
        .prose-custom li { font-size: 16px; line-height: 26px; color: var(--black-alpha-72); margin-bottom: 6px; }
        .prose-custom a { color: var(--heat-100); text-decoration: none; }
        .prose-custom a:hover { opacity: 0.8; }
        .prose-custom strong { color: var(--accent-black); font-weight: 500; }
      `}</style>
      </main>
    </div>
  );
}