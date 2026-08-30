import { useState } from "react";
import { Link } from "react-router-dom";
import { List, X } from "@phosphor-icons/react";

const GITHUB = "https://github.com/RavaniRoshan/policyctl";

export function MarketingNav() {
  const [mobile, setMobile] = useState(false);

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-border bg-bg-primary/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-content items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 text-fg-primary no-underline">
          <span className="text-brand text-lg">◆</span>
          <span className="font-sans font-semibold text-lg">policyctl</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link to="/docs" className="text-sm font-medium text-fg-secondary hover:text-fg-primary transition-colors duration-400">Docs</Link>
          <a href="#features" className="text-sm font-medium text-fg-secondary hover:text-fg-primary transition-colors duration-400">Features</a>
          <a href="#pricing" className="text-sm font-medium text-fg-secondary hover:text-fg-primary transition-colors duration-400">Pricing</a>
          <a href={GITHUB} target="_blank" rel="noreferrer" className="text-sm font-medium text-fg-secondary hover:text-fg-primary transition-colors duration-400">GitHub</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/login" className="hidden sm:inline-flex text-sm font-medium text-fg-secondary hover:text-fg-primary transition-colors duration-400">
            Sign in
          </Link>
          <Link
            to="/signup"
            className="inline-flex h-9 items-center justify-center rounded-full bg-brand px-5 text-sm font-medium text-fg-inverse hover:bg-brand-hover transition-all duration-400 ease-fluid active:scale-[0.98]"
          >
            Get started
          </Link>
          <button className="md:hidden text-fg-secondary" onClick={() => setMobile((m) => !m)} aria-label="Toggle menu">
            {mobile ? <X className="size-5" /> : <List className="size-5" />}
          </button>
        </div>
      </div>

      {mobile && (
        <div className="border-t border-border bg-bg-primary px-6 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link to="/docs" className="py-2 text-fg-primary">Docs</Link>
            <a href="#features" className="py-2 text-fg-primary">Features</a>
            <a href="#pricing" className="py-2 text-fg-primary">Pricing</a>
            <Link to="/login" className="py-2 text-fg-primary">Sign in</Link>
            <Link to="/signup" className="py-2 text-brand font-medium">Get started</Link>
          </div>
        </div>
      )}
    </header>
  );
}
