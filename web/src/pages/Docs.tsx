import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { CommandPalette, type Command } from "@/components/ui/command-palette";
import { Callout } from "@/components/ui/callout";
import { CodeBlock } from "@/components/ui/code-block";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, MessageSquare, Copy, Check } from "lucide-react";
import { GitHubIcon } from "@/components/ui/brand-icons";
import { cn } from "@/lib/utils";

const sections = [
  {
    id: "getting-started",
    title: "Getting Started",
    items: [
      { id: "install", title: "Install" },
      { id: "quickstart", title: "Quickstart" },
    ],
  },
  {
    id: "core-concepts",
    title: "Core Concepts",
    items: [
      { id: "policy-file", title: "The policy file" },
      { id: "matchers", title: "Rule matchers" },
      { id: "levels", title: "Enforce levels" },
      { id: "scopes", title: "Scopes" },
    ],
  },
  {
    id: "cli-reference",
    title: "CLI Reference",
    items: [{ id: "commands", title: "Commands" }],
  },
];

const GITHUB = "https://github.com/RavaniRoshan/policyctl";

export function Docs() {
  const [palette, setPalette] = useState(false);
  const [active, setActive] = useState("install");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-80px 0px -70% 0px" },
    );
    document.querySelectorAll("article h2, article h3").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const commands: Command[] = [
    { label: "Install", group: "Docs", action: () => (location.href = "/docs#install") },
    { label: "Quickstart", group: "Docs", action: () => (location.href = "/docs#quickstart") },
    { label: "Core Concepts", group: "Docs", action: () => (location.href = "/docs#core-concepts") },
    { label: "CLI Reference", group: "Docs", action: () => (location.href = "/docs#cli-reference") },
    { label: "Home", group: "Navigate", action: () => (location.href = "/") },
    { label: "GitHub", group: "External", action: () => window.open(GITHUB, "_blank") },
  ];

  const copyMd = async () => {
    await navigator.clipboard.writeText(`<context url="https://policyctl.pages.dev/docs">\n${document.querySelector("article")?.innerText ?? ""}\n</context>`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-n-950">
      <MarketingNav />
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-0 px-4 md:grid-cols-[240px_1fr_220px]">
        {/* Left nav */}
        <aside className="hidden md:block border-r border-n-800 py-8 pr-4">
          <nav className="sticky top-24 space-y-6">
            {sections.map((s) => (
              <div key={s.id}>
                <div className="font-mono text-xs uppercase tracking-wider text-n-500">{s.title}</div>
                <ul className="mt-2 space-y-1">
                  {s.items.map((it) => (
                    <li key={it.id}>
                      <a
                        href={`#${it.id}`}
                        className={cn(
                          "block rounded-md px-2 py-1 text-sm transition-colors",
                          active === it.id ? "bg-pc-500/10 text-pc-300" : "text-n-300 hover:text-n-100",
                        )}
                      >
                        {it.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Center */}
        <article className="min-w-0 max-w-3xl py-10 px-2 md:px-8">
          <div className="flex items-center justify-between">
            <Badge tone="pc">CLI & Developer Tooling</Badge>
            <div className="flex items-center gap-2">
              <button onClick={copyMd} className="inline-flex items-center gap-1 rounded-md border border-n-700 bg-n-800 px-2 py-1 text-xs text-n-300 hover:text-pc-300" aria-label="Copy page as markdown">
                {copied ? <Check className="size-3.5 text-pc-400" /> : <Copy className="size-3.5" />}
                {copied ? "Copied" : "Copy MD"}
              </button>
            </div>
          </div>

          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight">policyctl Documentation</h1>
          <p className="mt-2 text-lg font-semibold text-n-200">
            Provider-agnostic policy runtime for coding agents — enforced at tool-call time and in CI.
          </p>

          <h2 id="getting-started" className="mt-10 scroll-mt-24 font-display text-2xl font-semibold">Getting Started</h2>

          <h3 id="install" className="mt-6 scroll-mt-24 font-display text-xl font-semibold">Install</h3>
          <p className="mt-2 text-n-300">Node 18+ required. Install the CLI globally:</p>
          <CodeBlock code="npm install -g @policyctl/cli" lang="bash" />

          <Callout type="warning" title="Use a global install">
            A global install lets hooks resolve <code className="font-mono">policyctl</code> from any repo. Local installs work but require npx.
          </Callout>

          <h3 id="quickstart" className="mt-6 scroll-mt-24 font-display text-xl font-semibold">Quickstart</h3>
          <p className="mt-2 text-n-300">Lead with the command, not the theory:</p>
          <CodeBlock code={"policyctl init --template full\npolicyctl gen claude\npolicyctl check --from main"} lang="bash" />

          <h2 id="core-concepts" className="mt-10 scroll-mt-24 font-display text-2xl font-semibold">Core Concepts</h2>

          <h3 id="policy-file" className="mt-6 scroll-mt-24 font-display text-xl font-semibold">The policy file</h3>
          <p className="mt-2 text-n-300">One <code className="font-mono">.policyctl.yml</code> declares rules. Hook-time and CI-time share the same engine.</p>
          <CodeBlock
            filename=".policyctl.yml"
            lang="yaml"
            code={"rules:\n  - name: migrations-via-generator\n    match:\n      path: db/migrations/**\n    enforce: block\n    scope: both\n    require: generator-signature"}
          />

          <h3 id="matchers" className="mt-6 scroll-mt-24 font-display text-xl font-semibold">Rule matchers</h3>
          <p className="mt-2 text-n-300">Compose matchers to target exactly what an agent may or may not do.</p>
          <div className="mt-3 overflow-hidden rounded-md border border-n-800">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-n-800 bg-n-900 text-left font-mono text-xs uppercase text-n-500"><th className="p-3">Matcher</th><th className="p-3">Description</th></tr></thead>
              <tbody>
                <tr className="border-b border-n-800/60"><td className="p-3 font-mono text-n-100">path</td><td className="p-3 text-n-300">Glob over changed files</td></tr>
                <tr className="border-b border-n-800/60"><td className="p-3 font-mono text-n-100">regex</td><td className="p-3 text-n-300">Match diff content (e.g. secrets)</td></tr>
                <tr><td className="p-3 font-mono text-n-100">tool</td><td className="p-3 text-n-300">Match a tool call (Bash, Edit, Write)</td></tr>
              </tbody>
            </table>
          </div>

          <h3 id="levels" className="mt-6 scroll-mt-24 font-display text-xl font-semibold">Enforce levels</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge tone="danger">block</Badge>
            <Badge tone="ac">fail</Badge>
            <Badge tone="muted">warn</Badge>
            <Badge tone="pc">allow</Badge>
          </div>
          <Callout type="tip" title="block vs fail">
            <code className="font-mono">block</code> stops the tool call at hook time; <code className="font-mono">fail</code> fails the CI build.
          </Callout>

          <h3 id="scopes" className="mt-6 scroll-mt-24 font-display text-xl font-semibold">Scopes</h3>
          <p className="mt-2 text-n-300"><Badge tone="pc">hook</Badge> enforces at agent tool-call time; <Badge tone="ac">ci</Badge> enforces in the pipeline; <Badge tone="muted">both</Badge> enforces everywhere.</p>

          <h2 id="cli-reference" className="mt-10 scroll-mt-24 font-display text-2xl font-semibold">CLI Reference</h2>
          <h3 id="commands" className="mt-6 scroll-mt-24 font-display text-xl font-semibold">Commands</h3>
          <CodeBlock code={"policyctl init      # scaffold a policy\npolicyctl gen       # write provider hooks\npolicyctl check     # gate the diff\npolicyctl login     # link the control plane\npolicyctl report    # export compliance CSV"} lang="bash" />

          <Callout type="note" title="LLM-ready">
            This page is also available raw at <code className="font-mono">/llms.txt</code> and <code className="font-mono">/docs/&lt;slug&gt;.md</code> for autonomous agents.
          </Callout>

          <div className="mt-10 flex items-center justify-between border-t border-n-800 pt-6 text-sm">
            <a href={`${GITHUB}/edit/main/site/docs.html`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-n-400 hover:text-pc-300"><GitHubIcon className="size-4" /> Edit this page on GitHub</a>
            <a href={`${GITHUB}/issues/new`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-n-400 hover:text-pc-300"><MessageSquare className="size-4" /> Report an issue</a>
          </div>
        </article>

        {/* Right TOC */}
        <aside className="hidden lg:block py-10 pl-4">
          <div className="sticky top-24">
            <div className="font-mono text-xs uppercase tracking-wider text-n-500">On this page</div>
            <ul className="mt-3 space-y-1 border-l border-n-800">
              {sections.flatMap((s) => s.items).map((it) => (
                <li key={it.id}>
                  <a
                    href={`#${it.id}`}
                    className={cn(
                      "block border-l-2 pl-3 text-sm -ml-px transition-colors",
                      active === it.id ? "border-pc-400 text-pc-300" : "border-transparent text-n-400 hover:text-n-100",
                    )}
                  >
                    {it.title}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Button variant="ghost" size="sm" className="w-full" onClick={() => setPalette(true)}>
                <Search className="size-3.5" /> Search docs
              </Button>
            </div>
          </div>
        </aside>
      </div>
      <CommandPalette open={palette} onClose={() => setPalette(false)} commands={commands} />
    </div>
  );
}
