import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { roles, availablePermissions } from "../data/mockData";
import RoleCard from "../components/RoleCard";
import PermissionManagement from "./PermissionManagement";
import { CreateRoleDialog } from "../dialogs/CreateRoleDialog";
import { EditRoleDialog } from "../dialogs/EditRoleDialog";
import { DeleteRoleDialog } from "../dialogs/DeleteRoleDialog";
import { Role } from "../../../../types";

const RolesPermissions = () => {
  const [showCreateRoleDialog, setShowCreateRoleDialog] = useState(false);
  const [showEditRoleDialog, setShowEditRoleDialog] = useState(false);
  const [showDeleteRoleDialog, setShowDeleteRoleDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [activeRoleTab, setActiveRoleTab] = useState("super-admin");

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setShowEditRoleDialog(true);
  };

  const handleDeleteRole = (role: Role) => {
    setSelectedRole(role);
    setShowDeleteRoleDialog(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Roles & Permissions</CardTitle>
          <CardDescription>
            Manage roles and their associated permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {roles.map((role) => (
                <RoleCard
                  key={role.id}
                  role={role}
                  onEdit={handleEditRole}
                  onDelete={handleDeleteRole}
                />
              ))}
            </div>

            <div className="flex justify-center">
              <Button onClick={() => setShowCreateRoleDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Role
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permission Management</CardTitle>
          <CardDescription>
            Configure detailed permissions for each role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeRoleTab} onValueChange={setActiveRoleTab}>
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
                  availablePermissions={availablePermissions}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-end gap-2">
          <Button variant="outline">Reset to Default</Button>
          <Button>Save Changes</Button>
        </CardFooter>
      </Card>

      {/* Create Role Dialog */}
      <CreateRoleDialog
        open={showCreateRoleDialog}
        onOpenChange={setShowCreateRoleDialog}
        availablePermissions={availablePermissions}
      />

      {/* Edit Role Dialog */}
      {selectedRole && (
        <EditRoleDialog
          open={showEditRoleDialog}
          onOpenChange={setShowEditRoleDialog}
          role={selectedRole}
          availablePermissions={availablePermissions}
        />
      )}

      {/* Delete Role Dialog */}
      {selectedRole && (
        <DeleteRoleDialog
          open={showDeleteRoleDialog}
          onOpenChange={setShowDeleteRoleDialog}
          role={selectedRole}
        />
      )}
    </>
  );
};

export default RolesPermissions;
