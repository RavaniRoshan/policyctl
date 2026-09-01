import React from "react";
import { createRoot } from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import "@policyctl/design-system/tokens.css";
import "@policyctl/design-system/primitives.css";
import "./index.css";
import { App } from "./App";

const AUTH0_DOMAIN = "dev-wyyyhy36ogxygyky.us.auth0.com";
const AUTH0_CLIENT_ID = "91txJu7H0xUBDi6b8gE3073Nwhi2hG1I";
const REDIRECT_URI = `${window.location.origin}/`;

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Auth0Provider
      domain={AUTH0_DOMAIN}
      clientId={AUTH0_CLIENT_ID}
      authorizationParams={{ redirect_uri: REDIRECT_URI }}
      cacheLocation="localstorage"
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>,
);
