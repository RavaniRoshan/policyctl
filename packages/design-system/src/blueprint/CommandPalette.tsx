import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface CommandItem {
  id: string;
  label: string;
  hint?: string;
  section?: string;
  to?: string;
  action?: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  items?: CommandItem[];
}

const DEFAULT_ITEMS: CommandItem[] = [
  { id: "home", label: "Home", to: "/", section: "Navigation", keywords: ["landing", "index"] },
  { id: "docs", label: "Documentation", to: "/docs", section: "Navigation", keywords: ["help", "guide"] },
  { id: "login", label: "Sign in", to: "/login", section: "Account", keywords: ["login", "auth"] },
  { id: "signup", label: "Create account", to: "/signup", section: "Account", keywords: ["register"] },
  { id: "dashboard", label: "Dashboard — Overview", to: "/dashboard", section: "Dashboard", keywords: ["home", "stats"] },
  { id: "sessions", label: "Dashboard — Sessions", to: "/dashboard/sessions", section: "Dashboard", keywords: ["violations"] },
  { id: "policies", label: "Dashboard — Policies", to: "/dashboard/policies", section: "Dashboard", keywords: ["versions", "rules"] },
  { id: "ai", label: "Dashboard — AI rule author", to: "/dashboard/ai", section: "Dashboard", keywords: ["author"] },
  { id: "reports", label: "Dashboard — Reports", to: "/dashboard/reports", section: "Dashboard", keywords: ["export"] },
  { id: "settings", label: "Dashboard — Settings", to: "/dashboard/settings", section: "Dashboard", keywords: ["account", "gear"] },
];

function fuzzy(needle: string, haystack: string): number {
  needle = needle.toLowerCase();
  haystack = haystack.toLowerCase();
  let i = 0;
  let score = 0;
  for (let j = 0; j < haystack.length; j++) {
    if (haystack[j] === needle[i]) {
      i++;
      score += 1;
      if (i === needle.length) break;
    }
  }
  return i === needle.length ? score : -1;
}

export function CommandPalette({ open, onClose, items = DEFAULT_ITEMS }: CommandPaletteProps) {
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setQ("");
      setCursor(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const filtered = useMemo(() => {
    if (!q) return items;
    return items
      .map((it) => ({
        ...it,
        score: Math.max(
          fuzzy(q, it.label),
          ...(it.keywords?.map((k) => fuzzy(q, k)) ?? []),
        ),
      }))
      .filter((it) => it.score >= 0)
      .sort((a, b) => b.score - a.score);
  }, [q, items]);

  useEffect(() => {
    if (cursor >= filtered.length) setCursor(Math.max(0, filtered.length - 1));
  }, [filtered, cursor]);

  const run = (item: CommandItem) => {
    if (item.to) navigate(item.to);
    if (item.action) item.action();
    onClose();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => (filtered.length ? (c + 1) % filtered.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => (filtered.length ? (c - 1 + filtered.length) % filtered.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[cursor]) run(filtered[cursor]);
    }
  };

  // Group by section
  const grouped = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    filtered.forEach((it) => {
      const sec = it.section ?? "Other";
      if (!map.has(sec)) map.set(sec, []);
      map.get(sec)!.push(it);
    });
    return Array.from(map.entries());
  }, [filtered]);

  let globalIndex = 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black-alpha-40 z-[2000]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.3 } }}
            exit={{ opacity: 0, transition: { duration: 0.2, delay: 0.1 } }}
            onClick={onClose}
          />
          <motion.div
            className="fixed top-[20vh] left-1/2 -translate-x-1/2 z-[2001] w-[min(560px,calc(100%-32px))]"
            initial={{ opacity: 0, y: -8, scale: 0.98, filter: "blur(4px)" }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
              transition: { type: "spring", stiffness: 240, damping: 16, delay: 0.05 },
            }}
            exit={{
              opacity: 0,
              y: -8,
              scale: 0.98,
              filter: "blur(4px)",
              transition: { type: "spring", stiffness: 300, damping: 16 },
            }}
          >
            <div className="pcl-card p-0 overflow-hidden shadow-lg">
              <div className="flex items-center gap-3 p-16 border-b border-border-faint">
                <span className="text-mono-x-small text-black-alpha-32">[ CMD ]</span>
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={onKey}
                  placeholder="Search pages, actions…"
                  className="flex-1 bg-transparent outline-none text-body-input placeholder:text-black-alpha-48"
                />
                <kbd className="text-mono-x-small text-black-alpha-32 font-mono border border-border-faint rounded-4 px-6 py-2">
                  ESC
                </kbd>
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                {grouped.length === 0 && (
                  <div className="p-16 text-center text-body-medium text-black-alpha-48">
                    No matches
                  </div>
                )}
                {grouped.map(([section, list]) => (
                  <div key={section}>
                    <div className="px-16 pt-12 pb-4 text-mono-x-small text-black-alpha-32 uppercase">
                      {section}
                    </div>
                    {list.map((it) => {
                      const idx = globalIndex++;
                      const active = idx === cursor;
                      return (
                        <button
                          key={it.id}
                          onMouseEnter={() => setCursor(idx)}
                          onClick={() => run(it)}
                          className={`w-full text-left px-16 py-8 flex items-center justify-between gap-3 ${
                            active ? "bg-black-alpha-4" : ""
                          }`}
                        >
                          <span className="text-label-large text-accent-black">{it.label}</span>
                          {it.hint && (
                            <span className="text-mono-x-small text-black-alpha-32 font-mono">
                              {it.hint}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function CommandPaletteHost(): ReactNode {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  return <CommandPalette open={open} onClose={() => setOpen(false)} />;
}