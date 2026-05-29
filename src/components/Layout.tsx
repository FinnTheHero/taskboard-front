import { LayoutDashboard, LogOut } from "lucide-react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <nav className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link
            to="/boards"
            className="flex items-center gap-2 font-semibold text-text"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm text-white">
              TB
            </span>
            TaskBoard
          </Link>

          <div className="flex items-center gap-4">
            <Link
              to="/boards"
              className="flex items-center gap-1.5 text-sm text-muted transition hover:text-text"
            >
              <LayoutDashboard className="h-4 w-4" />
              Boards
            </Link>
            <span className="hidden text-sm text-muted sm:inline">
              {user?.name}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-muted transition hover:bg-[var(--color-surface-raised)] hover:text-text"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
