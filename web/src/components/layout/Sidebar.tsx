import { NavLink } from "react-router-dom";
import { SquaresFour, Pulse, ShieldCheck, Sparkle, ChartBar, Gear, Package } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/dashboard", label: "Overview", icon: SquaresFour, end: true },
  { to: "/dashboard/sessions", label: "Sessions", icon: Pulse },
  { to: "/dashboard/policies", label: "Policies", icon: ShieldCheck },
  { to: "/dashboard/ai", label: "AI", icon: Sparkle },
  { to: "/dashboard/reports", label: "Reports", icon: ChartBar },
  { to: "/dashboard/settings", label: "Gear", icon: Gear },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-bg-elevated">
      <div className="flex items-center gap-2 px-5 h-14 border-b border-border">
        <span className="text-brand text-lg">◆</span>
        <span className="font-display font-semibold text-fg-primary">policyctl</span>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-brand/10 text-brand"
                  : "text-fg-secondary hover:bg-bg-surface hover:text-fg-primary",
              )
            }
          >
            <Icon className="size-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-border">
        <a
          href="https://www.npmjs.com/package/@policyctl/cli"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-fg-muted hover:text-brand"
        >
          <Package className="size-4" />
          <span className="font-mono text-xs">npm i -g @policyctl/cli</span>
        </a>
      </div>
    </aside>
  );
}
