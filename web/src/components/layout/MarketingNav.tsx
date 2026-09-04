import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  List,
  X,
  GithubLogo,
  Terminal,
  GitBranch,
  ShieldCheck,
  Sparkle,
  BookOpen,
  FolderLock,
  Robot,
  FileCode,
} from "@phosphor-icons/react";
import { PolicyctlMark } from "@/components/brand/PolicyctlMark";
import { CurvyRect } from "@policyctl/design-system";
import { useAuth } from "@/lib/auth";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

const GITHUB = "https://github.com/RavaniRoshan/policyctl";
const GITHUB_DISPLAY_METRIC = "1.4K";

const PRODUCTS = [
  {
    title: "CLI Runtime Gate",
    desc: "Deterministic hooks inside Claude Code, Codex & Cursor",
    href: "/docs/reference/cli-commands/",
    icon: Terminal,
  },
  {
    title: "Cloud Versioning",
    desc: "Centralized policy management across all repositories",
    href: "/docs/reference/api-cloud/",
    icon: GitBranch,
  },
  {
    title: "AI Rule Author",
    desc: "Generate enforceable AST rules from natural language",
    href: "/docs/how-to/author-rules-with-ai/",
    icon: Sparkle,
  },
  {
    title: "CI Hard Gate",
    desc: "Fail pull requests on block/fail rules in GitHub Actions",
    href: "/docs/tutorials/ci-pipeline-setup/",
    icon: ShieldCheck,
  },
];

const RESOURCES = [
  {
    title: "Documentation",
    desc: "Complete engine reference, matchers & CLI commands",
    href: "/docs/",
    icon: BookOpen,
  },
  {
    title: "Rule Catalog",
    desc: "Pre-built templates for migrations, secrets & file limits",
    href: "/docs/how-to/protect-critical-files/",
    icon: FileCode,
  },
  {
    title: "Agent Guides",
    desc: "Setup guides for Claude Code, Cursor, Windsurf & Codex",
    href: "/docs/tutorials/claude-code-setup/",
    icon: Robot,
  },
  {
    title: "Security & Auditing",
    desc: "Local-first policy runtime with deterministic enforcement",
    href: "/docs/concepts/security-model/",
    icon: FolderLock,
  },
];

export function MarketingNav() {
  const { isAuthenticated } = useAuth();
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

  return (
    <>
      {/* Top Announcement Bar — In normal document flow, scrolls away with page */}
      <div className="w-full bg-background-base pt-8 pb-4">
        <div className="pcl-container">
          <div className="w-full bg-heat-100 text-accent-white py-8 px-16 rounded-10 flex items-center justify-center gap-8 text-label-small sm:text-label-medium font-medium shadow-2xs">
            <span className="hidden sm:inline">
              Introducing the policyctl Cloud runtime, built for supercharging coding agents.
            </span>
            <span className="sm:hidden">policyctl Cloud runtime for coding agents.</span>
            <Link
              to="/pricing"
              className="underline font-semibold hover:opacity-90 inline-flex items-center gap-4 shrink-0"
            >
              Read the announcement →
            </Link>
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar — Only this sticks to the top on scroll */}
      <header className="sticky top-0 left-0 w-full z-[101]">
        <div
          className={`w-full transition-colors duration-200 ${
            scrolled
              ? "bg-background-base border-b border-border-faint shadow-[0_1px_0_rgba(0,0,0,0.04)]"
              : "bg-background-base border-b border-transparent"
          }`}
        >
          <div className="pcl-container flex items-center justify-between h-64">
            {/* Brand Logo */}
            <Link
              to="/"
              className="flex items-center gap-8 text-accent-black no-underline group"
              aria-label="policyctl home"
            >
              <span className="inline-flex size-30 items-center justify-center text-heat-100 group-hover:scale-105 transition-transform duration-200">
                <PolicyctlMark size={26} />
              </span>
              <span className="text-label-large font-medium tracking-tight text-accent-black">
                policyctl
              </span>
            </Link>

            {/* Desktop Navigation Links with Radix NavigationMenu */}
            <nav className="hidden items-center md:flex">
              <NavigationMenu viewport={false}>
                <NavigationMenuList className="flex items-center gap-4 lg:gap-8">
                  {/* Products Dropdown */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-label-medium text-accent-black font-normal hover:text-heat-100 data-[state=open]:text-heat-100 px-12 py-6 bg-transparent hover:bg-black-alpha-4">
                      Products
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="w-[580px] p-20 rounded-xl bg-surface border border-border-faint shadow-hero-card">
                      <div className="relative">
                        <CurvyRect sides="allSides" color="var(--border-muted)" />
                        <div className="text-mono-x-small font-mono text-black-alpha-40 uppercase px-4 pb-12 mb-12 border-b border-border-faint flex items-center justify-between">
                          <span>[ 00 / platform modules ]</span>
                          <span className="text-heat-100 font-semibold">RUNTIME CORE</span>
                        </div>
                        <div className="grid grid-cols-[1.1fr_1.4fr] gap-16">
                          {/* Featured Spotlight Card */}
                          <div className="flex flex-col justify-between rounded-lg bg-background-base p-16 border border-border-faint relative">
                            <div>
                              <div className="inline-flex items-center gap-6 px-8 py-3 rounded-md bg-surface border border-border-faint text-mono-x-small font-mono text-heat-100 uppercase tracking-wider mb-10">
                                <span className="size-6 rounded-full bg-heat-100 animate-pulse" />
                                <span>v0.1.7 RUNTIME</span>
                              </div>
                              <h4 className="text-label-large font-semibold text-accent-black mb-6">
                                .policyctl.yml
                              </h4>
                              <p className="text-body-small text-black-alpha-64 leading-relaxed">
                                Deterministic runtime hooks enforced inside Claude Code, Codex, Cursor, and CI.
                              </p>
                            </div>
                            <a
                              href="/docs/reference/cli-commands/"
                              className="mt-16 inline-flex items-center gap-6 text-label-small font-medium text-heat-100 hover:underline no-underline"
                            >
                              <span>Explore runtime</span>
                              <span>→</span>
                            </a>
                          </div>

                          {/* Right List of Products */}
                          <ul className="flex flex-col gap-6 list-none p-0 m-0">
                            {PRODUCTS.map((item) => (
                              <li key={item.title}>
                                <NavigationMenuLink asChild>
                                  <a
                                    href={item.href}
                                    className="flex items-start gap-12 p-8 rounded-lg hover:bg-black-alpha-4 transition-colors group/item no-underline"
                                  >
                                    <div className="size-32 rounded-md bg-heat-4 border border-heat-12 flex items-center justify-center text-heat-100 shrink-0 mt-2">
                                      <item.icon className="size-16" />
                                    </div>
                                    <div>
                                      <div className="text-label-medium font-medium text-accent-black group-hover/item:text-heat-100 transition-colors">
                                        {item.title}
                                      </div>
                                      <div className="text-body-small text-black-alpha-56 leading-snug mt-2">
                                        {item.desc}
                                      </div>
                                    </div>
                                  </a>
                                </NavigationMenuLink>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-16 pt-10 border-t border-border-faint flex items-center justify-between text-mono-x-small font-mono text-black-alpha-40 px-4">
                          <span>DETERMINISTIC HOOKS</span>
                          <span>·</span>
                          <span>LOCAL-FIRST</span>
                          <span>·</span>
                          <span>CI HARD GATE</span>
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  {/* Resources Dropdown */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-label-medium text-accent-black font-normal hover:text-heat-100 data-[state=open]:text-heat-100 px-12 py-6 bg-transparent hover:bg-black-alpha-4">
                      Resources
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="w-[560px] p-20 rounded-xl bg-surface border border-border-faint shadow-hero-card">
                      <div className="relative">
                        <CurvyRect sides="allSides" color="var(--border-muted)" />
                        <div className="text-mono-x-small font-mono text-black-alpha-40 uppercase px-4 pb-12 mb-12 border-b border-border-faint flex items-center justify-between">
                          <span>[ 01 / guides & reference ]</span>
                          <span className="text-heat-100 font-semibold">ENGINE DOCS</span>
                        </div>
                        <ul className="grid grid-cols-2 gap-12 list-none p-0 m-0">
                          {RESOURCES.map((item) => (
                            <li key={item.title}>
                              <NavigationMenuLink asChild>
                                <a
                                  href={item.href}
                                  className="flex items-start gap-12 p-10 rounded-lg hover:bg-black-alpha-4 transition-colors group/item no-underline"
                                >
                                  <div className="size-32 rounded-md bg-black-alpha-4 border border-border-faint flex items-center justify-center text-accent-black shrink-0 mt-2">
                                    <item.icon className="size-16" />
                                  </div>
                                  <div>
                                    <div className="text-label-medium font-medium text-accent-black group-hover/item:text-heat-100 transition-colors">
                                      {item.title}
                                    </div>
                                    <div className="text-body-small text-black-alpha-56 leading-snug mt-2">
                                      {item.desc}
                                    </div>
                                  </div>
                                </a>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-16 pt-10 border-t border-border-faint flex items-center justify-between text-mono-x-small font-mono text-black-alpha-40 px-4">
                          <span>MATCHER SYNTAX</span>
                          <span>·</span>
                          <span>PRE-BUILT RULES</span>
                          <span>·</span>
                          <span>MIT LICENSED</span>
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  {/* Pricing Link */}
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/pricing"
                        className="inline-flex h-36 items-center px-12 py-6 text-label-medium text-accent-black hover:text-heat-100 hover:bg-black-alpha-4 rounded-md transition-colors no-underline"
                      >
                        Pricing
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  {/* Docs Link */}
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <a
                        href="/docs/"
                        className="inline-flex h-36 items-center px-12 py-6 text-label-medium text-accent-black hover:text-heat-100 hover:bg-black-alpha-4 rounded-md transition-colors no-underline"
                      >
                        Docs
                      </a>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </nav>

            {/* Right Section: GitHub + Dashboard Button */}
            <div className="flex items-center gap-16 lg:gap-20">
              {/* GitHub Metric Link */}
              <a
                href={GITHUB}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-6 text-label-medium text-accent-black hover:text-heat-100 transition-colors py-6 group"
                aria-label="GitHub repository"
              >
                <GithubLogo weight="fill" className="size-20" />
                <span className="font-mono text-mono-small text-black-alpha-72 group-hover:text-accent-black">
                  {GITHUB_DISPLAY_METRIC}
                </span>
              </a>

              {/* Auth-aware Action Buttons */}
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-16 py-8 rounded-8 bg-black-alpha-7 hover:bg-black-alpha-12 text-accent-black text-label-medium font-medium transition-colors duration-150"
                >
                  Dashboard
                </Link>
              ) : (
                <div className="flex items-center gap-10">
                  <Link
                    to="/login"
                    className="hidden sm:inline-flex px-12 py-6 rounded-md text-label-medium text-accent-black hover:text-heat-100 hover:bg-black-alpha-4 transition-colors no-underline"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    className="inline-flex items-center px-14 py-7 rounded-8 bg-heat-100 hover:bg-heat-90 text-accent-white text-label-medium font-medium shadow-2xs transition-colors duration-150 no-underline"
                  >
                    Sign up
                  </Link>
                </div>
              )}

              {/* Mobile Hamburger Toggle */}
              <button
                className="md:hidden size-40 -mr-8 inline-flex items-center justify-center rounded-md text-black-alpha-72 hover:bg-black-alpha-4 transition-colors"
                onClick={() => setMobileOpen((m) => !m)}
                aria-label="Toggle menu"
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X className="size-20" /> : <List className="size-20" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-out bg-background-base border-b border-border-faint ${
            mobileOpen ? "max-h-[85vh] opacity-100 overflow-y-auto" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-16 py-20 flex flex-col gap-8">
            <div className="text-mono-x-small font-mono text-black-alpha-40 uppercase px-8">
              [ Products ]
            </div>
            {PRODUCTS.map((p) => (
              <a
                key={p.title}
                href={p.href}
                className="px-8 py-6 text-label-medium text-accent-black hover:text-heat-100 flex items-center justify-between no-underline"
              >
                <span>{p.title}</span>
                <span className="text-black-alpha-40 text-mono-x-small">→</span>
              </a>
            ))}

            <div className="text-mono-x-small font-mono text-black-alpha-40 uppercase px-8 pt-8 border-t border-border-faint">
              [ Resources ]
            </div>
            {RESOURCES.map((r) => (
              <a
                key={r.title}
                href={r.href}
                className="px-8 py-6 text-label-medium text-accent-black hover:text-heat-100 flex items-center justify-between no-underline"
              >
                <span>{r.title}</span>
                <span className="text-black-alpha-40 text-mono-x-small">→</span>
              </a>
            ))}

            <div className="border-t border-border-faint pt-8 flex flex-col gap-6">
              <NavLink
                to="/pricing"
                className="px-8 py-6 text-label-medium text-accent-black hover:text-heat-100"
              >
                Pricing
              </NavLink>
              <a
                href="/docs/"
                className="px-8 py-6 text-label-medium text-accent-black hover:text-heat-100 no-underline"
              >
                Docs
              </a>
              <a
                href={GITHUB}
                target="_blank"
                rel="noreferrer"
                className="px-8 py-6 text-label-medium text-accent-black hover:text-heat-100 flex items-center gap-8"
              >
                <GithubLogo weight="fill" className="size-18" />
                <span>GitHub ({GITHUB_DISPLAY_METRIC})</span>
              </a>
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="mt-8 text-center py-10 px-16 rounded-8 bg-black-alpha-7 text-accent-black text-label-medium font-medium"
                >
                  Open Dashboard
                </Link>
              ) : (
                <div className="mt-8 flex flex-col gap-8">
                  <Link
                    to="/login"
                    className="text-center py-8 px-16 rounded-8 bg-surface border border-border-faint text-accent-black text-label-medium font-medium"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    className="text-center py-10 px-16 rounded-8 bg-heat-100 text-accent-white text-label-medium font-medium"
                  >
                    Sign up free
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
