import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield } from "lucide-react";
import RoleCard from "@/components/admin/user-management/components/RoleCard";

const mockRoles = [
  {
    id: "1",
    name: "Admin",
    description: "Full system access with all permissions",
    userCount: 3,
    permissions: [
      "create_users",
      "edit_users",
      "delete_users",
      "assign_roles",
      "manage_models",
      "edit_prompts",
      "test_ai",
      "view_ai_logs",
      "create_widgets",
      "edit_widgets",
      "publish_widgets",
      "delete_widgets",
      "create_kb_articles",
      "edit_kb_articles",
      "delete_kb_articles",
      "manage_kb_categories",
      "manage_api_keys",
      "billing_subscription",
      "system_backup",
      "view_audit_logs",
    ],
  },
  {
    id: "2",
    name: "Editor",
    description: "Can manage content and widgets",
    userCount: 5,
    permissions: [
      "edit_users",
      "edit_prompts",
      "test_ai",
      "view_ai_logs",
      "create_widgets",
      "edit_widgets",
      "publish_widgets",
      "create_kb_articles",
      "edit_kb_articles",
      "manage_kb_categories",
    ],
  },
  {
    id: "3",
    name: "Viewer",
    description: "Read-only access to the system",
    userCount: 12,
    permissions: ["view_ai_logs", "view_audit_logs"],
  },
];

const RolesPermissionsStoryboard = () => {
  const [roles] = useState(mockRoles);

  const handleEditRole = (role) => {
    console.log("Edit role:", role);
  };

  const handleDeleteRole = (role) => {
    console.log("Delete role:", role);
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
          <Button>
            <Shield className="mr-2 h-4 w-4" /> Create Role
          </Button>
        </div>

        <Tabs defaultValue="roles" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="space-y-4 mt-6">
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
          </TabsContent>

          <TabsContent value="permissions" className="mt-6">
            <div className="border rounded-md p-8 text-center">
              <h2 className="text-xl font-semibold mb-2">Permissions Tab</h2>
              <p className="text-muted-foreground mb-4">
                This tab will show detailed permissions management.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RolesPermissionsStoryboard;
