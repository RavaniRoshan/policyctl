import React from "react";
import { createRoot } from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import "@policyctl/design-system/tokens.css";
import "@policyctl/design-system/primitives.css";
import "./index.css";
import { App } from "./App";

// Public Auth0 identifiers (same convention as API_BASE in lib/api.ts: baked-in
// defaults so prebuilt artifacts work, VITE_* env overrides when set).
// Domain and SPA client ID are public — they ship in the JS bundle by design.
//
// Audience MUST be an Auth0 API identifier (Dashboard > Applications > APIs),
// not the client ID — Auth0 rejects anything else with "Service not found".
// When unset, audience is omitted so login still works; API calls will 401
// until VITE_AUTH0_AUDIENCE matches the Worker's AUTH0_AUDIENCE.
const AUTH0_DOMAIN =
  (import.meta.env.VITE_AUTH0_DOMAIN as string | undefined) || "dev-wyyyhy36ogxygyky.us.auth0.com";
const AUTH0_CLIENT_ID =
  (import.meta.env.VITE_AUTH0_CLIENT_ID as string | undefined) || "91txJu7H0xUBDi6b8gE3073Nwhi2hG1I";
const AUTH0_AUDIENCE = import.meta.env.VITE_AUTH0_AUDIENCE as string | undefined;

const REDIRECT_URI = window.location.origin;

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Auth0Provider
      domain={AUTH0_DOMAIN}
      clientId={AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: REDIRECT_URI,
        ...(AUTH0_AUDIENCE ? { audience: AUTH0_AUDIENCE } : {}),
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
      skipRedirectCallback={false}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>,
);
