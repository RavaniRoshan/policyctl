import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ArrowRight, Terminal, SkipForward, WarningCircle } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CodeBlock } from "@/components/ui/code-block";
import { CurvyRect } from "@policyctl/design-system";
import { api } from "@/lib/api";
import { useOrgs } from "@/lib/hooks";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "policyctl-onboarding-complete";

const STEPS = [
  { id: "welcome", label: "Welcome" },
  { id: "org", label: "Workspace" },
  { id: "install", label: "Install" },
  { id: "push", label: "Push" },
];

export function Onboarding() {
  const [step, setStep] = useState(0);
  const [orgName, setOrgName] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { data: orgsData, isLoading: orgsLoading } = useOrgs();
  const existingOrgs = orgsData?.orgs ?? [];

  // Pre-fill the org name with the auto-provisioned org (created by the Worker
  // during Auth0 JWT verification via getOrCreateUserByAuth0Sub).
  useEffect(() => {
    if (existingOrgs.length > 0 && !orgName) {
      setOrgName(existingOrgs[0].name);
    }
  }, [existingOrgs, orgName]);

  const createOrg = useMutation({
    mutationFn: (name: string) => api.createOrg(name),
    onError: (e: any) => setSubmitError(e?.message || "Failed to create workspace."),
  });

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const complete = async () => {
    localStorage.setItem(STORAGE_KEY, "true");
    // The user already has an auto-provisioned org from Auth0 login.
    // Only create a new org if none exist yet.
    if (existingOrgs.length === 0 && orgName) {
      try {
        await createOrg.mutateAsync(orgName);
      } catch {
        // Best-effort — the org may already exist server-side. Continue.
      }
    }
    navigate("/dashboard", { replace: true });
  };

  const skip = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background-base text-accent-black">
      <MarketingNav />
      <div className="pcl-container py-64 lg:py-88">
        <div className="mx-auto max-w-552">
          <Stepper step={step} />

          <div className="mt-40 border border-border-faint rounded-xl bg-surface p-32 lg:p-64 relative">
            <CurvyRect sides="allSides" />
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 12, filter: "blur(2px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -12, filter: "blur(2px)" }}
                transition={{ duration: 0.2 }}
              >
                {step === 0 && <Welcome />}
                {step === 1 && (
                  <OrgStep
                    value={orgName}
                    onChange={setOrgName}
                  />
                )}
                {step === 2 && <InstallStep />}
                {step === 3 && <PushStep />}
              </motion.div>
            </AnimatePresence>

            <div className="mt-40 flex items-center justify-between -mt-1">
              <div className="flex items-center gap-8">
                <Button
                  variant="tertiary"
                  onClick={back}
                  disabled={step === 0}
                >
                  Back
                </Button>
                <Button
                  variant="tertiary"
                  onClick={skip}
                  className="text-black-alpha-56"
                >
                  <SkipForward className="size-3 mr-4" />
                  Skip for now
                </Button>
              </div>
              {step < STEPS.length - 1 ? (
                <Button onClick={next} trailingIcon>
                  Continue
                </Button>
              ) : (
                <Button
                  onClick={complete}
                  trailingIcon
                  disabled={createOrg.isPending || orgsLoading}
                  className="min-w-40"
                >
                  {createOrg.isPending ? "Creating workspace…" : "Open dashboard"}
                </Button>
              )}
            </div>
            {submitError && (
              <div className="mt-12 text-body-small text-danger flex items-center gap-6">
                <WarningCircle className="size-3" />
                {submitError}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-8 -mt-1">
      {STEPS.map((s, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <div key={s.id} className="flex-1 flex items-center gap-8">
            <div
              className={`size-32 rounded-full flex items-center justify-center text-mono-small -mt-1 relative before:absolute before:inset-0 before:rounded-inherit before:border ${
                done
                  ? "bg-heat-100 text-accent-white before:border-heat-100"
                  : active
                    ? "bg-heat-4 text-heat-ink before:border-heat-30"
                    : "bg-black-alpha-4 text-black-alpha-64 before:border-border-faint"
              }`}
            >
              {done ? <Check className="size-4" /> : i + 1}
            </div>
            <div className="flex-1">
              <div className="text-mono-x-small text-black-alpha-32 uppercase">
                [ {String(i + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")} ]
              </div>
              <div className="text-label-medium text-accent-black">{s.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Welcome() {
  return (
    <>
      <div className="text-mono-x-small text-black-alpha-32 uppercase">[ welcome ]</div>
      <h1 className="mt-12 text-title-h3 text-accent-black">
        Make your coding agents <span className="text-heat-100">obey the rules</span>.
      </h1>
      <p className="mt-16 text-body-medium text-black-alpha-64 leading-26">
        policyctl gives you one file every agent and your CI must obey. We'll get you set up
        in 4 quick steps — about a minute.
      </p>
      <ul className="mt-32 space-y-12 text-body-medium text-black-alpha-72">
        <li className="flex gap-8">
          <Check className="size-4 text-heat-100 mt-2 shrink-0" /> Free CLI, MIT licensed
        </li>
        <li className="flex gap-8">
          <Check className="size-4 text-heat-100 mt-2 shrink-0" /> Hooks at tool-call time
        </li>
        <li className="flex gap-8">
          <Check className="size-4 text-heat-100 mt-2 shrink-0" /> Same engine in CI
        </li>
      </ul>
    </>
  );
}

function OrgStep({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <>
      <div className="text-mono-x-small text-black-alpha-32 uppercase">[ workspace ]</div>
      <h1 className="mt-12 text-title-h3 text-accent-black">
        Name your <span className="text-heat-100">workspace</span>
      </h1>
      <p className="mt-16 text-body-medium text-black-alpha-64 leading-26">
        A workspace groups the policies, repos, and members you'll be working with.
      </p>
      <Input
        className="mt-32"
        placeholder="Acme Platform"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="mt-12 text-mono-small text-black-alpha-32">
        You can rename this anytime.
      </p>
    </>
  );
}

function InstallStep() {
  return (
    <>
      <div className="text-mono-x-small text-black-alpha-32 uppercase">[ install ]</div>
      <h1 className="mt-12 text-title-h3 text-accent-black">
        Install the <span className="text-heat-100">CLI</span>
      </h1>
      <p className="mt-16 text-body-medium text-black-alpha-64 leading-26">
        A single static binary. No telemetry. Run it anywhere.
      </p>
      <div className="mt-32">
        <CodeBlock
          code="npm install -g @policyctl/cli"
          lang="bash"
          title="terminal"
        />
      </div>
      <p className="mt-12 text-mono-small text-black-alpha-32">
        Or grab the binary from{" "}
        <a
          href="https://github.com/RavaniRoshan/policyctl/releases"
          target="_blank"
          rel="noreferrer"
          className="text-heat-ink hover:opacity-80"
        >
          GitHub releases
        </a>
        .
      </p>
    </>
  );
}

function PushStep() {
  return (
    <>
      <div className="text-mono-x-small text-black-alpha-32 uppercase">[ push ]</div>
      <h1 className="mt-12 text-title-h3 text-accent-black">
        Initialize and <span className="text-heat-100">push</span> your first policy
      </h1>
      <p className="mt-16 text-body-medium text-black-alpha-64 leading-26">
        From any repo, run init to scaffold a starter policy, then push to register it
        with your workspace.
      </p>
      <div className="mt-32 space-y-16">
        <CodeBlock
          code="policyctl init && policyctl push"
          lang="bash"
          title="terminal"
        />
        <p className="text-mono-small text-black-alpha-32">Starter policy shipped:</p>
        <CodeBlock
          code={`rules:
  - id: protect-readme
    match: { path: README.md }
    enforce: block

  - id: no-secrets
    match: { regex: '(AKIA|ghp_|sk-)' }
    enforce: fail`}
          lang="yaml"
          title=".policyctl.yml"
          showLineNumbers={false}
        />
      </div>
    </>
  );
}