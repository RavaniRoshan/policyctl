import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { useAuth } from "@/lib/auth";
import { Card, CardTitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/ui/callout";
import { api } from "@/lib/api";
import {
  Pulse, ShieldCheck, Sparkle, ChartBar, Warning, CheckCircle,
  ArrowClockwise, Spinner,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const titles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/sessions": "Sessions",
  "/dashboard/policies": "Policies",
  "/dashboard/ai": "AI",
  "/dashboard/reports": "Reports",
  "/dashboard/settings": "Gear",
};

export function DashboardShell() {
  const { pathname } = useLocation();
  const title = titles[pathname] ?? "Overview";
  return (
    <div className="flex min-h-screen bg-bg-primary">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function StatCard({ label, value, tone = "brand", icon: Icon }: { label: string; value: string; tone?: "brand" | "accent" | "danger" | "success"; icon?: any }) {
  const colors = {
    brand: "text-brand",
    accent: "text-accent",
    danger: "text-danger",
    success: "text-success",
  };
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="font-mono text-xs uppercase tracking-wider text-fg-muted">{label}</div>
        {Icon && <Icon className={cn("size-5", colors[tone])} />}
      </div>
      <div className={cn("mt-2 font-display text-3xl font-bold", colors[tone])}>{value}</div>
    </Card>
  );
}

export function Overview() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [analytics, violations] = await Promise.all([
        api.analytics().catch(() => null),
        api.violations().catch(() => []),
      ]);
      setData({ analytics, violations });
    } catch (e: any) {
      setError(e?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="size-8 text-brand animate-spin" />
        <span className="ml-3 text-fg-secondary">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Callout type="warning" title="Dashboard data unavailable">
          {error}. This is expected if the Worker API is not reachable. Showing placeholder data.
        </Callout>
        <OverviewFallback />
      </div>
    );
  }

  const score = data?.analytics?.compliance_score ?? 94;
  const sessions = data?.analytics?.active_sessions ?? 0;
  const violations = data?.analytics?.violations_24h ?? 0;
  const insights = data?.analytics?.ai_insights ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button variant="ghost" size="sm" onClick={load}><ArrowClockwise className="size-3.5" /> Refresh</Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Compliance score" value={`${score}%`} tone="success" icon={ShieldCheck} />
        <StatCard label="Active sessions" value={String(sessions)} tone="brand" icon={Pulse} />
        <StatCard label="Violations (24h)" value={String(violations)} tone={violations > 0 ? "danger" : "success"} icon={Warning} />
        <StatCard label="AI insights" value={String(insights)} tone="accent" icon={Sparkle} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle>Recent violations</CardTitle>
          <CardBody>Latest enforcement events across your repos.</CardBody>
          <div className="mt-4 space-y-2">
            {data?.violations?.length > 0 ? (
              data.violations.slice(0, 5).map((v: any) => (
                <div key={v.id} className="flex items-center justify-between rounded-lg border border-border bg-bg-surface px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <Badge tone="danger">{v.enforce}</Badge>
                    <span className="font-mono text-sm text-fg-primary">{v.rule_id}</span>
                    <span className="text-sm text-fg-secondary">{v.repo}</span>
                  </div>
                  <span className="font-mono text-xs text-fg-muted">{v.created_at}</span>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-border bg-bg-surface p-6 text-center">
                <CheckCircle className="mx-auto size-8 text-success" />
                <p className="mt-2 text-sm text-fg-secondary">No violations recorded yet</p>
              </div>
            )}
          </div>
          <Link to="/dashboard/sessions" className="mt-3 inline-block text-sm text-brand hover:underline">View all sessions →</Link>
        </Card>

        <Card>
          <CardTitle className="flex items-center gap-2"><Sparkle className="size-4 text-accent" /> AI insight</CardTitle>
          <CardBody>Today's semantic analysis flagged a pattern worth a rule.</CardBody>
          <div className="mt-3 rounded-lg border border-border bg-bg-elevated p-3 text-sm text-fg-secondary">
            "Migrations edited by hand in <code className="font-mono">db/migrations</code> 3× this week — consider a <code className="font-mono">migrations-via-generator</code> rule."
          </div>
          <Link to="/dashboard/ai" className="mt-3 inline-block text-sm text-brand hover:underline">Open AI →</Link>
        </Card>
      </div>

      <Callout type="tip" title="Deterministic by default">
        Hook-time and CI-time share the same engine. A rule that blocks in Claude blocks in Codex and in your pipeline.
      </Callout>
    </div>
  );
}

function OverviewFallback() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Compliance score" value="—" tone="brand" />
      <StatCard label="Active sessions" value="—" tone="brand" />
      <StatCard label="Violations (24h)" value="—" tone="brand" />
      <StatCard label="AI insights" value="—" tone="brand" />
    </div>
  );
}

export function Sessions() {
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.violations().then(setViolations).catch(() => setViolations([])).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="size-8 text-brand animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {violations.length > 0 ? (
        violations.map((v) => (
          <Card key={v.id}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge tone={v.enforce === "block" ? "danger" : v.enforce === "fail" ? "accent" : "muted"}>{v.enforce}</Badge>
                <span className="font-mono text-sm text-fg-primary">{v.rule_id}</span>
                <span className="text-sm text-fg-secondary">{v.repo}</span>
              </div>
              <span className="font-mono text-xs text-fg-muted">{v.created_at}</span>
            </div>
            {v.message && <p className="mt-2 text-sm text-fg-secondary">{v.message}</p>}
          </Card>
        ))
      ) : (
        <Card className="p-8 text-center">
          <CheckCircle className="mx-auto size-10 text-success" />
          <p className="mt-3 text-fg-primary font-medium">No sessions recorded</p>
          <p className="mt-1 text-sm text-fg-secondary">Enforcement sessions will appear here once you link a repo.</p>
        </Card>
      )}
    </div>
  );
}

export function Policies() {
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.policyVersions().then(setVersions).catch(() => setVersions([])).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="size-8 text-brand animate-spin" />
      </div>
    );
  }

  return (
    <Card className="p-0">
      {versions.length > 0 ? (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-fg-muted font-mono text-xs uppercase">
              <th className="p-4">Version</th>
              <th className="p-4">Note</th>
              <th className="p-4">Author</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {versions.map((v) => (
              <tr key={v.id} className="border-b border-border/60">
                <td className="p-4 font-mono text-fg-primary">v{v.version}</td>
                <td className="p-4 text-fg-secondary">{v.note || "—"}</td>
                <td className="p-4 text-fg-secondary">{v.author_id}</td>
                <td className="p-4 font-mono text-fg-muted">{v.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="p-8 text-center">
          <ShieldCheck className="mx-auto size-10 text-fg-muted" />
          <p className="mt-3 text-fg-primary font-medium">No policy versions</p>
          <p className="mt-1 text-sm text-fg-secondary">Push a policy from the CLI to see versions here.</p>
        </div>
      )}
    </Card>
  );
}

export function Ai() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const analyze = async (mode: "analyze" | "author") => {
    setBusy(true);
    setErr(null);
    try {
      const r = await (mode === "author" ? api.aiAuthor(prompt) : api.aiAnalyze(prompt));
      setResult(JSON.stringify(r, null, 2));
    } catch (e: any) {
      setErr(e?.message || "AI request failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardTitle className="flex items-center gap-2"><Sparkle className="size-4 text-accent" /> Rule author</CardTitle>
        <CardBody>Describe a rule in plain English; get a typed policy back.</CardBody>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Block any commit that touches migrations/ unless it was generated by the CLI"
          className="mt-3 h-28 w-full rounded-lg border border-border bg-bg-elevated p-3 text-sm text-fg-primary outline-none focus:border-brand placeholder:text-fg-muted"
        />
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => analyze("author")} disabled={busy || !prompt}>Author rule</Button>
          <Button size="sm" variant="ghost" onClick={() => analyze("analyze")} disabled={busy || !prompt}>Analyze</Button>
        </div>
        {err && <div className="mt-3 text-sm text-danger">{err}</div>}
      </Card>
      <Card>
        <CardTitle>Output</CardTitle>
        <CardBody>Structured policy or analysis.</CardBody>
        <div className="mt-3">
          <CodeBlock code={result || "// result appears here"} lang="json" />
        </div>
      </Card>
    </div>
  );
}

export function Reports() {
  return (
    <div className="space-y-4">
      <Callout type="note" title="Daily compliance report">
        Delivered to your inbox at 09:00 UTC. The next report runs on the cron trigger and aggregates posture across all linked repos.
      </Callout>
      <Card>
        <CardTitle className="flex items-center gap-2"><ChartBar className="size-4 text-brand" /> Latest report</CardTitle>
        <CardBody>No report yet — the first run happens at 09:00 UTC after you link a repo.</CardBody>
        <div className="mt-3 font-mono text-xs text-fg-muted">subject: policyctl compliance · 2026-08-29 · 3 repos · 2 violations</div>
      </Card>
    </div>
  );
}

export function Gear() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="max-w-2xl space-y-4">
      <Card>
        <CardTitle>Account</CardTitle>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-fg-secondary">Email</span><span className="font-mono text-fg-primary">{user?.email}</span></div>
          <div className="flex justify-between"><span className="text-fg-secondary">Provider</span><span className="font-mono text-fg-primary">{user?.provider}</span></div>
        </div>
      </Card>
      <Card>
        <CardTitle>Control-plane API key</CardTitle>
        <CardBody>Use this to link the CLI: <code className="font-mono">policyctl login --control-plane</code>.</CardBody>
        <CodeBlock code="pc_live_••••••••••••••••••••" lang="text" />
      </Card>
      <Button variant="danger" onClick={() => logout().then(() => navigate("/"))}>Log out</Button>
    </div>
  );
}
