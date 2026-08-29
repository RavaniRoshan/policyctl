import { Link } from "react-router-dom";

const GITHUB = "https://github.com/RavaniRoshan/policyctl";
const NPM = "https://www.npmjs.com/package/@policyctl/cli";
const X = "https://x.com/policyctl";

export function Footer() {
  return (
    <footer className="border-t border-n-800 mt-16">
      <div className="mx-auto max-w-content px-6 py-10 grid gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2 text-n-100">
            <span className="text-pc-400">◆</span>
            <span className="font-display font-semibold text-lg">policyctl</span>
          </div>
          <p className="mt-3 text-n-400 text-sm max-w-xs">
            Provider-agnostic policy runtime for coding agents. One file, every agent, every repo.
          </p>
          <p className="mt-4 text-n-500 text-xs">MIT · © 2026 policyctl</p>
        </div>
        <div>
          <div className="font-mono text-xs uppercase tracking-wider text-n-500 mb-3">Product</div>
          <ul className="space-y-2 text-sm text-n-300">
            <li><a href="/#how" className="hover:text-pc-300">How it works</a></li>
            <li><a href="/#enforce" className="hover:text-pc-300">Enforce</a></li>
            <li><a href="/#pricing" className="hover:text-pc-300">Pricing</a></li>
            <li><Link to="/docs" className="hover:text-pc-300">Docs</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-mono text-xs uppercase tracking-wider text-n-500 mb-3">Resources</div>
          <ul className="space-y-2 text-sm text-n-300">
            <li><Link to="/docs" className="hover:text-pc-300">Documentation</Link></li>
            <li><Link to="/login" className="hover:text-pc-300">Control plane</Link></li>
            <li><a href={GITHUB} target="_blank" rel="noreferrer" className="hover:text-pc-300">GitHub</a></li>
            <li><a href={NPM} target="_blank" rel="noreferrer" className="hover:text-pc-300">npm</a></li>
          </ul>
        </div>
        <div>
          <div className="font-mono text-xs uppercase tracking-wider text-n-500 mb-3">Company</div>
          <ul className="space-y-2 text-sm text-n-300">
            <li><a href={X} target="_blank" rel="noreferrer" className="hover:text-pc-300">X / Twitter</a></li>
            <li><a href="https://news.ycombinator.com/item?id=49466458" target="_blank" rel="noreferrer" className="hover:text-pc-300">Ask HN</a></li>
            <li><span className="text-n-500">Built for staff engineers</span></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
