"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Eye, EyeSlash, Copy, Check, GithubLogo, GoogleLogo } from "@phosphor-icons/react";
import { PolicyctlMark } from "@/components/brand/PolicyctlMark";

export function AuthPage() {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    marketing: false,
    terms: false,
  });

  const { loginWithRedirect, isLoading, error, isAuthenticated, user, logout } = useAuth0();

  const REDIRECT_URI = `${window.location.origin}/`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginWithRedirect({
      authorizationParams: {
        redirect_uri: REDIRECT_URI,
        screen_hint: mode === "signup" ? "signup" : "login",
      },
    });
  };

  const handleSocialLogin = (provider: string) => {
    loginWithRedirect({
      authorizationParams: {
        redirect_uri: REDIRECT_URI,
        connection: provider,
        screen_hint: mode === "signup" ? "signup" : "login",
      },
    });
  };

  const copyCommand = () => {
    navigator.clipboard.writeText("brew install ravaniroshan/tap/policyctl");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-base p-16">
        <div className="text-center">
          <h1 className="text-title-h3 text-accent-black">Welcome, {user?.name || user?.email}</h1>
          <p className="mt-8 text-body-medium text-black-alpha-64">You're signed in to policyctl.</p>
          <button
            onClick={() => logout({ logoutParams: { returnTo: `${window.location.origin}/` } })}
            className="mt-24 pcl-btn pcl-btn--secondary"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Auth Card (fits on a single desktop page) */}
      <div className="flex-1 lg:w-1/2 bg-surface flex flex-col p-24 lg:p-32 justify-between min-h-screen">
        {/* Top: brand mark + mode switch */}
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-8 text-accent-black no-underline group" aria-label="policyctl home">
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

        {/* Form (centered, no scroll) */}
        <div className="flex-1 flex flex-col justify-center max-w-420 mx-auto w-full py-24">
          {/* Header */}
          <h1 className="text-title-h3 text-accent-black tracking-tight">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-6 text-body-medium text-black-alpha-72">
            {mode === "signup"
              ? "Define guardrails, enforce policies across systems."
              : "Sign in to manage your policies."}
          </p>

          {/* SSO Buttons */}
          <div className="mt-20 space-y-8">
            <button
              onClick={() => handleSocialLogin("github")}
              className="flex w-full h-40 items-center justify-center gap-8 rounded-xl border border-border-faint bg-surface text-label-medium text-accent-black transition-all duration-200 hover:bg-black-alpha-4 hover:border-border-muted active:scale-[0.99]"
            >
              <GithubLogo className="size-4" weight="bold" />
              {mode === "signup" ? "Sign up with GitHub" : "Sign in with GitHub"}
            </button>
            <button
              onClick={() => handleSocialLogin("google-oauth2")}
              className="flex w-full h-40 items-center justify-center gap-8 rounded-xl border border-border-faint bg-surface text-label-medium text-accent-black transition-all duration-200 hover:bg-black-alpha-4 hover:border-border-muted active:scale-[0.99]"
            >
              <GoogleLogo className="size-4" weight="bold" />
              {mode === "signup" ? "Sign up with Google" : "Sign in with Google"}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-12 my-16">
            <div className="flex-1 h-px bg-border-faint" />
            <span className="text-mono-x-small text-black-alpha-32 uppercase">or</span>
            <div className="flex-1 h-px bg-border-faint" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-12">
            {mode === "signup" && (
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-label-small text-accent-black block mb-4">First Name</label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    placeholder="Ada"
                    className="w-full h-40 rounded-xl border border-border-faint bg-surface px-12 py-10 text-body-medium text-accent-black placeholder:text-black-alpha-32 outline-none transition-all duration-200 focus:border-heat-100 focus:ring-2 focus:ring-heat-100/20"
                  />
                </div>
                <div>
                  <label className="text-label-small text-accent-black block mb-4">Last Name</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    placeholder="Lovelace"
                    className="w-full h-40 rounded-xl border border-border-faint bg-surface px-12 py-10 text-body-medium text-accent-black placeholder:text-black-alpha-32 outline-none transition-all duration-200 focus:border-heat-100 focus:ring-2 focus:ring-heat-100/20"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-label-small text-accent-black block mb-4">Work Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="name@company.com"
                className="w-full h-40 rounded-xl border border-border-faint bg-surface px-12 py-10 text-body-medium text-accent-black placeholder:text-black-alpha-32 outline-none transition-all duration-200 focus:border-heat-100 focus:ring-2 focus:ring-heat-100/20"
              />
            </div>

            <div>
              <label className="text-label-small text-accent-black block mb-4">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full h-40 rounded-xl border border-border-faint bg-surface px-12 py-10 pr-44 text-body-medium text-accent-black placeholder:text-black-alpha-32 outline-none transition-all duration-200 focus:border-heat-100 focus:ring-2 focus:ring-heat-100/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-12 top-1/2 -translate-y-1/2 text-black-alpha-48 hover:text-accent-black transition-colors"
                >
                  {showPassword ? <EyeSlash className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <label className="flex items-start gap-8 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={form.terms}
                  onChange={(e) => setForm({ ...form, terms: e.target.checked })}
                  className="size-4 mt-1 rounded border-border-faint text-heat-100 focus:ring-heat-100"
                />
                <span className="text-mono-x-small text-black-alpha-56 leading-16">
                  I agree to the Terms of Service and Privacy Policy
                </span>
              </label>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-44 rounded-xl bg-accent-black text-accent-white text-label-medium font-medium transition-all duration-200 hover:bg-black-alpha-88 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-8"
            >
              {isLoading ? (
                <span className="size-4 border-2 border-accent-white/30 border-t-accent-white rounded-full animate-spin" />
              ) : (
                <>{mode === "signup" ? "Get started free" : "Sign in"}</>
              )}
            </button>
          </form>
        </div>

        {/* Bottom: legal */}
        <p className="text-mono-x-small text-black-alpha-32 text-center">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>

      {/* Right Panel - Hero / Brand with gradient */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-accent-black">
        {/* Multi-layer gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 20% 30%, rgba(250, 93, 25, 0.35), transparent 60%),
              radial-gradient(ellipse 60% 50% at 80% 70%, rgba(59, 130, 246, 0.25), transparent 60%),
              radial-gradient(ellipse 50% 40% at 50% 100%, rgba(168, 85, 247, 0.20), transparent 60%),
              linear-gradient(135deg, #0a0a0a 0%, #1a0f0a 50%, #0a0a0a 100%)
            `,
          }}
        />

        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />

        {/* Content (centered, fits on a single page) */}
        <div className="relative z-10 flex flex-col justify-center items-start p-40 w-full">
          {/* Floating logo mark */}
          <div className="mb-32 inline-flex items-center gap-12 text-accent-white/90">
            <PolicyctlMark size={48} className="text-heat-100" />
            <span className="font-mono text-mono-medium uppercase tracking-wider text-body-medium">
              policyctl
            </span>
          </div>

          <h2 className="text-title-h1 text-accent-white tracking-tight leading-[1.05] mb-24">
            Define once,<br />Build compliant.
          </h2>

          <p className="text-body-large text-accent-white/72 max-w-400 leading-26 mb-40">
            One <span className="font-mono text-accent-white/90">.policyctl.yml</span> enforced
            across Claude Code, Codex, Cursor, and your CI pipeline. No vendor lock-in.
          </p>

          {/* CLI Pill */}
          <div className="inline-flex items-center gap-12 px-20 py-12 rounded-full bg-white-alpha-8 backdrop-blur-xl border border-white-alpha-12">
            <code className="text-mono-small text-accent-white">
              brew install ravaniroshan/tap/policyctl
            </code>
            <button
              onClick={copyCommand}
              aria-label="Copy install command"
              className="text-accent-white/60 hover:text-accent-white transition-colors"
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}