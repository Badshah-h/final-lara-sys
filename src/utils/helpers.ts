/**
 * UI Helper Functions
 * 
 * Contains helper functions for UI components and user management.
 */

import { type VariantProps } from "class-variance-authority";
import { badgeVariants } from "@/components/ui/badge";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

/**
 * Get the appropriate badge variant for a user role
 */
export const getRoleBadgeVariant = (role: string): BadgeVariant => {
  switch (role.toLowerCase()) {
    case "admin":
      return "default";
    case "moderator":
      return "secondary";
    default:
      return "outline";
  }
};

/**
 * Handle permission checkbox changes in forms
 */
export interface PermissionState {
  permissions: string[];
  [key: string]: any;
}

export const handlePermissionChange = (
  permissionId: string,
  isChecked: boolean,
  setStateFunction: (state: PermissionState) => void,
  currentState: PermissionState
): void => {
  setStateFunction({
    ...currentState,
    permissions: isChecked
      ? [...currentState.permissions, permissionId]
      : currentState.permissions.filter((id: string) => id !== permissionId),
  });
};

export const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "active":
      return "success";
    case "inactive":
      return "secondary";
    case "pending":
      return "warning";
    default:
      return "outline";
  }
};
