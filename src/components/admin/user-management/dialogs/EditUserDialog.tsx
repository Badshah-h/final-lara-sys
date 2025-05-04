import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { userService } from "@/services/user-management/userService";
import StatusIcon from "@/components/admin/user-management/components/StatusIcon";
import { useRoles } from "@/hooks/access-control/useRoles";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";

import { User, EditedUser, Role } from "../../../../types";

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

export function EditUserDialog({
  open,
  onOpenChange,
  user,
}: EditUserDialogProps) {
  const { roles, fetchRoles, isLoading: isLoadingRoles } = useRoles();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar);

  // Helper function to get the user's primary role name
  const getUserRoleName = (): string => {
    // If user has roles array and it's not empty
    if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
      // Get the first active role
      const activeRole = user.roles.find(role => !role.pivot || role.pivot.is_active);
      if (activeRole) {
        return activeRole.name;
      }
    }

    // Fallback to legacy role property
    return user.role || '';
  };

  const [editedUser, setEditedUser] = useState<EditedUser>({
    id: user.id,
    name: user.name,
    email: user.email,
    role: getUserRoleName(),
    status: user.status,
  });
  const [error, setError] = useState<string | null>(null);

  // Handle avatar upload
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingAvatar(true);
      setError(null);

      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to server
      await userService.uploadAvatar(user.id, file);
    } catch (err: any) {
      setError(err?.message || "Failed to upload avatar");
      // Revert preview on error
      setAvatarPreview(user.avatar);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Fetch roles only once when component mounts
  useEffect(() => {
    // Only fetch roles if they haven't been loaded yet
    if (roles.length === 0) {
      fetchRoles();
    }
  }, []);

  const handleEditUser = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await userService.updateUser(editedUser.id, {
        name: editedUser.name,
        email: editedUser.email,
        role: editedUser.role,

        status: editedUser.status,
      });
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.message || "Failed to update user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information and role assignment.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center mb-4">
            <div
              className="relative cursor-pointer group"
              onClick={handleAvatarClick}
            >
              <Avatar className="h-24 w-24 border-2 border-primary/20">
                <AvatarImage src={avatarPreview || undefined} alt={user.name} />
                <AvatarFallback className="text-lg">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isUploadingAvatar ? (
                  <div className="h-6 w-6 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                ) : (
                  <Camera className="h-6 w-6 text-white" />
                )}
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            <span className="text-xs text-muted-foreground mt-2">
              Click to upload avatar
            </span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-name">Full Name</Label>
            <Input
              id="edit-name"
              placeholder="John Doe"
              value={editedUser.name}
              onChange={(e) =>
                setEditedUser({ ...editedUser, name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              placeholder="john@example.com"
              value={editedUser.email}
              onChange={(e) =>
                setEditedUser({ ...editedUser, email: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-role">Role</Label>
            <Select
              value={editedUser.role}
              onValueChange={(value) =>
                setEditedUser({ ...editedUser, role: value })
              }
            >
              <SelectTrigger id="edit-role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingRoles ? (
                  <SelectItem value="" disabled>Loading roles...</SelectItem>
                ) : roles && roles.length > 0 ? (
                  roles.map((role: Role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name}
                    </SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-status">Status</Label>
            <Select
              value={editedUser.status}
              onValueChange={(value) =>
                setEditedUser({ ...editedUser, status: value })
              }
            >
              <SelectTrigger id="edit-status">
                <SelectValue placeholder="Select status">
                  <div className="flex items-center gap-2">
                    <StatusIcon status={editedUser.status} />
                    {editedUser.status.charAt(0).toUpperCase() + editedUser.status.slice(1)}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
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
          </div>
          {error && <div className="text-destructive text-sm mb-2">{error}</div>}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditUser}
            disabled={isSubmitting || !editedUser.name || !editedUser.email}
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 mr-2 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
