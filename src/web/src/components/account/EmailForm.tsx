import { useState } from "react";
import type { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { updateProfile } from "@/lib/apiService";

/** Email Address card — lets the user change their email. */
export function EmailForm() {
  const { user, updateUser } = useAuth();
  const [emailValue, setEmailValue] = useState(user?.email ?? "");
  const [emailError, setEmailError] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);

  /** Handle email form submission. */
  async function handleEmailSave(e: React.FormEvent) {
    e.preventDefault();
    setEmailError("");
    const trimmed = emailValue.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("Invalid email format");
      return;
    }
    setEmailSaving(true);
    try {
      const updated = await updateProfile({ email: trimmed });
      updateUser(updated);
      setEmailSuccess(true);
      setTimeout(() => setEmailSuccess(false), 2000);
    } catch (err) {
      const status = (err as AxiosError)?.response?.status;
      setEmailError(
        status === 400
          ? "Email already in use"
          : "Failed to update email. Please try again.",
      );
    } finally {
      setEmailSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Email Address</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleEmailSave} noValidate className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="text"
              value={emailValue}
              onChange={(e) => setEmailValue(e.target.value)}
              placeholder="your@email.com"
            />
            {emailError && (
              <p className="text-destructive text-sm">{emailError}</p>
            )}
            {emailSuccess && (
              <p className="text-sm text-green-600">Email updated!</p>
            )}
          </div>
          <Button type="submit" disabled={emailSaving}>
            {emailSaving ? "Saving…" : "Save"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
