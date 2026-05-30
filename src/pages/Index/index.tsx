import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    const onboarded = localStorage.getItem("sentir-onboarded");
    navigate(onboarded ? "/home" : "/onboarding", { replace: true });
  }, [user, loading, navigate]);

  return null;
};

export default Index;
