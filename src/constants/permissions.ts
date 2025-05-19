/**
 * Permission constants and utility functions
 */

// Permission categories
export const PERMISSION_CATEGORIES = [
  "User Management",
  "Content Management",
  "System Settings",
  "Analytics",
  "API Access"
];

/**
 * Check if a role has any permission in a specific category
 * @param permissions Array of permission IDs
 * @param category Category name to check
 * @returns boolean indicating if the role has any permission in the category
 */
export function hasPermissionInCategory(permissions: string[], category: string): boolean {
  // Map categories to permission prefixes
  const categoryPrefixMap: Record<string, string[]> = {
    "User Management": ["users."],
    "Content Management": ["content."],
    "System Settings": ["settings."],
    "Analytics": ["analytics."],
    "API Access": ["api."]
  };
  
  // Get the prefixes for this category
  const prefixes = categoryPrefixMap[category] || [];
  
  // Check if any permission starts with the category prefix
  return permissions.some(permissionId => {
    // For numeric IDs, we can't determine the category, so we'll return false
    if (!isNaN(Number(permissionId))) {
      return false;
    }
    
    // Check if the permission starts with any of the prefixes
    return prefixes.some(prefix => permissionId.startsWith(prefix));
  });
}

/**
 * Get a list of permissions by category
 * @param allPermissions Array of all permissions
 * @param category Category to filter by
 * @returns Array of permissions in the specified category
 */
export function getPermissionsByCategory(allPermissions: any[], category: string): any[] {
  return allPermissions.filter(permission => {
    // If the permission has a category property, use that
    if (permission.category) {
      return permission.category === category;
    }
    
    // Otherwise, try to determine the category from the permission name
    const name = permission.name || '';
    
    switch (category) {
      case "User Management":
        return name.startsWith('users.');
      case "Content Management":
        return name.startsWith('content.');
      case "System Settings":
        return name.startsWith('settings.');
      case "Analytics":
        return name.startsWith('analytics.');
      case "API Access":
        return name.startsWith('api.');
      default:
        return false;
    }
  });
}
