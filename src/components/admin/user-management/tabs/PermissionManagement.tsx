import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

import { Role, PermissionCategory } from "../../../../types";

interface PermissionManagementProps {
  role: Role;
  availablePermissions: PermissionCategory[];
  canEdit?: boolean;
  onPermissionsChange?: (permissions: string[]) => void;
}

const PermissionManagement = ({
  role,
  availablePermissions,
  canEdit = true,
  onPermissionsChange,
}: PermissionManagementProps) => {
  // State for permissions and saving status
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Extract role permissions as strings
  const extractRolePermissions = () => {
    if (!role || !role.permissions) return [];
    
    if (Array.isArray(role.permissions)) {
      return role.permissions
        .filter(p => p !== null && p !== undefined)
        .map(p => {
          if (typeof p === 'string') return p;
          if (p && typeof p === 'object' && 'id' in p) return (p as {id: string}).id;
          return null;
        })
        .filter(p => p !== null) as string[];
    }
    
    return [];
  };
  
  // Initialize permissions when role changes
  useEffect(() => {
    const rolePerms = extractRolePermissions();
    setPermissions(rolePerms);
    setHasChanges(false);
  }, [role]);

  // Update parent component when permissions change
  useEffect(() => {
    if (onPermissionsChange && hasChanges) {
      onPermissionsChange(permissions);
    }
  }, [permissions, onPermissionsChange, hasChanges]);

  const hasPermission = (permissionId: string) => {
    return permissions.includes(permissionId);
  };

  const togglePermission = (permissionId: string) => {
    if (!canEdit) return;
    
    let newPermissions;
    if (hasPermission(permissionId)) {
      newPermissions = permissions.filter((id) => id !== permissionId);
    } else {
      newPermissions = [...permissions, permissionId];
    }
    
    setPermissions(newPermissions);
    setHasChanges(true);
  };
  
  // Save changes directly from this component
  const handleSaveChanges = async () => {
    if (!hasChanges || !onPermissionsChange) return;
    
    setIsSaving(true);
    try {
      // Call the parent's onPermissionsChange to trigger save
      onPermissionsChange(permissions);
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving permissions:", error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Reset permissions to original state
  const handleResetChanges = () => {
    const rolePerms = extractRolePermissions();
    setPermissions(rolePerms);
    setHasChanges(false);
  };

  return (
    <div className="space-y-4">
      {/* Save/Reset buttons at the top for better UX */}
      {canEdit && (
        <div className="flex justify-end gap-2 mb-4">
          <Button 
            variant="outline" 
            onClick={handleResetChanges}
            disabled={!hasChanges || isSaving}
          >
            Reset Changes
          </Button>
          <Button 
            onClick={handleSaveChanges}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      )}
      
      {availablePermissions.map((category) => (
        <div key={category.category}>
          <h3 className="text-lg font-medium mb-2">{category.category}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {category.permissions.map((permission) => {
              const isActive = hasPermission(permission.id);
              return (
                <div
                  key={permission.id}
                  className={`flex items-center justify-between border p-3 rounded-md ${isActive ? 'bg-muted/50' : ''}`}
                >
                  <Label 
                    htmlFor={`${role.id}-${permission.id}`}
                    className="flex-1 cursor-pointer"
                  >
                    {permission.name}
                    {permission.description && (
                      <p className="text-xs text-muted-foreground mt-1">{permission.description}</p>
                    )}
                  </Label>
                  <Switch
                    id={`${role.id}-${permission.id}`}
                    checked={isActive}
                    onCheckedChange={() => togglePermission(permission.id)}
                    disabled={!canEdit}
                  />
                </div>
              );
            })}
          </div>
          {category !== availablePermissions[availablePermissions.length - 1] && (
            <Separator className="my-4" />
          )}
        </div>
      ))}
    </div>
  );
};

export default PermissionManagement;
