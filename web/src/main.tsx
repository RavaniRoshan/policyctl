import React from "react";
import { createRoot } from "react-dom/client";
import "@policyctl/design-system/tokens.css";
import "@policyctl/design-system/primitives.css";
import "./index.css";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);