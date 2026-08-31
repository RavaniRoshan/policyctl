import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { api, type Session, type User } from "./api";

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, turnstile?: string) => Promise<void>;
  signup: (email: string, password: string, displayName?: string, turnstile?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .me()
      .then((s) => setUser(s?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string, turnstile?: string) => {
    const s = await api.login({ email, password, turnstile });
    setUser(s.user);
  };
  const signup = async (email: string, password: string, displayName?: string, turnstile?: string) => {
    const s = await api.signup({ email, password, displayName, turnstile });
    setUser(s.user);
  };
  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, login, signup, logout }),
    [user, loading],
  );

  return (
    <AuthCtx.Provider value={value}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      const next = window.location.pathname + window.location.search;
      setRedirectTo(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [user, loading]);

  if (loading) {
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
