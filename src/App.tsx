import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import PatientDashboard from "./pages/PatientDashboard";
import CaregiverDashboard from "./pages/CaregiverDashboard";
import ClinicalPanel from "./pages/ClinicalPanel";
import AIChatbot from "./pages/AIChatbot";
import VitalsMonitor from "./pages/VitalsMonitor";
import Notifications from "./pages/Notifications";
import PrivacySettings from "./pages/PrivacySettings";
import HelpDesk from "./pages/HelpDesk";
import PatientDocuments from "./pages/PatientDocuments";
import SafetyMap from "./pages/SafetyMap";
import MemoryGames from "./pages/MemoryGames";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/patient" element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>} />
            <Route path="/caregiver" element={<ProtectedRoute><CaregiverDashboard /></ProtectedRoute>} />
            <Route path="/clinical" element={<ProtectedRoute><ClinicalPanel /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><AIChatbot /></ProtectedRoute>} />
            <Route path="/vitals" element={<ProtectedRoute><VitalsMonitor /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/privacy" element={<ProtectedRoute><PrivacySettings /></ProtectedRoute>} />
            <Route path="/help" element={<ProtectedRoute><HelpDesk /></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute><PatientDocuments /></ProtectedRoute>} />
            <Route path="/safety" element={<ProtectedRoute><SafetyMap /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
