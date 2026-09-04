import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, Upload, MagnifyingGlass, ArrowClockwise } from "@phosphor-icons/react";
import { usePolicyVersions, usePublishPolicy, useRollbackVersion } from "@/lib/hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";
import { Skeleton, EmptyState } from "@/components/shared/EmptyState";
import { Callout } from "@/components/ui/callout";
import { useToast } from "@policyctl/design-system";
import type { PolicyVersion } from "@policyctl/types";

export function Policies() {
  const { data, isLoading, error, refetch } = usePolicyVersions();
  const queryClient = useQueryClient();
  const { push } = useToast();
  const publishMutation = usePublishPolicy();
  const rollbackMutation = useRollbackVersion();

  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [publishYaml, setPublishYaml] = useState("");
  const [publishNote, setPublishNote] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const versions = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = data ?? [];
    if (!q) return list;
    return list.filter(
      (v) => v.note?.toLowerCase().includes(q) || v.yaml?.toLowerCase().includes(q),
    );
  }, [data, search]);

  // Highest version number is live; rollback moves the pointer, so the rest is history.
  const activeVersion =
    versions.length > 0 ? Math.max(...versions.map((v) => v.version)) : null;

  const retry = () => {
    queryClient.invalidateQueries({ queryKey: ["policyVersions"] });
    refetch();
  };

  const copyYaml = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handlePublish = async () => {
    if (!publishYaml.trim()) {
      push({ title: "Policy YAML is required", tone: "warning" });
      return;
    }
    try {
      await publishMutation.mutateAsync({ yaml: publishYaml, note: publishNote });
      push({ title: "Policy published", description: "New version registered." });
      setPublishYaml("");
      setPublishNote("");
      queryClient.invalidateQueries({ queryKey: ["policyVersions"] });
      refetch();
    } catch (e: any) {
      push({ title: "Publish failed", description: e?.message ?? "Try again." });
    }
  };

  const handleRollback = async (id: string) => {
    try {
      await rollbackMutation.mutateAsync(id);
      push({ title: "Rolled back", description: "Policy reverted to this version." });
      queryClient.invalidateQueries({ queryKey: ["policyVersions"] });
      refetch();
    } catch (e: any) {
      push({ title: "Rollback failed", description: e?.message ?? "Try again." });
    }
  };

  return (
    <div className="space-y-24">
      <div className="-mt-1 flex flex-wrap items-center justify-between gap-8 border-b border-border-faint pb-12">
        <span className="font-mono text-mono-x-small uppercase tracking-wider text-black-alpha-32">
          [ policies / {versions.length}
          {data && data.length !== versions.length ? ` of ${data.length}` : ""} versions ]
        </span>
        <div className="flex items-center gap-8">
          {data && data.length > 0 && (
            <Button
              size="sm"
              variant={publishYaml.trim() ? "primary" : "secondary"}
              onClick={() => {
                const existing = data?.[0];
                if (existing) setPublishYaml(existing.yaml ?? "");
              }}
            >
              <Upload className="size-3 mr-4" aria-hidden /> Edit &amp; publish
            </Button>
          )}
          <label className="flex items-center gap-8 rounded-md border border-border-faint px-12 py-6">
            <MagnifyingGlass className="size-3 text-black-alpha-64" aria-hidden />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="search notes / yaml…"
              aria-label="Search policy versions"
              className="w-200 bg-transparent font-mono text-mono-small outline-none placeholder:text-black-alpha-32"
            />
          </label>
        </div>
      </div>

      {error && (
        <Callout type="danger" title="Failed to load policy versions" className="p-16">
          {(error as Error)?.message || "An unexpected error occurred."}
          <button onClick={retry} className="mt-8 pcl-btn pcl-btn--secondary pcl-btn--sm">
            <ArrowClockwise className="size-3 mr-4" aria-hidden /> Retry
          </button>
        </Callout>
      )}

      {isLoading ? (
        <div className="space-y-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      ) : (data?.length ?? 0) === 0 ? (
        <Card className="p-32 lg:p-64">
          <EmptyState
            icon={ShieldCheck}
            title="No policy versions yet"
            description="Publish your first policy version or push from the CLI."
            action={
              <>
                <pre className="rounded-md border border-border-faint px-16 py-12 font-mono text-mono-medium leading-22">
                  $ policyctl push
                </pre>
                <span className="mt-12 text-mono-x-small text-black-alpha-32">— or —</span>
                <div className="mt-16 w-full">
                  <textarea
                    value={publishYaml}
                    onChange={(e) => setPublishYaml(e.target.value)}
                    placeholder={"rules:\n  - id: block-secrets\n    enforce: block"}
                    aria-label="Policy YAML"
                    className="min-h-40 w-full resize-y rounded-lg border border-border-faint bg-surface px-12 py-8 font-mono text-mono-small outline-none focus:border-heat-100"
                  />
                  <input
                    type="text"
                    value={publishNote}
                    onChange={(e) => setPublishNote(e.target.value)}
                    placeholder="Optional note (e.g. 'Added .env block rule')"
                    aria-label="Version note"
                    className="mt-8 h-9 w-full rounded-lg border border-border-faint bg-surface px-3 py-2 text-body-medium outline-none placeholder:text-black-alpha-32 focus:border-heat-100"
                  />
                  <Button className="mt-16 w-full" onClick={handlePublish} disabled={!publishYaml.trim() || publishMutation.isPending}>
                    {publishMutation.isPending ? "Publishing…" : "Publish version"}
                  </Button>
                </div>
              </>
            }
          />
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-body-medium">
            <thead>
              <tr className="border-b border-border-faint text-left font-mono text-mono-x-small uppercase text-black-alpha-64">
                <th scope="col" className="p-16">version</th>
                <th scope="col" className="p-16">note</th>
                <th scope="col" className="hidden p-16 md:table-cell">author</th>
                <th scope="col" className="p-16">date</th>
                <th scope="col" className="p-16">status</th>
              </tr>
            </thead>
            <tbody>
              {versions.map((v) => (
                <VersionRow
                  key={v.id}
                  v={v}
                  isActive={v.version === activeVersion}
                  expanded={expanded === v.id}
                  onToggle={() => setExpanded(expanded === v.id ? null : v.id)}
                  onCopy={() => copyYaml(v.id, v.yaml)}
                  copied={copiedId === v.id}
                  onRollback={() => handleRollback(String(v.id))}
                  isRollingBack={rollbackMutation.isPending}
                />
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Card className="p-24 lg:p-32">
        <h3 className="text-label-x-large">Push from CLI</h3>
        <p className="mt-8 text-body-medium leading-22 text-black-alpha-72">
          Inside any repo, push your local{" "}
          <code className="font-mono text-mono-small">.policyctl.yml</code> to register a new
          version:
        </p>
        <div className="mt-16">
          <CodeBlock code='policyctl push --note "block manual migrations"' lang="bash" title="terminal" />
        </div>
      </Card>
    </div>
  );
}

function VersionRow({
  v,
  isActive,
  expanded,
  onToggle,
  onCopy,
  copied,
  onRollback,
  isRollingBack,
}: {
  v: PolicyVersion;
  isActive: boolean;
  expanded: boolean;
  onToggle: () => void;
  onCopy: () => void;
  copied: boolean;
  onRollback: () => void;
  isRollingBack: boolean;
}) {
  return (
    <>
      <tr
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        tabIndex={0}
        role="button"
        aria-expanded={expanded}
        className="cursor-pointer border-b border-border-faint transition-colors last:border-0 hover:bg-black-alpha-4"
      >
        <td className="p-16 font-mono text-mono-medium">v{v.version}</td>
        <td className="max-w-[240px] truncate p-16 text-black-alpha-72">{v.note || "—"}</td>
        <td className="hidden p-16 font-mono text-mono-small text-black-alpha-64 md:table-cell">
          {v.author_id}
        </td>
        <td className="whitespace-nowrap p-16 font-mono text-mono-x-small text-black-alpha-32">
          {new Date(v.created_at).toLocaleString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </td>
        <td className="p-16">
          {isActive ? <Badge tone="heat">active</Badge> : <Badge tone="muted">archived</Badge>}
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={5} className="border-b border-border-faint p-24">
            <div className="mb-12 flex items-center justify-between">
              <span className="font-mono text-mono-x-small text-black-alpha-64">
                // .policyctl.yml (v{v.version})
              </span>
              <div className="flex gap-8">
                <Button
                  variant="tertiary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopy();
                  }}
                >
                  {copied ? "Copied" : "Copy"}
                </Button>
                {!isActive && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRollback();
                    }}
                    disabled={isRollingBack}
                  >
                    {isRollingBack ? "Rolling back…" : "Rollback to here"}
                  </Button>
                )}
              </div>
            </div>
            <CodeBlock code={v.yaml} lang="yaml" title={`v${v.version}`} />
          </td>
        </tr>
      )}
    </>
  );
}
