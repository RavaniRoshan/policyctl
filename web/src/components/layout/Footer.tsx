import { Link } from "react-router-dom";
import { PolicyctlMark } from "@/components/brand/PolicyctlMark";
import { RuixenGradientFooter } from "@/components/ui/ruixen-gradient-footer";

const COLS: { heading: string; links: { label: string; to?: string; href?: string }[] }[] = [
  {
    heading: "Product",
    links: [
      { label: "Features", to: "/#features" },
      { label: "Pricing", to: "/pricing" },
      { label: "Documentation", to: "/docs" },
      { label: "GitHub", href: "https://github.com/RavaniRoshan/policyctl" },
    ],
  },
  {
    heading: "Use Cases",
    links: [
      { label: "Migrations via generator", to: "/docs/tutorials/claude-code-setup/" },
      { label: "Secret scanning", to: "/docs/how-to/intercept-secrets/" },
      { label: "Protected paths", to: "/docs/how-to/protect-critical-files/" },
      { label: "CI hard gate", to: "/docs/tutorials/ci-pipeline-setup/" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Getting started", to: "/docs/tutorials/getting-started/" },
      { label: "CLI reference", to: "/docs/reference/cli-commands/" },
      { label: "Policy schema", to: "/docs/reference/policy-schema/" },
      { label: "Changelog", href: "https://github.com/RavaniRoshan/policyctl/releases" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms of service", to: "/terms" },
      { label: "Privacy policy", to: "/privacy" },
      { label: "Security & Audit", to: "/docs/concepts/security-model/" },
      { label: "Report issue", href: "https://github.com/RavaniRoshan/policyctl/issues" },
    ],
  },
];

export function Footer() {
  return (
    <RuixenGradientFooter gradientHeight="40vh" className="relative pt-0 overflow-clip">
      <div className="pcl-index-strip pl-5 lg:pl-10">
        <div className="pcl-index-strip__cell">
          <span className="pcl-index-strip__label">FOOTER</span>
        </div>
        <div className="pcl-index-strip__cell" />
      </div>

      <div className="pcl-container py-32 lg:py-56 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-32 lg:gap-64">
          <div className="px-16 lg:px-32">
            <div className="flex items-center gap-8 mb-16">
              <span className="text-heat-100">
                <PolicyctlMark size={24} />
              </span>
              <span className="font-mono text-mono-medium uppercase tracking-wider text-accent-black font-semibold">
                policyctl
              </span>
            </div>
            <p className="text-label-x-large text-accent-black max-w-sm">
              Make your coding agents <span className="text-heat-100 font-semibold">obey the rules</span>.
            </p>
            <p className="text-body-medium text-black-alpha-64 mt-8 max-w-sm leading-relaxed">
              The deterministic policy runtime to keep Claude, Codex, and Cursor inside the lines you draw.
            </p>

            <div className="mt-24 flex max-w-xs gap-8">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-16 py-8 rounded-md bg-accent-black text-accent-white font-mono text-mono-x-small uppercase tracking-wider hover:bg-black-alpha-88 transition-colors no-underline"
              >
                Start free trial →
              </Link>
              <Link
                to="/docs"
                className="inline-flex items-center justify-center px-16 py-8 rounded-md bg-surface border border-border-faint text-accent-black font-mono text-mono-x-small uppercase tracking-wider hover:bg-black-alpha-4 transition-colors no-underline"
              >
                Read docs
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-16 px-16 lg:px-32">
            {COLS.map((col) => (
              <div key={col.heading} className="relative">
                <div className="text-label-medium text-accent-black font-medium py-12 px-16 lg:p-16 lg:px-20 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-border-faint">
                  {col.heading}
                </div>
                <ul className="space-y-4 list-none p-0 m-0">
                  {col.links.map((l) => (
                    <li key={l.label} className="-mt-1 relative">
                      <LinkOrAnchor
                        to={l.to}
                        href={l.href}
                        className="text-label-small text-black-alpha-72 hover:text-heat-100 transition-colors duration-200 block py-8 px-16 lg:px-20 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-border-faint no-underline"
                      >
                        {l.label}
                      </LinkOrAnchor>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-32 lg:mt-64 flex flex-col md:flex-row items-start md:items-center justify-between gap-12 px-16 lg:px-32 -mt-1">
          <div className="text-mono-x-small text-black-alpha-56 font-mono px-16 lg:px-20 py-12 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-border-faint bg-surface/50">
            © {new Date().getFullYear()} policyctl · MIT licensed
          </div>
          <div className="flex items-center gap-8 text-mono-x-small text-black-alpha-56 font-mono">
            <span className="size-6 rounded-full bg-heat-100 animate-pulse" />
            <span>Built on Cloudflare Workers & D1</span>
          </div>
        </div>
      </div>
    </RuixenGradientFooter>
  );
}

function LinkOrAnchor({
  to,
  href,
  className,
  children,
}: {
  to?: string;
  href?: string;
  className?: string;
  children: React.ReactNode;
}) {
  if (to) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {children}
    </a>
  );
}