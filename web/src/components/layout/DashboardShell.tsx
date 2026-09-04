import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  SquaresFour,
  Pulse,
  ShieldCheck,
  Sparkle,
  ChartBar,
  CreditCard,
  Buildings,
  Gear,
  SignOut,
  MagnifyingGlass,
  Sun,
  Moon,
  Monitor,
  List,
  X,
  Warning,
  CaretDown,
} from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { useOrgs, useCurrentOrgId, useSetCurrentOrgId, __isDemoMode } from "@/lib/hooks";
import { PolicyctlMark } from "@/components/brand/PolicyctlMark";
import { CommandMenu, COMMAND_MENU_EVENT } from "@/components/dashboard/CommandMenu";

const TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/violations": "Violations",
  "/dashboard/policies": "Policies",
  "/dashboard/ai": "AI rule author",
  "/dashboard/reports": "Reports",
  "/dashboard/billing": "Billing",
  "/dashboard/team": "Team",
  "/dashboard/settings": "Settings",
};

const ITEMS = [
  { to: "/dashboard", label: "Overview", icon: SquaresFour, end: true },
  { to: "/dashboard/violations", label: "Violations", icon: Pulse },
  { to: "/dashboard/policies", label: "Policies", icon: ShieldCheck },
  { to: "/dashboard/ai", label: "AI", icon: Sparkle },
  { to: "/dashboard/reports", label: "Reports", icon: ChartBar },
  { to: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { to: "/dashboard/team", label: "Team", icon: Buildings },
  { to: "/dashboard/settings", label: "Settings", icon: Gear },
];

export function DashboardShell() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-background-base text-accent-black lg:flex">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Header title={TITLES[pathname] ?? "Overview"} />
        {__isDemoMode && <DemoBanner />}
        <main id="main-content" className="mx-auto w-full max-w-[1280px] px-16 py-24 md:px-32">
          <Outlet />
        </main>
      </div>
      <CommandMenu />
    </div>
  );
}

function navClass(isActive: boolean) {
  return [
    "group flex h-36 items-center gap-10 rounded-md px-12 text-[13px] transition-colors",
    isActive
      ? "bg-heat-4 font-medium text-accent-black"
      : "text-black-alpha-64 hover:bg-black-alpha-4 hover:text-accent-black",
  ].join(" ");
}

function Sidebar() {
  const { pathname } = useLocation();
  return (
    <aside className="sticky top-0 hidden h-screen w-[240px] shrink-0 flex-col border-r border-border-faint bg-surface lg:flex">
      <div className="flex h-64 items-center gap-8 border-b border-border-faint px-16">
        <span className="text-heat-100">
          <PolicyctlMark size={22} />
        </span>
        <span className="font-mono text-mono-medium font-semibold uppercase tracking-wider">
          policyctl
        </span>
      </div>
      <nav aria-label="Dashboard" className="flex-1 space-y-2 overflow-y-auto p-12">
        {ITEMS.map(({ to, label, icon: Icon, end }) => {
          const active = end ? pathname === to : pathname.startsWith(to);
          return (
            <NavLink key={to} to={to} end={end} className={navClass(active)} aria-current={active ? "page" : undefined}>
              <Icon className="size-4 shrink-0" aria-hidden />
              <span className="truncate">{label}</span>
              {active && <span className="ml-auto h-16 w-2 rounded-full bg-heat-100" aria-hidden />}
            </NavLink>
          );
        })}
      </nav>
      <div className="border-t border-border-faint p-12">
        <a
          href="https://www.npmjs.com/package/@policyctl/cli"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-8 rounded-md border border-border-faint px-12 py-8 font-mono text-mono-x-small text-black-alpha-56 transition-colors hover:text-heat-100"
        >
          npm i -g @policyctl/cli
        </a>
      </div>
    </aside>
  );
}

function Header({ title }: { title: string }) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menu, setMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [orgMenu, setOrgMenu] = useState(false);
  const { data: orgsData } = useOrgs();
  const currentOrgId = useCurrentOrgId();
  const setCurrentOrgId = useSetCurrentOrgId();

  const orgs = orgsData?.orgs ?? [];
  const currentOrg = orgs.find((o) => o.id === currentOrgId);

  const openPalette = () => window.dispatchEvent(new Event(COMMAND_MENU_EVENT));

  const onLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border-faint bg-background-base/95 backdrop-blur">
      <div className="mx-auto flex h-64 w-full max-w-[1280px] items-center gap-8 px-16 md:px-32">
        <button
          className="inline-flex size-44 items-center justify-center rounded-md text-accent-black hover:bg-black-alpha-4 lg:hidden"
          onClick={() => setMobileOpen((m) => !m)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="size-4" /> : <List className="size-4" />}
        </button>
        <span className="text-heat-100 lg:hidden">
          <PolicyctlMark size={20} />
        </span>

        <h1 className="text-title-h5 tracking-tight">{title}</h1>

        <div className="ml-auto flex items-center gap-4">
          <div className="relative hidden sm:block">
            <button
              onClick={() => setOrgMenu((m) => !m)}
              className="inline-flex h-32 max-w-[200px] items-center gap-6 rounded-md border border-border-faint px-10 text-body-small hover:bg-black-alpha-4"
              aria-haspopup="menu"
              aria-expanded={orgMenu}
              aria-label="Switch organization"
            >
              <Buildings className="size-4 shrink-0" aria-hidden />
              <span className="truncate">{currentOrg?.name ?? "My org"}</span>
              <CaretDown className="size-3 shrink-0" aria-hidden />
            </button>
            {orgMenu && (
              <div role="menu" className="absolute right-0 top-40 z-50 w-240 rounded-md border border-border-faint bg-surface p-8 shadow-lg">
                <div className="px-8 py-4 font-mono text-mono-x-small uppercase text-black-alpha-32">
                  Organizations
                </div>
                {orgs.map((o) => (
                  <button
                    key={o.id}
                    role="menuitem"
                    onClick={() => {
                      setCurrentOrgId(o.id);
                      setOrgMenu(false);
                    }}
                    className={`flex w-full items-center justify-between rounded px-8 py-8 text-left text-body-small ${
                      o.id === currentOrgId ? "text-heat-100" : "hover:bg-black-alpha-4"
                    }`}
                  >
                    <span className="truncate">{o.name}</span>
                    {o.id === currentOrgId && <span aria-hidden>●</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className="hidden h-32 items-center gap-8 rounded-md border border-border-faint px-10 font-mono text-mono-small text-black-alpha-48 transition-colors hover:text-accent-black md:inline-flex"
            onClick={openPalette}
            aria-label="Open command menu"
          >
            <MagnifyingGlass className="size-4" aria-hidden />
            <span>Search</span>
            <kbd className="rounded border border-border-faint px-6 py-2 font-mono text-mono-x-small">
              ⌘K
            </kbd>
          </button>
          <button
            className="inline-flex size-44 items-center justify-center rounded-md hover:bg-black-alpha-4 md:hidden"
            onClick={openPalette}
            aria-label="Open command menu"
          >
            <MagnifyingGlass className="size-4" aria-hidden />
          </button>

          <ThemeSwitch theme={theme} onChange={setTheme} />

          <div className="relative">
            <button
              onClick={() => setMenu((m) => !m)}
              className="inline-flex size-44 items-center justify-center rounded-full bg-heat-12 text-label-medium uppercase text-heat-100"
              aria-haspopup="menu"
              aria-expanded={menu}
              aria-label="User menu"
            >
              {user?.email?.charAt(0).toUpperCase() ?? "?"}
            </button>
            {menu && (
              <div role="menu" className="absolute right-0 top-48 z-50 w-240 rounded-md border border-border-faint bg-surface p-8 shadow-lg">
                <div className="truncate border-b border-border-faint px-8 py-4 text-mono-small text-black-alpha-56">
                  {user?.email}
                </div>
                <button
                  onClick={onLogout}
                  className="flex w-full items-center gap-8 rounded-md px-8 py-8 text-left text-label-medium hover:bg-black-alpha-4"
                >
                  <SignOut className="size-4" aria-hidden />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileOpen && (
        <nav aria-label="Dashboard" className="space-y-2 border-t border-border-faint p-8 lg:hidden">
          {ITEMS.map(({ to, label, icon: Icon, end }) => {
            const active = end ? pathname === to : pathname.startsWith(to);
            return (
              <NavLink key={to} to={to} end={end} onClick={() => setMobileOpen(false)} className={navClass(active)}>
                <Icon className="size-4 shrink-0" aria-hidden />
                <span className="truncate">{label}</span>
              </NavLink>
            );
          })}
        </nav>
      )}
    </header>
  );
}

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
  { value: "dark", label: "Dark", icon: Moon },
] as const;

type ThemeValue = (typeof THEME_OPTIONS)[number]["value"];

/** Segmented light/system/dark switch — large targets, keyboard-first. */
function ThemeSwitch({ theme, onChange }: { theme: ThemeValue; onChange: (t: ThemeValue) => void }) {
  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className="flex h-40 items-center gap-2 rounded-lg border border-border-faint bg-surface p-4"
    >
      {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            role="radio"
            aria-checked={active}
            aria-label={`${label} theme`}
            title={`${label} theme`}
            onClick={() => onChange(value)}
            className={`inline-flex h-32 min-w-44 items-center justify-center gap-6 rounded-md px-8 text-body-small transition-colors ${
              active
                ? "bg-heat-4 font-medium text-heat-100"
                : "text-black-alpha-48 hover:bg-black-alpha-4 hover:text-accent-black"
            }`}
          >
            <Icon className="size-4" aria-hidden />
            <span className="hidden xl:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

function DemoBanner() {
  return (
    <div role="status" className="bg-warning px-16 py-8 text-mono-small text-accent-black lg:px-32">
      <span className="mx-auto flex w-full max-w-[1280px] items-center gap-12">
        <Warning className="size-4 shrink-0" weight="bold" aria-hidden />
        <span>
          <strong>Demo data</strong> — no backend is wired in this build. Connect the Worker
          (VITE_API_BASE) to see real analytics, violations, and policies.
        </span>
      </span>
    </div>
  );
}
