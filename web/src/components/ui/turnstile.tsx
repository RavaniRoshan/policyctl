"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

const TurnstileCtx = createContext<{
  siteKey: string | null;
  token: string | null;
  setToken: (t: string | null) => void;
}>({ siteKey: null, token: null, setToken: () => {} });

const SCRIPT_ID = "cf-turnstile-script";
const SITE_KEY_ENV = "VITE_TURNSTILE_SITE_KEY";

function loadTurnstileScript(): Promise<void> {
  return new Promise((resolve) => {
    if (document.getElementById(SCRIPT_ID)) return resolve();
    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.src = "https://challenges.cloudflare.com/cdn-cgi/challenge-platform/h/g/turnstile/v0/api.js";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    document.head.appendChild(s);
  });
}

/** Provider that injects the Turnstile script once and exposes the site key. */
export function TurnstileProvider({
  siteKey: forcedKey,
  children,
}: {
  siteKey?: string;
  children: React.ReactNode;
}) {
  const [token, setToken] = useState<string | null>(null);
  const envKey = (import.meta.env[SITE_KEY_ENV] as string | undefined) ?? forcedKey;
  useEffect(() => {
    loadTurnstileScript().catch((e) => console.error("Turnstile script load failed:", e));
  }, []);
  return (
    <TurnstileCtx.Provider value={{ siteKey: envKey ?? null, token, setToken }}>
      {children}
    </TurnstileCtx.Provider>
  );
}

export function useTurnstile() {
  return useContext(TurnstileCtx);
}

/** Renders the Cloudflare Turnstile challenge widget. */
export function TurnstileWidget({
  action = "auth",
  theme = "auto",
}: {
  action?: string;
  theme?: "light" | "dark" | "auto";
}) {
  const { siteKey, setToken } = useTurnstile();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!siteKey) {
      console.warn("Turnstile: no site key configured — widget hidden");
      return;
    }
    const container = containerRef.current;
    if (!container || !window.turnstile) return;
    // Reset any previous widget before re-rendering.
    window.turnstile.reset();
    container.innerHTML = "";
    window.turnstile.render(container, {
      sitekey: siteKey,
      theme,
      action,
      callback: (t: string) => setToken(t),
      "error-callback": () => setToken(null),
      "timeout-callback": () => setToken(null),
    });
  }, [siteKey, theme, action, setToken]);

  if (!siteKey) return null;
  return <div ref={containerRef} />;
}

declare global {
  interface Window {
    turnstile: {
      render: (
        container: HTMLElement,
        opts: {
        sitekey: string;
        theme?: string;
        action?: string;
        callback?: (token: string) => void;
        "error-callback"?: () => void;
        "timeout-callback"?: () => void;
      },
      ) => string;
      reset: (id?: string) => void;
    };
  }
}
