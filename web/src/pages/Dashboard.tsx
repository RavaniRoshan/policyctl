import { useState } from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { useAuth } from "@/lib/auth";
import { Card, CardTitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/ui/callout";
import {
  Activity, ShieldCheck, Sparkles, FileBarChart, Cpu, Database, GitBranch, Terminal,
} from "lucide-react";
import { api, API_BASE } from "@/lib/api";

const titles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/sessions": "Sessions",
  "/dashboard/policies": "Policies",
  "/dashboard/ai": "AI",
  "/dashboard/reports": "Reports",
  "/dashboard/settings": "Settings",
};

export function DashboardShell() {
  const { pathname } = useLocation();
  const title = titles[pathname] ?? "Overview";
  return (
    <div className="flex min-h-screen bg-n-950">
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

function StatCard({ label, value, tone = "pc" }: { label: string; value: string; tone?: "pc" | "ac" | "danger" }) {
  const color = tone === "danger" ? "text-danger" : tone === "ac" ? "text-ac-300" : "text-pc-300";
  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wider text-n-500">{label}</div>
      <div className={`mt-2 font-display text-3xl font-bold ${color}`}>{value}</div>
    </Card>
  );
}

export function Overview() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Compliance score" value="94%" />
        <StatCard label="Active sessions" value="3" />
        <StatCard label="Violations (24h)" value="2" tone="danger" />
        <StatCard label="AI insights" value="5" tone="ac" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle>Recent enforcement sessions</CardTitle>
          <CardBody>Live agent runs streaming tool calls and blocked violations.</CardBody>
          <div className="mt-4 space-y-2">
            {[
              { id: "sess_8f2a", repo: "platform-api", status: "ACTIVE", blocked: 0 },
              { id: "sess_1c9d", repo: "shared-types", status: "KILLED", blocked: 2 },
              { id: "sess_4b70", repo: "billing-svc", status: "IDLE", blocked: 0 },
            ].map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-md border border-n-800 bg-n-900 px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <StatusPill status={s.status} />
                  <span className="font-mono text-sm text-n-100">{s.id}</span>
                  <span className="text-sm text-n-400">{s.repo}</span>
                </div>
                <span className="font-mono text-xs text-n-500">{s.blocked} blocked</span>
              </div>
            ))}
          </div>
          <Link to="/dashboard/sessions" className="mt-3 inline-block text-sm text-pc-300 hover:underline">View all sessions →</Link>
        </Card>

        <Card>
          <CardTitle className="flex items-center gap-2"><Sparkles className="size-4 text-ac-300" /> AI insight</CardTitle>
          <CardBody>Today's semantic analysis flagged a pattern worth a rule.</CardBody>
          <div className="mt-3 rounded-md border border-n-800 bg-n-1000 p-3 text-sm text-n-200">
            "Migrations edited by hand in <code className="font-mono">db/migrations</code> 3× this week — consider a <code className="font-mono">migrations-via-generator</code> rule."
          </div>
          <Link to="/dashboard/ai" className="mt-3 inline-block text-sm text-pc-300 hover:underline">Open AI →</Link>
        </Card>
      </div>

      <Callout type="tip" title="Deterministic by default">
        Hook-time and CI-time share the same engine. A rule that blocks in Claude blocks in Codex and in your pipeline.
      </Callout>
    </div>
  );
}

export function Sessions() {
  const [open, setOpen] = useState<string | null>("sess_1c9d");
  const rows = [
    { id: "sess_8f2a", repo: "platform-api", status: "ACTIVE", blocked: 0, calls: ["Edit src/auth.ts", "Bash pnpm test"] },
    { id: "sess_1c9d", repo: "shared-types", status: "KILLED", blocked: 2, calls: ["Edit README.md ❌ protected", "Write db/migrations/0005.sql ❌ no generator sig", "Bash git commit"] },
    { id: "sess_4b70", repo: "billing-svc", status: "IDLE", blocked: 0, calls: ["Read package.json"] },
  ];
  return (
    <div className="space-y-3">
      {rows.map((s) => (
        <Card key={s.id} className="cursor-pointer" onClick={() => setOpen(open === s.id ? null : s.id)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StatusPill status={s.status} />
              <span className="font-mono text-sm text-n-100">{s.id}</span>
              <span className="text-sm text-n-400">{s.repo}</span>
            </div>
            <span className="font-mono text-xs text-n-500">{s.blocked} blocked</span>
          </div>
          {open === s.id && (
            <div className="mt-3 space-y-1 border-t border-n-800 pt-3">
              {s.calls.map((c, i) => (
                <div key={i} className="font-mono text-xs text-n-300">
                  <span className="text-n-600">$ </span>
                  {c}
                </div>
              ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

export function Policies() {
  const rows = [
    { name: "migrations-via-generator", level: "block", scope: "both", tag: "required" },
    { name: "no-protected-edits", level: "block", scope: "hook", tag: "required" },
    { name: "no-secrets-in-commits", level: "fail", scope: "ci", tag: "required" },
    { name: "tests-for-source", level: "warn", scope: "ci", tag: "optional" },
  ];
  return (
    <Card className="p-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-n-800 text-left text-n-500 font-mono text-xs uppercase">
            <th className="p-4">Property</th>
            <th className="p-4">Level</th>
            <th className="p-4">Scope</th>
            <th className="p-4">Tag</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-b border-n-800/60">
              <td className="p-4 font-mono text-n-100">{r.name}</td>
              <td className="p-4"><Badge tone={r.level === "block" ? "danger" : r.level === "fail" ? "ac" : "muted"}>{r.level}</Badge></td>
              <td className="p-4 text-n-300">{r.scope}</td>
              <td className="p-4"><Badge tone={r.tag === "required" ? "pc" : "muted"}>{r.tag}</Badge></td>
            </tr>
          ))}
        </tbody>
      </table>
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
      const r = await fetch(`${API_BASE}/api/ai/${mode}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: prompt }),
      });
      const data = await r.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (e: any) {
      setErr(e?.message || "AI request failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardTitle className="flex items-center gap-2"><Sparkles className="size-4 text-ac-300" /> Rule author</CardTitle>
        <CardBody>Describe a rule in plain English; get a typed policy back.</CardBody>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Block any commit that touches migrations/ unless it was generated by the CLI"
          className="mt-3 h-28 w-full rounded-md border border-n-700 bg-n-1000 p-3 text-sm text-n-100 outline-none focus-visible:border-pc-400"
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
        <CardTitle className="flex items-center gap-2"><FileBarChart className="size-4 text-pc-300" /> Latest report</CardTitle>
        <CardBody>No report yet — the first run happens at 09:00 UTC after you link a repo.</CardBody>
        <div className="mt-3 font-mono text-xs text-n-500">subject: policyctl compliance · 2026-08-29 · 3 repos · 2 violations</div>
      </Card>
    </div>
  );
}

export function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="max-w-2xl space-y-4">
      <Card>
        <CardTitle>Account</CardTitle>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-n-400">Email</span><span className="font-mono text-n-100">{user?.email}</span></div>
          <div className="flex justify-between"><span className="text-n-400">Provider</span><span className="font-mono text-n-100">{user?.provider}</span></div>
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

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { cls: string; dot: string }> = {
    ACTIVE: { cls: "bg-pc-500/15 text-pc-300 border-pc-700/50", dot: "bg-pc-400" },
    IDLE: { cls: "bg-n-800 text-n-300 border-n-700", dot: "bg-n-400" },
    KILLED: { cls: "bg-danger/15 text-danger border-danger/40", dot: "bg-danger" },
  };
  const m = map[status] ?? map.IDLE;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-0.5 font-mono text-xs ${m.cls}`}>
      <span className={`size-1.5 rounded-full ${m.dot}`} />
      {status}
    </span>
  );
}
