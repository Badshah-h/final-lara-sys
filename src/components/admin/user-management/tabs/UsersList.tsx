import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  MoreHorizontal,
  Edit,
  Key,
  Mail,
  Trash2,
  Users,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuLabel,
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
import { Alert, AlertDescription } from "@/components/ui/alert";

import { getRoleBadgeVariant } from "@/utils/helpers";
import StatusIcon from "@/components/admin/user-management/components/StatusIcon";
import { EditUserDialog } from "@/components/admin/user-management/dialogs/EditUserDialog";
import { DeleteUserDialog } from "@/components/admin/user-management/dialogs/DeleteUserDialog";
import { User } from "@/types";
import { useUsers } from "@/hooks/user-management/useUsers";
import { useRoles } from "@/hooks/access-control/useRoles";
import { Role } from "@/types";
import {
  ApiResponse,
  RoleQueryParams,
  PaginatedResponse,
} from "@/services/api/types";
import { SEARCH_DEBOUNCE_TIME } from "@/constants";
import { USER_STATUSES_ARRAY } from "@/constants";

// UsersList component with proper role and status filtering
const UsersList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all"); // Default role filter
  const [selectedStatus, setSelectedStatus] = useState("all"); // Default status filter
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [showDeleteUserDialog, setShowDeleteUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [localFilteredUsers, setLocalFilteredUsers] = useState<User[]>([]);
  const [isLocalFiltering, setIsLocalFiltering] = useState(false);

  // Use refs to track active timers
  const searchTimerRef = useRef<number | null>(null);
  const roleTimerRef = useRef<number | null>(null);
  const statusTimerRef = useRef<number | null>(null);

  // Get users data
  const {
    users,
    totalUsers,
    isLoading,
    error,
    updateQueryParams,
    deleteUser,
    fetchUsers: refreshUsers,
  } = useUsers();

  // Get roles data
  const { roles, isLoading: isLoadingRoles, error: rolesError } = useRoles();

  const applyLocalFilters = useCallback(
    (users: User[] | null, query: string, role: string, status: string) => {
      if (!users) return [];

      return users.filter(
        (user) =>
          (query === "" ||
            user.name.toLowerCase().includes(query.toLowerCase()) ||
            user.email.toLowerCase().includes(query.toLowerCase())) &&
          (role === "all" || user.role === role) &&
          (status === "all" || user.status === status),
      );
    },
    [],
  );

  // Handle search query changes
  useEffect(() => {
    // Clear previous timer
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    setIsLocalFiltering(true);
    if (users) {
      const filtered = applyLocalFilters(
        users,
        searchQuery,
        selectedRole,
        selectedStatus,
      );
      setLocalFilteredUsers(filtered);
    }

    // Set new timer
    searchTimerRef.current = window.setTimeout(() => {
      if (searchQuery) {
        updateQueryParams({ search: searchQuery });
      } else if (searchQuery === "") {
        updateQueryParams({ search: undefined });
      }
      setIsLocalFiltering(false);
      searchTimerRef.current = null;
    }, SEARCH_DEBOUNCE_TIME);

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, [
    searchQuery,
    users,
    applyLocalFilters,
    updateQueryParams,
    selectedRole,
    selectedStatus,
  ]);

  // Handle role filter changes
  useEffect(() => {
    // Clear previous timer
    if (roleTimerRef.current) {
      clearTimeout(roleTimerRef.current);
    }

    setIsLocalFiltering(true);
    if (users) {
      const filtered = applyLocalFilters(
        users,
        searchQuery,
        selectedRole,
        selectedStatus,
      );
      setLocalFilteredUsers(filtered);
    }

    // Set new timer
    roleTimerRef.current = window.setTimeout(() => {
      if (selectedRole !== "all") {
        updateQueryParams({ role: selectedRole });
      } else {
        updateQueryParams({ role: undefined });
      }
      setIsLocalFiltering(false);
      roleTimerRef.current = null;
    }, SEARCH_DEBOUNCE_TIME);

    return () => {
      if (roleTimerRef.current) {
        clearTimeout(roleTimerRef.current);
      }
    };
  }, [
    selectedRole,
    users,
    applyLocalFilters,
    updateQueryParams,
    searchQuery,
    selectedStatus,
  ]);

  // Handle status filter changes
  useEffect(() => {
    // Clear previous timer
    if (statusTimerRef.current) {
      clearTimeout(statusTimerRef.current);
    }

    setIsLocalFiltering(true);
    if (users) {
      const filtered = applyLocalFilters(
        users,
        searchQuery,
        selectedRole,
        selectedStatus,
      );
      setLocalFilteredUsers(filtered);
    }

    // Set new timer
    statusTimerRef.current = window.setTimeout(() => {
      if (selectedStatus !== "all") {
        updateQueryParams({ status: selectedStatus });
      } else {
        updateQueryParams({ status: undefined });
      }
      setIsLocalFiltering(false);
      statusTimerRef.current = null;
    }, SEARCH_DEBOUNCE_TIME);

    return () => {
      if (statusTimerRef.current) {
        clearTimeout(statusTimerRef.current);
      }
    };
  }, [
    selectedStatus,
    users,
    applyLocalFilters,
    updateQueryParams,
    searchQuery,
    selectedRole,
  ]);

  const openEditUserDialog = (user: User) => {
    setSelectedUser(user);
    setShowEditUserDialog(true);
  };

  const openDeleteUserDialog = (user: User) => {
    setSelectedUser(user);
    setShowDeleteUserDialog(true);
  };

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    refreshUsers();
  }, [refreshUsers]);

  const displayedUsers = isLocalFiltering ? localFilteredUsers : users || [];

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
              <Select value={selectedRole} onValueChange={setSelectedRole}>
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
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {USER_STATUSES_ARRAY.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
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
          {rolesError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                Error loading roles: {rolesError.message || "Please try again."}
              </AlertDescription>
            </Alert>
          )}
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
              ) : displayedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                displayedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StatusIcon status={user.status} />
                    </TableCell>
                    <TableCell>
                      {new Date(user.lastActive).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openEditUserDialog(user)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDeleteUserDialog(user)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-muted-foreground">
              Showing {displayedUsers.length} of {totalUsers} users
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

      {showEditUserDialog && (
        <EditUserDialog
          user={selectedUser}
          open={showEditUserDialog}
          onOpenChange={setShowEditUserDialog}
        />
      )}
      {showDeleteUserDialog && (
        <DeleteUserDialog
          user={selectedUser}
          open={showDeleteUserDialog}
          onOpenChange={setShowDeleteUserDialog}
        />
      )}
    </>
  );
};

export default UsersList;
