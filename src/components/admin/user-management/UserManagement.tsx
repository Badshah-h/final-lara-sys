
import React, { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Shield, Activity, UserPlus, Loader2 } from "lucide-react";
import ErrorBoundary from "@/components/ErrorBoundary";

import { AddUserDialog } from "./dialogs";

// Lazy load tab components to improve initial load time
// Use dynamic imports with explicit chunk names to improve caching and debugging
const UsersList = React.lazy(() =>
  import(/* webpackChunkName: "users-list" */ "./tabs/UsersList.js")
);

const RolesPermissions = React.lazy(() =>
  import(/* webpackChunkName: "roles-permissions" */ "./tabs/RolesPermissions.js")
);

const ActivityLog = React.lazy(() =>
  import(/* webpackChunkName: "activity-log" */ "./tabs/ActivityLog.js")
);

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

  return (
    <div className="space-y-6 bg-background">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage users, roles, and permissions
          </p>
        </div>
        <AddUserDialog
          open={showAddUserDialog}
          onOpenChange={setShowAddUserDialog}
        >
          <Button>
            <UserPlus className="mr-2 h-4 w-4" /> Add User
          </Button>
        </AddUserDialog>
      </div>

      <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" /> Users
          </TabsTrigger>
          <TabsTrigger value="roles">
            <Shield className="mr-2 h-4 w-4" /> Roles & Permissions
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="mr-2 h-4 w-4" /> Activity Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4 pt-4">
          <ErrorBoundary>
            <Suspense fallback={<TabLoadingFallback />}>
              <UsersList />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4 pt-4">
          <ErrorBoundary>
            <Suspense fallback={<TabLoadingFallback />}>
              <RolesPermissions />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4 pt-4">
          <ErrorBoundary>
            <Suspense fallback={<TabLoadingFallback />}>
              <ActivityLog />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagement;
