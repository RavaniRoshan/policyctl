import {
  useContext,
  createContext,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate, Navigate } from "react-router-dom";
import { setTokenGetter } from "./api.js";

interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
  provider: string;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (opts?: { screenHint?: "signup" | "login" }) => void;
  logout: () => void;
  getAccessToken: () => Promise<string | null>;
}

const AuthCtx = createContext<AuthState | null>(null);

/**
 * Demo access for visual QA and frontend development without Auth0 credentials.
 *
 * PRODUCTION SAFETY: `import.meta.env.MODE` is replaced at build time, so any
 * production bundle reduces the first operand to `false` and minifiers drop
 * the whole branch. There is no runtime flag, env var, or query param that can
 * enable this in production. Never weaken this gate.
 */
export const DEMO_AUTH_ENABLED =
  import.meta.env.MODE !== "production" &&
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).has("demo_auth");

const DEMO_USER: AuthUser = {
  id: "demo-user",
  email: "demo@policyctl.dev",
  displayName: "Demo User",
  provider: "demo",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    user: auth0User,
    isLoading,
    isAuthenticated,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently,
  } = useAuth0();

  // Wire the Bearer-token getter so api.ts can attach Auth0 access tokens.
  useEffect(() => {
    if (isAuthenticated && typeof getAccessTokenSilently === "function") {
      setTokenGetter(() => getAccessTokenSilently().catch(() => null));
    } else {
      setTokenGetter(null);
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  const login = (opts?: { screenHint?: "signup" | "login" }) => {
    loginWithRedirect({
      authorizationParams: {
        redirect_uri: window.location.origin,
        screen_hint: opts?.screenHint || "login",
      },
    });
  };

  const logout = () => {
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });
  };

  const getAccessToken = async (): Promise<string | null> => {
    if (DEMO_AUTH_ENABLED && !isAuthenticated) return "demo-token";
    if (!isAuthenticated) return null;
    try {
      return await getAccessTokenSilently();
    } catch {
      return null;
    }
  };

  const value: AuthState = {
    user: auth0User
      ? {
          id: auth0User.sub ?? "",
          email: auth0User.email ?? "",
          displayName: auth0User.name ?? auth0User.nickname ?? null,
          provider: auth0User.sub?.split("|")[0] ?? "auth0",
        }
      : DEMO_AUTH_ENABLED
        ? DEMO_USER
        : null,
    loading: isLoading,
    isAuthenticated: isAuthenticated || DEMO_AUTH_ENABLED,
    login,
    logout,
    getAccessToken,
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

  // Demo visual-QA access (compile-time gated, never active in production).
  if (DEMO_AUTH_ENABLED) return <>{children}</>;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const next = window.location.pathname + window.location.search;
      setRedirectTo(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center text-black-alpha-64 font-mono text-mono-small">
        Loading…
      </div>
    );
  }
  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }
  return <>{children}</>;
}
