import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { Footer } from "@/components/layout/Footer";
import { AuthSection } from "@/components/ui/auth-section";
import { useAuth } from "@/lib/auth";

export function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = async (data: { email: string; password: string; displayName?: string }) => {
    setIsLoading(true);
    setError(undefined);
    try {
      await signup(data.email, data.password, data.displayName);
      navigate("/onboarding", { replace: true });
    } catch (e: any) {
      setError(e?.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-base text-accent-black flex flex-col">
      <MarketingNav />
      <main className="flex-1 flex items-center justify-center py-80 px-16">
        <AuthSection
          mode="signup"
          onSubmit={handleSubmit}
          onModeSwitch={() => navigate("/login")}
          isLoading={isLoading}
          error={error}
        />
      </main>
      <Footer />
    </div>
  );
}