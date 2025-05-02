import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";

// Lazy load the UserManagement component to prevent initial load issues
const UserManagement = React.lazy(() =>
  import("@/components/admin/user-management/UserManagement").then(
    (module) => ({ default: module.default }),
  ),
);

const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
    <p className="text-lg">Loading User Management...</p>
  </div>
);

const UserManagementStoryboard = () => {
  return (
    <div className="bg-background min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <Suspense fallback={<LoadingFallback />}>
          <UserManagement />
        </Suspense>
      </div>
    </div>
  );
};

export default UserManagementStoryboard;
