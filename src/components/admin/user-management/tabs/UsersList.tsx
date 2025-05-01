import { useState, useEffect, useCallback } from "react";
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
import { Role } from "@/types";
import {
  ApiResponse,
  RoleQueryParams,
  PaginatedResponse,
} from "@/services/api/types";
import { SEARCH_DEBOUNCE_TIME } from "@/constants";
import { USER_STATUSES_ARRAY } from "@/constants";
import { roleService } from "@/services/access-control/roleService";

// Fetching and managing roles with useRoles hook
export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [totalRoles, setTotalRoles] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [queryParams, setQueryParams] = useState<RoleQueryParams>({
    page: 1,
    per_page: 10,
  });

  const fetchRoles = useCallback(async () => {
    try {
      const response = await roleService.getRoles(queryParams);
      if (response?.data) {
        const { data, meta } = response;
        setRoles(data);
        setTotalRoles(meta?.total || 0);
        setCurrentPage(meta?.current_page || 1);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  }, [queryParams]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return {
    roles,
    totalRoles,
    currentPage,
    fetchRoles,
    setRoles,
    setCurrentPage,
    queryParams,
    setQueryParams,
  };
}

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

  const {
    users,
    totalUsers,
    isLoading,
    error,
    updateQueryParams,
    deleteUser,
  } = useUsers();

  const applyLocalFilters = useCallback(
    (users: User[] | null, query: string, role: string, status: string) => {
      if (!users) return [];

      return users.filter(
        (user) =>
          (query === "" ||
            user.name.toLowerCase().includes(query.toLowerCase()) ||
            user.email.toLowerCase().includes(query.toLowerCase())) &&
          (role === "all" || user.role === role) &&
          (status === "all" || user.status === status)
      );
    },
    []
  );

  useEffect(() => {
    setIsLocalFiltering(true);
    if (users) {
      const filtered = applyLocalFilters(
        users,
        searchQuery,
        selectedRole,
        selectedStatus
      );
      setLocalFilteredUsers(filtered);
    }

    const timer = setTimeout(() => {
      if (searchQuery) {
        updateQueryParams({ search: searchQuery });
      } else if (searchQuery === "") {
        updateQueryParams({ search: undefined });
      }
      setIsLocalFiltering(false);
    }, SEARCH_DEBOUNCE_TIME);

    return () => clearTimeout(timer);
  }, [searchQuery, users, applyLocalFilters, updateQueryParams, selectedRole, selectedStatus]);

  useEffect(() => {
    setIsLocalFiltering(true);
    if (users) {
      const filtered = applyLocalFilters(
        users,
        searchQuery,
        selectedRole,
        selectedStatus
      );
      setLocalFilteredUsers(filtered);
    }

    const timer = setTimeout(() => {
      if (selectedRole !== "all") {
        updateQueryParams({ role: selectedRole });
      } else {
        updateQueryParams({ role: undefined });
      }
      setIsLocalFiltering(false);
    }, SEARCH_DEBOUNCE_TIME);

    return () => clearTimeout(timer);
  }, [selectedRole, users, applyLocalFilters, updateQueryParams, searchQuery, selectedStatus]);

  useEffect(() => {
    setIsLocalFiltering(true);
    if (users) {
      const filtered = applyLocalFilters(
        users,
        searchQuery,
        selectedRole,
        selectedStatus
      );
      setLocalFilteredUsers(filtered);
    }

    const timer = setTimeout(() => {
      if (selectedStatus !== "all") {
        updateQueryParams({ status: selectedStatus });
      } else {
        updateQueryParams({ status: undefined });
      }
      setIsLocalFiltering(false);
    }, SEARCH_DEBOUNCE_TIME);

    return () => clearTimeout(timer);
  }, [selectedStatus, users, applyLocalFilters, updateQueryParams, searchQuery, selectedRole]);

  const openEditUserDialog = (user: User) => {
    setSelectedUser(user);
    setShowEditUserDialog(true);
  };

  const openDeleteUserDialog = (user: User) => {
    setSelectedUser(user);
    setShowDeleteUserDialog(true);
  };

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
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="user">User</SelectItem>
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
                      <p>Error loading users</p>
                      <p className="text-sm">{error.message || "Please try again."}</p>
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
                          <DropdownMenuItem onClick={() => openEditUserDialog(user)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDeleteUserDialog(user)}>
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
              <Button variant="outline" size="sm">
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>

      {showEditUserDialog && (
        <EditUserDialog user={selectedUser} open={showEditUserDialog} onOpenChange={setShowEditUserDialog} />
      )}
      {showDeleteUserDialog && (
        <DeleteUserDialog user={selectedUser} open={showDeleteUserDialog} onOpenChange={setShowDeleteUserDialog} />
      )}
    </>
  );
};

export default UsersList;
