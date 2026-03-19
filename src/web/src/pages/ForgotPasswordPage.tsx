import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { resetPassword } from "@/lib/apiService";
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
const passwordValidator = z.string().min(8, "Password must be at least 8 characters");

/** Validates a field value with a Zod schema; returns error string or undefined. */
function validate<T>(schema: z.ZodType<T>, value: T): string | undefined {
  const result = schema.safeParse(value);
  return result.success ? undefined : result.error.issues[0].message;
}

/**
 * Forgot password page — two steps.
 * Step 1: user enters their email.
 * Step 2: user sets a new password. On submit the API resets the password
 *         if the email exists, or returns an error so they can correct their email.
 */
export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  /** Called by PasswordStep on 404 — return to step 1 with an error message. */
  function handleEmailNotFound() {
    setEmailError("No account found with that email.");
    setStep(1);
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Password Reset</CardTitle>
            <CardDescription>Your password has been updated.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link to="/login" className="text-primary underline text-sm">
              Back to sign in
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>
            {step === 1
              ? "Enter the email address for your account."
              : "Choose a new password for your account."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <EmailStep
              emailError={emailError}
              onNext={(e) => { setEmail(e); setEmailError(null); setStep(2); }}
            />
          ) : (
            <PasswordStep
              email={email}
              onBack={() => setStep(1)}
              onEmailNotFound={handleEmailNotFound}
              onDone={() => setDone(true)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/** Step 1 — collect email. */
function EmailStep({
  emailError,
  onNext,
}: {
  emailError: string | null;
  onNext: (email: string) => void;
}) {
  const form = useForm({
    defaultValues: { email: "" },
    onSubmit: ({ value }) => {
      onNext(value.email);
    },
  });

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}
      className="flex flex-col gap-4"
    >
      <form.Field
        name="email"
        validators={{ onBlur: ({ value }) => validate(emailValidator, value) }}
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
              <p className="text-destructive text-sm">{field.state.meta.errors[0]}</p>
            )}
            {emailError && (
              <p className="text-destructive text-sm">{emailError}</p>
            )}
          </div>
        )}
      </form.Field>

      <Button type="submit" className="w-full">Continue</Button>

      <p className="text-muted-foreground text-center text-sm">
        Remember your password?{" "}
        <Link to="/login" className="text-primary underline">Sign in</Link>
      </p>
    </form>
  );
}

/** Step 2 — collect new password and submit the reset. */
function PasswordStep({
  email,
  onBack,
  onEmailNotFound,
  onDone,
}: {
  email: string;
  onBack: () => void;
  onEmailNotFound: () => void;
  onDone: () => void;
}) {
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { new_password: "", confirm_password: "" },
    onSubmit: async ({ value }) => {
      if (value.new_password !== value.confirm_password) {
        setApiError("Passwords do not match.");
        return;
      }
      setApiError(null);
      try {
        await resetPassword(email, value.new_password);
        onDone();
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 404) {
          onEmailNotFound();
        } else {
          setApiError("Something went wrong. Please try again.");
        }
      }
    },
  });

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}
      className="flex flex-col gap-4"
    >
      <p className="text-muted-foreground text-sm">
        Setting new password for <span className="text-foreground font-medium">{email}</span>.{" "}
        <button type="button" onClick={onBack} className="text-primary underline">
          Change email
        </button>
      </p>

      <form.Field
        name="new_password"
        validators={{ onBlur: ({ value }) => validate(passwordValidator, value) }}
      >
        {(field) => (
          <div className="flex flex-col gap-1">
            <Label htmlFor="new_password">New Password</Label>
            <Input
              id="new_password"
              type="password"
              placeholder="At least 8 characters"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-destructive text-sm">{field.state.meta.errors[0]}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="confirm_password">
        {(field) => (
          <div className="flex flex-col gap-1">
            <Label htmlFor="confirm_password">Confirm Password</Label>
            <Input
              id="confirm_password"
              type="password"
              placeholder="Repeat your password"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </div>
        )}
      </form.Field>

      {apiError && (
        <p className="text-destructive text-sm text-center">{apiError}</p>
      )}

      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Resetting…" : "Reset Password"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
