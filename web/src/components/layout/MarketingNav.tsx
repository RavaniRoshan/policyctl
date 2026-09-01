import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { List, X, ArrowRight, Scroll, Sparkle, ChartBar } from "@phosphor-icons/react";

const GITHUB = "https://github.com/RavaniRoshan/policyctl";

export function MarketingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const scrollToAnchor = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault();
    const el = document.querySelector(hash);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = `/${hash}`;
    }
  };

  return (
    <header
      className={`sticky top-0 left-0 w-full z-[101] transition-all duration-300 ${
        scrolled
          ? "bg-background-base/80 backdrop-blur-xl border-b border-border-faint shadow-[0_1px_0_rgba(0,0,0,0.04)]"
          : "bg-background-base border-b border-transparent"
      }`}
    >
      <div className="pcl-container flex items-center justify-between h-64">
        <Link to="/" className="flex items-center gap-8 text-accent-black no-underline group">
          <span className="inline-flex size-32 items-center justify-center rounded-lg bg-heat-100 text-accent-white group-hover:scale-105 transition-transform duration-200">
            <FlameMark className="size-5" />
          </span>
          <span className="text-label-large font-medium tracking-tight text-accent-black">
            policyctl
          </span>
        </Link>

        <nav className="hidden items-center gap-4 md:flex">
          <NavLink
            to="/docs"
            className={({ isActive }) =>
              `px-12 py-6 rounded-md text-label-medium transition-colors duration-200 ${
                isActive
                  ? "text-accent-black bg-black-alpha-4"
                  : "text-black-alpha-72 hover:text-accent-black hover:bg-black-alpha-4"
              }`
            }
          >
            Docs
          </NavLink>
          <a
            href="/#features"
            onClick={(e) => scrollToAnchor(e, "#features")}
            className="px-12 py-6 rounded-md text-label-medium text-black-alpha-72 hover:text-accent-black hover:bg-black-alpha-4 transition-colors duration-200"
          >
            Features
          </a>
          <a
            href="/#pricing"
            onClick={(e) => scrollToAnchor(e, "#pricing")}
            className="px-12 py-6 rounded-md text-label-medium text-black-alpha-72 hover:text-accent-black hover:bg-black-alpha-4 transition-colors duration-200"
          >
            Pricing
          </a>
          <a
            href={GITHUB}
            target="_blank"
            rel="noreferrer"
            className="px-12 py-6 rounded-md text-label-medium text-black-alpha-72 hover:text-accent-black hover:bg-black-alpha-4 transition-colors duration-200"
          >
            GitHub
          </a>
        </nav>

        <div className="flex items-center gap-8">
          <Link
            to="/login"
            className="hidden sm:inline-flex px-12 py-6 rounded-md text-label-medium text-black-alpha-72 hover:text-accent-black hover:bg-black-alpha-4 transition-colors duration-200"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center gap-4 h-40 px-20 rounded-full bg-accent-black text-accent-white text-label-medium font-medium hover:bg-black-alpha-88 active:scale-[0.98] transition-all duration-200"
          >
            Get started
            <ArrowRight className="size-3.5" />
          </Link>
          <button
            className="md:hidden text-black-alpha-72 p-8 -mr-8 rounded-md hover:bg-black-alpha-4 transition-colors"
            onClick={() => setMobileOpen((m) => !m)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="size-5" /> : <List className="size-5" />}
          </button>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
          mobileOpen ? "max-h-400 opacity-100 border-t border-border-faint" : "max-h-0 opacity-0 border-t border-transparent"
        }`}
      >
        <div className="px-16 py-16 flex flex-col gap-4 bg-background-base">
          <NavLink
            to="/docs"
            className={({ isActive }) =>
              `px-12 py-8 rounded-md text-label-medium ${
                isActive ? "text-accent-black bg-black-alpha-4" : "text-accent-black"
              }`
            }
          >
            Docs
          </NavLink>
          <a
            href="/#features"
            onClick={(e) => scrollToAnchor(e, "#features")}
            className="px-12 py-8 rounded-md text-label-medium text-accent-black"
          >
            Features
          </a>
          <a
            href="/#pricing"
            onClick={(e) => scrollToAnchor(e, "#pricing")}
            className="px-12 py-8 rounded-md text-label-medium text-accent-black"
          >
            Pricing
          </a>
          <a
            href={GITHUB}
            target="_blank"
            rel="noreferrer"
            className="px-12 py-8 rounded-md text-label-medium text-accent-black"
          >
            GitHub
          </a>
          <div className="h-1 bg-border-faint my-4" />
          <Link to="/login" className="px-12 py-8 rounded-md text-label-medium text-accent-black">
            Sign in
          </Link>
          <Link to="/signup" className="px-12 py-8 rounded-md text-label-large font-medium text-heat-100">
            Get started free →
          </Link>
        </div>
      </div>
    </header>
  );
}

function FlameMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 600" fill="none" className={className} aria-hidden>
      <path
        d="M300 80c-50 70-90 110-90 200 0 100 80 200 90 220 10-20 90-120 90-220 0-90-40-130-90-200z"
        fill="currentColor"
      />
    </svg>
  );
}