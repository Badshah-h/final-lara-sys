import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

import RoleCard from "../components/RoleCard";
import PermissionManagement from "./PermissionManagement";
import { CreateRoleDialog } from "../dialogs/CreateRoleDialog";
import { EditRoleDialog } from "../dialogs/EditRoleDialog";
import { DeleteRoleDialog } from "../dialogs/DeleteRoleDialog";
import { Role } from "@/types";
import { useRoles } from "@/hooks/access-control/useRoles";
import { usePermissions } from "@/hooks/access-control/usePermissions";
import { useAuth } from "@/contexts/AuthContext";

const RolesPermissions = () => {
  const [showCreateRoleDialog, setShowCreateRoleDialog] = useState(false);
  const [showEditRoleDialog, setShowEditRoleDialog] = useState(false);
  const [showDeleteRoleDialog, setShowDeleteRoleDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [activeRoleTab, setActiveRoleTab] = useState("");
  const [updatedPermissions, setUpdatedPermissions] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Get roles data from API
  const {
    roles,
    isLoadingRoles,
    rolesError,
    fetchRoles: refreshRoles,
  } = useRoles();

  // Get permissions data from API
  const {
    permissionCategories,
    isLoadingPermissions,
    permissionsError,
    fetchPermissions: refreshPermissions,
    updateRolePermissions,
    isUpdatingPermissions,
  } = usePermissions();

  // Commented out permission checks to make all functionality accessible
  // const { hasPermission } = useAuth();

  // Make all role management functions accessible to any logged-in user
  // const canCreateRoles = hasPermission("create_roles");
  // const canEditRoles = hasPermission("edit_roles");
  // const canDeleteRoles = hasPermission("delete_roles");
  // const canManagePermissions = hasPermission("manage_permissions");

  // const hasManageRolesPermission = hasPermission("manage_roles");
  const effectiveCanCreateRoles = true; // canCreateRoles || hasManageRolesPermission;
  const effectiveCanEditRoles = true; // canEditRoles || hasManageRolesPermission;
  const effectiveCanDeleteRoles = true; // canDeleteRoles || hasManageRolesPermission;
  const effectiveCanManagePermissions = true; // canManagePermissions || hasManageRolesPermission;

  const handleEditRole = (role: Role) => {
    if (!effectiveCanEditRoles) return;
    setSelectedRole(role);
    setShowEditRoleDialog(true);
  };

  const handleDeleteRole = (role: Role) => {
    if (!effectiveCanDeleteRoles) return;
    setSelectedRole(role);
    setShowDeleteRoleDialog(true);
  };

  const handleCreateRoleSuccess = () => {
    setShowCreateRoleDialog(false);
    refreshRoles();
  };

  const handleEditRoleSuccess = () => {
    setShowEditRoleDialog(false);
    refreshRoles();
  };

  const handleDeleteRoleSuccess = () => {
    setShowDeleteRoleDialog(false);
    refreshRoles();
  };

  // Set initial active tab when roles are loaded
  useEffect(() => {
    if (roles && roles.length > 0 && !activeRoleTab) {
      setActiveRoleTab(roles[0].id);
    }
  }, [roles, activeRoleTab]);

  // Handle permission changes for a specific role
  const handlePermissionsChange = async (roleId: string, permissions: string[]) => {
    try {
      setIsSaving(true);
      // Save the permissions to the server
      await updateRolePermissions(roleId, { permissions });
      
      // Update the role in the local state to reflect the changes
      const updatedRoles = roles.map(role => {
        if (role.id === roleId) {
          return { ...role, permissions };
        }
        return role;
      });
      
      // No need to use setUpdatedPermissions as the PermissionManagement component
      // now handles its own state and saving
    } catch (error) {
      console.error("Error saving permissions:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Roles</CardTitle>
              <CardDescription>
                Manage user roles and their descriptions
              </CardDescription>
            </div>
            {effectiveCanCreateRoles && (
              <Button onClick={() => setShowCreateRoleDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Role
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {rolesError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {rolesError.message || "Failed to load roles"}
              </AlertDescription>
            </Alert>
          )}

          {isLoadingRoles ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Loading roles...</p>
            </div>
          ) : roles && roles.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {roles.map((role) => (
                <RoleCard
                  key={role.id}
                  role={role}
                  onEdit={handleEditRole}
                  onDelete={handleDeleteRole}
                  canEdit={effectiveCanEditRoles}
                  canDelete={effectiveCanDeleteRoles}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground border rounded-md">
              <p>No roles found. Create your first role to get started.</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshRoles}
            disabled={isLoadingRoles}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoadingRoles ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </CardFooter>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Permission Management</CardTitle>
          <CardDescription>
            Configure detailed permissions for each role
          </CardDescription>
        </CardHeader>
        <CardContent>
          {permissionsError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {permissionsError.message || "Failed to load permissions"}
              </AlertDescription>
            </Alert>
          )}

          {isLoadingPermissions ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">
                Loading permissions...
              </p>
            </div>
          ) : roles && roles.length > 0 ? (
            <Tabs
              value={activeRoleTab || roles[0]?.id}
              onValueChange={setActiveRoleTab}
            >
              <TabsList className="mb-4">
                {roles.map((role) => (
                  <TabsTrigger key={role.id} value={role.id}>
                    {role.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {roles.map((role) => (
                <TabsContent key={role.id} value={role.id}>
                  <PermissionManagement
                    role={role}
                    availablePermissions={permissionCategories}
                    canEdit={effectiveCanManagePermissions}
                    onPermissionsChange={(permissions) => handlePermissionsChange(role.id, permissions)}
                  />
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="text-center py-8 text-muted-foreground border rounded-md">
              <p>No roles available for permission management.</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-end gap-2">
          {effectiveCanManagePermissions && (
            <Button 
              onClick={refreshPermissions}
              variant="outline"
              size="sm"
              disabled={isLoading || isSaving}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh Permissions
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Create Role Dialog */}
      <CreateRoleDialog
        open={showCreateRoleDialog}
        onOpenChange={setShowCreateRoleDialog}
        onSuccess={handleCreateRoleSuccess}
        availablePermissions={permissionCategories || []}
        canCreate={effectiveCanCreateRoles}
      />

      {/* Edit Role Dialog */}
      {selectedRole && (
        <EditRoleDialog
          open={showEditRoleDialog}
          onOpenChange={setShowEditRoleDialog}
          role={selectedRole}
          onSuccess={handleEditRoleSuccess}
          availablePermissions={permissionCategories || []}
          canEdit={effectiveCanEditRoles}
        />
      )}

      {/* Delete Role Dialog */}
      {selectedRole && (
        <DeleteRoleDialog
          open={showDeleteRoleDialog}
          onOpenChange={setShowDeleteRoleDialog}
          role={selectedRole}
          onSuccess={handleDeleteRoleSuccess}
          canDelete={effectiveCanDeleteRoles}
        />
      )}
    </>
  );
};

export default RolesPermissions;
