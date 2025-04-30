/**
 * API Types
 * 
 * Contains types specific to API requests/responses and data transfer.
 * Core domain types are in @/types
 */
import {
  User,
  Role,
  Permission,
  PermissionCategory,
  ActivityLogEntry,
} from "@/types";

// Common API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  path: string;
  per_page: number;
  to: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// API Request Types
export interface UserCreateRequest {
  name: string;
  email: string;
  role: string;
  send_email?: boolean;
}

export interface UserUpdateRequest {
  name?: string;
  email?: string;
  role?: string;
  status?: string;
}

export interface RoleCreateRequest {
  name: string;
  description: string;
  permissions: string[];
}

export interface RoleUpdateRequest {
  name?: string;
  description?: string;
  permissions?: string[];
}

export interface PermissionUpdateRequest {
  permissions: string[];
}

// Query Parameter Types
export interface BaseQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_direction?: "asc" | "desc";
}

export interface UserQueryParams extends BaseQueryParams {
  role?: string;
  status?: string;
}

export interface RoleQueryParams extends BaseQueryParams {}

export interface ActivityLogQueryParams extends BaseQueryParams {
  user_id?: string;
  action_type?: string;
  date_from?: string;
  date_to?: string;
}
