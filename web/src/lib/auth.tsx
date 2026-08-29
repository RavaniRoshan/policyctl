import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
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

  return (
    <AuthCtx.Provider value={{ user, loading, login, signup, logout }}>
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
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-n-400 font-mono text-sm">
        Loading…
      </div>
    );
  }
  if (!user) {
    const next = encodeURIComponent(
      typeof window !== "undefined" ? window.location.pathname : "/dashboard",
    );
    window.location.href = `/login?next=${next}`;
    return null;
  }
  return <>{children}</>;
}
