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
      {/* Left Panel - Auth Card (fits on a single desktop page) */}
      <div className="flex-1 lg:w-1/2 bg-surface flex flex-col p-24 lg:p-32 justify-between min-h-screen">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-8 text-accent-black no-underline group"
            aria-label="policyctl home"
          >
            <span className="inline-flex size-32 items-center justify-center text-heat-100 group-hover:scale-105 transition-transform duration-200">
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

        <div className="flex-1 flex flex-col justify-center max-w-420 mx-auto w-full py-24">
          <h1 className="text-title-h3 text-accent-black tracking-tight">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-6 text-body-medium text-black-alpha-72">
            {mode === "signup"
              ? "Define guardrails, enforce policies across systems."
              : "Sign in to manage your policies."}
          </p>

          {friendlyError && (
            <div className="mt-16">
              <Callout type="danger" title="Sign in failed">
                {friendlyError}
              </Callout>
            </div>
          )}

          <div className="mt-20 space-y-8">
            <button
              type="button"
              onClick={() => handleSocialLogin("github")}
              disabled={isLoading}
              className="flex w-full h-44 items-center justify-center gap-8 rounded-xl border border-border-faint bg-surface text-label-medium text-accent-black transition-all duration-200 hover:bg-black-alpha-4 hover:border-border-muted active:scale-[0.99] disabled:opacity-50"
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
              className="flex w-full h-44 items-center justify-center gap-8 rounded-xl border border-border-faint bg-surface text-label-medium text-accent-black transition-all duration-200 hover:bg-black-alpha-4 hover:border-border-muted active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? (
                <span className="size-4 border-2 border-border-faint border-t-heat-100 rounded-full animate-spin" />
              ) : (
                <GoogleLogo className="size-4" weight="bold" />
              )}
              {mode === "signup" ? "Sign up with Google" : "Sign in with Google"}
            </button>
          </div>

          <div className="flex items-center gap-12 my-16">
            <div className="flex-1 h-px bg-border-faint" />
            <span className="text-mono-x-small text-black-alpha-32 uppercase">or</span>
            <div className="flex-1 h-px bg-border-faint" />
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-12">
            {mode === "signup" && (
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label
                    htmlFor="firstName"
                    className="text-label-small text-accent-black block mb-4"
                  >
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
                    className="w-full h-40 rounded-xl border border-border-faint bg-surface px-12 py-10 text-body-medium text-accent-black placeholder:text-black-alpha-32 outline-none transition-all duration-200 focus:border-heat-100 focus:ring-2 focus:ring-heat-100/20"
                  />
                  {errors.firstName && (
                    <p id="firstName-error" role="alert" className="mt-4 text-mono-small text-danger flex items-center gap-4">
                      <WarningCircle className="size-3" />
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="text-label-small text-accent-black block mb-4"
                  >
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
                    className="w-full h-40 rounded-xl border border-border-faint bg-surface px-12 py-10 text-body-medium text-accent-black placeholder:text-black-alpha-32 outline-none transition-all duration-200 focus:border-heat-100 focus:ring-2 focus:ring-heat-100/20"
                  />
                  {errors.lastName && (
                    <p id="lastName-error" role="alert" className="mt-4 text-mono-small text-danger flex items-center gap-4">
                      <WarningCircle className="size-3" />
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="text-label-small text-accent-black block mb-4">
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
                className="w-full h-40 rounded-xl border border-border-faint bg-surface px-12 py-10 text-body-medium text-accent-black placeholder:text-black-alpha-32 outline-none transition-all duration-200 focus:border-heat-100 focus:ring-2 focus:ring-heat-100/20"
              />
              {errors.email && (
                <p id="email-error" role="alert" className="mt-4 text-mono-small text-danger flex items-center gap-4">
                  <WarningCircle className="size-3" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="text-label-small text-accent-black block mb-4">
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
                  className="w-full h-40 rounded-xl border border-border-faint bg-surface px-12 py-10 pr-44 text-body-medium text-accent-black placeholder:text-black-alpha-32 outline-none transition-all duration-200 focus:border-heat-100 focus:ring-2 focus:ring-heat-100/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-12 top-1/2 -translate-y-1/2 text-black-alpha-48 hover:text-accent-black transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeSlash className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" role="alert" className="mt-4 text-mono-small text-danger flex items-center gap-4">
                  <WarningCircle className="size-3" />
                  {errors.password}
                </p>
              )}
            </div>

            {mode === "signup" && (
              <div>
                <label className="flex items-start gap-8 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={form.terms}
                    onChange={(e) => setForm({ ...form, terms: e.target.checked })}
                    onBlur={() => setTouched((t) => ({ ...t, terms: true }))}
                    aria-invalid={errors.terms ? "true" : undefined}
                    aria-describedby={errors.terms ? "terms-error" : undefined}
                    className="size-4 mt-1 rounded border-border-faint text-heat-100 focus:ring-heat-100"
                  />
                  <span className="text-mono-small text-black-alpha-56 leading-16">
                    I agree to the Terms of Service and Privacy Policy
                  </span>
                </label>
                {errors.terms && (
                  <p id="terms-error" role="alert" className="mt-4 text-mono-small text-danger flex items-center gap-4">
                    <WarningCircle className="size-3" />
                    {errors.terms}
                  </p>
                )}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-44"
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

        <p className="text-mono-x-small text-black-alpha-32 text-center">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>

      {/* Right Panel - always dark, looks great in both themes */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-accent-black border-l border-border-faint">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 20% 30%, rgba(250, 93, 25, 0.35), transparent 60%),
              radial-gradient(ellipse 60% 50% at 80% 70%, rgba(59, 130, 246, 0.25), transparent 60%),
              linear-gradient(135deg, #0a0a0a 0%, #1a0f0a 50%, #0a0a0a 100%)
            `,
          }}
        />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 80% at 30% 50%, rgba(0,0,0,0.55), transparent 70%)",
          }}
        />

        <div className="relative z-10 flex flex-col justify-center items-start p-40 w-full">
          <div className="mb-32 relative inline-flex items-center gap-12">
            <PolicyctlMark size={48} className="text-heat-100" />
            <span className="font-mono text-mono-medium uppercase tracking-wider text-body-medium text-accent-white">
              policyctl
            </span>
          </div>

          <h2
            className="relative text-title-h1 text-accent-white tracking-tight leading-[1.05] mb-24"
            style={{ textShadow: "0 2px 24px rgba(0,0,0,0.5)" }}
          >
            Define once,
            <br />
            Build compliant.
          </h2>

          <p
            className="relative text-body-large text-accent-white max-w-400 leading-26 mb-40"
            style={{ textShadow: "0 1px 12px rgba(0,0,0,0.6)" }}
          >
            One <span className="font-mono text-heat-100">.policyctl.yml</span> enforced
            across Claude Code, Codex, Cursor, and your CI pipeline. No vendor lock-in.
          </p>

          <button
            onClick={copyCommand}
            aria-label="Copy install command"
            className="relative inline-flex items-center gap-12 px-20 py-12 rounded-full bg-white-alpha-12 backdrop-blur-xl border border-white-alpha-24 hover:bg-white-alpha-24 transition-colors"
          >
            <code className="text-mono-small text-accent-white">
              brew install ravaniroshan/tap/policyctl
            </code>
            {copied ? (
              <Check className="size-4 text-accent-white" />
            ) : (
              <Copy className="size-4 text-accent-white/80" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}