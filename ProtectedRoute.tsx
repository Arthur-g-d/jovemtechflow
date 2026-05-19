import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { authService } from "@/services";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

/**
 * Rota protegida. Redireciona para /auth se não houver sessão.
 * Se requireAdmin=true, valida `has_role(admin)` via service e redireciona
 * para "/" se o usuário não for admin.
 */
export function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const [status, setStatus] = useState<
    "loading" | "authed" | "unauthed" | "forbidden"
  >("loading");
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const session = await authService.getSession();
        if (cancelled) return;

        if (!session) {
          setStatus("unauthed");
          return;
        }

        if (!requireAdmin) {
          setStatus("authed");
          return;
        }

        const isAdmin = await authService.hasRole(session.user.id, "admin");
        if (cancelled) return;
        setStatus(isAdmin ? "authed" : "forbidden");
      } catch {
        if (!cancelled) setStatus("unauthed");
      }
    }

    check();

    const { data: sub } = authService.onAuthStateChange(() => {
      check();
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [requireAdmin]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status === "unauthed") {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  if (status === "forbidden") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
