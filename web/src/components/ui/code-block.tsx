import { useState } from "react";
import { Check, Copy } from "@phosphor-icons/react";
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
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={cn("pcl-codeblock", className)}>
      <div className="pcl-codeblock__bar">
        <span className="pcl-codeblock__dot" />
        <span className="pcl-codeblock__dot" />
        <span className="pcl-codeblock__dot" />
        <span className="pcl-codeblock__title">{title ?? lang ?? "code"}</span>
        <button
          onClick={copy}
          className="ml-auto text-mono-x-small text-black-alpha-32 hover:text-heat-100 transition-colors flex items-center gap-1"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="size-3" />
              <span>copied</span>
            </>
          ) : (
            <>
              <Copy className="size-3" />
              <span>copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="pcl-codeblock__body leading-20">
        <code>
          {lines.map((line, i) => (
            <div key={i} className="flex">
              {showLineNumbers && (
                <span className="select-none w-9 shrink-0 text-black-alpha-16 text-mono-x-small pr-8">
                  {(i + 1).toString().padStart(2, "0")}
                </span>
              )}
              <span className="whitespace-pre text-accent-black">{line || " "}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}