import { useState } from "react";
import { CheckCircle, Funnel } from "@phosphor-icons/react";
import { useViolations } from "@/lib/hooks";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";
import { Card } from "@/components/ui/card";
import { Sheet, CurvyRect } from "@policyctl/design-system";
import { Skeleton, EmptyState, MonoAnnotation } from "@/components/shared/EmptyState";
import type { Violation } from "@/lib/api";

export function Sessions() {
  const { data, isLoading, error } = useViolations();
  const [provider, setProvider] = useState<string>("All");
  const [enforce, setEnforce] = useState<string>("All");
  const [open, setOpen] = useState<Violation | null>(null);

  const filtered = (data ?? []).filter((v) => {
    if (provider !== "All" && v.agent?.toLowerCase() !== provider.toLowerCase()) return false;
    if (enforce !== "All" && v.enforce !== enforce) return false;
    return true;
  });

  return (
    <div className="space-y-24">
      <div className="flex items-center justify-between -mt-1">
        <MonoAnnotation>[ sessions / {filtered.length} records ]</MonoAnnotation>
        <div className="flex items-center gap-8">
          <SelectPill value={provider} onChange={setProvider} options={["All", "claude", "codex", "cursor", "ci"]} label="provider" />
          <SelectPill value={enforce} onChange={setEnforce} options={["All", "block", "fail", "warn", "log"]} label="enforce" />
        </div>
      </div>

      {error && (
        <div role="alert" className="p-16 -mt-1 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-danger/30 bg-danger/5 text-danger text-body-medium">
          Failed to load sessions. Please try again.
        </div>
      )}

      {isLoading ? (
        <div className="space-y-8 -mt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-32 lg:p-64">
          <CurvyRect sides="allSides" />
          <EmptyState
            icon={CheckCircle}
            title="No sessions recorded"
            description="Enforcement sessions will appear here once an agent runs against your repo."
          />
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <CurvyRect sides="allSides" />
          <div className="overflow-x-auto">
          <table className="w-full text-body-medium min-w-600">
            <thead>
              <tr className="border-b border-border-faint text-left text-mono-x-small text-black-alpha-32 uppercase">
                <th scope="col" className="p-16">enforce</th>
                <th scope="col" className="p-16">rule_id</th>
                <th scope="col" className="p-16">repo</th>
                <th scope="col" className="p-16">agent</th>
                <th scope="col" className="p-16">timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr
                  key={v.id}
                  onClick={() => setOpen(v)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(v); } }}
                  tabIndex={0}
                  role="button"
                  className="border-b border-border-faint hover:bg-black-alpha-4 transition-colors cursor-pointer focus-visible:bg-black-alpha-4"
                >
                  <td className="p-16">
                    <Badge tone={v.enforce === "block" ? "danger" : v.enforce === "fail" ? "accent" : "muted"}>
                      {v.enforce}
                    </Badge>
                  </td>
                  <td className="p-16 font-mono text-mono-small text-accent-black">{v.rule_id}</td>
                  <td className="p-16 text-black-alpha-72">{v.repo}</td>
                  <td className="p-16 text-black-alpha-64">{v.agent}</td>
                  <td className="p-16 font-mono text-mono-x-small text-black-alpha-32">
                    {new Date(v.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </Card>
      )}

      <Sheet open={!!open} onClose={() => setOpen(null)} title="Session detail" width={520}>
        {open && (
          <div className="space-y-24">
            <div>
              <MonoAnnotation>// enforcement</MonoAnnotation>
              <div className="mt-8 flex items-center gap-8">
                <Badge tone={open.enforce === "block" ? "danger" : open.enforce === "fail" ? "accent" : "muted"}>
                  {open.enforce}
                </Badge>
                <span className="font-mono text-mono-medium text-accent-black">{open.rule_id}</span>
              </div>
            </div>

            <div>
              <MonoAnnotation>// message</MonoAnnotation>
              <p className="mt-8 text-body-medium text-black-alpha-72 leading-22">{open.message}</p>
            </div>

            <div>
              <MonoAnnotation>// context</MonoAnnotation>
              <ul className="mt-8 space-y-4 text-body-medium">
                <li className="flex justify-between"><span className="text-black-alpha-48">Repo</span><span className="font-mono text-mono-small">{open.repo}</span></li>
                <li className="flex justify-between"><span className="text-black-alpha-48">Agent</span><span className="font-mono text-mono-small">{open.agent}</span></li>
                <li className="flex justify-between"><span className="text-black-alpha-48">At</span><span className="font-mono text-mono-small">{open.created_at}</span></li>
                <li className="flex justify-between"><span className="text-black-alpha-48">ID</span><span className="font-mono text-mono-small">{open.id}</span></li>
              </ul>
            </div>

            {open.message && (
              <div>
                <MonoAnnotation>// detail</MonoAnnotation>
                <p className="mt-8 text-body-medium text-black-alpha-72 leading-22 whitespace-pre-wrap">
                  {open.message}
                </p>
              </div>
            )}
          </div>
        )}
      </Sheet>
    </div>
  );
}

function SelectPill({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  label: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-mono-x-small text-black-alpha-72 hover:text-accent-black hover:bg-black-alpha-4 transition-colors flex items-center gap-4 px-10 py-6 -mt-1 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-border-faint"
      >
        <Funnel className="size-3" />
        {label}: <span className="text-accent-black font-mono">{value}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-4 z-10 min-w-160 bg-surface border border-border-faint rounded-md shadow-md p-4">
          {options.map((o) => (
            <button
              key={o}
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
              className={`w-full text-left px-8 py-6 text-mono-small hover:bg-black-alpha-4 rounded-4 ${
                value === o ? "text-heat-100" : "text-accent-black"
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}