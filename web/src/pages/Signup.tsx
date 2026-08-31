import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TurnstileWidget, useTurnstile } from "@/components/ui/turnstile";
import { useAuth } from "@/lib/auth";
import { CurvyRect, useToast } from "@policyctl/design-system";
import { useState } from "react";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
  displayName: z.string().min(2, "At least 2 characters").max(64),
});

type FormData = z.infer<typeof schema>;

export function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
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
      await signup(data.email, data.password, data.displayName, turnstileToken ?? undefined);
      push({ title: "Account created", description: "Let's set up your workspace." });
      navigate("/onboarding");
    } catch (e: any) {
      push({ title: "Sign up failed", description: e?.message, tone: "danger" });
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
              [ secure / create-account ]
            </div>
            <h1 className="mt-12 text-title-h4 text-accent-black">
              Create your account
            </h1>
            <p className="mt-12 text-body-medium text-black-alpha-64">
              Free forever for the CLI. Paid only when you want the control plane.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-32 space-y-16">
              <div>
                <label htmlFor="signup-name" className="text-label-small text-black-alpha-56 mb-8 block">
                  Display name
                </label>
                <Input
                  id="signup-name"
                  autoComplete="name"
                  aria-invalid={errors.displayName ? "true" : undefined}
                  aria-describedby={errors.displayName ? "signup-name-error" : undefined}
                  {...register("displayName")}
                  placeholder="Ada Lovelace"
                />
                {errors.displayName && (
                  <div id="signup-name-error" role="alert" className="mt-4 text-mono-small text-danger">
                    {errors.displayName.message}
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="signup-email" className="text-label-small text-black-alpha-56 mb-8 block">
                  Email
                </label>
                <Input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={errors.email ? "true" : undefined}
                  aria-describedby={errors.email ? "signup-email-error" : undefined}
                  {...register("email")}
                  placeholder="you@team.dev"
                />
                {errors.email && (
                  <div id="signup-email-error" role="alert" className="mt-4 text-mono-small text-danger">
                    {errors.email.message}
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="signup-password" className="text-label-small text-black-alpha-56 mb-8 block">
                  Password
                </label>
                <Input
                  id="signup-password"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={errors.password ? "true" : undefined}
                  aria-describedby={errors.password ? "signup-password-error" : undefined}
                  {...register("password")}
                />
                {errors.password && (
                  <div id="signup-password-error" role="alert" className="mt-4 text-mono-small text-danger">
                    {errors.password.message}
                  </div>
                )}
              </div>
              <div className="-mt-1">
                <TurnstileWidget action="signup" />
              </div>
              <Button type="submit" disabled={busy} className="w-full" size="lg">
                {busy ? "Creating account…" : "Create account"}
              </Button>
              <p className="text-mono-x-small text-black-alpha-32 text-center -mt-1">
                By creating an account you agree to the Terms of Service.
              </p>
            </form>
            <div className="mt-24 text-body-small text-black-alpha-56 text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-heat-100 hover:opacity-80">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}