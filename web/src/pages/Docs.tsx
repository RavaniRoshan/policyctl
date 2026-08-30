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
  { id: "getting-started", title: "Getting Started", items: [{ id: "install", title: "Install" }, { id: "quickstart", title: "Quickstart" }] },
  { id: "core-concepts", title: "Core Concepts", items: [{ id: "policy-file", title: "The policy file" }, { id: "matchers", title: "Rule matchers" }, { id: "levels", title: "Enforce levels" }, { id: "scopes", title: "Scopes" }] },
  { id: "cli-reference", title: "CLI Reference", items: [{ id: "commands", title: "Commands" }] },
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
    <div className="min-h-screen bg-bg-primary">
      <MarketingNav />
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-0 px-4 md:grid-cols-[240px_1fr_220px]">
        <aside className="hidden md:block border-r border-border py-8 pr-4">
          <nav className="sticky top-24 space-y-6">
            {sections.map((s) => (
              <div key={s.id}>
                <div className="font-mono text-xs uppercase tracking-wider text-fg-muted">{s.title}</div>
                <ul className="mt-2 space-y-1">
                  {s.items.map((it) => (
                    <li key={it.id}>
                      <a href={`#${it.id}`} className={cn("block rounded-md px-2 py-1 text-sm transition-colors", active === it.id ? "bg-brand/10 text-brand" : "text-fg-secondary hover:text-fg-primary")}>{it.title}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <article className="min-w-0 max-w-3xl py-10 px-2 md:px-8">
          <div className="flex items-center justify-between">
            <Badge tone="brand">CLI and Developer Tooling</Badge>
            <button onClick={copyMd} className="inline-flex items-center gap-1 rounded-lg border border-border bg-bg-surface px-2 py-1 text-xs text-fg-secondary hover:text-brand" aria-label="Copy page as markdown">
              {copied ? <Check className="size-3.5 text-brand" /> : <Copy className="size-3.5" />}
              {copied ? "Copied" : "Copy MD"}
            </button>
          </div>

          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-fg-primary">policyctl Documentation</h1>
          <p className="mt-2 text-lg text-fg-secondary">Provider-agnostic policy runtime for coding agents, enforced at tool-call time and in CI.</p>

          <h2 id="getting-started" className="mt-10 scroll-mt-24 font-display text-2xl font-semibold text-fg-primary">Getting Started</h2>
          <h3 id="install" className="mt-6 scroll-mt-24 font-display text-xl font-semibold text-fg-primary">Install</h3>
          <p className="mt-2 text-fg-secondary">Node 18+ required. Install the CLI globally:</p>
          <CodeBlock code="npm install -g @policyctl/cli" lang="bash" />
          <Callout type="warning" title="Use a global install">A global install lets hooks resolve <code className="font-mono">policyctl</code> from any repo.</Callout>

          <h3 id="quickstart" className="mt-6 scroll-mt-24 font-display text-xl font-semibold text-fg-primary">Quickstart</h3>
          <p className="mt-2 text-fg-secondary">Lead with the command, not the theory:</p>
          <CodeBlock code={"policyctl init --template full\npolicyctl gen claude\npolicyctl check --from main"} lang="bash" />

          <h2 id="core-concepts" className="mt-10 scroll-mt-24 font-display text-2xl font-semibold text-fg-primary">Core Concepts</h2>
          <h3 id="policy-file" className="mt-6 scroll-mt-24 font-display text-xl font-semibold text-fg-primary">The policy file</h3>
          <p className="mt-2 text-fg-secondary">One <code className="font-mono">.policyctl.yml</code> declares rules.</p>
          <CodeBlock filename=".policyctl.yml" lang="yaml" code={"rules:\n  - name: migrations-via-generator\n    match:\n      path: db/migrations/**\n    enforce: block\n    scope: both\n    require: generator-signature"} />

          <h3 id="matchers" className="mt-6 scroll-mt-24 font-display text-xl font-semibold text-fg-primary">Rule matchers</h3>
          <p className="mt-2 text-fg-secondary">Compose matchers to target exactly what an agent may or may not do.</p>
          <div className="mt-3 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-bg-surface text-left font-mono text-xs uppercase text-fg-muted"><th className="p-3">Matcher</th><th className="p-3">Description</th></tr></thead>
              <tbody>
                <tr className="border-b border-border/60"><td className="p-3 font-mono text-fg-primary">path</td><td className="p-3 text-fg-secondary">Glob over changed files</td></tr>
                <tr className="border-b border-border/60"><td className="p-3 font-mono text-fg-primary">regex</td><td className="p-3 text-fg-secondary">Match diff content</td></tr>
                <tr><td className="p-3 font-mono text-fg-primary">tool</td><td className="p-3 text-fg-secondary">Match a tool call</td></tr>
              </tbody>
            </table>
          </div>

          <h3 id="levels" className="mt-6 scroll-mt-24 font-display text-xl font-semibold text-fg-primary">Enforce levels</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge tone="danger">block</Badge>
            <Badge tone="accent">fail</Badge>
            <Badge tone="muted">warn</Badge>
            <Badge tone="brand">allow</Badge>
          </div>

          <h3 id="scopes" className="mt-6 scroll-mt-24 font-display text-xl font-semibold text-fg-primary">Scopes</h3>
          <p className="mt-2 text-fg-secondary"><Badge tone="brand">hook</Badge> enforces at agent tool-call time. <Badge tone="accent">ci</Badge> enforces in the pipeline.</p>

          <h2 id="cli-reference" className="mt-10 scroll-mt-24 font-display text-2xl font-semibold text-fg-primary">CLI Reference</h2>
          <h3 id="commands" className="mt-6 scroll-mt-24 font-display text-xl font-semibold text-fg-primary">Commands</h3>
          <CodeBlock code={"policyctl init      # scaffold a policy\npolicyctl gen       # write provider hooks\npolicyctl check     # gate the diff\npolicyctl login     # link the control plane\npolicyctl report    # export compliance CSV"} lang="bash" />

          <div className="mt-10 flex items-center justify-between border-t border-border pt-6 text-sm">
            <a href={`${GITHUB}/edit/main/site/docs.html`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-fg-muted hover:text-brand"><GitHubIcon className="size-4" /> Edit on GitHub</a>
            <a href={`${GITHUB}/issues/new`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-fg-muted hover:text-brand"><MessageSquare className="size-4" /> Report an issue</a>
          </div>
        </article>

        <aside className="hidden lg:block py-10 pl-4">
          <div className="sticky top-24">
            <div className="font-mono text-xs uppercase tracking-wider text-fg-muted">On this page</div>
            <ul className="mt-3 space-y-1 border-l border-border">
              {sections.flatMap((s) => s.items).map((it) => (
                <li key={it.id}>
                  <a href={`#${it.id}`} className={cn("block border-l-2 pl-3 text-sm -ml-px transition-colors", active === it.id ? "border-brand text-brand" : "border-transparent text-fg-muted hover:text-fg-primary")}>{it.title}</a>
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
