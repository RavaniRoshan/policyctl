import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Check } from "@phosphor-icons/react";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { Footer } from "@/components/layout/Footer";
import { WaitlistForm } from "@/components/ui/waitlist-form";

const CLOUD_FEATURES = [
  "Shared policy versioning + rollback",
  "Violation audit feed + daily reports",
  "AI rule authoring + analyzer",
  "CSV export + live sessions",
  "Waitlist members get early access",
];

const FREE_FEATURES = [
  "Full CLI: hooks, CI gate, 8 matchers",
  "MIT licensed, local-first, zero telemetry",
  "Claude Code · Cursor · Codex support",
];

export function Pricing() {
  const { isAuthenticated } = useAuth0();
  const freeCta = isAuthenticated ? "/dashboard" : "/signup";

  return (
    <div className="min-h-screen bg-background-base text-accent-black">
      <MarketingNav />
      <main id="main-content" className="mx-auto max-w-[1112px] px-16 pt-64 pb-96">
        <p className="pcl-section__badge">Pricing</p>
        <h1 className="pcl-section__title mt-12">Free CLI. Cloud waitlist open.</h1>
        <p className="pcl-section__subtitle mt-12 max-w-xl">
          The CLI is free forever. Cloud adds team sync, audit, and AI — join the
          waitlist, no payment today.
        </p>

        <div className="mt-48 grid gap-16 md:grid-cols-2">
          <section className="pcl-card p-32" aria-label="Free plan">
            <h2 className="text-title-h3">Free</h2>
            <p className="mt-8 text-body-large">
              <span className="font-semibold">$0</span>
              <span className="text-black-alpha-56"> forever</span>
            </p>
            <ul className="mt-24 space-y-12 text-body-medium">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-8">
                  <Check className="size-20 shrink-0 text-heat-100" weight="bold" aria-hidden />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link to={freeCta} className="pcl-btn pcl-btn--secondary mt-32 w-full justify-center">
              Get started free
            </Link>
          </section>

          <section className="pcl-card pcl-card--floating p-32" aria-label="Cloud plan">
            <div className="flex items-center justify-between">
              <h2 className="text-title-h3">Cloud</h2>
              <span className="pcl-badge pcl-badge--heat">Waitlist open</span>
            </div>
            <p className="mt-8 text-body-large">
              <span className="font-semibold">Waitlist</span>
              <span className="text-black-alpha-56"> / early access</span>
            </p>
            <p className="text-body-small text-black-alpha-56">Pricing at launch — no charge today</p>
            <ul className="mt-24 space-y-12 text-body-medium">
              {CLOUD_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-8">
                  <Check className="size-20 shrink-0 text-heat-100" weight="bold" aria-hidden />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-32">
              <WaitlistForm source="pricing" compact />
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
