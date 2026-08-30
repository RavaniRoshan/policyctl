import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Command as CommandIcon, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { CommandPalette, type Command } from "@/components/ui/command-palette";

export function DashboardHeader({ title }: { title: string }) {
  const [palette, setPalette] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const commands: Command[] = [
    { label: "Overview", hint: "/dashboard", group: "Navigate", action: () => navigate("/dashboard") },
    { label: "Sessions", group: "Navigate", action: () => navigate("/dashboard/sessions") },
    { label: "Policies", group: "Navigate", action: () => navigate("/dashboard/policies") },
    { label: "AI", group: "Navigate", action: () => navigate("/dashboard/ai") },
    { label: "Reports", group: "Navigate", action: () => navigate("/dashboard/reports") },
    { label: "Settings", group: "Navigate", action: () => navigate("/dashboard/settings") },
    { label: "Documentation", group: "Resources", action: () => navigate("/docs") },
    { label: "Log out", group: "Account", action: () => logout().then(() => navigate("/")) },
  ];

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-bg-elevated px-4">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-fg-muted">policyctl</span>
        <span className="text-fg-muted">/</span>
        <span className="text-fg-primary font-medium">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPalette(true)}
          aria-label="Open command menu"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-bg-surface px-2.5 py-1 text-fg-muted hover:text-brand"
        >
          <CommandIcon className="size-3.5" />
          <span className="font-mono text-[0.7rem]">K</span>
        </button>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-bg-surface px-2 py-1">
          <UserIcon className="size-4 text-fg-muted" />
          <span className="text-xs text-fg-secondary max-w-[140px] truncate">{user?.email}</span>
        </div>
        <button
          onClick={() => logout().then(() => navigate("/"))}
          aria-label="Log out"
          className="rounded-lg border border-border bg-bg-surface p-1.5 text-fg-muted hover:text-danger"
        >
          <LogOut className="size-4" />
        </button>
      </div>
      <CommandPalette open={palette} onClose={() => setPalette(false)} commands={commands} />
    </header>
  );
}
