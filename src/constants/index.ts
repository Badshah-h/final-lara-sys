/**
 * User Management Constants
 *
 * This file contains all constants used in the user management module.
 * Centralizing these values makes the code more maintainable and easier to update.
 */

// Filter constants
export const FILTER_ALL = "all";

// User statuses
export const USER_STATUSES = {
  ALL: "all",
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
} as const;

export const USER_STATUSES_ARRAY = [
  { value: USER_STATUSES.ALL, label: "All Status" },
  { value: USER_STATUSES.ACTIVE, label: "Active" },
  { value: USER_STATUSES.INACTIVE, label: "Inactive" },
  { value: USER_STATUSES.PENDING, label: "Pending" },
];

// Debounce time for search (in milliseconds)
export const SEARCH_DEBOUNCE_TIME = 300;

// Table column headers
export const USER_TABLE_HEADERS = [
  { key: "user", label: "User" },
  { key: "role", label: "Role" },
  { key: "status", label: "Status" },
  { key: "lastActive", label: "Last Active" },
  { key: "actions", label: "Actions", align: "right" },
];

// User actions
export const USER_ACTIONS = {
  EDIT: "edit",
  CHANGE_ROLE: "change_role",
  SEND_EMAIL: "send_email",
  DELETE: "delete",
};
