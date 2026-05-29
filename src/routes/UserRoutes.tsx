import { Routes, Route } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import Home from "@/pages/Home";
import Journal from "@/pages/Journal";
import Processes from "@/pages/Processes";
import CycleTracking from "@/pages/CycleTracking";
import Savings from "@/pages/Savings";
import Settings from "@/pages/Settings";
import ProfessionalHelp from "@/pages/ProfessionalHelp";
import Onboarding from "@/pages/Onboarding";

/** Routes accessible only to authenticated (non-admin) users */
const UserRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-background" />;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/home"       element={<Home />} />
      <Route path="/journal"    element={<Journal />} />
      <Route path="/processes"  element={<Processes />} />
      <Route path="/cycle"      element={<CycleTracking />} />
      <Route path="/savings"    element={<Savings />} />
      <Route path="/settings"   element={<Settings />} />
      <Route path="/help"       element={<ProfessionalHelp />} />
    </Routes>
  );
};

export default UserRoutes;
