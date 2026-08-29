"use client";

import { GrainGradient } from "@paper-design/shaders-react";
import { useState, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TurnstileWidget, useTurnstile } from "@/components/ui/turnstile";

interface Props {
  mode: "signup" | "login";
  onSubmit: (data: { email: string; password: string; displayName?: string; turnstile?: string }) => Promise<void> | void;
  onOAuth: (provider: "google" | "apple") => void;
  error?: string | null;
  loading?: boolean;
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853" />
      <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84Z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" fill="#EB4335" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 12.54c-.03-3.02 2.47-4.47 2.58-4.54-1.41-2.06-3.6-2.34-4.38-2.37-1.86-.19-3.64 1.1-4.58 1.1-.95 0-2.42-1.07-3.98-1.04-2.05.03-3.94 1.19-4.99 3.02-2.13 3.69-.54 9.16 1.53 12.15 1.01 1.46 2.22 3.1 3.81 3.04 1.53-.06 2.11-.99 3.96-.99s2.37.99 3.99.96c1.65-.03 2.69-1.49 3.69-2.96 1.16-1.69 1.64-3.33 1.66-3.41-.04-.02-3.2-1.23-3.24-4.87ZM14.03 3.66c.84-1.02 1.41-2.43 1.25-3.84-1.21.05-2.68.81-3.55 1.83-.78.9-1.46 2.34-1.28 3.72 1.35.1 2.73-.69 3.58-1.71Z" />
    </svg>
  );
}

export function AuthSectionOne({ mode, onSubmit, onOAuth, error, loading }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [editing, setEditing] = useState(false);
  const { token: turnstileToken } = useTurnstile();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      email,
      password,
      displayName: mode === "signup" ? `${firstName} ${lastName}`.trim() || undefined : undefined,
      turnstile: turnstileToken ?? undefined,
    });
  };

  return (
    <section className="grid min-h-screen bg-n-950 text-n-100 antialiased lg:grid-cols-[0.94fr_1.06fr]">
      <div className="flex min-h-[760px] items-start border-n-800 px-6 py-12 sm:px-10 lg:min-h-0 lg:px-14 lg:py-20 xl:px-20">
        <div className="mx-auto w-full max-w-[560px]">
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[42px] lg:leading-[1.05]">
            {mode === "signup" ? "Create an account" : "Welcome back"}
          </h1>
          <p className="mt-3 text-lg text-n-400 sm:text-xl">
            {mode === "signup"
              ? "Encode the rules your agents must obey."
              : "Sign in to your control plane."}
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <SocialButton icon={<GoogleIcon />} label="Google" onClick={() => onOAuth("google")} />
            <SocialButton icon={<AppleIcon />} label="Apple" onClick={() => onOAuth("apple")} />
          </div>

            <div className="my-8 text-center font-medium text-n-500">or</div>

          <form className="space-y-4" onSubmit={submit}>
            {mode === "signup" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldBox label="First name" value={firstName} onChange={setFirstName} editing={editing} setEditing={setEditing} />
                <FieldBox label="Last name" value={lastName} onChange={setLastName} editing={editing} setEditing={setEditing} />
              </div>
            )}
            <Input
              type="email"
              required
              placeholder="Email"
              aria-label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              required
              placeholder="Password"
              aria-label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <div className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
                {error}
              </div>
            )}

            <div className="flex justify-center py-2">
              <TurnstileWidget action={mode === "signup" ? "signup" : "login"} />
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading || !turnstileToken}>
              {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-n-500">
            {mode === "signup" ? (
              <>
                Already have an account?{" "}
                <a href="/login" className="text-pc-300 hover:underline">Sign in</a>
              </>
            ) : (
              <>
                New to policyctl?{" "}
                <a href="/signup" className="text-pc-300 hover:underline">Create an account</a>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="relative flex min-h-[640px] overflow-hidden bg-n-1000 p-8 sm:p-12 lg:min-h-0">
        <GrainGradient
          speed={1}
          scale={1}
          rotation={0}
          offsetX={0}
          offsetY={0}
          softness={0.5}
          intensity={0.5}
          noise={0.25}
          shape="corners"
          frame={2854.5}
          colors={["#34d399", "#0D9373", "#F59E0B", "#0a7d62", "#34d399", "#F59E0B"]}
          colorBack="#00000000"
          className="absolute inset-0 bg-n-1000"
        />
        <div className="relative z-10 flex h-full w-full flex-col justify-between">
          <h2 className="max-w-[620px] pt-0 font-display text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:pt-12 lg:text-[64px] lg:leading-[0.98]">
            One file.<br />Every agent.<br />No exceptions.
          </h2>
          <p className="mb-0 max-w-md text-lg text-white/70 xl:mb-24">
            Deterministic guardrails for Claude, Codex, and Cursor — enforced at tool-call time and again in CI.
          </p>
        </div>
      </div>
    </section>
  );
}

function SocialButton({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 items-center justify-center gap-2 rounded-md border border-n-700 bg-n-900 px-3 text-sm text-n-100 transition-colors hover:border-pc-500 hover:bg-n-800"
    >
      <span className="shrink-0">{icon}</span>
      <span>Continue with {label}</span>
    </button>
  );
}

function FieldBox({
  label,
  value,
  onChange,
  editing,
  setEditing,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  editing: boolean;
  setEditing: (b: boolean) => void;
}) {
  return (
    <label className="flex h-12 items-center gap-3 rounded-md border border-n-700 bg-n-1000 px-4">
      <input
        type="text"
        value={value}
        aria-label={label}
        onFocus={() => !editing && setEditing(true)}
        onChange={(e) => {
          onChange(e.target.value);
          setEditing(true);
        }}
        placeholder={label}
        className="min-w-0 flex-1 bg-transparent text-n-100 outline-none placeholder:text-n-500"
      />
    </label>
  );
}
