import { Outlet, useLocation, NavLink, useNavigate } from "react-router-dom";
import {
  SquaresFour,
  Pulse,
  ShieldCheck,
  Sparkle,
  ChartBar,
  Gear,
  Package,
  SignOut,
  MagnifyingGlass,
  Sun,
  Moon,
} from "@phosphor-icons/react";
import { CommandPaletteHost } from "@policyctl/design-system";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { useState } from "react";
import { cn } from "@/lib/utils";

const titles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/sessions": "Sessions",
  "/dashboard/policies": "Policies",
  "/dashboard/ai": "AI rule author",
  "/dashboard/reports": "Reports",
  "/dashboard/settings": "Settings",
};

const items = [
  { to: "/dashboard", label: "Overview", icon: SquaresFour, end: true },
  { to: "/dashboard/sessions", label: "Sessions", icon: Pulse },
  { to: "/dashboard/policies", label: "Policies", icon: ShieldCheck },
  { to: "/dashboard/ai", label: "AI", icon: Sparkle },
  { to: "/dashboard/reports", label: "Reports", icon: ChartBar },
  { to: "/dashboard/settings", label: "Settings", icon: Gear },
];

export function DashboardShell() {
  const { pathname } = useLocation();
  const title = titles[pathname] ?? "Overview";

  return (
    <div className="min-h-screen flex bg-background-base">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={title} />
        <main id="main-content" tabIndex={-1} className="flex-1 overflow-y-auto p-16 lg:p-32 focus:outline-none">
          <Outlet />
        </main>
      </div>
      <CommandPaletteHost />
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="hidden lg:flex w-240 shrink-0 flex-col border-r border-border-faint bg-background-base relative">
      <div className="flex items-center gap-2 px-20 h-64 border-b border-border-faint">
        <NavLink to="/" className="flex items-center gap-2 text-accent-black no-underline">
          <span className="inline-flex size-7 items-center justify-center">
            <FlameMark />
          </span>
          <span className="font-mono text-mono-medium uppercase tracking-wider">
            policyctl
          </span>
        </NavLink>
      </div>
      <nav className="flex-1 p-8 space-y-2">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-12 rounded-md p-8 text-label-medium transition-all duration-200 -mt-1 relative",
                "before:absolute before:inset-0 before:rounded-inherit before:border before:border-border-faint before:transition-all before:duration-200",
                isActive
                  ? "bg-heat-4 text-accent-black before:border-heat-12"
                  : "text-black-alpha-72 hover:text-accent-black hover:bg-black-alpha-4 before:border-transparent",
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-12 bottom-12 w-2 bg-heat-100" />
                )}
                <Icon className="size-4 relative" />
                <span className="relative">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="p-8 border-t border-border-faint">
        <a
          href="https://www.npmjs.com/package/@policyctl/cli"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-8 rounded-md p-8 text-mono-small text-black-alpha-56 hover:text-heat-100 transition-colors -mt-1 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-border-faint before:transition-all before:duration-200"
        >
          <Package className="size-4 relative" />
          <span className="font-mono text-mono-x-small relative">npm i -g @policyctl/cli</span>
        </a>
      </div>
    </aside>
  );
}

function Header({ title }: { title: string }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);

  const onLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-background-base/95 backdrop-blur-4 border-b border-border-faint h-64 flex items-center px-16 lg:px-32">
      <div className="flex items-center gap-8 lg:hidden">
        <NavLink to="/" className="flex items-center gap-2 text-accent-black">
          <span className="inline-flex size-7 items-center justify-center">
            <FlameMark />
          </span>
        </NavLink>
      </div>
      <h1 className="ml-8 lg:ml-0 text-title-h5 text-accent-black tracking-tight">
        {title}
      </h1>
      <div className="ml-auto flex items-center gap-4">
        <button
          className="hidden lg:inline-flex items-center gap-4 rounded-md px-10 py-6 text-mono-small text-black-alpha-48 hover:text-accent-black hover:bg-black-alpha-4 transition-colors -mt-1 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-border-faint before:transition-all before:duration-200"
          aria-label="Open command palette"
          onClick={() => {
            window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true } as any));
          }}
        >
          <MagnifyingGlass className="size-3.5" />
          <span>Search</span>
          <span className="ml-4 text-mono-x-small text-black-alpha-32 font-mono border border-border-faint rounded-4 px-6 py-2">
            ⌘K
          </span>
        </button>
        <button
          className="rounded-md size-44 inline-flex items-center justify-center text-black-alpha-48 hover:text-accent-black hover:bg-black-alpha-4 transition-colors"
          onClick={toggle}
          aria-label="Toggle theme"
        >
          {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
        </button>
        <div className="relative">
          <button
            onClick={() => setMenu((m) => !m)}
            className="rounded-full size-44 inline-flex items-center justify-center bg-heat-12 text-heat-100 text-label-medium uppercase -mt-1 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-heat-30"
            aria-haspopup="menu"
            aria-expanded={menu}
          >
            {user?.email?.charAt(0).toUpperCase() ?? "?"}
          </button>
          {menu && (
            <div className="absolute right-0 top-40 z-50 w-240 rounded-md bg-surface border border-border-faint shadow-lg p-8 -mt-1">
              <div className="px-8 py-4 text-mono-small text-black-alpha-56 border-b border-border-faint">
                {user?.email}
              </div>
              <button
                onClick={onLogout}
                className="w-full text-left px-8 py-8 text-label-medium text-accent-black hover:bg-black-alpha-4 flex items-center gap-8 rounded-md"
              >
                <SignOut className="size-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
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