import { useState } from "react";
import { Link } from "react-router-dom";
import { List, X, Sun, Moon } from "@phosphor-icons/react";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const GITHUB = "https://github.com/RavaniRoshan/policyctl";

export function MarketingNav() {
  const [mobile, setMobile] = useState(false);
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-border bg-bg-primary/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-content items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 text-fg-primary no-underline">
          <span className="text-brand text-lg">◆</span>
          <span className="font-display font-semibold text-lg">policyctl</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link to="/docs" className="text-sm font-medium text-fg-secondary hover:text-fg-primary transition-colors">Docs</Link>
          <a href="#features" className="text-sm font-medium text-fg-secondary hover:text-fg-primary transition-colors">Features</a>
          <a href="#pricing" className="text-sm font-medium text-fg-secondary hover:text-fg-primary transition-colors">Pricing</a>
          <a href={GITHUB} target="_blank" rel="noreferrer" className="text-sm font-medium text-fg-secondary hover:text-fg-primary transition-colors">GitHub</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="flex size-9 items-center justify-center rounded-lg border border-border text-fg-secondary hover:text-fg-primary hover:bg-bg-surface transition-colors"
          >
            {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </button>
          <Link to="/login" className="hidden sm:inline-flex text-sm font-medium text-fg-secondary hover:text-fg-primary transition-colors">
            Sign in
          </Link>
          <Link
            to="/signup"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-brand px-4 text-sm font-medium text-fg-inverse hover:bg-brand-hover transition-colors"
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
