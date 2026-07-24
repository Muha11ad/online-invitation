"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";

export function ConfirmDeleteDialog({
  slug,
  husbandName,
  wifeName,
  onDeleted,
}: ConfirmDeleteDialogProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm(): Promise<void> {
    setDeleting(true);
    setError(null);

    const response = await fetch(`/api/admin/weddings/${slug}`, { method: "DELETE" });

    setDeleting(false);
    if (!response.ok) {
      setError("Failed to delete. Try again.");
      return;
    }

    setOpen(false);
    toast.success("Invitation deleted.");
    onDeleted();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive" size="sm" />}>Delete</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete invitation?</DialogTitle>
          <DialogDescription>
            This will permanently delete the invitation for {husbandName} & {wifeName} ({slug}).
            This action cannot be undone and the public link will stop working immediately.
          </DialogDescription>
        </DialogHeader>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button variant="destructive" onClick={handleConfirm} disabled={deleting}>
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ConfirmDeleteDialogProps {
  slug: string;
  husbandName: string;
  wifeName: string;
  onDeleted: () => void;
}
