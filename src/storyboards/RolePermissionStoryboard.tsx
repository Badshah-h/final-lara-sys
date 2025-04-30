import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { roleService } from "@/services/roles/roleService";
import { permissionService } from "@/services/permissions/permissionService";
import {
  Role,
  PermissionCategory,
} from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function RolePermissionStoryboard() {
  const [activeTab, setActiveTab] = useState("roles");
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<PermissionCategory[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Fetch roles and permissions on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const rolesResponse = await roleService.getRoles();
        setRoles(rolesResponse.data);

        const permissionsResponse = await permissionService.getPermissions();
        setPermissions(permissionsResponse.data);
      } catch (error) {
        setResult({
          success: false,
          message:
            error instanceof Error ? error.message : "Failed to fetch data",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRoleSelect = async (roleId: string) => {
    setIsLoading(true);
    try {
      const roleResponse = await roleService.getRole(roleId);
      setSelectedRole(roleResponse.data);

      const permissionsResponse =
        await permissionService.getRolePermissions(roleId);
      setSelectedPermissions(permissionsResponse.data);
    } catch (error) {
      setResult({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch role details",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions([...selectedPermissions, permissionId]);
    } else {
      setSelectedPermissions(
        selectedPermissions.filter((id) => id !== permissionId),
      );
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;

    setIsLoading(true);
    try {
      await permissionService.updateRolePermissions(
        selectedRole.id,
        selectedPermissions,
      );
      setResult({
        success: true,
        message: `Permissions updated successfully for ${selectedRole.name}`,
      });
    } catch (error) {
      setResult({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update permissions",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Role & Permission API Integration Test</CardTitle>
          <CardDescription>
            Test the integration with Laravel backend role and permission APIs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="roles">Roles</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>

            <TabsContent value="roles" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-4 border-r pr-4">
                  <h3 className="text-lg font-medium">Available Roles</h3>
                  {isLoading ? (
                    <div className="flex justify-center p-4">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {roles.length === 0 ? (
                        <p className="text-muted-foreground">No roles found</p>
                      ) : (
                        roles.map((role) => (
                          <Button
                            key={role.id}
                            variant={
                              selectedRole?.id === role.id
                                ? "default"
                                : "outline"
                            }
                            className="w-full justify-start"
                            onClick={() => handleRoleSelect(role.id)}
                          >
                            {role.name}
                          </Button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div className="col-span-2">
                  {selectedRole ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium">
                          {selectedRole.name}
                        </h3>
                        <p className="text-muted-foreground">
                          {selectedRole.description}
                        </p>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium">Permissions</h4>
                        {permissions.map((category) => (
                          <div key={category.category} className="space-y-2">
                            <h5 className="text-sm font-medium">
                              {category.category}
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {category.permissions.map((permission) => (
                                <div
                                  key={permission.id}
                                  className="flex items-center space-x-2 border p-2 rounded-md"
                                >
                                  <Checkbox
                                    id={`perm-${permission.id}`}
                                    checked={selectedPermissions.includes(
                                      permission.id,
                                    )}
                                    onCheckedChange={(checked) =>
                                      handlePermissionChange(
                                        permission.id,
                                        checked === true,
                                      )
                                    }
                                  />
                                  <Label
                                    htmlFor={`perm-${permission.id}`}
                                    className="flex-1 cursor-pointer"
                                  >
                                    {permission.name}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      <Button
                        onClick={handleSavePermissions}
                        disabled={isLoading}
                      >
                        {isLoading ? "Saving..." : "Save Permissions"}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">
                        Select a role to view and edit permissions
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4 mt-4">
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Available Permissions</h3>
                {isLoading ? (
                  <div className="flex justify-center p-4">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  </div>
                ) : (
                  permissions.map((category) => (
                    <div key={category.category} className="space-y-2">
                      <h4 className="font-medium">{category.category}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {category.permissions.map((permission) => (
                          <div
                            key={permission.id}
                            className="border p-2 rounded-md"
                          >
                            {permission.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>

          {result && (
            <Alert
              className={`mt-4 ${result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
            >
              <AlertDescription
                className={result.success ? "text-green-800" : "text-red-800"}
              >
                {result.message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            Testing connection to Laravel backend
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
