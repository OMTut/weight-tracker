import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { deleteAccount } from "@/lib/apiService";

/** Danger Zone card — delete account with a confirmation dialog. */
export function DeleteAccountCard() {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  /** Call DELETE /api/user/me and logout on success. */
  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      await deleteAccount();
      logout();
    } catch {
      setDeleting(false);
      setOpen(false);
      setDeleteError("Failed to delete account. Please try again.");
    }
  }

  return (
    <>
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-base text-destructive">
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all weight data. This cannot be
            undone.
          </p>
          {deleteError && (
            <p className="text-destructive text-sm">{deleteError}</p>
          )}
          <Button variant="destructive" onClick={() => setOpen(true)}>
            Delete Account
          </Button>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This will permanently delete your account and all weight entries.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
