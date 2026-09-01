import {
  useContext,
  createContext,
  type ReactNode,
} from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface AuthState {
  user: { sub: string; email?: string; name?: string; picture?: string } | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (opts?: { screenHint?: "signup" | "login" }) => void;
  logout: () => void;
}

const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    user,
    isLoading,
    isAuthenticated,
    loginWithRedirect,
    logout: auth0Logout,
  } = useAuth0();

  const login = (opts?: { screenHint?: "signup" | "login" }) => {
    loginWithRedirect({
      authorizationParams: {
        redirect_uri: `${window.location.origin}/`,
        screen_hint: opts?.screenHint || "login",
      },
    });
  };

  const logout = () => {
    auth0Logout({ logoutParams: { returnTo: `${window.location.origin}/` } });
  };

  const value: AuthState = {
    user: user
      ? { sub: user.sub ?? "", email: user.email, name: user.name, picture: user.picture }
      : null,
    loading: isLoading,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const next = window.location.pathname + window.location.search;
      setRedirectTo(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center text-black-alpha-48 font-mono text-mono-small">
        Loading…
      </div>
    );
  }
  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }
  return <>{children}</>;
}