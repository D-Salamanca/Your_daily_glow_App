import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Admin-only routes.
 * Extend this file when an admin panel is added.
 * Currently redirects all admin paths to /home.
 */

const ADMIN_EMAILS: string[] = [
  // Add admin emails here, e.g. "admin@sentir.app"
];

const AdminRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-background" />;
  if (!user) return <Navigate to="/login" replace />;

  const isAdmin = user.email ? ADMIN_EMAILS.includes(user.email) : false;
  if (!isAdmin) return <Navigate to="/home" replace />;

  return (
    <Routes>
      {/* Admin pages go here */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
