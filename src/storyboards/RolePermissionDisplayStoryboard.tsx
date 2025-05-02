import RolePermissionDisplay from "@/components/admin/user-management/components/RolePermissionDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RolePermissionDisplayStoryboard() {
  // Mock data for demonstration
  const mockRole = {
    id: "admin",
    name: "Administrator",
    description: "Full system access",
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
  };

  const mockPermissions = [
    {
      id: "create_users",
      name: "Create Users",
      description: "Can create new users",
      module: "User Management",
    },
    {
      id: "edit_users",
      name: "Edit Users",
      description: "Can edit existing users",
      module: "User Management",
    },
    {
      id: "delete_users",
      name: "Delete Users",
      description: "Can delete users",
      module: "User Management",
    },
    {
      id: "view_users",
      name: "View Users",
      description: "Can view user list",
      module: "User Management",
    },
    {
      id: "manage_ai_models",
      name: "Manage AI Models",
      description: "Can configure AI models",
      module: "AI Configuration",
    },
    {
      id: "edit_prompts",
      name: "Edit Prompts",
      description: "Can edit AI prompts",
      module: "AI Configuration",
    },
    {
      id: "create_widgets",
      name: "Create Widgets",
      description: "Can create new widgets",
      module: "Widget Builder",
    },
    {
      id: "edit_widgets",
      name: "Edit Widgets",
      description: "Can edit existing widgets",
      module: "Widget Builder",
    },
    {
      id: "manage_kb_articles",
      name: "Manage KB Articles",
      description: "Can manage knowledge base articles",
      module: "Knowledge Base",
    },
    {
      id: "system_backup",
      name: "System Backup",
      description: "Can perform system backups",
      module: "System Settings",
    },
  ];

  return (
    <div className="bg-background min-h-screen p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold">Role Permission Display</h1>

        <Card>
          <CardHeader>
            <CardTitle>With Full Permission Objects</CardTitle>
          </CardHeader>
          <CardContent>
            <RolePermissionDisplay
              role={mockRole}
              availablePermissions={mockPermissions}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>With Permission IDs Only</CardTitle>
          </CardHeader>
          <CardContent>
            <RolePermissionDisplay role={mockRole} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
