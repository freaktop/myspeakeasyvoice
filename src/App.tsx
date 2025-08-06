
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { VoiceProvider } from "./contexts/VoiceContext";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import SettingsPage from "./pages/SettingsPage";
import RoutinesPage from "./pages/RoutinesPage";
import CommandLogPage from "./pages/CommandLogPage";
import OnboardingPage from "./pages/OnboardingPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <VoiceProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="routines" element={<RoutinesPage />} />
                <Route path="commands" element={<CommandLogPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </VoiceProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
