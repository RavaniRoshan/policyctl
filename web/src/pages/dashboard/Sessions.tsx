import { useState, useEffect } from "react";
import { CheckCircle, Funnel, ArrowClockwise, X, CheckSquare, Square } from "@phosphor-icons/react";
import { useViolations, useSessionStream, __isDemoMode } from "@/lib/hooks";
import { useAuth } from "@/lib/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, CurvyRect, Modal, useToast } from "@policyctl/design-system";
import { Skeleton, EmptyState, MonoAnnotation } from "@/components/shared/EmptyState";
import { Callout } from "@/components/ui/callout";
import type { Violation } from "@policyctl/types";
import type { UseSessionStreamOptions } from "@/lib/hooks.types";
import { api } from "@/lib/api";

export function Sessions() {
  const { data, isLoading, error, refetch } = useViolations();
  const { getAccessToken } = useAuth();
  const queryClient = useQueryClient();
  const { push } = useToast();
  const [provider, setProvider] = useState<string>("All");
  const [enforce, setEnforce] = useState<string>("All");
  const [open, setOpen] = useState<Violation | null>(null);
  const [sessionKey] = useState<string>("live"); // shared live-feed channel for the org
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { connected } = useSessionStream(
    sessionKey,
    {
      getAccessToken,
      onViolation: () => {
        queryClient.invalidateQueries({ queryKey: ["violations"] });
      },
    } as UseSessionStreamOptions
  );

  const dismissMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => api.dismissViolation(id, reason),
    onSuccess: () => {
      push({ title: "Violation dismissed", description: "The violation has been marked as dismissed." });
      queryClient.invalidateQueries({ queryKey: ["violations"] });
    },
  });

  const [dismissModal, setDismissModal] = useState<{ open: boolean; violation: Violation | null }>({ open: false, violation: null });
  const [dismissReason, setDismissReason] = useState("");

  // Show connection status
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["violations"] });
  }, [connected, queryClient]);

  const filtered = (data ?? []).filter((v) => {
    if (provider !== "All" && v.agent?.toLowerCase() !== provider.toLowerCase()) return false;
    if (enforce !== "All" && v.enforce !== enforce) return false;
    return true;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((v) => v.id)));
    }
  };

  const handleBulkDismiss = () => {
    if (selectedIds.size === 0) return;
    // For bulk dismiss, we use a simple reason
    const reason = "Bulk dismiss by user";
    selectedIds.forEach((id) => {
      dismissMutation.mutate({ id, reason });
    });
    setSelectedIds(new Set());
  };

  const handleDismiss = (violation: Violation) => {
    setDismissModal({ open: true, violation });
    setDismissReason("");
  };

  const confirmDismiss = () => {
    if (!dismissModal.violation || !dismissReason.trim()) return;
    dismissMutation.mutate({ id: dismissModal.violation.id, reason: dismissReason });
    setDismissModal({ open: false, violation: null });
    setDismissReason("");
  };

  const retry = () => {
    queryClient.invalidateQueries({ queryKey: ["violations"] });
    refetch();
  };

  return (
    <div className="space-y-24">
      {/* Connection status banner (hidden in demo builds: no stream exists to connect to) */}
      {!__isDemoMode && (
      <div className={`p-12 rounded-md -mt-1 ${connected ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>        <div className="flex items-center gap-8">
          <span className={`size-8 rounded-full ${connected ? "bg-success" : "bg-warning"}`} />
          <span className="font-medium">
            {connected
              ? "Live enforcement session connected"
              : "Live enforcement session disconnected - attempting to reconnect..."}
          </span>
        </div>
      </div>
      )}

      <div className="flex items-center justify-between -mt-1 border-b border-border-faint pb-12 flex-wrap gap-8">
        <MonoAnnotation>[ violations / {filtered.length} records ]</MonoAnnotation>
        <div className="flex items-center gap-8">
          <SelectPill value={provider} onChange={setProvider} options={["All", "claude", "codex", "cursor", "ci"]} label="provider" />
          <SelectPill value={enforce} onChange={setEnforce} options={["All", "block", "fail", "warn", "log"]} label="enforce" />
        </div>
      </div>

      {/* Bulk actions toolbar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between p-16 bg-heat-4 border border-heat-12 rounded-md -mt-1">
          <span className="text-label-medium text-accent-black">
            {selectedIds.size} violation{selectedIds.size === 1 ? "" : "s"} selected
          </span>
          <div className="flex items-center gap-8">
            <button
              onClick={handleBulkDismiss}
              className="text-label-small text-danger hover:text-danger/80 transition-colors"
            >
              Dismiss selected
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-label-small text-black-alpha-72 hover:text-accent-black transition-colors"
            >
              Clear selection
            </button>
          </div>
        </div>
      )}

      {error && (
        <Callout type="danger" title="Failed to load violations" className="p-16">
          {error.message || "An unexpected error occurred."}
          <button onClick={retry} className="mt-8 pcl-btn pcl-btn--secondary pcl-btn--sm">
            <ArrowClockwise className="size-3 mr-4" /> Retry
          </button>
        </Callout>
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
            title="No violations recorded"
            description="Enforcement sessions will appear here once an agent runs against your repo."
          />
        </Card>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-8 -mt-1">
            {filtered.map((v) => (
              <Card
                key={v.id}
                onClick={() => setOpen(v)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(v); } }}
                tabIndex={0}
                role="button"
                className="p-16 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-border-faint hover:bg-black-alpha-4 transition-colors cursor-pointer focus-visible:bg-black-alpha-4"
              >
                <div className="flex items-center justify-between mb-8">
                  <Badge tone={v.enforce === "block" ? "danger" : v.enforce === "fail" ? "accent" : "muted"}>
                    {v.enforce}
                  </Badge>
                  <span className="text-mono-x-small text-black-alpha-32">
                    {new Date(v.created_at).toLocaleString("en-US", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className="font-mono text-mono-small text-accent-black mb-4">{v.rule_id}</div>
                <div className="flex items-center justify-between text-body-small text-black-alpha-56">
                  <span className="truncate">{v.repo}</span>
                  <span className="font-mono text-mono-x-small ml-8">{v.agent}</span>
                </div>
              </Card>
            ))}
          </div>

          {/* Desktop table */}
          <Card className="p-0 overflow-hidden hidden md:block">
            <CurvyRect sides="allSides" />
            <div className="overflow-x-auto">
            <table className="w-full text-body-medium min-w-600">
              <thead>
                <tr className="border-b border-border-faint text-left text-mono-x-small text-black-alpha-32 uppercase">
                  <th scope="col" className="p-16 w-48">
                    <button onClick={toggleSelectAll} className="flex items-center justify-center w-full">
                      {selectedIds.size === filtered.length && filtered.length > 0 ? <CheckSquare className="size-4" /> : <Square className="size-4" />}
                    </button>
                  </th>
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
                    <td className="p-16" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleSelect(v.id)}
                        className="flex items-center justify-center w-full"
                      >
                        {selectedIds.has(v.id) ? <CheckSquare className="size-4 text-heat-100" /> : <Square className="size-4 text-black-alpha-32" />}
                      </button>
                    </td>
                    <td className="p-16">
                      <Badge tone={v.enforce === "block" ? "danger" : v.enforce === "fail" ? "accent" : "muted"}>
                        {v.enforce}
                      </Badge>
                    </td>
                    <td className="p-16 font-mono text-mono-small text-accent-black">{v.rule_id}</td>
                    <td className="p-16 text-black-alpha-72">{v.repo}</td>
                    <td className="p-16 text-black-alpha-64">{v.agent}</td>
                    <td className="p-16 font-mono text-mono-x-small text-black-alpha-32">
                      {new Date(v.created_at).toLocaleString("en-US", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </Card>
        </>
      )}

      {/* Violation detail sheet */}
      <Sheet open={!!open} onClose={() => setOpen(null)} title="Violation detail" width={640}>
        {open && (
          <div className="space-y-24">
            <div>
              <MonoAnnotation>// enforcement</MonoAnnotation>
              <div className="mt-8 flex items-center gap-8">
                <Badge tone={open.enforce === "block" ? "danger" : open.enforce === "fail" ? "accent" : "default"}>
                  {open.enforce}
                </Badge>
                <span className="font-mono text-mono-medium text-accent-black">{open.rule_id}</span>
              </div>
            </div>

            <div>
              <MonoAnnotation>// message</MonoAnnotation>
              <p className="mt-8 text-body-medium text-black-alpha-72 leading-22 whitespace-pre-wrap">
                {open.message || "—"}
              </p>
            </div>

            <div>
              <MonoAnnotation>// context</MonoAnnotation>
              <ul className="mt-8 space-y-4 text-body-medium">
                <li className="flex justify-between"><span className="text-black-alpha-56">Repo</span><span className="font-mono text-mono-small text-accent-black">{open.repo}</span></li>
                <li className="flex justify-between"><span className="text-black-alpha-56">Agent</span><span className="font-mono text-mono-small text-accent-black">{open.agent}</span></li>
                <li className="flex justify-between"><span className="text-black-alpha-56">At</span><span className="font-mono text-mono-small text-accent-black">{new Date(open.created_at).toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span></li>
                <li className="flex justify-between"><span className="text-black-alpha-56">ID</span><span className="font-mono text-mono-small text-accent-black">{open.id}</span></li>
              </ul>
            </div>

            <div className="flex items-center gap-8 pt-8 border-t border-border-faint">
              <Button variant="secondary" size="sm" onClick={() => handleDismiss(open)}>
                Dismiss
              </Button>
            </div>
          </div>
        )}
      </Sheet>

      {/* Dismiss modal */}
      <Modal open={dismissModal.open} onClose={() => setDismissModal({ open: false, violation: null })} title="Dismiss violation" maxWidth={420}>
        {dismissModal.violation && (
          <div className="space-y-16">
            <p className="text-body-medium text-black-alpha-72 leading-22">
              Mark this violation as dismissed. This will hide it from the default view but keep it in the audit log.
            </p>
            <div>
              <label className="block text-label-small text-black-alpha-56 mb-8">Reason</label>
              <textarea
                value={dismissReason}
                onChange={(e) => setDismissReason(e.target.value)}
                placeholder="e.g. false positive, accepted risk, won't fix"
                className="w-full min-h-80 font-mono text-mono-small text-accent-black bg-surface border border-border-faint rounded-lg px-12 py-8 outline-none focus:border-heat-100 focus:ring-2 focus:ring-heat-100/20 resize-y"
              />
            </div>
            <div className="flex items-center justify-end gap-8 pt-8">
              <Button variant="tertiary" onClick={() => setDismissModal({ open: false, violation: null })}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDismiss} disabled={!dismissReason.trim() || dismissMutation.isPending}>
                {dismissMutation.isPending ? "Dismissing…" : "Dismiss"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
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