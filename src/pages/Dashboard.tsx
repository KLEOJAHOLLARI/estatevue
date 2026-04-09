import { useAuth } from "@/lib/auth";
import AgentDashboard from "@/components/dashboard/AgentDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import { Navigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

export default function Dashboard() {
  const { user, hasRole, loading, profile } = useAuth();

  if (loading) return <div className="container py-20 text-center text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!hasRole("agent") && !hasRole("admin")) return <Navigate to="/" />;

  return (
    <div className="container py-8">
      {!profile?.is_approved && !hasRole("admin") && (
        <Alert variant="destructive" className="mb-6">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Account Pending Approval</AlertTitle>
          <AlertDescription>
            Your account is awaiting admin approval. You can browse properties but cannot create listings, save favorites, or contact agents until approved.
          </AlertDescription>
        </Alert>
      )}
      {hasRole("admin") ? <AdminDashboard /> : <AgentDashboard />}
    </div>
  );
}
