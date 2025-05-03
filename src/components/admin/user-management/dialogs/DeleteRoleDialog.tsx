import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Role } from "../../../../types";

interface DeleteRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role;
  onSuccess?: () => void;
  canDelete?: boolean;
}

export function DeleteRoleDialog({
  open,
  onOpenChange,
  role,
  onSuccess,
  canDelete = true,
}: DeleteRoleDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeleteRole = async () => {
    if (!canDelete) return;

    setIsSubmitting(true);
    try {
      // Make actual API call to delete the role
      await fetch(`/api/roles/${role.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN":
            document
              .querySelector('meta[name="csrf-token"]')
              ?.getAttribute("content") || "",
        },
        credentials: "include",
      });

      if (onSuccess) {
        onSuccess();
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting role:", error);
      toast({
        title: "Error",
        description: "Failed to delete role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Role</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the role "{role.name}"? This action
            cannot be undone.
            {role.userCount > 0 && (
              <div className="mt-2 flex items-center text-destructive">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span>
                  This role is currently assigned to {role.userCount} users.
                  They will need to be reassigned.
                </span>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteRole}
            disabled={isSubmitting || !canDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 mr-2 rounded-full border-2 border-t-transparent border-current animate-spin"></div>
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteRoleDialog;
