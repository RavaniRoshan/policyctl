import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TurnstileWidget, useTurnstile } from "@/components/ui/turnstile";
import { useAuth } from "@/lib/auth";
import { useToast } from "@policyctl/design-system";
import { CurvyRect } from "@policyctl/design-system";
import { useState } from "react";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const rawNext = params.get("next");
  // Validate next is a relative path to prevent open redirect.
  const next = rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";
  const [busy, setBusy] = useState(false);
  const { push } = useToast();
  const { token: turnstileToken } = useTurnstile();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setBusy(true);
    try {
      await login(data.email, data.password, turnstileToken ?? undefined);
      navigate(next, { replace: true });
    } catch (e: any) {
      push({ title: "Sign in failed", description: e?.message, tone: "danger" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-base text-accent-black">
      <MarketingNav />
      <div className="pcl-container py-64 lg:py-88">
        <div className="mx-auto max-w-420">
          <div className="border border-border-faint rounded-xl bg-surface p-32 lg:p-64 relative">
            <CurvyRect sides="allSides" />
            <div className="text-mono-x-small text-black-alpha-32 uppercase">
              [ secure ]
            </div>
            <h1 className="mt-12 text-title-h4 text-accent-black">Sign in</h1>
            <p className="mt-12 text-body-medium text-black-alpha-64">
              Welcome back. Pick up where your agents left off.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-32 space-y-16">
              <div>
                <label htmlFor="login-email" className="text-label-small text-black-alpha-56 mb-8 block">
                  Email
                </label>
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={errors.email ? "true" : undefined}
                  aria-describedby={errors.email ? "login-email-error" : undefined}
                  {...register("email")}
                  placeholder="you@team.dev"
                />
                {errors.email && (
                  <div id="login-email-error" role="alert" className="mt-4 text-mono-small text-danger">
                    {errors.email.message}
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="login-password" className="text-label-small text-black-alpha-56 mb-8 block">
                  Password
                </label>
                <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  aria-invalid={errors.password ? "true" : undefined}
                  aria-describedby={errors.password ? "login-password-error" : undefined}
                  {...register("password")}
                />
                {errors.password && (
                  <div id="login-password-error" role="alert" className="mt-4 text-mono-small text-danger">
                    {errors.password.message}
                  </div>
                )}
              </div>
              <div className="-mt-1">
                <TurnstileWidget action="login" />
              </div>
              <Button type="submit" disabled={busy} className="w-full" size="lg">
                {busy ? "Signing in…" : "Sign in"}
              </Button>
            </form>
            <div className="mt-24 text-body-small text-black-alpha-56 text-center">
              New here?{" "}
              <Link to="/signup" className="text-heat-100 hover:opacity-80">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}