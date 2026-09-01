import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { Footer } from "@/components/layout/Footer";
import { AuthSection } from "@/components/ui/auth-section";
import { useAuth } from "@/lib/auth";
import { useToast } from "@policyctl/design-system";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const rawNext = params.get("next");
  const next = rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const { push } = useToast();

  const handleSubmit = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    setError(undefined);
    try {
      await login(data.email, data.password);
      navigate(next, { replace: true });
    } catch (e: any) {
      setError(e?.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-base text-accent-black flex flex-col">
      <MarketingNav />
      <main className="flex-1 flex items-center justify-center py-80 px-16">
        <AuthSection
          mode="login"
          onSubmit={handleSubmit}
          onModeSwitch={() => navigate("/signup")}
          isLoading={isLoading}
          error={error}
        />
      </main>
      <Footer />
    </div>
  );
}