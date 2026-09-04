import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sparkle, Copy, Check, Lock, ArrowRight } from "@phosphor-icons/react";
import { useAiAuthor, useAiAnalyze, useBilling } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/ui/callout";
import { Textarea } from "@/components/ui/input";
import { CurvyRect, PillTabs } from "@policyctl/design-system";
import { MonoAnnotation } from "@/components/shared/EmptyState";

const HISTORY_KEY = "policyctl-ai-history";

interface HistoryItem {
  id: string;
  prompt: string;
  output: string;
  mode: "author" | "analyze";
  at: string;
}

export function Ai() {
  const [mode, setMode] = useState<"author" | "analyze">("author");
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: billing } = useBilling();
  const authorMut = useAiAuthor();
  const analyzeMut = useAiAnalyze();

  const isPaid = billing?.is_paid ?? false;

  const submit = async () => {
    if (!prompt) return;
    try {
      if (mode === "author") {
        const res = await authorMut.mutateAsync(prompt);
        const text = res.rule ?? JSON.stringify(res, null, 2);
        setOutput(text);
        saveHistory(prompt, text, mode);
      } else {
        const res = await analyzeMut.mutateAsync({ diff: prompt });
        const text = res.summary ?? JSON.stringify(res, null, 2);
        setOutput(text);
        saveHistory(prompt, text, mode);
      }
      setError(null);
    } catch (e: any) {
      // Surface a real error message via the Callout — not as raw YAML text.
      const msg = e?.message?.includes("429")
        ? "Rate limited. Please wait a moment and try again."
        : e?.message || "AI request failed. Please try again.";
      setError(msg);
      setOutput("");
    }
  };

  const copyOut = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-24">
      <div className="flex items-center justify-between -mt-1">
        <MonoAnnotation>[ ai / {mode === "author" ? "rule-author" : "analyzer"} ]</MonoAnnotation>
        {!isPaid && (
          <Badge tone="accent">
            <Lock className="size-3 mr-4" />
            Paid feature
          </Badge>
        )}
        <PillTabs
          active={mode}
          onChange={(id) => setMode(id as "author" | "analyze")}
          tabs={[
            { id: "author", label: "Author" },
            { id: "analyze", label: "Analyze" },
          ]}
        />
      </div>

      {!isPaid ? (
        <Card className="p-32 lg:p-64">
          <CurvyRect sides="allSides" />
          <div className="text-center">
            <div className="inline-flex size-48 items-center justify-center text-heat-100 mb-16">
              <Lock className="size-8" />
            </div>
            <h3 className="text-title-h4 text-accent-black mb-16">
              AI rule author &amp; analyzer
            </h3>
            <p className="text-body-medium text-black-alpha-64 leading-26 max-w-md mx-auto mb-24">
              Generate policy rules from plain-English intent and analyze git diffs for violations.
              This feature is part of the upcoming premium control plane.
            </p>
            <div className="flex items-center justify-center gap-12">
              <Link
                to="/pricing"
                className="inline-flex items-center gap-4 px-16 py-8 rounded-full bg-heat-100 text-accent-white text-label-medium font-medium hover:bg-heat-90 transition-colors"
              >
                Join the waitlist
                <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>
        </Card>
      ) : (
      <div className="grid lg:grid-cols-2 gap-16 -mt-1">
        <Card className="p-24 lg:p-32">
          <CurvyRect sides="allSides" />
          <div className="flex items-center gap-8 mb-16">
            <Sparkle className="size-4 text-heat-100" />
            <h3 className="text-label-x-large text-accent-black">Prompt</h3>
          </div>
          <p className="text-body-medium text-black-alpha-64 mb-16">
            {mode === "author"
              ? "Describe a rule in plain English. Get a typed policy."
              : "Paste a git diff here for analysis. Optionally include your policy and repo name."}
          </p>
          <Textarea
            rows={8}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              mode === "author"
                ? "e.g. Block any commit that touches db/migrations/ unless it was generated by the CLI"
                : "e.g. paste a git diff here for analysis"
            }
          />
          <div className="mt-16 flex items-center gap-8">
            <Button onClick={submit} disabled={(authorMut.isPending || analyzeMut.isPending) || !prompt}>
              {authorMut.isPending || analyzeMut.isPending ? "Generating…" : mode === "author" ? "Author rule" : "Analyze"}
            </Button>
            <Button variant="tertiary" onClick={() => { setPrompt(""); setOutput(""); }}>
              Clear
            </Button>
          </div>
        </Card>

        <Card className="p-24 lg:p-32">
          <CurvyRect sides="allSides" />
          <div className="flex items-center justify-between mb-16">
            <h3 className="text-label-x-large text-accent-black">Output</h3>
            {output && (
              <Button variant="tertiary" size="sm" onClick={copyOut}>
                {copied ? <Check className="size-3 mr-4" /> : <Copy className="size-3 mr-4" />}
                {copied ? "copied" : "copy"}
              </Button>
            )}
          </div>
          {error && (
            <div className="mt-12">
              <Callout type="danger" title="AI request failed">
                {error}
              </Callout>
            </div>
          )}
          {output ? (
            <CodeBlock
              code={output}
              lang={mode === "author" ? "yaml" : "text"}
              title="output"
              showLineNumbers={mode === "author"}
            />
          ) : !error ? (
            <div className="p-16 text-mono-medium text-black-alpha-32 leading-22 text-center">
              Describe a rule or paste a policy to begin. Output will appear here.
            </div>
          ) : null}
        </Card>
      </div>
      )}

      {isPaid && <History />}
    </div>
  );
}

function History() {
  const [items, setItems] = useState<HistoryItem[]>(loadHistory);

  useEffect(() => {
    const reload = () => setItems(loadHistory());
    window.addEventListener("policyctl:ai-history", reload);
    return () => window.removeEventListener("policyctl:ai-history", reload);
  }, []);

  const clear = () => {
    localStorage.removeItem(HISTORY_KEY);
    setItems([]);
  };

  if (items.length === 0) return null;

  return (
    <Card className="p-24 lg:p-32">
      <CurvyRect sides="allSides" />
      <div className="flex items-center justify-between mb-16">
        <h3 className="text-label-x-large text-accent-black">History</h3>
        <Button variant="tertiary" size="sm" onClick={clear}>
          Clear
        </Button>
      </div>
      <ul className="space-y-8 -mt-1">
        {items.slice(0, 10).map((h) => (
          <li
            key={h.id}
            className="flex items-start gap-12 px-12 py-12 -mt-1 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-border-faint"
          >
            <span className="font-mono text-mono-x-small text-black-alpha-32 shrink-0 pt-2">
              [{h.mode}]
            </span>
            <span className="text-body-medium text-accent-black line-clamp-2 flex-1">
              {h.prompt}
            </span>
            <span className="font-mono text-mono-x-small text-black-alpha-32 shrink-0">
              {h.at}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function loadHistory(): HistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveHistory(prompt: string, output: string, mode: "author" | "analyze") {
  try {
    const items: HistoryItem[] = loadHistory();
    items.unshift({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      prompt,
      output,
      mode,
      at: new Date().toISOString().slice(11, 16),
    });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 50)));
    window.dispatchEvent(new Event("policyctl:ai-history"));
  } catch {}
}