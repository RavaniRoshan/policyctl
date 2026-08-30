import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  lang?: string;
  filename?: string;
  highlight?: number[];
  className?: string;
}

export function CodeBlock({ code, lang = "bash", filename, highlight = [], className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const lines = code.replace(/\n$/, "").split("\n");
  const showNums = lines.length > 5;

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("group relative overflow-hidden rounded-xl border border-border bg-bg-subtle font-mono text-[0.85rem]", className)}>
      <div className="flex items-center justify-between border-b border-border bg-bg-surface px-4 py-2">
        <span className="text-fg-muted text-xs">{filename ?? lang}</span>
        <div className="flex items-center gap-3">
          <span className="text-fg-muted text-xs uppercase tracking-wider">{lang}</span>
          <button onClick={copy} aria-label="Copy code to clipboard" className="inline-flex items-center gap-1 text-fg-muted transition-colors hover:text-brand">
            {copied ? <Check className="size-3.5 text-brand" /> : <Copy className="size-3.5" />}
            <span className="text-xs">{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>
      <pre className="overflow-x-auto p-4 leading-relaxed" aria-live="polite">
        <code>
          {lines.map((line, i) => {
            const n = i + 1;
            const isDiff = /^[+-]/.test(line);
            const diffCls = line.startsWith("+") ? "text-success" : line.startsWith("-") ? "text-danger" : "";
            return (
              <div key={n} className={cn("flex", highlight.includes(n) && "bg-brand/5 -mx-4 px-4", diffCls)}>
                {showNums && <span className="select-none w-8 shrink-0 text-fg-muted">{n}</span>}
                <span className="whitespace-pre text-fg-secondary">{line || " "}</span>
              </div>
            );
          })}
        </code>
      </pre>
    </div>
  );
}
