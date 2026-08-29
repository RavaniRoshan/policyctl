import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthSectionOne } from "@/components/ui/auth-section-1";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const next = params.get("next") || "/dashboard";

  const onSubmit = async (data: { email: string; password: string }) => {
    setError(null);
    setLoading(true);
    try {
      await login(data.email, data.password);
      navigate(next, { replace: true });
    } catch (e: any) {
      setError(e?.message || "Sign in failed");
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

  return <AuthSectionOne mode="login" onSubmit={onSubmit} onOAuth={onOAuth} error={error} loading={loading} />;
}
