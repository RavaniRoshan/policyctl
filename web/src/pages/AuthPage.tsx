"use client";

import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Eye, EyeSlash, Copy, Check, GithubLogo, GoogleLogo } from "@phosphor-icons/react";

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
      {/* Left Panel - Auth Card */}
      <div className="flex-1 lg:w-1/2 bg-surface flex flex-col p-24 lg:p-40 overflow-y-auto">
        {/* Window Controls */}
        <div className="flex items-center gap-8 mb-32">
          <span className="size-12 rounded-full bg-danger/80" />
          <span className="size-12 rounded-full bg-warning/80" />
          <span className="size-12 rounded-full bg-success/80" />
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-black-alpha-4 w-max mb-24">
          <button
            onClick={() => setMode("signup")}
            className={`px-16 py-6 rounded-md text-label-medium transition-all duration-200 ${
              mode === "signup" ? "bg-surface shadow-sm text-accent-black" : "text-black-alpha-56"
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => setMode("login")}
            className={`px-16 py-6 rounded-md text-label-medium transition-all duration-200 ${
              mode === "login" ? "bg-surface shadow-sm text-accent-black" : "text-black-alpha-56"
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Header */}
        <h1 className="text-title-h2 text-accent-black tracking-tight">
          {mode === "signup" ? "Create an account" : "Welcome back"}
        </h1>
        <p className="mt-8 text-body-large text-black-alpha-64">
          {mode === "signup"
            ? "Define guardrails, enforce policies across systems"
            : "Sign in to manage your policies"}
        </p>

        {/* SSO Buttons */}
        <div className="mt-32 space-y-12">
          <button
            onClick={() => handleSocialLogin("github")}
            className="flex w-full h-44 items-center justify-center gap-8 rounded-xl border border-border-faint bg-surface text-label-medium text-accent-black transition-all duration-200 hover:bg-black-alpha-4 hover:border-border-muted active:scale-[0.99]"
          >
            <GithubLogo className="size-4" />
            {mode === "signup" ? "Sign up with GitHub" : "Sign in with GitHub"}
          </button>
          <button
            onClick={() => handleSocialLogin("google-oauth2")}
            className="flex w-full h-44 items-center justify-center gap-8 rounded-xl border border-border-faint bg-surface text-label-medium text-accent-black transition-all duration-200 hover:bg-black-alpha-4 hover:border-border-muted active:scale-[0.99]"
          >
            <GoogleLogo className="size-4" />
            {mode === "signup" ? "Sign up with Google" : "Sign in with Google"}
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-12 my-24">
          <div className="flex-1 h-px bg-border-faint" />
          <span className="text-mono-x-small text-black-alpha-32 uppercase">or</span>
          <div className="flex-1 h-px bg-border-faint" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-16">
          {mode === "signup" && (
            <div className="grid grid-cols-2 gap-12">
              <div>
                <label className="text-label-small text-accent-black block mb-6">First Name</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  placeholder="Ada"
                  className="w-full h-44 rounded-xl border border-border-faint bg-surface px-12 py-12 text-body-medium text-accent-black placeholder:text-black-alpha-32 outline-none transition-all duration-200 focus:border-heat-100 focus:ring-2 focus:ring-heat-100/20"
                />
              </div>
              <div>
                <label className="text-label-small text-accent-black block mb-6">Last Name</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  placeholder="Lovelace"
                  className="w-full h-44 rounded-xl border border-border-faint bg-surface px-12 py-12 text-body-medium text-accent-black placeholder:text-black-alpha-32 outline-none transition-all duration-200 focus:border-heat-100 focus:ring-2 focus:ring-heat-100/20"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-label-small text-accent-black block mb-6">Work Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="name@company.com"
              className="w-full h-44 rounded-xl border border-border-faint bg-surface px-12 py-12 text-body-medium text-accent-black placeholder:text-black-alpha-32 outline-none transition-all duration-200 focus:border-heat-100 focus:ring-2 focus:ring-heat-100/20"
            />
          </div>

          <div>
            <label className="text-label-small text-accent-black block mb-6">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full h-44 rounded-xl border border-border-faint bg-surface px-12 py-12 pr-44 text-body-medium text-accent-black placeholder:text-black-alpha-32 outline-none transition-all duration-200 focus:border-heat-100 focus:ring-2 focus:ring-heat-100/20"
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
            <div className="space-y-12">
              <label className="flex items-center gap-8 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.marketing}
                  onChange={(e) => setForm({ ...form, marketing: e.target.checked })}
                  className="size-4 rounded border-border-faint text-heat-100 focus:ring-heat-100"
                />
                <span className="text-body-small text-black-alpha-64">
                  Send me occasional product updates and tips
                </span>
              </label>
              <label className="flex items-center gap-8 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.terms}
                  onChange={(e) => setForm({ ...form, terms: e.target.checked })}
                  className="size-4 rounded border-border-faint text-heat-100 focus:ring-heat-100"
                />
                <span className="text-body-small text-black-alpha-64">
                  I agree to the Terms of Service and Privacy Policy
                </span>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-44 rounded-xl bg-accent-black text-accent-white text-label-medium font-medium transition-all duration-200 hover:bg-black-alpha-88 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-8"
          >
            {isLoading ? (
              <span className="size-4 border-2 border-accent-white/30 border-t-accent-white rounded-full animate-spin" />
            ) : (
              <>{mode === "signup" ? "Get Started" : "Sign In"}</>
            )}
          </button>
        </form>

        {/* Bottom Link */}
        <p className="mt-24 text-center text-body-small text-black-alpha-56">
          {mode === "signup" ? (
            <>
              Already have an account?{" "}
              <button onClick={() => setMode("login")} className="text-heat-100 hover:underline font-medium">
                Sign in
              </button>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <button onClick={() => setMode("signup")} className="text-heat-100 hover:underline font-medium">
                Sign up free
              </button>
            </>
          )}
        </p>
      </div>

      {/* Right Panel - Hero / Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-accent-black overflow-hidden">
        {/* Noise Texture */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Gradient Blur */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 h-600 w-600 rounded-full bg-heat-100/30 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 h-400 w-400 rounded-full bg-accent-sky/20 blur-[100px]" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-end p-40">
          <h2 className="text-title-h1 text-accent-white tracking-tight leading-[1.1]">
            Define once,<br />Build compliant.
          </h2>

          {/* CLI Pill */}
          <div className="mt-auto">
            <div className="inline-flex items-center gap-12 px-20 py-12 rounded-full bg-white-alpha-8 backdrop-blur-xl border border-white-alpha-12">
              <code className="text-mono-small text-accent-white">
                brew install ravaniroshan/tap/policyctl
              </code>
              <button
                onClick={copyCommand}
                className="text-accent-white/60 hover:text-accent-white transition-colors"
              >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}