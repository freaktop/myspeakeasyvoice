import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { VoiceProvider } from "./contexts/VoiceContext";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";

// ✅ Main screen (now renamed)
import Home from "./pages/Home";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <VoiceProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/*" element={<Home />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </VoiceProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
