import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Command } from "cmdk";
import {
  SquaresFour,
  Pulse,
  ShieldCheck,
  Sparkle,
  ChartBar,
  CreditCard,
  Buildings,
  Gear,
  Sun,
  Moon,
  BookOpen,
  SignOut,
  TerminalWindow,
} from "@phosphor-icons/react";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";

export const COMMAND_MENU_EVENT = "policyctl:command-menu";

const GROUP_CLS =
  "[&_[cmdk-group-heading]]:px-12 [&_[cmdk-group-heading]]:py-8 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-mono-x-small [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:text-black-alpha-32";

const NAV = [
  { to: "/dashboard", label: "Go to Overview", icon: SquaresFour },
  { to: "/dashboard/violations", label: "Go to Violations", icon: Pulse },
  { to: "/dashboard/policies", label: "Go to Policies", icon: ShieldCheck },
  { to: "/dashboard/ai", label: "Go to AI rule author", icon: Sparkle },
  { to: "/dashboard/reports", label: "Go to Reports", icon: ChartBar },
  { to: "/dashboard/billing", label: "Go to Billing", icon: CreditCard },
  { to: "/dashboard/team", label: "Go to Team", icon: Buildings },
  { to: "/dashboard/settings", label: "Go to Settings", icon: Gear },
  { to: "/docs", label: "Open documentation", icon: BookOpen, external: true },
];

/**
 * Global command menu (cmdk). Opens on Cmd/Ctrl+K from anywhere, or via
 * COMMAND_MENU_EVENT. Centered panel per Linear/Vercel anatomy: 640px,
 * top-anchored at 20vh, keyboard-first with footer legend.
 */
export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onEvent = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(COMMAND_MENU_EVENT, onEvent);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(COMMAND_MENU_EVENT, onEvent);
    };
  }, []);

  const go = useCallback(
    (to: string, external?: boolean) => {
      setOpen(false);
      if (external) window.open(to, "_blank", "noreferrer");
      else navigate(to);
    },
    [navigate],
  );

  const toggleTheme = useCallback(() => {
    setOpen(false);
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  const doLogout = useCallback(async () => {
    setOpen(false);
    await logout();
    navigate("/");
  }, [logout, navigate]);

  const copyInstall = useCallback(async () => {
    setOpen(false);
    try {
      await navigator.clipboard.writeText("npm install -g @policyctl/cli");
    } catch {
      /* clipboard unavailable */
    }
  }, []);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command menu"
      overlayClassName="fixed inset-0 z-[100] bg-black-alpha-48 backdrop-blur-[2px]"
      contentClassName="fixed left-1/2 top-[16vh] z-[101] max-h-[70vh] w-[640px] max-w-[calc(100vw-32px)] -translate-x-1/2 overflow-hidden rounded-xl border border-border-faint bg-surface shadow-2xl"
    >
      <Command.Input
        autoFocus
        placeholder="Type a command or search pages…"
        className="h-48 w-full border-b border-border-faint bg-transparent px-16 text-body-medium text-accent-black placeholder:text-black-alpha-32 outline-none"
      />
      <Command.List className="max-h-[320px] overflow-y-auto p-8">
        <Command.Empty className="px-12 py-16 text-body-small text-black-alpha-64">
          No matching commands.
        </Command.Empty>
        <Command.Group heading="Pages" className={GROUP_CLS}>
          {NAV.map((item) => (
            <MenuItem
              key={item.to}
              label={item.label}
              icon={<item.icon className="size-4" aria-hidden />}
              onSelect={() => go(item.to, item.external)}
            />
          ))}
        </Command.Group>
        <Command.Group heading="Actions" className={GROUP_CLS}>
          <MenuItem
            label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            icon={theme === "dark" ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
            onSelect={toggleTheme}
            hint="T"
          />
          <MenuItem
            label="Copy CLI install command"
            icon={<TerminalWindow className="size-4" aria-hidden />}
            onSelect={copyInstall}
            hint="C"
          />
          <MenuItem
            label="Sign out"
            icon={<SignOut className="size-4" aria-hidden />}
            onSelect={doLogout}
          />
        </Command.Group>
      </Command.List>
      <div className="flex items-center gap-16 border-t border-border-faint px-16 py-8 text-mono-x-small text-black-alpha-32">
        <span className="flex items-center gap-4">
          <Kbd>↑↓</Kbd> navigate
        </span>
        <span className="flex items-center gap-4">
          <Kbd>↵</Kbd> open
        </span>
        <span className="flex items-center gap-4">
          <Kbd>esc</Kbd> close
        </span>
      </div>
    </Command.Dialog>
  );
}

function MenuItem({
  label,
  icon,
  hint,
  onSelect,
}: {
  label: string;
  icon: React.ReactNode;
  hint?: string;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex h-36 cursor-pointer items-center gap-8 rounded-md px-12 text-body-small text-accent-black aria-selected:bg-heat-4 aria-selected:text-heat-100"
    >
      <span className="shrink-0">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {hint && (
        <kbd className="rounded border border-border-faint px-6 py-2 font-mono text-mono-x-small text-black-alpha-64">
          {hint}
        </kbd>
      )}
    </Command.Item>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-border-faint px-6 py-2 font-mono text-mono-x-small text-black-alpha-64">
      {children}
    </kbd>
  );
}
