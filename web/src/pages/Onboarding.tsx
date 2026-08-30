import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { Check } from "@phosphor-icons/react";

const steps = [
  { title: "Scaffold your policy", body: "Start from a template that encodes procedural rules, not opinions.", code: "policyctl init --template full" },
  { title: "Generate provider hooks", body: "Write the exact glue for each agent, no hand-rolled per-model plugin.", code: "policyctl gen claude\npolicyctl gen codex\npolicyctl gen cursor" },
  { title: "Gate the diff", body: "Fail CI on violations and stream them to your dashboard feed.", code: "policyctl check\npolicyctl check --report" },
  { title: "Connect the dashboard", body: "Link this account so sessions and reports show up here.", code: "policyctl login --control-plane" },
];

export function Onboarding() {
  const [done, setDone] = useState<boolean[]>(steps.map(() => false));
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const complete = (i: number) => {
    setDone((d) => d.map((v, idx) => (idx === i ? true : v)));
    if (i < steps.length - 1) setCurrent(i + 1);
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="font-mono text-xs uppercase tracking-[0.16em] text-brand">Welcome</div>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-fg-primary">Your first policy in four steps</h1>
        <p className="mt-2 text-fg-secondary">Follow along in a terminal. Mark each step done as you go.</p>

        <ol className="mt-8 space-y-4">
          {steps.map((s, i) => (
            <li key={i} className={`rounded-xl border p-5 transition-colors ${done[i] ? "border-brand/30 bg-brand/5" : i === current ? "border-border bg-bg-elevated" : "border-border/50 bg-bg-surface"}`}>
              <div className="flex items-center gap-3">
                <span className={`flex size-7 items-center justify-center rounded-pill font-mono text-xs ${done[i] ? "bg-brand text-fg-inverse" : "bg-bg-surface text-fg-secondary border border-border"}`}>
                  {done[i] ? <Check className="size-4" /> : i + 1}
                </span>
                <h3 className="font-display font-semibold text-fg-primary">{s.title}</h3>
              </div>
              <p className="mt-2 text-sm text-fg-secondary">{s.body}</p>
              <div className="mt-3"><CodeBlock code={s.code} lang="bash" /></div>
              {!done[i] && <Button className="mt-3" size="sm" onClick={() => complete(i)}>Mark done</Button>}
            </li>
          ))}
        </ol>

        <Button size="lg" className="mt-8 w-full" disabled={!done.every(Boolean)} onClick={() => navigate("/dashboard")}>Go to dashboard</Button>
      </div>
    </div>
  );
}
