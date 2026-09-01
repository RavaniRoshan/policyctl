import React from "react";
import { createRoot } from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import "@policyctl/design-system/tokens.css";
import "@policyctl/design-system/primitives.css";
import "./index.css";
import { App } from "./App";

const AUTH0_DOMAIN = "dev-wyyyhy36ogxygyky.us.auth0.com";
const AUTH0_CLIENT_ID = "91txJu7H0xUBDi6b8gE3073Nwhi2hG1I";
// Auth0 sends the redirect_uri exactly as configured. We register BOTH the
// bare origin and the origin with a trailing slash so social (GitHub/Google)
// and database callbacks both succeed. Trailing slash is canonical — the
// auth0-react SDK appends "/" when present.
const rawOrigin = window.location.origin;
const ALLOWED_ORIGINS = [rawOrigin, `${rawOrigin}/`];
const REDIRECT_URI = `${rawOrigin}/`;

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Auth0Provider
      domain={AUTH0_DOMAIN}
      clientId={AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: REDIRECT_URI,
      }}
      cacheLocation="localstorage"
      useRefreshTokens={false}
      skipRedirectCallback={false}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>,
);
