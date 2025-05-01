import UsersList from "@/components/admin/user-management/tabs/UsersList";

export default function UserManagementStoryboard() {
  return (
    <div className="bg-background min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">User Management</h1>
        <UsersList />
      </div>
    </div>
  );
}
