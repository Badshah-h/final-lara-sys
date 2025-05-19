import React, { useState, Suspense, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Shield, Activity, UserPlus, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AddUserDialog } from "./dialogs/AddUserDialog";
import UserDetailsPage from "./components/UserDetailsPage";

// Lazy load tab components to improve initial load time
const UsersList = React.lazy(() => import("./tabs/UsersList"));
const RolesPermissions = React.lazy(() => import("./tabs/RolesPermissions"));
const ActivityLog = React.lazy(() => import("./tabs/ActivityLog"));

// Loading fallback component
const TabLoadingFallback = () => (
  <div className="flex justify-center items-center py-12">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
    <span className="ml-2">Loading...</span>
  </div>
);

const UserManagement = () => {
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  const navigate = useNavigate();
  // Commented out permission checks to make all functionality accessible
  // const { hasPermission } = useAuth();

  // Make all tabs accessible to any logged-in user
  const canViewUsers = true; // hasPermission("view_users") || hasPermission("manage_users");
  const canAddUsers = true; // hasPermission("create_users") || hasPermission("manage_users");
  const canViewRoles = true; // hasPermission("view_roles") || hasPermission("manage_roles");
  const canViewActivity = true; // hasPermission("view_activity_log") || hasPermission("manage_users");

  // No need to redirect users away from tabs they don't have permission for
  // useEffect(() => {
  //   if (activeTab === "roles" && !canViewRoles) {
  //     setActiveTab(canViewUsers ? "users" : canViewActivity ? "activity" : "users");
  //   } else if (activeTab === "activity" && !canViewActivity) {
  //     setActiveTab(canViewUsers ? "users" : canViewRoles ? "roles" : "users");
  //   } else if (activeTab === "users" && !canViewUsers) {
  //     setActiveTab(canViewRoles ? "roles" : canViewActivity ? "activity" : "users");
  //   }
  // }, [activeTab, canViewUsers, canViewRoles, canViewActivity]);

  return (
    <Routes>
      <Route path="/" element={
        <div className="space-y-6 bg-background">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">User Management</h1>
              <p className="text-muted-foreground">
                Manage users, roles, and permissions
              </p>
            </div>
            {canAddUsers && (
              <AddUserDialog
                open={showAddUserDialog}
                onOpenChange={setShowAddUserDialog}
              >
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" /> Add User
                </Button>
              </AddUserDialog>
            )}
          </div>

          <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className={`grid w-full ${canViewUsers && canViewRoles && canViewActivity ? 'grid-cols-3' : (canViewUsers && canViewRoles) || (canViewUsers && canViewActivity) || (canViewRoles && canViewActivity) ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {canViewUsers && (
                <TabsTrigger value="users">
                  <Users className="mr-2 h-4 w-4" /> Users
                </TabsTrigger>
              )}
              {canViewRoles && (
                <TabsTrigger value="roles">
                  <Shield className="mr-2 h-4 w-4" /> Roles & Permissions
                </TabsTrigger>
              )}
              {canViewActivity && (
                <TabsTrigger value="activity">
                  <Activity className="mr-2 h-4 w-4" /> Activity Log
                </TabsTrigger>
              )}
            </TabsList>

            {canViewUsers && (
              <TabsContent value="users" className="space-y-4 pt-4">
                <Suspense fallback={<TabLoadingFallback />}>
                  {activeTab === "users" && <UsersList />}
                </Suspense>
              </TabsContent>
            )}

            {canViewRoles && (
              <TabsContent value="roles" className="space-y-4 pt-4">
                <Suspense fallback={<TabLoadingFallback />}>
                  {activeTab === "roles" && <RolesPermissions />}
                </Suspense>
              </TabsContent>
            )}

            {canViewActivity && (
              <TabsContent value="activity" className="space-y-4 pt-4">
                <Suspense fallback={<TabLoadingFallback />}>
                  {activeTab === "activity" && <ActivityLog />}
                </Suspense>
              </TabsContent>
            )}
          </Tabs>
        </div>
      } />
      <Route path="/users/:id" element={<UserDetailsPage />} />
    </Routes>
  );
};

export default UserManagement;
