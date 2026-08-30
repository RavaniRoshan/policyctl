import { useEffect, useMemo, useRef, useState } from "react";
import { MagnifyingGlass, CaretDown } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export interface Command {
  label: string;
  hint?: string;
  group: string;
  action: () => void;
}

interface Props {
  open: boolean;
  onClose: () => void;
  commands: Command[];
}

export function CommandPalette({ open, onClose, commands }: Props) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const query = q.toLowerCase().trim();
    if (!query) return commands;
    return commands.filter(
      (c) => c.label.toLowerCase().includes(query) || c.group.toLowerCase().includes(query),
    );
  }, [q, commands]);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  useEffect(() => setActive(0), [q]);

  if (!open) return null;

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    }
    if (e.key === "Enter") {
      e.preventDefault();
      results[active]?.action();
    }
  };

  let lastGroup = "";
  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Command menu"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-n-1000/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl overflow-hidden rounded-lg border border-n-700 bg-n-900 shadow-lg"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKey}
      >
        <div className="flex items-center gap-3 border-b border-n-800 px-4 py-3">
          <MagnifyingGlass className="size-4 text-n-400" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="MagnifyingGlass docs, jump to a page, run a command…"
            className="flex-1 bg-transparent text-n-100 outline-none placeholder:text-n-500"
            aria-label="MagnifyingGlass"
          />
          <kbd className="rounded border border-n-700 bg-n-800 px-1.5 py-0.5 font-mono text-[0.7rem] text-n-400">
            ESC
          </kbd>
        </div>
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto p-2" aria-live="polite">
          {results.length === 0 && (
            <div className="px-3 py-6 text-center text-n-500 text-sm">No results</div>
          )}
          {results.map((c, i) => {
            const showGroup = c.group !== lastGroup;
            lastGroup = c.group;
            return (
              <div key={i}>
                {showGroup && (
                  <div className="px-3 pt-3 pb-1 font-mono text-[0.65rem] uppercase tracking-wider text-n-500">
                    {c.group}
                  </div>
                )}
                <button
                  onMouseEnter={() => setActive(i)}
                  onClick={() => c.action()}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors",
                    i === active ? "bg-pc-500/15 text-pc-200" : "text-n-200 hover:bg-n-800",
                  )}
                >
                  <span>{c.label}</span>
                  {c.hint && <span className="font-mono text-xs text-n-500">{c.hint}</span>}
                  {i === active && <CaretDown className="size-3.5 text-pc-300" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
