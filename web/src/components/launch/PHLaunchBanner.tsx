import { useEffect, useState } from "react";
import { ArrowSquareOut, X } from "@phosphor-icons/react";

const PH_URL =
  "https://www.producthunt.com/posts/policyctl?utm_source=site&utm_campaign=ph-launch";
const EXPIRY = "2026-09-20T00:00:00Z";

function isLaunchWindow() {
  return Date.now() < Date.parse(EXPIRY);
}

export function PHLaunchBanner() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem("ph-launch-dismissed") === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  if (!isLaunchWindow() || dismissed) return null;

  return (
    <aside
      role="region"
      aria-label="Product Hunt launch"
      className="relative z-50 border-b border-border-faint bg-heat-4 text-accent-black"
    >
      <div className="pcl-container flex min-h-44 items-center justify-center gap-12 px-48 py-8 text-mono-small">
        <span className="font-medium">
          We&rsquo;re live on Product Hunt — support an indie, open-source launch.
        </span>
        <a
          href={PH_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-32 shrink-0 items-center gap-6 rounded-md border border-heat-100 bg-surface px-12 font-medium text-heat-100 transition-colors duration-200 hover:bg-heat-100 hover:text-accent-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-heat-100"
        >
          Upvote on Product Hunt
          <ArrowSquareOut className="size-3.5" aria-hidden />
        </a>
        <button
          type="button"
          aria-label="Dismiss launch banner"
          onClick={() => {
            try {
              localStorage.setItem("ph-launch-dismissed", "1");
            } catch {
              /* ignore */
            }
            setDismissed(true);
          }}
          className="absolute right-16 top-1/2 flex size-32 -translate-y-1/2 items-center justify-center rounded-md text-black-alpha-64 transition-colors duration-200 hover:bg-black-alpha-4 hover:text-accent-black focus-visible:outline-2 focus-visible:outline-heat-100"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    </aside>
  );
}
