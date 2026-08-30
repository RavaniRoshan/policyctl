import { useState } from "react";
import { CaretDown, CaretRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  lang?: string;
  filename?: string;
  className?: string;
}

export function CodeBlock({ code, lang = "bash", filename, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const lines = code.replace(/\n$/, "").split("\n");

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("group relative overflow-hidden rounded-xl border border-border bg-bg-subtle font-mono text-[0.82rem]", className)}>
      <div className="flex items-center justify-between border-b border-border bg-bg-surface px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-danger/60" />
          <span className="size-2.5 rounded-full bg-warning/60" />
          <span className="size-2.5 rounded-full bg-success/60" />
          <span className="ml-2 text-fg-muted text-xs">{filename ?? lang}</span>
        </div>
        <button onClick={copy} className="text-fg-muted transition-colors duration-400 hover:text-brand" aria-label="Copy">
          {copied ? <CaretDown className="size-4" /> : <CaretRight className="size-4" />}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 leading-relaxed">
        <code>
          {lines.map((line, i) => (
            <div key={i} className="flex">
              <span className="select-none w-8 shrink-0 text-fg-muted">{i + 1}</span>
              <span className="whitespace-pre text-fg-secondary">{line || " "}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
