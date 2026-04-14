import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
import { AppErrorBoundary } from "@/components/layout/AppErrorBoundary";
import { PageLoader } from "@/components/layout/PageLoader";

// ---------------------------------------------------------------------------
// QueryClient — created once outside the component tree so it is never
// recreated on re-renders. staleTime of 5 min prevents redundant refetches;
// retry:1 avoids hammering a failing endpoint.
// ---------------------------------------------------------------------------
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

// ---------------------------------------------------------------------------
// Lazy page imports — each page is a separate JS chunk that is only fetched
// when the user navigates to that route, keeping the initial bundle small.
// ---------------------------------------------------------------------------
const Index         = lazy(() => import("./pages/Index"));
const Reports       = lazy(() => import("./pages/Reports"));
const ReportDetail  = lazy(() => import("./pages/ReportDetail"));
const Settings      = lazy(() => import("./pages/Settings"));
const Help          = lazy(() => import("./pages/Help"));
const Analytics     = lazy(() => import("./pages/Analytics"));
const ScamDetector  = lazy(() => import("./pages/ScamDetector"));
const NotFound      = lazy(() => import("./pages/NotFound"));

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* Catches unhandled render errors in any child route */}
        <AppErrorBoundary>
          {/* Suspense boundary: shows a spinner while a lazy chunk loads */}
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* All authenticated/main routes share the AppLayout shell */}
              <Route element={<AppLayout />}>
                <Route path="/"                element={<Index />} />
                <Route path="/reports"         element={<Reports />} />
                <Route path="/report/:id"      element={<ReportDetail />} />
                <Route path="/scam-detector"   element={<ScamDetector />} />
                <Route path="/analytics"       element={<Analytics />} />
                <Route path="/settings"        element={<Settings />} />
                <Route path="/help"            element={<Help />} />
              </Route>

              {/* NotFound sits outside the layout so it gets a clean full-page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AppErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
