import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useGroup } from "../context/GroupContext";

export function ProtectedRoute() {
  const { user, loading: authLoading } = useAuth();
  const { membership, loading: groupLoading } = useGroup();
  const location = useLocation();

  if (authLoading || groupLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">
        Loading…
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const onJoinPage = location.pathname === "/join-group";

  if (!membership && !onJoinPage) {
    return <Navigate to="/join-group" replace />;
  }

  if (membership && onJoinPage) {
    return <Navigate to="/boards" replace />;
  }

  return <Outlet />;
}
