import { useEffect, useRef, useState } from "react";
import { Buildings, CaretDown } from "@phosphor-icons/react";
import { useOrgs, useCurrentOrgId, useSetCurrentOrgId } from "@/lib/hooks";

export function OrgSwitcher({ className = "" }: { className?: string }) {
  const { data: orgsData } = useOrgs();
  const currentOrgId = useCurrentOrgId();
  const setCurrentOrgId = useSetCurrentOrgId();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const orgs = orgsData?.orgs ?? [];
  const currentOrg = orgs.find((o) => o.id === currentOrgId);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open ]);

  if (orgs.length <= 1 && !currentOrg) return null;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        onClick={() => setOpen((m) => !m)}
        className="inline-flex h-32 max-w-[200px] items-center gap-6 rounded-md border border-border-faint px-10 text-body-small hover:bg-black-alpha-4"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Switch organization"
      >
        <Buildings className="size-4 shrink-0" aria-hidden />
        <span className="truncate">{currentOrg?.name ?? "My org"}</span>
        <CaretDown className="size-3 shrink-0" aria-hidden />
      </button>
      {open && (
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
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded px-8 py-8 text-left text-body-small ${
                o.id === currentOrgId ? "text-heat-ink" : "hover:bg-black-alpha-4"
              }`}
            >
              <span className="truncate">{o.name}</span>
              {o.id === currentOrgId && <span aria-hidden>●</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
