import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GradientWave } from "@/components/ui/gradient-wave";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { Check } from "lucide-react";

const steps = [
  {
    title: "Scaffold your policy",
    body: "Start from a template that encodes procedural rules, not opinions.",
    code: "policyctl init --template full",
  },
  {
    title: "Generate provider hooks",
    body: "Write the exact glue for each agent — no hand-rolled per-model plugin.",
    code: "policyctl gen claude\npolicyctl gen codex\npolicyctl gen cursor",
  },
  {
    title: "Gate the diff",
    body: "Fail CI on violations and stream them to your dashboard feed.",
    code: "policyctl check\npolicyctl check --report",
  },
  {
    title: "Connect the dashboard",
    body: "Link this account so sessions and reports show up here.",
    code: "policyctl login --control-plane",
  },
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
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-40">
        <GradientWave
          colors={["#0D9373", "#F59E0B", "#34d399", "#0a7d62", "#a7f3d0", "#0ea5e9"]}
          darkenTop
          shadowPower={6}
        />
      </div>
      <div className="absolute inset-0 z-[1] bg-n-1000/70" />
      <div className="relative z-10 mx-auto max-w-2xl px-6 py-16">
        <div className="font-mono text-xs uppercase tracking-[0.16em] text-pc-400">Welcome — let's get you set up</div>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">Your first policy in four steps</h1>
        <p className="mt-2 text-n-300">Follow along in a terminal. Mark each step done as you go.</p>

        <ol className="mt-8 space-y-4">
          {steps.map((s, i) => (
            <li
              key={i}
              className={`rounded-lg border p-5 transition-colors ${done[i] ? "border-pc-700/60 bg-pc-500/5" : i === current ? "border-n-700 bg-n-900/80" : "border-n-800 bg-n-900/50"}`}
            >
              <div className="flex items-center gap-3">
                <span className={`flex size-7 items-center justify-center rounded-pill font-mono text-xs ${done[i] ? "bg-pc-500 text-n-950" : "bg-n-800 text-n-300"}`}>
                  {done[i] ? <Check className="size-4" /> : i + 1}
                </span>
                <h3 className="font-display font-semibold">{s.title}</h3>
              </div>
              <p className="mt-2 text-sm text-n-400">{s.body}</p>
              <div className="mt-3">
                <CodeBlock code={s.code} lang="bash" />
              </div>
              {!done[i] && (
                <Button className="mt-3" size="sm" onClick={() => complete(i)}>
                  Mark done
                </Button>
              )}
            </li>
          ))}
        </ol>

        <Button
          size="lg"
          className="mt-8 w-full"
          disabled={!done.every(Boolean)}
          onClick={() => navigate("/dashboard")}
        >
          Go to dashboard
        </Button>
      </div>
    </div>
  );
}
