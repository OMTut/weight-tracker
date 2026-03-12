import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { createWeightEntry } from "@/lib/apiService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface WeightEntryFormProps {
  weightUnit: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const weightSchema = z.coerce
  .number({ message: "Please enter a number" })
  .positive("Weight must be positive");

/** Inline form for logging a new weight entry. */
export function WeightEntryForm({
  weightUnit,
  onSuccess,
  onCancel,
}: WeightEntryFormProps) {
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { weight_value: "" },
    onSubmit: async ({ value }) => {
      setApiError(null);
      const parsed = weightSchema.safeParse(value.weight_value);
      if (!parsed.success) {
        setApiError(parsed.error.issues[0].message);
        return;
      }
      try {
        await createWeightEntry(parsed.data);
        onSuccess();
      } catch {
        setApiError("Failed to save entry. Please try again.");
      }
    },
  });

  return (
    <div className="border-b bg-muted/30 px-4 py-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="flex items-end gap-3"
      >
        <div className="flex flex-col gap-1">
          <Label htmlFor="weight-value">Weight ({weightUnit})</Label>
          <form.Field name="weight_value">
            {(field) => (
              <div className="flex flex-col gap-1">
                <Input
                  id="weight-value"
                  type="number"
                  step="0.1"
                  placeholder="e.g. 175.5"
                  className="w-36"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-destructive text-xs">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>
        </div>

        {apiError && (
          <p className="text-destructive mb-1 text-xs">{apiError}</p>
        )}

        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" disabled={isSubmitting} size="sm">
              {isSubmitting ? "Saving…" : "Submit"}
            </Button>
          )}
        </form.Subscribe>

        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </form>
    </div>
  );
}
