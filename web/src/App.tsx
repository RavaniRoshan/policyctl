import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, RequireAuth } from "@/lib/auth";
import { TurnstileProvider } from "@/components/ui/turnstile";
import { Landing } from "@/pages/Landing";
import { Docs } from "@/pages/Docs";
import { Login } from "@/pages/Login";
import { Signup } from "@/pages/Signup";
import { Onboarding } from "@/pages/Onboarding";
import {
  DashboardShell,
  Overview,
  Sessions,
  Policies,
  Ai,
  Reports,
  Gear,
} from "@/pages/Dashboard";

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TurnstileProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
            <Route path="/dashboard" element={<RequireAuth><DashboardShell /></RequireAuth>}>
              <Route index element={<Overview />} />
              <Route path="sessions" element={<Sessions />} />
              <Route path="policies" element={<Policies />} />
              <Route path="ai" element={<Ai />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Gear />} />
            </Route>
            <Route path="*" element={<Landing />} />
          </Routes>
        </TurnstileProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
