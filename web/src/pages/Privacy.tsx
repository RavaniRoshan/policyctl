import { Link } from "react-router-dom";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { Footer } from "@/components/layout/Footer";

export function Privacy() {
  return (
    <div className="min-h-screen bg-background-base text-accent-black">
      <MarketingNav />
      <main id="main-content" className="mx-auto max-w-[1112px] px-16 pt-64 pb-96">
        <p className="pcl-section__badge">Legal</p>
        <h1 className="pcl-section__title mt-12">Privacy policy</h1>
        <p className="pcl-section__subtitle mt-12 max-w-xl">
          Last updated September 2026. Short version: local stays local; cloud stores only
          what you explicitly send.
        </p>

        <div className="mt-48 max-w-2xl space-y-24 text-body-medium text-black-alpha-72 leading-26">
          <section>
            <h2 className="text-label-x-large text-accent-black mb-8">1. Local-first</h2>
            <p>
              Hook evaluation and CI gates run entirely on your machines. The CLI emits zero
              telemetry and transmits no code over the network.
            </p>
          </section>

          <section>
            <h2 className="text-label-x-large text-accent-black mb-8">2. What the cloud stores</h2>
            <ul className="list-disc pl-20 space-y-8">
              <li>Account identity from Auth0 (email, name) when you sign up.</li>
              <li>Policies you push, and violation outcomes you stream via report.</li>
              <li>Waitlist emails and names you submit on the pricing page.</li>
              <li>Organization membership, seats, and (once billing launches) subscription state.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-label-x-large text-accent-black mb-8">3. What we never collect</h2>
            <p>
              Source files, diffs beyond what your own violation messages contain, credentials,
              or browsing behavior. There is no advertising, no tracking pixel, and no sale of
              personal data.
            </p>
          </section>

          <section>
            <h2 className="text-label-x-large text-accent-black mb-8">4. Subprocessors</h2>
            <p>
              Infrastructure runs on Cloudflare (hosting, database); authentication on Auth0;
              payments (when premium launches) on Stripe. Each processes data under its own
              policy to operate the service.
            </p>
          </section>

          <section>
            <h2 className="text-label-x-large text-accent-black mb-8">5. Deletion</h2>
            <p>
              Delete your organization from{" "}
              <Link to="/dashboard/settings" className="text-heat-ink hover:underline">
                dashboard settings
              </Link>{" "}
              to remove its policies, violations, and subscription data. For anything else,
              including waitlist removal,{" "}
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
