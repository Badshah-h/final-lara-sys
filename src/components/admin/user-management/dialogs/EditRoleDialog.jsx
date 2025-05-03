import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const EditRoleDialog = ({ open, onOpenChange, role, onRoleUpdated }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editedRole, setEditedRole] = useState({
    name: "",
    description: "",
    permissions: [],
  });

  // Initialize form with role data when it changes
  useEffect(() => {
    if (role) {
      setEditedRole({
        name: role.name || "",
        description: role.description || "",
        permissions: Array.isArray(role.permissions)
          ? role.permissions.map((p) => (typeof p === "string" ? p : p.id))
          : [],
      });
    }
  }, [role]);

  const handleUpdateRole = async () => {
    if (!editedRole.name.trim()) {
      toast({
        title: "Role name required",
        description: "Please enter a name for the role.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Make actual API call to update the role
      const response = await fetch(`/api/roles/${role.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN":
            document
              .querySelector('meta[name="csrf-token"]')
              ?.getAttribute("content") || "",
        },
        credentials: "include",
        body: JSON.stringify(editedRole),
      });

      if (!response.ok) {
        throw new Error("Failed to update role");
      }

      toast({
        title: "Role updated",
        description: `Role "${editedRole.name}" has been updated successfully.`,
      });

      // Close dialog
      onOpenChange(false);

      // Notify parent component
      if (onRoleUpdated) {
        onRoleUpdated();
      }
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error updating role",
        description: "There was a problem updating the role.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Role</DialogTitle>
          <DialogDescription>
            Update role details and permissions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Role Name</Label>
            <Input
              id="edit-name"
              placeholder="Enter role name"
              value={editedRole.name}
              onChange={(e) =>
                setEditedRole({ ...editedRole, name: e.target.value })
              }
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              placeholder="Enter role description"
              value={editedRole.description}
              onChange={(e) =>
                setEditedRole({ ...editedRole, description: e.target.value })
              }
              disabled={isSubmitting}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleUpdateRole} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Role"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditRoleDialog;
