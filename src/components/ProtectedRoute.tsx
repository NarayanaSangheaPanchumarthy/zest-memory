import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: AppRole[] }) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();
  const denied = !!(allowedRoles && role && !allowedRoles.includes(role));

  useEffect(() => {
    if (denied && user) {
      supabase.rpc("log_security_event", {
        _event_type: "access_denied",
        _table_name: null,
        _record_id: location.pathname,
        _target_user_id: user.id,
        _details: { role, allowedRoles, path: location.pathname },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any).then(() => {});
    }
  }, [denied, user, role, allowedRoles, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse-gentle text-primary font-serif text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  if (allowedRoles && !role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse-gentle text-primary font-serif text-xl">Loading...</div>
      </div>
    );
  }

  if (denied) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
