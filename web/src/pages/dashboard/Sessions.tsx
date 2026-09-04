import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckSquare, Square, ArrowClockwise, Funnel } from "@phosphor-icons/react";
import { useViolations, useSessionStream, __isDemoMode } from "@/lib/hooks";
import { useAuth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, Modal, useToast } from "@policyctl/design-system";
import { Skeleton, EmptyState } from "@/components/shared/EmptyState";
import { Callout } from "@/components/ui/callout";
import { api } from "@/lib/api";
import type { Violation } from "@policyctl/types";
import type { UseSessionStreamOptions } from "@/lib/hooks.types";

const PROVIDERS = ["All", "claude", "codex", "cursor", "ci"] as const;
const ENFORCEMENTS = ["All", "block", "fail", "warn"] as const;

export function Sessions() {
  const { data, isLoading, error, refetch } = useViolations();
  const { getAccessToken } = useAuth();
  const queryClient = useQueryClient();
  const { push } = useToast();

  const [provider, setProvider] = useState<string>("All");
  const [enforce, setEnforce] = useState<string>("All");
  const [open, setOpen] = useState<Violation | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dismissTarget, setDismissTarget] = useState<Violation | null>(null);
  const [reason, setReason] = useState("");

  const { connected } = useSessionStream(
    "live", // shared live-feed channel for the org
    {
      getAccessToken,
      onViolation: () => {
        queryClient.invalidateQueries({ queryKey: ["violations"] });
      },
    } as UseSessionStreamOptions,
  );

  const dismissMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.dismissViolation(id, reason),
    onSuccess: () => {
      push({ title: "Violation dismissed", description: "Hidden from the default view, kept in the audit log." });
      queryClient.invalidateQueries({ queryKey: ["violations"] });
    },
    onError: (e: any) => {
      push({ title: "Dismiss failed", description: e?.message ?? "Try again." });
    },
  });

  const filtered = useMemo(() => {
    return (data ?? []).filter(
      (v) =>
        (provider === "All" || v.agent?.toLowerCase() === provider.toLowerCase()) &&
        (enforce === "All" || v.enforce === enforce),
    );
  }, [data, provider, enforce]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) =>
      prev.size === filtered.length ? new Set() : new Set(filtered.map((v) => v.id)),
    );
  };

  const bulkDismiss = () => {
    if (selected.size === 0) return;
    selected.forEach((id) => dismissMutation.mutate({ id, reason: "Bulk dismiss by user" }));
    setSelected(new Set());
  };

  const confirmDismiss = () => {
    if (!dismissTarget || !reason.trim()) return;
    dismissMutation.mutate({ id: dismissTarget.id, reason });
    setDismissTarget(null);
    setReason("");
  };

  const retry = () => {
    queryClient.invalidateQueries({ queryKey: ["violations"] });
    refetch();
  };

  return (
    <div className="space-y-24">
      {!__isDemoMode && (
        <div
          role="status"
          className={`rounded-md p-12 ${connected ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}
        >
          <div className="flex items-center gap-8">
            <span className={`size-8 rounded-full ${connected ? "bg-success" : "bg-warning"}`} aria-hidden />
            <span className="font-medium">
              {connected
                ? "Live enforcement session connected"
                : "Live enforcement session disconnected - attempting to reconnect..."}
            </span>
          </div>
        </div>
      )}

      <div className="-mt-1 flex flex-wrap items-center justify-between gap-8 border-b border-border-faint pb-12">
        <span className="font-mono text-mono-x-small uppercase tracking-wider text-black-alpha-32">
          [ violations / {filtered.length} records ]
        </span>
        <div className="flex items-center gap-8">
          <Filter label="provider" value={provider} onChange={setProvider} options={[...PROVIDERS]} />
          <Filter label="enforce" value={enforce} onChange={setEnforce} options={[...ENFORCEMENTS]} />
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-12 rounded-md border border-border-faint bg-surface p-12">
          <span className="text-body-small text-black-alpha-64">
            {selected.size} selected
          </span>
          <Button size="sm" variant="secondary" onClick={bulkDismiss} disabled={dismissMutation.isPending}>
            Dismiss selected
          </Button>
          <button
            onClick={() => setSelected(new Set())}
            className="text-body-small text-black-alpha-64 hover:text-accent-black"
          >
            Clear
          </button>
        </div>
      )}

      {error && (
        <Callout type="danger" title="Failed to load violations" className="p-16">
          {(error as Error)?.message || "An unexpected error occurred."}
          <button onClick={retry} className="mt-8 pcl-btn pcl-btn--secondary pcl-btn--sm">
            <ArrowClockwise className="size-3 mr-4" aria-hidden /> Retry
          </button>
        </Callout>
      )}

      {isLoading ? (
        <div className="space-y-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-32 lg:p-64">
          <EmptyState
            icon={Funnel}
            title="No violations match"
            description="Adjust the filters, or wait for an agent to attempt a blocked operation."
          />
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-body-medium">
            <thead>
              <tr className="border-b border-border-faint text-left font-mono text-mono-x-small uppercase text-black-alpha-64">
                <th scope="col" className="w-40 p-12">
                  <button onClick={toggleAll} aria-label="Select all violations" className="inline-flex">
                    {selected.size === filtered.length && filtered.length > 0 ? (
                      <CheckSquare className="size-4" aria-hidden />
                    ) : (
                      <Square className="size-4" aria-hidden />
                    )}
                  </button>
                </th>
                <th scope="col" className="p-12">enforce</th>
                <th scope="col" className="p-12">rule</th>
                <th scope="col" className="hidden p-12 md:table-cell">repo</th>
                <th scope="col" className="hidden p-12 lg:table-cell">agent</th>
                <th scope="col" className="p-12 text-right">time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr
                  key={v.id}
                  onClick={() => setOpen(v)}
                  className="cursor-pointer border-b border-border-faint transition-colors last:border-0 hover:bg-black-alpha-4"
                >
                  <td className="p-12" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => toggle(v.id)} aria-label={`Select violation ${v.rule_id}`} className="inline-flex">
                      {selected.has(v.id) ? (
                        <CheckSquare className="size-4 text-heat-100" aria-hidden />
                      ) : (
                        <Square className="size-4" aria-hidden />
                      )}
                    </button>
                  </td>
                  <td className="p-12">
                    <Badge tone={v.enforce === "block" ? "danger" : v.enforce === "fail" ? "accent" : "muted"}>
                      {v.enforce}
                    </Badge>
                  </td>
                  <td className="p-12 font-mono text-mono-small">{v.rule_id}</td>
                  <td className="hidden truncate p-12 text-body-small text-black-alpha-64 md:table-cell">
                    {v.repo}
                  </td>
                  <td className="hidden p-12 text-body-small text-black-alpha-64 lg:table-cell">
                    {v.agent}
                  </td>
                  <td className="whitespace-nowrap p-12 text-right font-mono text-mono-x-small text-black-alpha-64">
                    {new Date(v.created_at).toLocaleString("en-US", {
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Sheet open={open !== null} onClose={() => setOpen(null)} title={open?.rule_id ?? "Violation"}>
        {open && (
          <div className="space-y-16 p-24">
            <p className="text-body-medium leading-22">{open.message}</p>
            <dl className="grid grid-cols-2 gap-12 text-body-small">
              <div>
                <dt className="font-mono text-mono-x-small uppercase text-black-alpha-32">enforce</dt>
                <dd className="mt-4 font-mono text-mono-small">{open.enforce}</dd>
              </div>
              <div>
                <dt className="font-mono text-mono-x-small uppercase text-black-alpha-32">agent</dt>
                <dd className="mt-4 font-mono text-mono-small">{open.agent}</dd>
              </div>
              <div className="col-span-2">
                <dt className="font-mono text-mono-x-small uppercase text-black-alpha-32">repo</dt>
                <dd className="mt-4 font-mono text-mono-small">{open.repo}</dd>
              </div>
              <div className="col-span-2">
                <dt className="font-mono text-mono-x-small uppercase text-black-alpha-32">time</dt>
                <dd className="mt-4 font-mono text-mono-small">
                  {new Date(open.created_at).toLocaleString()}
                </dd>
              </div>
            </dl>
            <Button
              variant="secondary"
              onClick={() => {
                setDismissTarget(open);
                setReason("");
                setOpen(null);
              }}
            >
              Dismiss violation
            </Button>
          </div>
        )}
      </Sheet>

      <Modal
        open={dismissTarget !== null}
        onClose={() => setDismissTarget(null)}
        title="Dismiss violation"
        maxWidth={420}
      >
        <p className="text-body-medium leading-22 text-black-alpha-72">
          Mark this violation as dismissed. This hides it from the default view but keeps it
          in the audit log.
        </p>
        <label htmlFor="dismiss-reason" className="mt-16 block text-label-small">
          Reason
        </label>
        <input
          id="dismiss-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. false positive, accepted risk"
          className="mt-8 h-44 w-full rounded-md border border-border-faint bg-surface px-12 text-body-medium outline-none focus:border-heat-100"
        />
        <div className="mt-24 flex items-center justify-end gap-8">
          <Button variant="tertiary" onClick={() => setDismissTarget(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={confirmDismiss}
            disabled={!reason.trim() || dismissMutation.isPending}
          >
            {dismissMutation.isPending ? "Dismissing…" : "Dismiss"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function Filter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="flex items-center gap-6 font-mono text-mono-x-small text-black-alpha-64">
      {label}:
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`Filter by ${label}`}
        className="h-32 rounded-md border border-border-faint bg-surface px-8 font-mono text-mono-small text-accent-black outline-none focus:border-heat-100"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
