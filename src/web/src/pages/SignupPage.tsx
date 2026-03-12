import { Navigate } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";

/** Sign-up page — redirects authenticated users to /dashboard. */
export function SignupPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-muted-foreground">Sign up page (coming soon)</p>
    </div>
  );
}
