import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

// Assumes it runs inside <RequireAuth>, so `user` is always set here.
export function RequireVerifiedEmail({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  if (user && !user.email_verified) {
    return <Navigate to="/verify-email" replace />;
  }

  return <>{children}</>;
}
