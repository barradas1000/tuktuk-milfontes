import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
const Admin = lazy(() => import("./pages/Admin"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Instrucoes = lazy(() => import("./pages/Instrucoes"));
import TermosCondicoes from "./pages/TermosCondicoes";
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade";
import PoliticaCancelamento from "./pages/PoliticaCancelamento";
<<<<<<< HEAD
=======
import DriverDashboard from "./pages/DriverDashboard";
>>>>>>> c8a33077bab7f709cdfa791e69ccd28f2ae30363
import PassengerView from "./pages/PassengerView";
import "./i18n";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route
              path="/admin"
              element={
                <Suspense fallback={<div>Carregando...</div>}>
                  <Admin />
                </Suspense>
              }
            />
            <Route
              path="/instrucoes"
              element={
                <Suspense fallback={<div>Carregando...</div>}>
                  <Instrucoes />
                </Suspense>
              }
            />
            <Route
              path="/login"
              element={
                <Suspense fallback={<div>Carregando...</div>}>
                  <Auth />
                </Suspense>
              }
            />
            <Route
              path="/reset-password"
              element={
                <Suspense fallback={<div>Carregando...</div>}>
                  <ResetPassword />
                </Suspense>
              }
            />
            <Route path="/TermosCondicoes" element={<TermosCondicoes />} />
            <Route
              path="/PoliticaPrivacidade"
              element={<PoliticaPrivacidade />}
            />
            <Route
              path="/PoliticaCancelamento"
              element={<PoliticaCancelamento />}
            />
<<<<<<< HEAD
=======
            <Route path="/driver" element={<DriverDashboard />} />
>>>>>>> c8a33077bab7f709cdfa791e69ccd28f2ae30363
            <Route path="/tracking" element={<PassengerView />} />
            <Route
              path="*"
              element={
                <Suspense fallback={<div>Carregando...</div>}>
                  <NotFound />
                </Suspense>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
