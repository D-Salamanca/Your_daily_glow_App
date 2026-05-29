import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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

/**
 * AppRoutes centralises all application routes.
 * User routes  → protected, require login.
 * Admin routes → handled in AdminRoutes (imported separately if needed).
 * Public routes → /, /login.
 */
const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/"      element={<Index />} />
    <Route path="/login" element={<Login />} />

    {/* User (protected) */}
    <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
    <Route path="/home"       element={<ProtectedRoute><Home /></ProtectedRoute>} />
    <Route path="/journal"    element={<ProtectedRoute><Journal /></ProtectedRoute>} />
    <Route path="/processes"  element={<ProtectedRoute><Processes /></ProtectedRoute>} />
    <Route path="/cycle"      element={<ProtectedRoute><CycleTracking /></ProtectedRoute>} />
    <Route path="/savings"    element={<ProtectedRoute><Savings /></ProtectedRoute>} />
    <Route path="/settings"   element={<ProtectedRoute><Settings /></ProtectedRoute>} />
    <Route path="/help"       element={<ProtectedRoute><ProfessionalHelp /></ProtectedRoute>} />

    {/* 404 */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
