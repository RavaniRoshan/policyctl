"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  GithubLogo,
  GoogleLogo,
  Envelope,
  LockKey,
  User,
  Eye,
  EyeSlash,
  Check,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface AuthFieldProps {
  id: string;
  label: string;
  type: string;
  placeholder?: string;
  icon?: ReactNode;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  onBlur?: () => void;
}

export function AuthField({
  id,
  label,
  type,
  placeholder,
  icon,
  value,
  onChange,
  error,
  onBlur,
}: AuthFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-6">
      <label htmlFor={id} className="text-label-small text-accent-black block">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-12 top-1/2 -translate-y-1/2 text-black-alpha-48">
            {icon}
          </span>
        )}
        <input
          id={id}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            "w-full h-44 rounded-xl border bg-surface px-12 py-12 text-body-medium text-accent-black placeholder:text-black-alpha-32 outline-none transition-all duration-200",
            icon && "pl-44",
            error
              ? "border-danger focus:border-danger focus:ring-2 focus:ring-danger/20"
              : "border-border-faint focus:border-heat-100 focus:ring-2 focus:ring-heat-100/20"
          )}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-12 top-1/2 -translate-y-1/2 text-black-alpha-48 hover:text-accent-black transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeSlash className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
      {error && (
        <div id={`${id}-error`} role="alert" className="text-mono-small text-danger flex items-center gap-4">
          <span className="size-1 rounded-full bg-danger" />
          {error}
        </div>
      )}
    </div>
  );
}

interface SocialButtonProps {
  provider: "github" | "google";
  onClick?: () => void;
  disabled?: boolean;
}

export function SocialButton({ provider, onClick, disabled }: SocialButtonProps) {
  const config = {
    github: { icon: <GithubLogo className="size-4" />, label: "Continue with GitHub" },
    google: { icon: <GoogleLogo className="size-4" />, label: "Continue with Google" },
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full h-44 items-center justify-center gap-8 rounded-xl border border-border-faint bg-surface text-label-medium text-accent-black transition-all duration-200",
        "hover:bg-black-alpha-4 hover:border-border-muted active:scale-[0.99]",
        "disabled:opacity-50 disabled:pointer-events-none"
      )}
    >
      {config[provider].icon}
      {config[provider].label}
    </button>
  );
}

interface AuthDividerProps {
  text?: string;
}

export function AuthDivider({ text = "or" }: AuthDividerProps) {
  return (
    <div className="flex items-center gap-12 my-24">
      <div className="flex-1 h-px bg-border-faint" />
      <span className="text-mono-x-small text-black-alpha-32 uppercase">{text}</span>
      <div className="flex-1 h-px bg-border-faint" />
    </div>
  );
}

interface AuthSectionProps {
  mode: "login" | "signup";
  onSubmit: (data: { email: string; password: string; displayName?: string }) => void;
  onSocialLogin?: (provider: "github" | "google") => void;
  onModeSwitch: () => void;
  isLoading?: boolean;
  error?: string;
  className?: string;
}

export function AuthSection({
  mode,
  onSubmit,
  onSocialLogin,
  onModeSwitch,
  isLoading,
  error,
  className,
}: AuthSectionProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors = {
    email: touched.email && !email.includes("@") ? "Please enter a valid email" : undefined,
    password: touched.password && password.length < 8 ? "Password must be at least 8 characters" : undefined,
    displayName: mode === "signup" && touched.displayName && displayName.length < 2 ? "Name must be at least 2 characters" : undefined,
  };

  const isValid = email.includes("@") && password.length >= 8 && (mode === "login" || displayName.length >= 2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isLoading) return;
    onSubmit({ email, password, displayName: mode === "signup" ? displayName : undefined });
  };

  return (
    <div className={cn("w-full max-w-420 mx-auto", className)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        className="border border-border-faint rounded-2xl bg-surface p-32 lg:p-40"
      >
        <div className="text-center mb-32">
          <div className="inline-flex size-48 items-center justify-center rounded-xl bg-heat-100 text-accent-white mb-16">
            <LockKey className="size-5" />
          </div>
          <h1 className="text-title-h3 text-accent-black tracking-tight">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-8 text-body-medium text-black-alpha-64">
            {mode === "login"
              ? "Sign in to manage your policies"
              : "Start enforcing rules across all your coding agents"}
          </p>
        </div>

        {error && (
          <div role="alert" className="mb-24 p-12 rounded-lg bg-danger/5 border border-danger/20 text-mono-small text-danger flex items-center gap-8">
            <span className="size-1.5 rounded-full bg-danger shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-12 mb-24">
          <SocialButton provider="github" onClick={() => onSocialLogin?.("github")} disabled={isLoading} />
          <SocialButton provider="google" onClick={() => onSocialLogin?.("google")} disabled={isLoading} />
        </div>

        <AuthDivider />

        <form onSubmit={handleSubmit} className="space-y-16">
          <AuthField
            id="auth-email"
            label="Email"
            type="email"
            placeholder="you@team.dev"
            icon={<Envelope className="size-4" />}
            value={email}
            onChange={setEmail}
            error={errors.email}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          />

          {mode === "signup" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <AuthField
                id="auth-name"
                label="Display name"
                type="text"
                placeholder="Ada Lovelace"
                icon={<User className="size-4" />}
                value={displayName}
                onChange={setDisplayName}
                error={errors.displayName}
                onBlur={() => setTouched((t) => ({ ...t, displayName: true }))}
              />
            </motion.div>
          )}

          <AuthField
            id="auth-password"
            label="Password"
            type="password"
            placeholder="••••••••"
            icon={<LockKey className="size-4" />}
            value={password}
            onChange={setPassword}
            error={errors.password}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          />

          <button
            type="submit"
            disabled={!isValid || isLoading}
            className={cn(
              "w-full h-44 rounded-xl bg-accent-black text-accent-white text-label-medium font-medium transition-all duration-200 flex items-center justify-center gap-8",
              "hover:bg-black-alpha-88 active:scale-[0.99]",
              "disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100"
            )}
          >
            {isLoading ? (
              <span className="size-4 border-2 border-accent-white/30 border-t-accent-white rounded-full animate-spin" />
            ) : (
              <>
                {mode === "login" ? "Sign in" : "Create account"}
                <ArrowRight className="size-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-24 text-center text-body-small text-black-alpha-56">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button onClick={onModeSwitch} className="text-heat-100 hover:underline font-medium">
                Sign up free
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button onClick={onModeSwitch} className="text-heat-100 hover:underline font-medium">
                Sign in
              </button>
            </>
          )}
        </div>
      </motion.div>

      <p className="mt-24 text-center text-mono-x-small text-black-alpha-32">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
}