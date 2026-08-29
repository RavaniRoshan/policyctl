import { useState } from "react";
import { Link } from "react-router-dom";
import { Command as CommandIcon, Menu, X } from "lucide-react";
import { CommandPalette, type Command } from "@/components/ui/command-palette";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.726-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.602-2.665-.305-5.466-1.334-5.466-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.007-.322 3.3 1.23A11.507 11.507 0 0112 5.808c1.007.003 2.027.135 3.005.399 2.287-1.552 3.294-1.23 3.294-1.23.653 1.653.242 2.874.117 3.177.77.84 1.235 1.911 1.235 3.221 0 4.609-2.81 6.623-5.484 7.09.429.37.818 1.102.818 2.223 0 1.606-.015 2.897-.015 3.29-0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

const GITHUB = "https://github.com/RavaniRoshan/policyctl";
const NPM = "https://www.npmjs.com/package/@policyctl/cli";

export function MarketingNav() {
  const [palette, setPalette] = useState(false);
  const [mobile, setMobile] = useState(false);

  const commands: Command[] = [
    { label: "Home", group: "Pages", action: () => (location.href = "/") },
    { label: "Documentation", hint: "/docs", group: "Pages", action: () => (location.href = "/docs") },
    { label: "How it works", group: "Pages", action: () => (location.href = "/#how") },
    { label: "Enforce", group: "Pages", action: () => (location.href = "/#enforce") },
    { label: "Pricing", group: "Pages", action: () => (location.href = "/#pricing") },
    { label: "Sign up", group: "Account", action: () => (location.href = "/signup") },
    { label: "Log in", group: "Account", action: () => (location.href = "/login") },
    { label: "GitHub", group: "External", action: () => window.open(GITHUB, "_blank") },
    { label: "npm package", group: "External", action: () => window.open(NPM, "_blank") },
  ];

  return (
    <>
      <header className="sticky top-4 z-50 mx-auto w-[min(1120px,calc(100%-2rem))]">
        <div className="flex items-center justify-between gap-4 rounded-pill border border-n-800 bg-n-1000/60 px-3 py-2 pl-4 backdrop-blur-xl shadow-[0_14px_40px_-18px_rgba(0,0,0,0.7)]">
          <Link to="/" className="flex items-center gap-2 text-n-100" style={{ textDecoration: "none" }}>
            <span className="text-pc-400 text-lg">◆</span>
            <span className="font-display font-semibold text-lg">policyctl</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link to="/docs" className="text-n-300 text-sm font-medium hover:text-n-100">Docs</Link>
            <a href="/#how" className="text-n-300 text-sm font-medium hover:text-n-100">How it works</a>
            <a href="/#enforce" className="text-n-300 text-sm font-medium hover:text-n-100">Enforce</a>
            <a href={GITHUB} target="_blank" rel="noreferrer" className="text-n-300 text-sm font-medium hover:text-n-100">GitHub</a>
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPalette(true)}
              aria-label="Open command menu"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-pill border border-n-700 bg-n-800 px-2.5 py-1 text-n-400 hover:text-pc-300"
            >
              <CommandIcon className="size-3.5" />
              <span className="font-mono text-[0.7rem]">K</span>
            </button>
            <a
              href={NPM}
              target="_blank"
              rel="noreferrer"
              className="rounded-pill bg-gradient-to-b from-pc-400 to-pc-600 px-4 py-2 text-n-950 text-sm font-semibold hover:-translate-y-px transition-transform"
              style={{ textDecoration: "none" }}
            >
              npm i -g @policyctl/cli
            </a>
            <button className="md:hidden text-n-300" onClick={() => setMobile((m) => !m)} aria-label="Toggle menu">
              {mobile ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        {mobile && (
          <div className="mt-2 flex flex-col gap-1 rounded-md border border-n-800 bg-n-900 p-3 md:hidden">
            <Link to="/docs" className="py-1 text-n-200">Docs</Link>
            <a href="/#how" className="py-1 text-n-200">How it works</a>
            <a href="/#enforce" className="py-1 text-n-200">Enforce</a>
            <Link to="/signup" className="py-1 text-n-200">Sign up</Link>
            <Link to="/login" className="py-1 text-n-200">Log in</Link>
          </div>
        )}
      </header>
      <CommandPalette open={palette} onClose={() => setPalette(false)} commands={commands} />
    </>
  );
}
