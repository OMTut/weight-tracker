import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Account Info page — user profile management with sections for each setting. */
export function AccountPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Sticky top bar */}
      <header className="bg-background sticky top-0 z-10 flex items-center gap-3 border-b px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Back to dashboard"
          onClick={() => navigate({ to: "/dashboard" })}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <span className="text-lg font-semibold">Account Info</span>
      </header>

      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-lg space-y-4">
          {/* Display Name */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Display Name</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Change your display name.
              </p>
            </CardContent>
          </Card>

          {/* Email Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Email Address</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Update the email address associated with your account.
              </p>
            </CardContent>
          </Card>

          {/* Password */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Password</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Change your account password.
              </p>
            </CardContent>
          </Card>

          {/* Weight Unit */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Weight Unit</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Choose between lbs and kg for logging your weight.
              </p>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-base text-destructive">
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
