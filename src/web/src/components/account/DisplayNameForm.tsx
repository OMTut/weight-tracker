import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { updateProfile } from "@/lib/apiService";

/** Display Name card — lets the user change their name. */
export function DisplayNameForm() {
  const { user, updateUser } = useAuth();
  const [nameValue, setNameValue] = useState(user?.name ?? "");
  const [nameError, setNameError] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);

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

  return (
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
            {nameSuccess && <p className="text-sm text-green-600">Saved!</p>}
          </div>
          <Button type="submit" disabled={nameSaving}>
            {nameSaving ? "Saving…" : "Save"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
