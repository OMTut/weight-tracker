import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { AxiosError } from "axios";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { updateProfile, updatePassword } from "@/lib/apiService";

/** Account Info page — user profile management with sections for each setting. */
export function AccountPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  // Display name form state
  const [nameValue, setNameValue] = useState(user?.name ?? "");
  const [nameError, setNameError] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);

  // Email form state
  const [emailValue, setEmailValue] = useState(user?.email ?? "");
  const [emailError, setEmailError] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);

  /** Handle display name form submission. */
  async function handleNameSave(e: React.FormEvent) {
    e.preventDefault();
    setNameError("");
    if (!nameValue.trim()) {
      setNameError("Name is required");
      return;
    }
    setNameSaving(true);
    try {
      const updated = await updateProfile({ name: nameValue.trim() });
      updateUser(updated);
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 2000);
    } catch {
      setNameError("Failed to update name. Please try again.");
    } finally {
      setNameSaving(false);
    }
  }

  // Password form state
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);

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

  /** Handle password form submission. */
  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    if (!currentPw) {
      setPwError("Current password is required");
      return;
    }
    if (newPw.length < 8) {
      setPwError("New password must be at least 8 characters");
      return;
    }
    if (newPw !== confirmPw) {
      setPwError("Passwords do not match");
      return;
    }
    setPwSaving(true);
    try {
      await updatePassword(currentPw, newPw);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setPwSuccess(true);
      setTimeout(() => setPwSuccess(false), 2000);
    } catch (err) {
      const status = (err as AxiosError)?.response?.status;
      setPwError(
        status === 400
          ? "Current password is incorrect"
          : "Failed to update password. Please try again.",
      );
    } finally {
      setPwSaving(false);
    }
  }

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
              <form onSubmit={handleNameSave} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="display-name">Name</Label>
                  <Input
                    id="display-name"
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    placeholder="Your name"
                  />
                  {nameError && (
                    <p className="text-destructive text-sm">{nameError}</p>
                  )}
                  {nameSuccess && (
                    <p className="text-sm text-green-600">Saved!</p>
                  )}
                </div>
                <Button type="submit" disabled={nameSaving}>
                  {nameSaving ? "Saving…" : "Save"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Email Address */}
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

          {/* Password */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSave} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                  />
                </div>
                {pwError && (
                  <p className="text-destructive text-sm">{pwError}</p>
                )}
                {pwSuccess && (
                  <p className="text-sm text-green-600">Password updated!</p>
                )}
                <Button type="submit" disabled={pwSaving}>
                  {pwSaving ? "Saving…" : "Save"}
                </Button>
              </form>
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
