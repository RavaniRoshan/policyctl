import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthSectionOne } from "@/components/ui/auth-section-1";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

export function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: { email: string; password: string; displayName?: string }) => {
    setError(null);
    setLoading(true);
    try {
      await signup(data.email, data.password, data.displayName);
      navigate("/onboarding", { replace: true });
    } catch (e: any) {
      setError(e?.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  const onOAuth = async (provider: "google" | "apple") => {
    try {
      const { url } = await api.oauthUrl(provider);
      window.location.href = url;
    } catch (e: any) {
      setError(e?.message || "OAuth unavailable");
    }
  };

  return <AuthSectionOne mode="signup" onSubmit={onSubmit} onOAuth={onOAuth} error={error} loading={loading} />;
}
