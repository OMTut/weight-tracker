import { useState } from "react";
import { Navigate, Link } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { login as loginApi } from "@/lib/apiService";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const emailValidator = z.string().email("Invalid email");
const passwordValidator = z.string().min(1, "Password is required");

/** Validates a field value with a Zod schema; returns error string or undefined. */
function validate<T>(schema: z.ZodType<T>, value: T): string | undefined {
  const result = schema.safeParse(value);
  return result.success ? undefined : result.error.issues[0].message;
}

/** Login page — redirects authenticated users to /dashboard. */
export function LoginPage() {
  const { user, isLoading, login } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { email: "", password: "" },
    onSubmit: async ({ value }) => {
      setApiError(null);
      try {
        const res = await loginApi(value.email, value.password);
        login(res.access_token, res.user);
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response
          ?.status;
        setApiError(
          status === 401
            ? "Invalid email or password."
            : "Something went wrong, please try again.",
        );
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">HeavyDeets</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="flex flex-col gap-4"
          >
            {/* Email */}
            <form.Field
              name="email"
              validators={{
                onBlur: ({ value }) => validate(emailValidator, value),
              }}
            >
              {(field) => (
                <div className="flex flex-col gap-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-destructive text-sm">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            {/* Password */}
            <form.Field
              name="password"
              validators={{
                onBlur: ({ value }) => validate(passwordValidator, value),
              }}
            >
              {(field) => (
                <div className="flex flex-col gap-1">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Your password"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-destructive text-sm">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            {/* API error */}
            {apiError && (
              <p className="text-destructive text-sm text-center">{apiError}</p>
            )}

            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? "Signing in…" : "Sign In"}
                </Button>
              )}
            </form.Subscribe>

            <p className="text-muted-foreground text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="text-primary underline">
                Sign up
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
