import { useAuth } from "@/lib/auth";
import AgentDashboard from "@/components/dashboard/AgentDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import { Navigate } from "react-router-dom";

export default function Dashboard() {
  const { user, hasRole, loading } = useAuth();

  if (loading) return <div className="container py-20 text-center text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!hasRole("agent") && !hasRole("admin")) return <Navigate to="/" />;

  return (
    <div className="container py-8">
      {hasRole("admin") ? <AdminDashboard /> : <AgentDashboard />}
    </div>
  );
}
