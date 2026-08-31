import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { List, X } from "@phosphor-icons/react";

const GITHUB = "https://github.com/RavaniRoshan/policyctl";

export function MarketingNav() {
  const [mobile, setMobile] = useState(false);

  return (
    <header className="sticky top-0 left-0 w-full z-[101] bg-background-base">
      <div className="absolute bottom-0 left-0 h-1 w-screen left-[calc(50%-50vw)] bg-border-faint pointer-events-none" />
      <div className="pcl-container flex items-center justify-between gap-16 h-64 lg:h-80 transition-[padding] duration-200 py-20 lg:py-34">
        <Link to="/" className="flex items-center gap-2 text-accent-black no-underline">
          <span className="inline-flex size-7 items-center justify-center">
            <FlameMark />
          </span>
          <span className="font-mono text-mono-medium uppercase tracking-wider text-accent-black">
            policyctl
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <NavLink
            to="/docs"
            className="text-label-medium text-black-alpha-72 hover:text-heat-100 transition-colors duration-200"
          >
            Docs
          </NavLink>
          <a
            href="/#features"
            className="text-label-medium text-black-alpha-72 hover:text-heat-100 transition-colors duration-200"
          >
            Features
          </a>
          <a
            href="/#pricing"
            className="text-label-medium text-black-alpha-72 hover:text-heat-100 transition-colors duration-200"
          >
            Pricing
          </a>
          <a
            href={GITHUB}
            target="_blank"
            rel="noreferrer"
            className="text-label-medium text-black-alpha-72 hover:text-heat-100 transition-colors duration-200"
          >
            GitHub
          </a>
        </nav>

        <div className="flex items-center gap-8">
          <Link
            to="/login"
            className="hidden sm:inline-flex text-label-medium text-black-alpha-72 hover:text-heat-100 transition-colors duration-200"
          >
            Sign in
          </Link>
          <Link to="/signup" className="pcl-btn pcl-btn--primary">
            <span>Get started</span>
          </Link>
          <button
            className="md:hidden text-black-alpha-72 p-4"
            onClick={() => setMobile((m) => !m)}
            aria-label="Toggle menu"
          >
            {mobile ? <X className="size-5" /> : <List className="size-5" />}
          </button>
        </div>
      </div>

      {mobile && (
        <div className="border-t border-border-faint bg-background-base px-16 py-12 md:hidden">
          <div className="flex flex-col gap-4">
            <Link to="/docs" className="text-label-medium py-8 text-accent-black">
              Docs
            </Link>
            <a href="/#features" className="text-label-medium py-8 text-accent-black">
              Features
            </a>
            <a href="/#pricing" className="text-label-medium py-8 text-accent-black">
              Pricing
            </a>
            <Link to="/login" className="text-label-medium py-8 text-accent-black">
              Sign in
            </Link>
            <Link to="/signup" className="text-label-medium py-8 text-heat-100">
              Get started →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function FlameMark() {
  return (
    <svg viewBox="0 0 600 600" fill="none" aria-hidden>
      <path
        d="M300 80c-50 70-90 110-90 200 0 100 80 200 90 220 10-20 90-120 90-220 0-90-40-130-90-200z"
        fill="#fa5d19"
      />
      <path
        d="M300 260c-20 30-40 60-40 110 0 60 30 110 40 130 10-20 40-70 40-130 0-50-20-80-40-110z"
        fill="#262626"
      />
    </svg>
  );
}