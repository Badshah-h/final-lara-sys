import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Loader2 } from "lucide-react";
import { useRoleManagement } from "@/hooks/access-control/useRoleManagement";
import { usePermissionManagement } from "@/hooks/access-control/usePermissionManagement";
import { Role } from "@/types";
import { CreateRoleDialog, DeleteRoleDialog, EditRoleDialog } from "../dialogs";
import RoleCard from "../components/RoleCard.js";

const RolesPermissions = () => {
  const [activeTab, setActiveTab] = useState("roles");
  const [showCreateRoleDialog, setShowCreateRoleDialog] = useState(false);
  const [showEditRoleDialog, setShowEditRoleDialog] = useState(false);
  const [showDeleteRoleDialog, setShowDeleteRoleDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Get roles data
  const {
    roles,
    isLoadingRoles,
    rolesError,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole
  } = useRoleManagement();

  // Get permission categories
  const {
    permissionCategories,
    isLoadingPermissions,
    permissionsError,
    fetchPermissionCategories
  } = usePermissionManagement();

  // Use isLoading to combine both loading states
  const isLoading = isLoadingRoles || isLoadingPermissions;
  // Handle error state
  const error = rolesError || permissionsError;

  // Load data on component mount - call functions directly without dependencies
  useEffect(() => {
    fetchRoles();
    fetchPermissionCategories();
  }, []); // Empty dependency array to run only on mount

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setShowEditRoleDialog(true);
  };

  const handleDeleteRole = (role: Role) => {
    setSelectedRole(role);
    setShowDeleteRoleDialog(true);
  };

  const handleCreateRole = async (name: string, description: string, permissions: string[]) => {
    try {
      await createRole(name, description, permissions);
      setShowCreateRoleDialog(false);
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  };

  const handleUpdateRole = async (id: string, name: string, description: string, permissions: string[]) => {
    try {
      await updateRole(id, name, description, permissions);
      setShowEditRoleDialog(false);
      setSelectedRole(null);
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  };

  const handleDeleteRoleConfirm = async (id: string) => {
    try {
      await deleteRole(id);
      setShowDeleteRoleDialog(false);
      setSelectedRole(null);
    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Roles & Permissions</h2>
          <p className="text-muted-foreground">
            Manage user roles and their associated permissions
          </p>
        </div>
        <Button onClick={() => setShowCreateRoleDialog(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Role
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
          <p className="font-medium">Error loading data</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          {isLoadingRoles ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2">Loading roles...</span>
            </div>
          ) : roles && roles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles.map((role) => (
                <RoleCard
                  key={role.id}
                  role={role}
                  onEdit={() => handleEditRole(role)}
                  onDelete={() => handleDeleteRole(role)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No roles found. Create your first role to get started.
            </div>
          )}
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="text-lg font-medium mb-4">Available Permissions</h3>
            {isLoadingPermissions ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2">Loading permissions...</span>
              </div>
            ) : permissionCategories && permissionCategories.length > 0 ? (
              <div className="space-y-6">
                {permissionCategories.map((category) => (
                  <div key={category.id} className="space-y-2">
                    <h4 className="font-medium text-md">{category.category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {category.permissions.map((permission) => (
                        <div
                          key={permission.id}
                          className="p-2 border rounded-md"
                        >
                          <p className="font-medium">{permission.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {permission.description ||
                              "No description available"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No permissions found.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <CreateRoleDialog
        open={showCreateRoleDialog}
        onOpenChange={setShowCreateRoleDialog}
        permissionCategories={permissionCategories}
        onCreateRole={handleCreateRole}
      />

      {selectedRole && (
        <>
          <EditRoleDialog
            role={selectedRole}
            open={showEditRoleDialog}
            onOpenChange={setShowEditRoleDialog}
            permissionCategories={permissionCategories}
            onSave={handleUpdateRole}
          />
          <DeleteRoleDialog
            role={selectedRole}
            open={showDeleteRoleDialog}
            onOpenChange={setShowDeleteRoleDialog}
            onDelete={() => handleDeleteRoleConfirm(selectedRole.id)}
          />
        </>
      )}
    </div>
  );
};

export default RolesPermissions;
