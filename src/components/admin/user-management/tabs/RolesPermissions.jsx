import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import RoleCard from "../components/RoleCard";
import CreateRoleDialog from "../dialogs/CreateRoleDialog";
import EditRoleDialog from "../dialogs/EditRoleDialog";
import DeleteRoleDialog from "../dialogs/DeleteRoleDialog";

// Mock data for development
const mockRoles = [
  {
    id: "admin",
    name: "Administrator",
    description: "Full system access with all permissions",
    permissions: [
      "create_users",
      "edit_users",
      "delete_users",
      "view_users",
      "manage_ai_models",
      "edit_prompts",
      "create_widgets",
      "edit_widgets",
      "manage_kb_articles",
      "system_backup",
    ],
    userCount: 2,
  },
  {
    id: "editor",
    name: "Content Editor",
    description: "Can manage content but not users or system settings",
    permissions: [
      "view_users",
      "edit_prompts",
      "create_widgets",
      "edit_widgets",
      "manage_kb_articles",
    ],
    userCount: 5,
  },
  {
    id: "viewer",
    name: "Viewer",
    description: "Read-only access to the system",
    permissions: ["view_users"],
    userCount: 12,
  },
];

const RolesPermissions = () => {
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch roles
  useEffect(() => {
    const fetchRoles = async () => {
      setIsLoading(true);
      try {
        // In production, this would be an API call
        // const response = await fetch('/api/roles');
        // const data = await response.json();
        // setRoles(data);

        // For development, use mock data
        setTimeout(() => {
          setRoles(mockRoles);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error("Error fetching roles:", error);
        toast({
          title: "Error",
          description: "Failed to fetch roles. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    fetchRoles();
  }, []);

  // Select the first role by default when roles are loaded
  useEffect(() => {
    if (roles.length > 0 && !selectedRole) {
      setSelectedRole(roles[0]);
    }
  }, [roles, selectedRole]);

  const handleEditRole = (role) => {
    setSelectedRole(role);
    setEditDialogOpen(true);
  };

  const handleDeleteRole = (role) => {
    setSelectedRole(role);
    setDeleteDialogOpen(true);
  };

  const handleRoleCreated = () => {
    // In production, this would refetch roles from the API
    // For development, simulate adding a new role
    const newRole = {
      id: `role-${Date.now()}`,
      name: "New Role",
      description: "Newly created role",
      permissions: [],
      userCount: 0,
    };
    setRoles([...roles, newRole]);
  };

  const handleRoleUpdated = () => {
    // In production, this would refetch roles from the API
    // For development, do nothing as the mock data doesn't change
    toast({
      title: "Role updated",
      description: "Role has been updated successfully.",
    });
  };

  const handleRoleDeleted = () => {
    // In production, this would refetch roles from the API
    // For development, simulate removing the role
    if (selectedRole) {
      setRoles(roles.filter((r) => r.id !== selectedRole.id));
      setSelectedRole(null);
      toast({
        title: "Role deleted",
        description: "Role has been deleted successfully.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Roles & Permissions</h2>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Role
        </Button>
      </div>

      <Tabs defaultValue="roles">
        <TabsList>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-6 pt-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                onEdit={handleEditRole}
                onDelete={handleDeleteRole}
              />
            ))}

            {roles.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No roles found. Create your first role to get started.
                  </p>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Create Role
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6 pt-4">
          <Card>
            <CardContent className="pt-6">
              {roles.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {roles.map((role) => (
                      <Button
                        key={role.id}
                        variant={
                          selectedRole?.id === role.id ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setSelectedRole(role)}
                      >
                        {role.name}
                      </Button>
                    ))}
                  </div>

                  {selectedRole && (
                    <div className="space-y-6 mt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-semibold">
                            {selectedRole.name} Permissions
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Configure permissions for this role
                          </p>
                        </div>
                        <Button onClick={() => handleEditRole(selectedRole)}>
                          Edit Permissions
                        </Button>
                      </div>

                      <div className="grid gap-4">
                        {selectedRole.permissions &&
                        selectedRole.permissions.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {selectedRole.permissions.map((permission) => (
                              <div
                                key={permission}
                                className="flex items-start gap-2"
                              >
                                <div className="w-4 h-4 mt-1 rounded-full bg-green-500" />
                                <div>
                                  <p className="font-medium text-sm">
                                    {typeof permission === "string"
                                      ? permission
                                          .split("_")
                                          .map(
                                            (word) =>
                                              word.charAt(0).toUpperCase() +
                                              word.slice(1),
                                          )
                                          .join(" ")
                                      : permission.name}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">
                            No permissions assigned to this role.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No roles found. Create a role to manage permissions.
                  </p>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Create Role
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateRoleDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onRoleCreated={handleRoleCreated}
      />

      {selectedRole && (
        <>
          <EditRoleDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            role={selectedRole}
            onRoleUpdated={handleRoleUpdated}
          />

          <DeleteRoleDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            role={selectedRole}
            onSuccess={handleRoleDeleted}
          />
        </>
      )}
    </div>
  );
};

export default RolesPermissions;
