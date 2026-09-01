import React from "react";
import { createRoot } from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import "@policyctl/design-system/tokens.css";
import "@policyctl/design-system/primitives.css";
import "./index.css";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-wyyyhy36ogxygyky.us.auth0.com"
      clientId="91txJu7H0xUBDi6b8gE3073Nwhi2hG1I"
      authorizationParams={{ redirect_uri: window.location.origin }}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>,
);
