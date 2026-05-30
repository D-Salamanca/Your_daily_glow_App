import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import OfflineScreen from "@/components/Shared/OfflineScreen";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import Home from "@/pages/Home";
import Journal from "@/pages/Journal";
import Processes from "@/pages/Processes";
import CycleTracking from "@/pages/CycleTracking";
import Savings from "@/pages/Savings";
import Settings from "@/pages/Settings";
import ProfessionalHelp from "@/pages/ProfessionalHelp";
import Onboarding from "@/pages/Onboarding";

/** ProtectedRoute: renders children only when authenticated */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background" />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

/** OnlineRoute: renders children only when online, otherwise shows OfflineScreen */
const OnlineRoute = ({ children }: { children: React.ReactNode }) => {
  const isOnline = useOnlineStatus();
  if (!isOnline) return <OfflineScreen />;
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/"      element={<Index />} />
    <Route path="/login" element={<Login />} />

    {/* Offline-capable (no OnlineRoute wrapper) */}
    <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
    <Route path="/home"       element={<ProtectedRoute><Home /></ProtectedRoute>} />
    <Route path="/processes"  element={<ProtectedRoute><Processes /></ProtectedRoute>} />
    <Route path="/savings"    element={<ProtectedRoute><Savings /></ProtectedRoute>} />

    {/* Online-only */}
    <Route path="/journal"  element={<ProtectedRoute><OnlineRoute><Journal /></OnlineRoute></ProtectedRoute>} />
    <Route path="/cycle"    element={<ProtectedRoute><OnlineRoute><CycleTracking /></OnlineRoute></ProtectedRoute>} />
    <Route path="/settings" element={<ProtectedRoute><OnlineRoute><Settings /></OnlineRoute></ProtectedRoute>} />
    <Route path="/help"     element={<ProtectedRoute><OnlineRoute><ProfessionalHelp /></OnlineRoute></ProtectedRoute>} />

    {/* 404 */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
