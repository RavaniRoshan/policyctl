import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, Component, Suspense, type ReactNode } from "react";
import { AuthProvider, RequireAuth } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import { ToastProvider } from "@policyctl/design-system";
import { TurnstileProvider } from "@/components/ui/turnstile";
import { queryClient } from "@/lib/query";
import { Landing } from "@/pages/Landing";
import { AuthPage } from "@/pages/AuthPage";
import { Pricing } from "@/pages/Pricing";
import { Terms } from "@/pages/Terms";
import { Privacy } from "@/pages/Privacy";
import { Onboarding } from "@/pages/Onboarding";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { FirstRunGate } from "@/components/dashboard/FirstRunGate";
import { Overview } from "@/pages/dashboard/Overview";
import { Sessions } from "@/pages/dashboard/Sessions";
import { Policies } from "@/pages/dashboard/Policies";
import { Ai } from "@/pages/dashboard/Ai";
import { Reports } from "@/pages/dashboard/Reports";
import { Settings } from "@/pages/dashboard/Settings";
import { Billing } from "@/pages/dashboard/Billing";
import { OrgMembers } from "@/pages/dashboard/OrgMembers";
import { NotFound } from "@/pages/NotFound";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen grid place-items-center bg-background-base text-accent-black p-32">
          <div className="text-center max-w-md">
            <h1 className="text-title-h3">Something went wrong</h1>
            <p className="mt-12 text-body-large text-black-alpha-64">
              An unexpected error occurred. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-24 pcl-btn pcl-btn--primary"
            >
              Refresh page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function DocsRedirect() {
  useEffect(() => {
    window.location.replace("/docs/");
  }, []);
  return null;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
            <BrowserRouter>
            <a href="#main-content" className="skip-link">Skip to main content</a>
            <ErrorBoundary>
              <AuthProvider>
                <TurnstileProvider>
                  <MotionConfig reducedMotion="user">
                  <Suspense
                    fallback={
                      <div className="min-h-screen grid place-items-center text-black-alpha-48 font-mono text-mono-small">
                        Loading…
                      </div>
                    }
                  >
                    <Routes>
                      {/* Public */}
                      <Route path="/" element={<Landing />} />
                      <Route path="/pricing" element={<Pricing />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/docs" element={<DocsRedirect />} />
                      <Route path="/docs/*" element={<DocsRedirect />} />
                      <Route path="/login" element={<AuthPage />} />
                      <Route path="/signup" element={<AuthPage />} />

                      {/* Onboarding */}
                      <Route
                        path="/onboarding"
                        element={
                          <RequireAuth>
                            <Onboarding />
                          </RequireAuth>
                        }
                      />

                      {/* Dashboard */}
                      <Route
                        path="/dashboard"
                        element={
                          <RequireAuth>
                            <FirstRunGate>
                              <DashboardShell />
                            </FirstRunGate>
                          </RequireAuth>
                        }
                      >
                        <Route index element={<Overview />} />
                        <Route path="violations" element={<Sessions />} />
                        <Route path="policies" element={<Policies />} />
                        <Route path="ai" element={<Ai />} />
                        <Route path="reports" element={<Reports />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="billing" element={<Billing />} />
                        <Route path="team" element={<OrgMembers />} />
                        <Route path="sessions" element={<Navigate to="/dashboard/violations" replace />} />
                      </Route>

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                    </Suspense>
                  </MotionConfig>
                </TurnstileProvider>
              </AuthProvider>
            </ErrorBoundary>
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}