/**
 * Core Domain Types
 *
 * Contains the main entity types used across the application.
 * API-specific types (requests/responses) are in @/services/api/types
 */

// User Domain
export interface User {
  id: string;
  name: string;
  email: string;
  roles?: {
    id: string;
    name: string;
    description?: string;
    pivot?: {
      is_active: boolean;
    };
  }[];
  role?: string; // For backward compatibility
  status: string;
  last_active: string | null;
  avatar: string | null;
}

// Permission Domain
export interface Permission {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  module?: string;
}

export interface PermissionCategory {
  id: string;
  category: string;
  permissions: Permission[];
}

// Role Domain
export interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: (string | number)[];
}

// Activity Log Domain
export interface ActivityLogEntry {
  id: string;
  user_id: string;
  user_name: string;
  action: "login" | "logout" | "create" | "update" | "delete";
  description: string;
  created_at: string;
  user_avatar: string;
  ip_address: string;
}

export interface NewUser {
  name: string;
  email: string;
  role: string;
  password?: string;
}

export interface EditedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export interface NewRole {
  name: string;
  description: string;
  permissions: string[];
}

export interface EditedRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}
