import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteAccountCard } from "@/components/account/DeleteAccountCard";
import { DisplayNameForm } from "@/components/account/DisplayNameForm";
import { EmailForm } from "@/components/account/EmailForm";
import { PasswordForm } from "@/components/account/PasswordForm";
import { WeightUnitForm } from "@/components/account/WeightUnitForm";

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
          <DisplayNameForm />
          <EmailForm />
          <PasswordForm />
          <WeightUnitForm />
          <DeleteAccountCard />
        </div>
      </main>
    </div>
  );
}
