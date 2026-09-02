import { useState, useMemo } from "react";
import { ShieldCheck, GitBranch, Copy, Check, MagnifyingGlass, ArrowClockwise, Upload } from "@phosphor-icons/react";
import { usePolicyVersions, usePublishPolicy, useRollbackVersion } from "@/lib/hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";
import { CurvyRect, useToast } from "@policyctl/design-system";
import { Skeleton, EmptyState, MonoAnnotation } from "@/components/shared/EmptyState";
import { Callout } from "@/components/ui/callout";
import { useQueryClient } from "@tanstack/react-query";
import type { PolicyVersion } from "@/lib/api";

export function Policies() {
  const { data, isLoading, error, refetch } = usePolicyVersions();
  const queryClient = useQueryClient();
  const { push } = useToast();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const publishMutation = usePublishPolicy();
  const rollbackMutation = useRollbackVersion();
  const [publishYaml, setPublishYaml] = useState("");
  const [publishNote, setPublishNote] = useState("");

  const filtered = useMemo(() => {
    if (!data || !search) return data ?? [];
    const q = search.toLowerCase();
    return data.filter(
      (v) => v.note?.toLowerCase().includes(q) || v.yaml?.toLowerCase().includes(q),
    );
  }, [data, search]);

  const copyYaml = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const retry = () => {
    queryClient.invalidateQueries({ queryKey: ["policyVersions"] });
    refetch();
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
      <div className="flex items-center justify-between -mt-1 border-b border-border-faint pb-12 flex-wrap gap-8">
        <MonoAnnotation>[ policies / {filtered.length}{data && data.length !== filtered.length ? ` of ${data.length}` : ""} versions ]</MonoAnnotation>
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
              <Upload className="size-3 mr-4" /> Edit & publish
            </Button>
          )}
          <div className="flex items-center gap-8 px-12 py-6 -mt-1 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-border-faint">
            <MagnifyingGlass className="size-3 text-black-alpha-48" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="search notes / yaml…"
              aria-label="Search policy versions"
              className="bg-transparent text-mono-small outline-none w-200 placeholder:text-black-alpha-32"
            />
          </div>
        </div>
      </div>

      {error && (
        <Callout type="danger" title="Failed to load policy versions" className="p-16">
          {error.message || "An unexpected error occurred."}
          <button onClick={retry} className="mt-8 pcl-btn pcl-btn--secondary pcl-btn--sm">
            <ArrowClockwise className="size-3 mr-4" /> Retry
          </button>
        </Callout>
      )}

      {isLoading ? (
        <div className="space-y-8 -mt-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      ) : (data?.length ?? 0) === 0 ? (
        <Card className="p-32 lg:p-64">
          <CurvyRect sides="allSides" />
          <EmptyState
            icon={ShieldCheck}
            title="No policy versions yet"
            description="Publish your first policy version or push from the CLI."
            action={
              <>
                <pre className="font-mono text-mono-medium leading-22 px-16 py-12 -mt-1 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-border-faint">
                  $ policyctl push
                </pre>
                <span className="mt-12 text-mono-x-small text-black-alpha-32">— or —</span>
                <div className="mt-16 w-full">
                  <textarea
                    value={publishYaml}
                    onChange={(e) => setPublishYaml(e.target.value)}
                    placeholder="rules:
  - id: block-secrets
    match:
      path: '**/*.env'
    enforce: block
    message: |
      Do not commit .env files."
                    className="w-full min-h-40 font-mono text-mono-small text-accent-black bg-surface border border-border-faint rounded-lg px-12 py-8 outline-none focus:border-heat-100 focus:ring-2 focus:ring-heat-100/20 resize-y"
                    aria-label="Policy YAML"
                  />
                  <input
                    type="text"
                    value={publishNote}
                    onChange={(e) => setPublishNote(e.target.value)}
                    placeholder="Optional note (e.g. 'Added .env block rule')"
                    className="mt-8 w-full h-9 rounded-lg border border-border-faint bg-surface px-3 py-2 text-body-medium text-accent-black placeholder:text-black-alpha-32 outline-none focus:border-heat-100 focus:ring-2 focus:ring-heat-100/20"
                  />
                  <Button
                    className="mt-16 w-full"
                    onClick={handlePublish}
                    disabled={!publishYaml.trim() || publishMutation.isPending}
                  >
                    {publishMutation.isPending ? "Publishing…" : "Publish version"}
                  </Button>
                </div>
              </>
            }
          />
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <CurvyRect sides="allSides" />
          <table className="w-full text-body-medium">
            <thead>
              <tr className="border-b border-border-faint text-left text-mono-x-small text-black-alpha-48 uppercase">
                <th scope="col" className="p-16">version</th>
                <th scope="col" className="p-16">note</th>
                <th scope="col" className="p-16">author</th>
                <th scope="col" className="p-16">date</th>
                <th scope="col" className="p-16">status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <VersionRow
                  key={v.id}
                  v={v}
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

      <Card className="p-32 lg:p-64">
        <CurvyRect sides="allSides" />
        <div className="flex items-start gap-12">
          <GitBranch className="size-5 text-heat-100 mt-2 shrink-0" />
          <div>
            <h3 className="text-label-x-large text-accent-black">Push from CLI</h3>
            <p className="mt-8 text-body-medium text-black-alpha-72 leading-22">
              Inside any repo, push your local <code className="font-mono text-mono-small">.policyctl.yml</code> to register a new version:
            </p>
            <div className="mt-16">
              <CodeBlock code='policyctl push --note "block manual migrations"' lang="bash" title="terminal" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function VersionRow({
  v,
  expanded,
  onToggle,
  onCopy,
  copied,
  onRollback,
  isRollingBack,
}: {
  v: PolicyVersion;
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
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(); } }}
        tabIndex={0}
        role="button"
        aria-expanded={expanded}
        className="border-b border-border-faint hover:bg-black-alpha-4 transition-colors cursor-pointer focus-visible:bg-black-alpha-4"
      >
        <td className="p-16 font-mono text-mono-medium text-accent-black">v{v.version}</td>
        <td className="p-16 text-black-alpha-72">{v.note || "—"}</td>
        <td className="p-16 text-black-alpha-64 font-mono text-mono-small">{v.author_id}</td>
        <td className="p-16 font-mono text-mono-x-small text-black-alpha-32">
          {new Date(v.created_at).toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
        </td>
        <td className="p-16">
          <Badge tone="heat">active</Badge>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={5} className="p-24 border-b border-border-faint">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-8">
                <MonoAnnotation>// .policyctl.yml (v{v.version})</MonoAnnotation>
                <Button
                  variant="tertiary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRollback();
                  }}
                  disabled={isRollingBack}
                >
                  Rollback to this version
                </Button>
              </div>
              <Button variant="tertiary" size="sm" onClick={onCopy}>
                {copied ? <Check className="size-3 mr-4" /> : <Copy className="size-3 mr-4" />}
                {copied ? "copied" : "copy"}
              </Button>
            </div>
            <div className="max-h-400 overflow-y-auto">
              <CodeBlock code={v.yaml || "# empty policy"} lang="yaml" title="" showLineNumbers />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}