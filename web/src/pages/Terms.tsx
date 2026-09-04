import { Link } from "react-router-dom";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { Footer } from "@/components/layout/Footer";

export function Terms() {
  return (
    <div className="min-h-screen bg-background-base text-accent-black">
      <MarketingNav />
      <main id="main-content" className="mx-auto max-w-[1112px] px-16 pt-64 pb-96">
        <p className="pcl-section__badge">Legal</p>
        <h1 className="pcl-section__title mt-12">Terms of service</h1>
        <p className="pcl-section__subtitle mt-12 max-w-xl">
          Last updated September 2026. Short version: the CLI is free and MIT-licensed;
          the cloud is in free-launch while premium is in development.
        </p>

        <div className="mt-48 max-w-2xl space-y-24 text-body-medium text-black-alpha-72 leading-26">
          <section>
            <h2 className="text-label-x-large text-accent-black mb-8">1. The free CLI</h2>
            <p>
              The <code className="font-mono text-mono-small">policyctl</code> command-line tool
              is MIT-licensed, runs 100% locally, emits zero telemetry, and works offline.
              You may use, modify, and distribute it under the MIT license included in the
              repository.
            </p>
          </section>

          <section>
            <h2 className="text-label-x-large text-accent-black mb-8">2. The cloud control plane</h2>
            <p>
              Hosted accounts provide shared policy versioning, violation audit feeds, daily
              reports, and AI-assisted authoring. During the free launch, all cloud features
              available to you are free. Premium billing has not started; joining the waitlist
              creates no payment obligation.
            </p>
          </section>

          <section>
            <h2 className="text-label-x-large text-accent-black mb-8">3. Acceptable use</h2>
            <p>
              Don&apos;t abuse the service: no credential stuffing, no scraping other
              organizations&apos; data, no violating other users&apos; policies. We may suspend
              accounts that degrade the service for others.
            </p>
          </section>

          <section>
            <h2 className="text-label-x-large text-accent-black mb-8">4. Your data</h2>
            <p>
              Local evaluation never leaves your machine. Anything you explicitly stream to
              the cloud (policy pushes, violation reports, waitlist signups) is stored to
              operate your account and is never sold. See the{" "}
              <Link to="/privacy" className="text-heat-ink hover:underline">
                privacy policy
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-label-x-large text-accent-black mb-8">5. No warranties</h2>
            <p>
              The service is provided &quot;as is&quot;, without warranty of any kind. Policy
              gates are a safety layer, not a guarantee — review critical changes yourself.
            </p>
          </section>

          <section>
            <h2 className="text-label-x-large text-accent-black mb-8">6. Contact</h2>
            <p>
              Questions about these terms:{" "}
              <a
                href="https://github.com/RavaniRoshan/policyctl/issues"
                target="_blank"
                rel="noreferrer"
                className="text-heat-ink hover:underline"
              >
                open an issue on GitHub
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
