import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Loader2 } from "lucide-react";
import RoleCard from "@/components/admin/user-management/components/RoleCard";
import { useRoles } from "@/hooks/access-control/useRoles";
import { usePermissions } from "@/hooks/access-control/usePermissions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CreateRoleDialog,
  EditRoleDialog,
  DeleteRoleDialog,
} from "@/components/admin/user-management/dialogs";

const RolesPermissionsStoryboard = () => {
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("roles");

  // Fetch roles data from API
  const {
    roles,
    isLoading: isLoadingRoles,
    error: rolesError,
    refetchRoles,
  } = useRoles();

  // Fetch permissions data from API
  const {
    permissions,
    isLoading: isLoadingPermissions,
    error: permissionsError,
  } = usePermissions();

  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [isDeleteRoleOpen, setIsDeleteRoleOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);

  const handleEditRole = (role) => {
    setSelectedRole(role);
    setIsEditRoleOpen(true);
  };

  const handleDeleteRole = (role) => {
    setSelectedRole(role);
    setIsDeleteRoleOpen(true);
  };

  const handleDeleteRoleSuccess = () => {
    setIsDeleteRoleOpen(false);
    refetchRoles(); // Refresh the roles list after deletion
  };

  const handleEditRoleSuccess = () => {
    setIsEditRoleOpen(false);
    refetchRoles(); // Refresh the roles list after editing
  };

  const handleCreateRoleSuccess = () => {
    setIsCreateRoleOpen(false);
    refetchRoles(); // Refresh the roles list after creation
  };

  return (
    <div className="bg-background min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Roles & Permissions</h1>
            <p className="text-muted-foreground">
              Manage user roles and their permissions
            </p>
          </div>
          <Button onClick={() => setIsCreateRoleOpen(true)}>
            <Shield className="mr-2 h-4 w-4" /> Create Role
          </Button>
        </div>

        <Tabs
          defaultValue="roles"
          className="w-full"
          onValueChange={(value) => setActiveTab(value)}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="space-y-4 mt-6">
            {rolesError && (
              <Alert variant="destructive">
                <AlertDescription>
                  Error loading roles: {rolesError.message}
                </AlertDescription>
              </Alert>
            )}

            {isLoadingRoles ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading roles...</span>
              </div>
            ) : roles && roles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map((role) => (
                  <RoleCard
                    key={role.id}
                    role={role}
                    onEdit={handleEditRole}
                    onDelete={handleDeleteRole}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-md">
                <p className="text-muted-foreground">
                  No roles found. Create your first role to get started.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="permissions" className="mt-6">
            {permissionsError && (
              <Alert variant="destructive">
                <AlertDescription>
                  Error loading permissions: {permissionsError.message}
                </AlertDescription>
              </Alert>
            )}

            {isLoadingPermissions ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading permissions...</span>
              </div>
            ) : permissions && permissions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {permissions.map((permission) => (
                  <Card key={permission.id}>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <span>{permission.name}</span>
                        <Badge variant="outline">{permission.id}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        {permission.description || "No description available"}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-md">
                <p className="text-muted-foreground">No permissions found.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <CreateRoleDialog
        open={isCreateRoleOpen}
        onOpenChange={setIsCreateRoleOpen}
        onSuccess={handleCreateRoleSuccess}
        availablePermissions={permissions || []}
      />

      <EditRoleDialog
        open={isEditRoleOpen}
        onOpenChange={setIsEditRoleOpen}
        role={selectedRole}
        onSuccess={handleEditRoleSuccess}
      />

      <DeleteRoleDialog
        open={isDeleteRoleOpen}
        onOpenChange={setIsDeleteRoleOpen}
        role={selectedRole}
        onSuccess={handleDeleteRoleSuccess}
      />
    </div>
  );
};

export default RolesPermissionsStoryboard;
