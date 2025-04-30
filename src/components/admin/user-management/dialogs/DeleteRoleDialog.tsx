import { useState } from "react";
import { AlertCircle } from "lucide-react";
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
}

export function DeleteRoleDialog({
  open,
  onOpenChange,
  role,
}: DeleteRoleDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeleteRole = () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      // In a real implementation, this would delete the role from the database
      onOpenChange(false);
      setIsSubmitting(false);
    }, 1000);
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
            disabled={isSubmitting}
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
