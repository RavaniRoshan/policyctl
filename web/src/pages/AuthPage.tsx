"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Eye,
  EyeSlash,
  Copy,
  Check,
  GithubLogo,
  GoogleLogo,
  WarningCircle,
} from "@phosphor-icons/react";
import { PolicyctlMark } from "@/components/brand/PolicyctlMark";
import { Callout } from "@/components/ui/callout";
import { Button } from "@/components/ui/button";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  terms: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthPage() {
  const navigate = useNavigate();
  const { loginWithRedirect, isLoading, error, isAuthenticated, logout } = useAuth0();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    terms: false,
  });
  const [touched, setTouched] = useState<Record<keyof FormData, boolean>>({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    terms: false,
  });
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Redirect authenticated users straight to the dashboard.
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const REDIRECT_URI = `${window.location.origin}/`;

  const errors = {
    firstName: touched.firstName && mode === "signup" && form.firstName.trim().length < 2
      ? "At least 2 characters"
      : undefined,
    lastName: touched.lastName && mode === "signup" && form.lastName.trim().length < 2
      ? "At least 2 characters"
      : undefined,
    email: touched.email && !EMAIL_RE.test(form.email)
      ? "Enter a valid email"
      : undefined,
    password: touched.password && form.password.length < 8
      ? "At least 8 characters"
      : undefined,
    terms: mode === "signup" && touched.terms && !form.terms
      ? "Required to continue"
      : undefined,
  };

  const isFormValid =
    EMAIL_RE.test(form.email) &&
    form.password.length >= 8 &&
    (mode === "login" ||
      (form.firstName.trim().length >= 2 &&
        form.lastName.trim().length >= 2 &&
        form.terms));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ firstName: true, lastName: true, email: true, password: true, terms: true });
    setSubmitError(null);
    if (!isFormValid || isLoading) return;
    loginWithRedirect({
      authorizationParams: {
        redirect_uri: REDIRECT_URI,
        screen_hint: mode === "signup" ? "signup" : "login",
      },
    });
  };

  const handleSocialLogin = (provider: string) => {
    if (isLoading) return;
    loginWithRedirect({
      authorizationParams: {
        redirect_uri: REDIRECT_URI,
        connection: provider,
        screen_hint: mode === "signup" ? "signup" : "login",
      },
    });
  };

  const copyCommand = () => {
    navigator.clipboard.writeText("brew install ravaniroshan/tap/policyctl").then(
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
      ? `Auth0 rejected the callback URL. Add this URL to your Auth0 application's Allowed Callback URLs list: ${REDIRECT_URI}`
      : error.message?.includes("access_denied")
        ? "Access was denied. Try signing in with email instead."
        : error.message ?? "Something went wrong. Please try again."
    : submitError;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Auth Card (single desktop page, no scroll) */}
      <div className="flex-1 lg:w-1/2 bg-surface flex flex-col justify-center p-6 sm:p-8 lg:p-12 xl:p-16">
        <div className="w-full max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6 lg:mb-8">
            <Link
              to="/"
              className="flex items-center gap-2 text-accent-black no-underline group"
              aria-label="policyctl home"
            >
              <span className="inline-flex size-8 items-center justify-center text-heat-100 group-hover:scale-105 transition-transform duration-200">
                <PolicyctlMark size={28} />
              </span>
              <span className="text-label-large font-medium tracking-tight text-accent-black">
                policyctl
              </span>
            </Link>
            <button
              onClick={() => setMode(mode === "signup" ? "login" : "signup")}
              className="text-body-small text-black-alpha-56 hover:text-accent-black transition-colors"
            >
              {mode === "signup" ? "Already have an account?" : "Don't have an account?"}{" "}
              <span className="text-heat-100 font-medium">
                {mode === "signup" ? "Sign in" : "Sign up"}
              </span>
            </button>
          </div>

          <h1 className="text-title-h3 text-accent-black tracking-tight">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-body-medium text-black-alpha-72">
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

          <div className="mt-6 space-y-2">
            <button
              type="button"
              onClick={() => handleSocialLogin("github")}
              disabled={isLoading}
              className="flex w-full h-10 items-center justify-center gap-2 rounded-lg border border-border-faint bg-surface text-label-medium text-accent-black transition-all duration-200 hover:bg-black-alpha-4 hover:border-border-muted active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? (
                <span className="size-4 border-2 border-border-faint border-t-heat-100 rounded-full animate-spin" />
              ) : (
                <GithubLogo className="size-4" weight="bold" />
              )}
              {mode === "signup" ? "Sign up with GitHub" : "Sign in with GitHub"}
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin("google-oauth2")}
              disabled={isLoading}
              className="flex w-full h-10 items-center justify-center gap-2 rounded-lg border border-border-faint bg-surface text-label-medium text-accent-black transition-all duration-200 hover:bg-black-alpha-4 hover:border-border-muted active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? (
                <span className="size-4 border-2 border-border-faint border-t-heat-100 rounded-full animate-spin" />
              ) : (
                <GoogleLogo className="size-4" weight="bold" />
              )}
              {mode === "signup" ? "Sign up with Google" : "Sign in with Google"}
            </button>
          </div>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-border-faint" />
            <span className="text-mono-x-small text-black-alpha-32 uppercase">or</span>
            <div className="flex-1 h-px bg-border-faint" />
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-3">
            {mode === "signup" && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="firstName" className="text-label-small text-accent-black block mb-1">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    onBlur={() => setTouched((t) => ({ ...t, firstName: true }))}
                    placeholder="Ada"
                    aria-invalid={errors.firstName ? "true" : undefined}
                    aria-describedby={errors.firstName ? "firstName-error" : undefined}
                    className="w-full h-9 rounded-lg border border-border-faint bg-surface px-3 py-2 text-body-medium text-accent-black placeholder:text-black-alpha-32 outline-none transition-all duration-200 focus:border-heat-100 focus:ring-2 focus:ring-heat-100/20"
                  />
                  {errors.firstName && (
                    <p id="firstName-error" role="alert" className="mt-1 text-mono-small text-danger flex items-center gap-1">
                      <WarningCircle className="size-3" />
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="lastName" className="text-label-small text-accent-black block mb-1">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    onBlur={() => setTouched((t) => ({ ...t, lastName: true }))}
                    placeholder="Lovelace"
                    aria-invalid={errors.lastName ? "true" : undefined}
                    aria-describedby={errors.lastName ? "lastName-error" : undefined}
                    className="w-full h-9 rounded-lg border border-border-faint bg-surface px-3 py-2 text-body-medium text-accent-black placeholder:text-black-alpha-32 outline-none transition-all duration-200 focus:border-heat-100 focus:ring-2 focus:ring-heat-100/20"
                  />
                  {errors.lastName && (
                    <p id="lastName-error" role="alert" className="mt-1 text-mono-small text-danger flex items-center gap-1">
                      <WarningCircle className="size-3" />
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="text-label-small text-accent-black block mb-1">
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
                className="w-full h-9 rounded-lg border border-border-faint bg-surface px-3 py-2 text-body-medium text-accent-black placeholder:text-black-alpha-32 outline-none transition-all duration-200 focus:border-heat-100 focus:ring-2 focus:ring-heat-100/20"
              />
              {errors.email && (
                <p id="email-error" role="alert" className="mt-1 text-mono-small text-danger flex items-center gap-1">
                  <WarningCircle className="size-3" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="text-label-small text-accent-black block mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  aria-invalid={errors.password ? "true" : undefined}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  className="w-full h-9 rounded-lg border border-border-faint bg-surface px-3 py-2 pr-9 text-body-medium text-accent-black placeholder:text-black-alpha-32 outline-none transition-all duration-200 focus:border-heat-100 focus:ring-2 focus:ring-heat-100/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-black-alpha-48 hover:text-accent-black transition-colors p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeSlash className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" role="alert" className="mt-1 text-mono-small text-danger flex items-center gap-1">
                  <WarningCircle className="size-3" />
                  {errors.password}
                </p>
              )}
            </div>

            {mode === "signup" && (
              <div>
                <label className="flex items-start gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={form.terms}
                    onChange={(e) => setForm({ ...form, terms: e.target.checked })}
                    onBlur={() => setTouched((t) => ({ ...t, terms: true }))}
                    aria-invalid={errors.terms ? "true" : undefined}
                    aria-describedby={errors.terms ? "terms-error" : undefined}
                    className="size-4 mt-0.5 rounded border-border-faint text-heat-100 focus:ring-heat-100"
                  />
                  <span className="text-mono-small text-black-alpha-56 leading-4">
                    I agree to the Terms of Service and Privacy Policy
                  </span>
                </label>
                {errors.terms && (
                  <p id="terms-error" role="alert" className="mt-1 text-mono-small text-danger flex items-center gap-1">
                    <WarningCircle className="size-3" />
                    {errors.terms}
                  </p>
                )}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 mt-2"
              size="lg"
            >
              {isLoading ? (
                <span className="size-4 border-2 border-accent-white/30 border-t-accent-white rounded-full animate-spin" />
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
              brew install ravaniroshan/tap/policyctl
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
