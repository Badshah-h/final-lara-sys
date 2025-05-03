import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { PermissionCategory } from "../../../../types";
import PermissionGroup from "../components/PermissionGroup";
import { useRoles } from "@/hooks/access-control/useRoles";

interface CreateRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availablePermissions: PermissionCategory[];
  onSuccess?: () => void;
  canCreate?: boolean;
}

export function CreateRoleDialog({
  open,
  onOpenChange,
  availablePermissions,
  onSuccess,
  canCreate = true,
}: CreateRoleDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    permissions: [],
  });
  const { createRole } = useRoles();

  const handleCreateRole = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await createRole({
        name: newRole.name,
        description: newRole.description,
        permissions: newRole.permissions,
      });
      if (onSuccess) onSuccess();
      onOpenChange(false);
      setNewRole({ name: "", description: "", permissions: [] });
    } catch (err: any) {
      setError(err?.message || "Failed to create role.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Role</DialogTitle>
          <DialogDescription>
            Define a new role and assign permissions.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <div className="space-y-4 py-4 overflow-hidden flex flex-col h-full">
            <div className="space-y-2">
              <Label htmlFor="role-name">Role Name</Label>
              <Input
                id="role-name"
                placeholder="e.g., Content Manager"
                value={newRole.name}
                onChange={(e) =>
                  setNewRole({ ...newRole, name: e.target.value })
                }
                disabled={!canCreate}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-description">Description</Label>
              <Textarea
                id="role-description"
                placeholder="Describe the purpose and responsibilities of this role"
                value={newRole.description}
                onChange={(e) =>
                  setNewRole({ ...newRole, description: e.target.value })
                }
                className="resize-none"
                disabled={!canCreate}
              />
            </div>
            <div className="space-y-2 flex-1 overflow-hidden">
              <Label>Permissions</Label>
              <div className="border rounded-md overflow-hidden flex-1">
                <ScrollArea className="h-[300px] pr-4">
                  <div className="p-4 space-y-6">
                    {availablePermissions.map((category) => (
                      <PermissionGroup
                        key={category.category}
                        category={category}
                        selectedPermissions={newRole.permissions}
                        setStateFunction={setNewRole}
                        currentState={newRole}
                        idPrefix="create"
                      />
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
            {error && <div className="text-destructive text-sm mb-2">{error}</div>}
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
          <Button
            onClick={handleCreateRole}
            disabled={isSubmitting || !newRole.name.trim() || !canCreate}
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 mr-2 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                Creating...
              </>
            ) : (
              "Create Role"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateRoleDialog;
