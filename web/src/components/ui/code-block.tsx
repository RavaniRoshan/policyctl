import { useState } from "react";
import { Check, Copy, TerminalWindow } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  lang?: string;
  title?: string;
  showLineNumbers?: boolean;
  className?: string;
}

export function CodeBlock({
  code,
  lang,
  title,
  showLineNumbers = true,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const lines = code.replace(/\n$/, "").split("\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // fallback
    }
  };

  return (
    <div className={cn("pcl-codeblock border border-border-faint rounded-xl overflow-hidden bg-background-base", className)}>
      <div className="pcl-codeblock__bar px-16 py-10 bg-surface border-b border-border-faint flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-6">
            <span className="size-10 rounded-full bg-danger/80 border border-danger/40" />
            <span className="size-10 rounded-full bg-warning/80 border border-warning/40" />
            <span className="size-10 rounded-full bg-success/80 border border-success/40" />
          </div>
          <div className="h-14 w-1 bg-border-faint ml-4 mr-2" />
          <div className="flex items-center gap-6 text-mono-x-small font-mono text-black-alpha-64">
            <TerminalWindow className="size-14 text-heat-100" />
            <span className="font-semibold text-accent-black">{title ?? lang ?? "code"}</span>
          </div>
        </div>
        <div className="flex items-center gap-8">
          {lang && (
            <span className="text-mono-x-small font-mono uppercase text-black-alpha-40 px-6 py-2 rounded bg-black-alpha-4 border border-border-faint">
              {lang}
            </span>
          )}
          <button
            onClick={copy}
            className="text-mono-x-small font-mono text-black-alpha-64 hover:text-heat-100 transition-colors flex items-center gap-4 px-8 py-4 rounded hover:bg-black-alpha-4 cursor-pointer"
            aria-label="Copy code"
          >
            {copied ? (
              <>
                <Check className="size-14 text-heat-100" weight="bold" />
                <span className="text-heat-ink font-medium">copied</span>
              </>
            ) : (
              <>
                <Copy className="size-14" />
                <span>copy</span>
              </>
            )}
          </button>
        </div>
      </div>
      <pre className="pcl-codeblock__body p-16 font-mono text-mono-small leading-22 text-accent-black overflow-hidden m-0">
        <code>
          {lines.map((line, i) => (
            <div key={i} className="flex items-start hover:bg-black-alpha-4/50 px-4 -mx-4 rounded transition-colors">
              {showLineNumbers && (
                <span className="select-none w-28 shrink-0 text-black-alpha-24 font-mono text-mono-x-small text-right pr-12 mr-12 border-r border-border-faint">
                  {(i + 1).toString().padStart(2, "0")}
                </span>
              )}
              <span className="whitespace-pre-wrap break-words text-accent-black flex-1 font-mono">
                {formatCodeLine(line)}
              </span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}

// Simple deterministic syntax highlighter for YAML and Bash
function formatCodeLine(line: string) {
  if (!line) return " ";

  // Comments
  if (line.trim().startsWith("#")) {
    return <span className="text-black-alpha-40 italic">{line}</span>;
  }

  // YAML keys: `key:` or `- id:`
  const yamlKeyMatch = line.match(/^(\s*-?\s*)([a-zA-Z0-9_-]+)(:)(.*)$/);
  if (yamlKeyMatch) {
    const [, indent, key, colon, rest] = yamlKeyMatch;
    const isEnforce = key === "enforce";
    const isBlock = rest.includes("block") || rest.includes("fail");
    return (
      <>
        <span>{indent}</span>
        <span className="font-semibold text-accent-black">{key}</span>
        <span className="text-black-alpha-40">{colon}</span>
        {isEnforce && isBlock ? (
          <span className="text-heat-100 font-semibold">{rest}</span>
        ) : (
          <span className="text-black-alpha-72">{rest}</span>
        )}
      </>
    );
  }

  // Bash commands starting with `exec` or `policyctl` or flags `--flag`
  if (line.includes("--")) {
    const parts = line.split(/(--[a-zA-Z0-9_-]+)/g);
    return (
      <>
        {parts.map((p, idx) =>
          p.startsWith("--") ? (
            <span key={idx} className="text-heat-ink font-medium">
              {p}
            </span>
          ) : (
            <span key={idx}>{p}</span>
          )
        )}
      </>
    );
  }

  return line;
}