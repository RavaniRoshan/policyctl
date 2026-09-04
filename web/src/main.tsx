import React from "react";
import { createRoot } from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import "@policyctl/design-system/tokens.css";
import "@policyctl/design-system/primitives.css";
import "./index.css";
import { App } from "./App";

const AUTH0_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN as string;
const AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID as string;
const REDIRECT_URI = window.location.origin;

const rootEl = document.getElementById("root")!;

if (!AUTH0_DOMAIN || !AUTH0_CLIENT_ID) {
  rootEl.innerHTML =
    "<p style=\"font-family:sans-serif;padding:32px\">Missing <code>VITE_AUTH0_DOMAIN</code> / " +
    "<code>VITE_AUTH0_CLIENT_ID</code> — copy <code>web/.env.example</code> to <code>web/.env</code> and fill them in.</p>";
} else {
  createRoot(rootEl).render(
    <React.StrictMode>
      <Auth0Provider
        domain={AUTH0_DOMAIN}
        clientId={AUTH0_CLIENT_ID}
        authorizationParams={{
          redirect_uri: REDIRECT_URI,
          audience: AUTH0_CLIENT_ID,
        }}
        cacheLocation="localstorage"
        useRefreshTokens={true}
        skipRedirectCallback={false}
      >
        <App />
      </Auth0Provider>
    </React.StrictMode>,
  );
}
