import { useState, useEffect } from "react";
import {
  Search,
  MoreHorizontal,
  Edit,
  Key,
  Trash2,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


import StatusIcon from "@/components/admin/user-management/components/StatusIcon";
import UserRoleDisplay from "@/components/admin/user-management/components/UserRoleDisplay";
import { EditUserDialog } from "@/components/admin/user-management/dialogs/EditUserDialog";
import { DeleteUserDialog } from "@/components/admin/user-management/dialogs/DeleteUserDialog";
import { ResetPasswordDialog } from "@/components/admin/user-management/dialogs/ResetPasswordDialog";
import { User } from "@/types";
import { useUsers } from "@/hooks/user-management/useUsers";
import { useRoles } from "@/hooks/access-control/useRoles";
import { SEARCH_DEBOUNCE_TIME } from "@/constants";

// UsersList component with proper role and status filtering
const UsersList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all"); // Default role filter
  const [selectedStatus, setSelectedStatus] = useState("all"); // Default status filter
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [showDeleteUserDialog, setShowDeleteUserDialog] = useState(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );

  // Get users data
  const {
    users,
    totalUsers,
    currentPage,
    isLoading,
    error,
    fetchUsers,
    updateQueryParams,
  } = useUsers();

  // Get roles data
  const { roles } = useRoles();

  // Handle search query changes with debounce
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      updateQueryParams({ search: searchQuery || undefined });
    }, SEARCH_DEBOUNCE_TIME);

    setSearchTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [searchQuery, updateQueryParams]);

  // Handle role filter changes
  const handleRoleChange = (value: string) => {
    setSelectedRole(value);
    updateQueryParams({
      role: value !== "all" ? value : undefined,
    });
  };

  // Handle status filter changes
  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    updateQueryParams({
      status: value !== "all" ? value : undefined,
    });
  };

  const openEditUserDialog = (user: User) => {
    console.log("Opening edit dialog for user:", user);
    setSelectedUser(user);
    setShowEditUserDialog(true);
  };

  const openDeleteUserDialog = (user: User) => {
    setSelectedUser(user);
    setShowDeleteUserDialog(true);
  };

  const openResetPasswordDialog = (user: User) => {
    setSelectedUser(user);
    setShowResetPasswordDialog(true);
  };

  // Handle manual refresh
  const handleRefresh = () => {
    fetchUsers();
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={selectedRole} onValueChange={handleRoleChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles &&
                    roles.map((role) => (
                      <SelectItem key={role.id} value={role.name}>
                        {role.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status">
                    {selectedStatus !== "all" && (
                      <div className="flex items-center gap-2">
                        <StatusIcon status={selectedStatus} />
                        {selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">
                    <div className="flex items-center gap-2">
                      <StatusIcon status="active" />
                      Active
                    </div>
                  </SelectItem>
                  <SelectItem value="inactive">
                    <div className="flex items-center gap-2">
                      <StatusIcon status="inactive" />
                      Inactive
                    </div>
                  </SelectItem>
                  <SelectItem value="pending">
                    <div className="flex items-center gap-2">
                      <StatusIcon status="pending" />
                      Pending
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={isLoading}
                title="Refresh users"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Loader2 className="h-12 w-12 mb-2 animate-spin" />
                      <p>Loading users...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center text-destructive">
                      <AlertCircle className="h-8 w-8 mb-2" />
                      <p>Error loading users</p>
                      <p className="text-sm">
                        {error.message || "Please try again."}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        className="mt-2"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try Again
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : users && users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <UserRoleDisplay user={user} allRoles={roles} />
                    </TableCell>
                    <TableCell>
                      <StatusIcon status={user.status} />
                    </TableCell>
                    <TableCell>
                      {user.last_active ? new Date(user.last_active).toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <span
                            role="button"
                            tabIndex={0}
                            className="h-8 w-8 flex items-center justify-center rounded hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                            aria-label="Open user actions menu"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openEditUserDialog(user)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>

                          <DropdownMenuItem onClick={() => openResetPasswordDialog(user)}>
                            <Key className="mr-2 h-4 w-4" />
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openDeleteUserDialog(user)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-muted-foreground">
              {totalUsers > 0 ? (
                <>
                  Showing {(currentPage - 1) * 10 + 1}-
                  {Math.min(currentPage * 10, totalUsers)} of {totalUsers} users
                </>
              ) : (
                "No users found"
              )}
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={isLoading || currentPage <= 1}
                onClick={() =>
                  updateQueryParams({ page: Math.max(1, currentPage - 1) })
                }
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground mx-2">
                Page {currentPage} of {Math.ceil(totalUsers / 10) || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={
                  isLoading ||
                  (totalUsers > 0 && currentPage * 10 >= totalUsers)
                }
                onClick={() => updateQueryParams({ page: currentPage + 1 })}
              >
                Next
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>

      {showEditUserDialog && selectedUser && (
        <EditUserDialog
          user={selectedUser}
          open={showEditUserDialog}
          onOpenChange={setShowEditUserDialog}
        />
      )}
      {showDeleteUserDialog && selectedUser && (
        <DeleteUserDialog
          user={selectedUser}
          open={showDeleteUserDialog}
          onOpenChange={setShowDeleteUserDialog}
        />
      )}
      {showResetPasswordDialog && selectedUser && (
        <ResetPasswordDialog
          user={selectedUser}
          open={showResetPasswordDialog}
          onOpenChange={setShowResetPasswordDialog}
        />
      )}
    </>
  );
};

export default UsersList;
