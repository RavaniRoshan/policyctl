"use client";

import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Copy,
  Check,
  GoogleLogo,
  WarningCircle,
} from "@phosphor-icons/react";
import { PolicyctlMark } from "@/components/brand/PolicyctlMark";
import { Callout } from "@/components/ui/callout";
import { Button } from "@/components/ui/button";

// Only the email is collected here — and only to pre-fill Universal Login
// via `login_hint`. Credentials are never handled by this page; Auth0 owns them.
interface FormData {
  email: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMPTY_TOUCHED: Record<keyof FormData, boolean> = {
  email: false,
};

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithRedirect, isLoading, error, isAuthenticated, logout } = useAuth0();
  const [mode, setMode] = useState<"signup" | "login">(
    location.pathname === "/login" ? "login" : "signup",
  );
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState<FormData>({ email: "" });
  const [touched, setTouched] = useState<Record<keyof FormData, boolean>>(EMPTY_TOUCHED);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Keep the form mode aligned with the route and never carry validation state
  // into the other account journey.
  useEffect(() => {
    setMode(location.pathname === "/login" ? "login" : "signup");
    setTouched(EMPTY_TOUCHED);
    setSubmitError(null);
  }, [location.pathname]);

  // Redirect authenticated users to their original destination.
  useEffect(() => {
    if (isAuthenticated) {
      const n = safeNext(sessionStorage.getItem("policyctl.postLoginNext"));
      const plan = sessionStorage.getItem("policyctl.postLoginPlan");
      sessionStorage.removeItem("policyctl.postLoginNext");
      sessionStorage.removeItem("policyctl.postLoginPlan");
      navigate(n ?? (plan ? "/dashboard/billing" : "/dashboard"), { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const REDIRECT_URI = window.location.origin;

  // ?next= / ?plan= arrive here from RequireAuth and landing CTAs. The Auth0
  // round-trip lands on `/` and drops query params, so stash them for post-login.
  const searchParams = new URLSearchParams(location.search);
  const nextParam = searchParams.get("next");
  const planParam = searchParams.get("plan");

  /** Same-origin path only — blocks open redirects like //evil or https:. */
  function safeNext(raw: string | null): string | null {
    if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
    return raw;
  }

  const stashPostLogin = () => {
    const n = safeNext(nextParam);
    if (n) sessionStorage.setItem("policyctl.postLoginNext", n);
    else sessionStorage.removeItem("policyctl.postLoginNext");
    if (planParam) sessionStorage.setItem("policyctl.postLoginPlan", planParam);
    else sessionStorage.removeItem("policyctl.postLoginPlan");
  };

  const errors = {
    email: touched.email && !EMAIL_RE.test(form.email)
      ? "Enter a valid email"
      : undefined,
  };

  const firstInvalidField = (): keyof FormData | null => {
    if (!EMAIL_RE.test(form.email)) return "email";
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const invalidField = firstInvalidField();
    if (invalidField) {
      setTouched((current) => ({ ...current, [invalidField]: true }));
      document.getElementById(invalidField)?.focus();
      return;
    }
    if (isLoading) return;
    stashPostLogin();
    loginWithRedirect({
      authorizationParams: {
        redirect_uri: REDIRECT_URI,
        screen_hint: mode === "signup" ? "signup" : "login",
        login_hint: form.email,
      },
    });
  };

  const handleSocialLogin = (provider: string) => {
    if (isLoading) return;
    stashPostLogin();
    loginWithRedirect({
      authorizationParams: {
        redirect_uri: REDIRECT_URI,
        connection: provider,
        screen_hint: mode === "signup" ? "signup" : "login",
      },
    });
  };

  const copyCommand = () => {
    navigator.clipboard.writeText("npm install -g @policyctl/cli").then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => {
        /* ignore — UI never lies about success */
      },
    );
  };

  // Friendly error messages for known Auth0 error codes.
  const friendlyError = error
    ? error.message?.includes("Callback URL")
      ? `Auth0 rejected the callback URL. The app sent: "${REDIRECT_URI}". Make sure this exact URL (without a trailing slash) is in your Auth0 app's Allowed Callback URLs.`
      : error.message?.includes("Service not found")
        ? "Auth0 doesn't recognize the API audience. Create an API in your Auth0 dashboard (Applications > APIs), then set its identifier as VITE_AUTH0_AUDIENCE (web) and AUTH0_AUDIENCE (Worker) — the SPA client ID is not a valid audience."
        : error.message?.includes("access_denied")
        ? "Access was denied. Try signing in with email instead."
        : error.message ?? "Something went wrong. Please try again."
    : submitError;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Auth Card (single desktop page, no scroll) */}
      <div className="flex-1 lg:w-1/2 bg-surface flex flex-col justify-center p-16 sm:p-24 lg:p-48 xl:p-64">
        <div className="w-full max-w-md mx-auto">
          <div className="flex items-center justify-between gap-16 mb-24 lg:mb-32">
            <Link
              to="/"
              className="flex items-center gap-8 text-accent-black no-underline group"
              aria-label="policyctl home"
            >
              <span className="inline-flex size-32 shrink-0 items-center justify-center text-heat-100 group-hover:scale-105 transition-transform duration-200">
                <PolicyctlMark size={28} />
              </span>
              <span className="text-label-large font-medium tracking-tight text-accent-black">
                policyctl
              </span>
            </Link>
            <Link
              to={`${mode === "signup" ? "/login" : "/signup"}${location.search}`}
              className="inline-flex min-h-44 items-center px-8 -mr-8 text-body-small text-black-alpha-56 hover:text-accent-black transition-colors"
            >
              <span>{mode === "signup" ? "Already have an account?" : "Don't have an account?"}</span>
              <span className="ml-4 text-heat-100 font-medium">
                {mode === "signup" ? "Sign in" : "Sign up"}
              </span>
            </Link>
          </div>

          <h1 className="text-title-h3 text-accent-black tracking-tight">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-8 text-body-medium text-black-alpha-72">
            {mode === "signup"
              ? "Define guardrails, enforce policies across systems."
              : "Sign in to manage your policies."}
          </p>

          {friendlyError && (
            <div className="mt-4">
              <Callout type="danger" title="Sign in failed">
                {friendlyError}
              </Callout>
            </div>
          )}

          <div className="mt-24 space-y-8">
            <button
              type="button"
              onClick={() => handleSocialLogin("google-oauth2")}
              disabled={isLoading}
              className="flex w-full h-44 items-center justify-center gap-8 rounded-md border border-border-faint bg-surface text-label-medium text-accent-black transition-all duration-200 hover:bg-black-alpha-4 hover:border-border-muted active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? (
                <span className="size-20 border-2 border-border-faint border-t-heat-100 rounded-full animate-spin" />
              ) : (
                <GoogleLogo className="size-20" weight="bold" />
              )}
              {mode === "signup" ? "Sign up with Google" : "Sign in with Google"}
            </button>
          </div>

          <div className="flex items-center gap-12 my-20">
            <div className="flex-1 h-px bg-border-faint" />
            <span className="text-mono-x-small text-black-alpha-32 uppercase">or</span>
            <div className="flex-1 h-px bg-border-faint" />
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-16">
            <div>
              <label htmlFor="email" className="text-label-small text-accent-black block mb-6">
                Work Email
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                placeholder="name@company.com"
                required
                aria-invalid={errors.email ? "true" : undefined}
                aria-describedby={errors.email ? "email-error" : undefined}
                className="w-full h-44 rounded-md border border-border-faint bg-surface px-12 text-body-medium text-accent-black placeholder:text-black-alpha-48 outline-none transition-all duration-200 focus:border-heat-100 focus:ring-2 focus:ring-heat-100/20"
              />
              {errors.email && (
                <p id="email-error" role="alert" className="mt-4 text-mono-small text-danger flex items-center gap-4">
                  <WarningCircle className="size-16" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <p className="text-mono-small text-black-alpha-48 leading-20">
                Continue with your work email — you&apos;ll finish signing in on Auth0&apos;s secure page.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-44 mt-8"
              size="lg"
            >
              {isLoading ? (
                <span className="size-20 border-2 border-accent-white/30 border-t-accent-white rounded-full animate-spin" />
              ) : (
                <>{mode === "signup" ? "Get started free" : "Sign in"}</>
              )}
            </Button>
          </form>
        </div>

        <p className="text-mono-x-small text-black-alpha-32 text-center mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>

      {/* Right Panel - dark artistic panel with vibrant gradient */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0a0a0a]">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 20% 30%, rgba(250, 93, 25, 0.4), transparent 60%),
              radial-gradient(ellipse 60% 50% at 80% 70%, rgba(59, 130, 246, 0.3), transparent 60%),
              radial-gradient(ellipse 50% 40% at 50% 50%, rgba(250, 93, 25, 0.15), transparent 50%),
              linear-gradient(135deg, #0a0a0a 0%, #1a0f0a 50%, #0a0a0a 100%)
            `,
          }}
        />

        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 flex flex-col justify-center items-start p-12 xl:p-16 w-full max-w-lg mx-auto">
          <div className="mb-8 relative inline-flex items-center gap-3">
            <PolicyctlMark size={48} className="text-heat-100" />
            <span className="font-mono text-mono-medium uppercase tracking-wider text-body-medium text-white">
              policyctl
            </span>
          </div>

          <h2
            className="relative text-4xl xl:text-5xl font-bold text-white tracking-tight leading-tight mb-6"
            style={{ textShadow: "0 2px 24px rgba(0,0,0,0.8), 0 0 48px rgba(250,93,25,0.2)" }}
          >
            Define once,
            <br />
            Build compliant.
          </h2>

          <p
            className="relative text-lg text-white/90 max-w-md leading-relaxed mb-10"
            style={{ textShadow: "0 1px 12px rgba(0,0,0,0.8)" }}
          >
            One <span className="font-mono text-heat-100">.policyctl.yml</span> enforced
            across Claude Code, Codex, Cursor, and your CI pipeline. No vendor lock-in.
          </p>

          <button
            onClick={copyCommand}
            aria-label="Copy install command"
            className="relative inline-flex items-center gap-3 px-5 py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-colors"
          >
            <code className="text-sm text-white font-mono">
              npm install -g @policyctl/cli
            </code>
            {copied ? (
              <Check className="size-4 text-white" />
            ) : (
              <Copy className="size-4 text-white/80" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
