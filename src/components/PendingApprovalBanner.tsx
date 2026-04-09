import { useAuth } from "@/lib/auth";
import { AlertTriangle } from "lucide-react";

export default function PendingApprovalBanner() {
  const { user, profile, loading } = useAuth();

  if (loading || !user || profile?.is_approved !== false) return null;

  return (
    <div className="bg-amber-500/90 text-white px-4 py-2.5 text-center text-sm font-medium flex items-center justify-center gap-2">
      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
      <span>Your account is pending admin approval. You can browse properties but cannot create listings, save favorites, or contact agents.</span>
    </div>
  );
}
