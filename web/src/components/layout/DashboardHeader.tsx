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
    <header className="flex h-12 items-center justify-between border-b border-n-800 bg-n-1000 px-4">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-n-500">policyctl</span>
        <span className="text-n-700">/</span>
        <span className="text-n-100 font-medium">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPalette(true)}
          aria-label="Open command menu"
          className="inline-flex items-center gap-1.5 rounded-md border border-n-700 bg-n-800 px-2.5 py-1 text-n-400 hover:text-pc-300"
        >
          <CommandIcon className="size-3.5" />
          <span className="font-mono text-[0.7rem]">K</span>
        </button>
        <div className="flex items-center gap-2 rounded-md border border-n-700 bg-n-800 px-2 py-1">
          <UserIcon className="size-4 text-n-400" />
          <span className="text-xs text-n-200 max-w-[140px] truncate">{user?.email}</span>
        </div>
        <button
          onClick={() => logout().then(() => navigate("/"))}
          aria-label="Log out"
          className="rounded-md border border-n-700 bg-n-800 p-1.5 text-n-400 hover:text-danger"
        >
          <LogOut className="size-4" />
        </button>
      </div>
      <CommandPalette open={palette} onClose={() => setPalette(false)} commands={commands} />
    </header>
  );
}
