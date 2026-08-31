import { Link } from "react-router-dom";

const COLS: { heading: string; links: { label: string; to?: string; href?: string }[] }[] = [
  {
    heading: "Product",
    links: [
      { label: "Features", to: "/#features" },
      { label: "Pricing", to: "/#pricing" },
      { label: "Documentation", to: "/docs" },
      { label: "GitHub", href: "https://github.com/RavaniRoshan/policyctl" },
    ],
  },
  {
    heading: "Use cases",
    links: [
      { label: "Migrations via generator", to: "/docs" },
      { label: "Secret scanning", to: "/docs" },
      { label: "Protected paths", to: "/docs" },
      { label: "CI gate", to: "/docs" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Getting started", to: "/docs" },
      { label: "CLI reference", to: "/docs" },
      { label: "Examples", to: "/docs" },
      { label: "Changelog", href: "https://github.com/RavaniRoshan/policyctl/releases" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms of service", to: "/docs" },
      { label: "Privacy policy", to: "/docs" },
      { label: "Report abuse", href: "mailto:help@policyctl.dev" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative pt-0">
      <div className="pcl-index-strip pl-5 lg:pl-10">
        <div className="pcl-index-strip__cell">
          <span className="pcl-index-strip__label">FOOTER</span>
        </div>
        <div className="pcl-index-strip__cell" />
      </div>

      <div className="pcl-container py-32 lg:py-56">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-32 lg:gap-64">
          <div className="px-16 lg:px-32">
            <div className="flex items-center gap-2 mb-16">
              <span className="font-mono text-mono-medium uppercase tracking-wider">
                policyctl
              </span>
            </div>
            <p className="text-label-x-large text-accent-black max-w-sm">
              Make your coding agents <span className="text-heat-100">obey the rules</span>.
            </p>
            <p className="text-body-medium text-black-alpha-64 mt-8 max-w-sm">
              The easiest way to keep Claude, Codex, and Cursor inside the lines you draw.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-16 px-16 lg:px-32">
            {COLS.map((col) => (
              <div key={col.heading}>
                <div className="text-label-medium text-accent-black py-12 px-16 lg:p-16 lg:px-20 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-border-faint">
                  {col.heading}
                </div>
                <ul className="space-y-4">
                  {col.links.map((l) => (
                    <li key={l.label} className="-mt-1 relative">
                      <LinkOrAnchor
                        to={l.to}
                        href={l.href}
                        className="text-label-small text-black-alpha-72 hover:text-heat-100 transition-colors duration-200 block py-8 px-16 lg:px-20 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-border-faint"
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
          <div className="text-mono-x-small text-black-alpha-32 font-mono px-16 lg:px-20 py-12 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-border-faint">
            © {new Date().getFullYear()} policyctl
          </div>
          <div className="text-mono-x-small text-black-alpha-32 font-mono">
            MIT licensed · Built on Cloudflare
          </div>
        </div>
      </div>
    </footer>
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