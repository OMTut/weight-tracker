import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { updatePreferences } from "@/lib/apiService";

/** Weight Unit card — lets the user switch between lbs and kg. */
export function WeightUnitForm() {
  const { user, updateUser } = useAuth();
  const [unitValue, setUnitValue] = useState<"lbs" | "kg">(
    user?.weight_unit ?? "lbs",
  );
  const [unitSaving, setUnitSaving] = useState(false);
  const [unitSuccess, setUnitSuccess] = useState(false);
  const [unitError, setUnitError] = useState("");

  /** Handle weight unit preference save. */
  async function handleUnitSave() {
    setUnitError("");
    setUnitSaving(true);
    try {
      const updated = await updatePreferences(unitValue);
      updateUser(updated);
      setUnitSuccess(true);
      setTimeout(() => setUnitSuccess(false), 2000);
    } catch {
      setUnitError("Failed to save preferences. Please try again.");
    } finally {
      setUnitSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Weight Unit</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Select
            value={unitValue}
            onValueChange={(v) => setUnitValue(v as "lbs" | "kg")}
          >
            <SelectTrigger aria-label="Weight unit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lbs">Pounds (lbs)</SelectItem>
              <SelectItem value="kg">Kilograms (kg)</SelectItem>
            </SelectContent>
          </Select>
          {unitError && <p className="text-destructive text-sm">{unitError}</p>}
          {unitSuccess && (
            <p className="text-sm text-green-600">Preferences saved!</p>
          )}
          <Button onClick={handleUnitSave} disabled={unitSaving}>
            {unitSaving ? "Saving…" : "Save"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
