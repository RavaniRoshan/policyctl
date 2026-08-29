import { NavLink } from "react-router-dom";
import { LayoutDashboard, Activity, ShieldCheck, Sparkles, FileBarChart, Settings, Box } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/dashboard/sessions", label: "Sessions", icon: Activity },
  { to: "/dashboard/policies", label: "Policies", icon: ShieldCheck },
  { to: "/dashboard/ai", label: "AI", icon: Sparkles },
  { to: "/dashboard/reports", label: "Reports", icon: FileBarChart },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-n-800 bg-n-1000">
      <div className="flex items-center gap-2 px-5 h-12 border-b border-n-800">
        <span className="text-pc-400">◆</span>
        <span className="font-display font-semibold">policyctl</span>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-pc-500/10 text-pc-200"
                  : "text-n-300 hover:bg-n-800 hover:text-n-100",
              )
            }
          >
            <Icon className="size-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-n-800">
        <a
          href="https://www.npmjs.com/package/@policyctl/cli"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-n-400 hover:text-pc-300"
        >
          <Box className="size-4" />
          <span className="font-mono text-xs">npm i -g @policyctl/cli</span>
        </a>
      </div>
    </aside>
  );
}
