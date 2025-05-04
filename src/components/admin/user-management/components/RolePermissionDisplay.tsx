import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Role, Permission } from "@/types";

interface RolePermissionDisplayProps {
  role: Role;
  availablePermissions?: Permission[];
}

const RolePermissionDisplay = ({
  role,
  availablePermissions = [],
}: RolePermissionDisplayProps) => {
  // Group permissions by module/category
  const groupPermissionsByCategory = () => {
    // Ensure role.permissions is valid
    if (!role.permissions) {
      return {};
    }

    // Convert role.permissions to a clean array of strings
    const rolePermissionIds: string[] = [];
    if (Array.isArray(role.permissions)) {
      role.permissions.forEach(p => {
        if (typeof p === "string") {
          rolePermissionIds.push(p);
        } else if (p && typeof p === "object" && 'id' in p) {
          rolePermissionIds.push((p as {id: string}).id);
        }
      });
    }

    // If we have the full permission objects available
    if (availablePermissions.length > 0 && rolePermissionIds.length > 0) {
      const permissionsByCategory: Record<string, Permission[]> = {};

      // Only include permissions that this role has
      const rolePermissions = availablePermissions.filter(p => 
        rolePermissionIds.includes(p.id)
      );

      // Group by category/module
      rolePermissions.forEach(permission => {
        const category = permission.module || "General";
        if (!permissionsByCategory[category]) {
          permissionsByCategory[category] = [];
        }
        permissionsByCategory[category].push(permission);
      });

      return permissionsByCategory;
    }

    // Fallback if we only have permission IDs
    // Group by common prefixes in permission names
    if (rolePermissionIds.length > 0) {
      const permissionsByCategory: Record<string, string[]> = {
        "User Management": [],
        "Role Management": [],
        "Permission Management": [],
        "System Settings": [],
        "Other": [],
      };

      rolePermissionIds.forEach(permId => {
        if (!permId || typeof permId !== 'string') {
          return;
        }

        if (permId.includes("user")) {
          permissionsByCategory["User Management"].push(permId);
        } else if (permId.includes("role")) {
          permissionsByCategory["Role Management"].push(permId);
        } else if (permId.includes("permission")) {
          permissionsByCategory["Permission Management"].push(permId);
        } else if (permId.includes("system") || permId.includes("setting")) {
          permissionsByCategory["System Settings"].push(permId);
        } else {
          permissionsByCategory["Other"].push(permId);
        }
      });

      // Remove empty categories
      Object.keys(permissionsByCategory).forEach(key => {
        if (permissionsByCategory[key].length === 0) {
          delete permissionsByCategory[key];
        }
      });

      return permissionsByCategory;
    }

    return {};
  };

  const permissionsByCategory = groupPermissionsByCategory();
  const categoryCount = Object.keys(permissionsByCategory).length;

  if (!role.permissions || role.permissions.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-2">
        No permissions assigned to this role
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {categoryCount > 0 ? (
        Object.entries(permissionsByCategory).map(([category, permissions]) => (
          <div key={category} className="space-y-2">
            <h4 className="text-sm font-medium">{category}</h4>
            <div className="flex flex-wrap gap-1.5">
              {Array.isArray(permissions) &&
                permissions.map((permission, index) => {
                  // Handle both string permissions and permission objects
                  const permName =
                    typeof permission === "string"
                      ? permission
                          .split("_")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1),
                          )
                          .join(" ")
                      : permission.name;

                  return (
                    <Badge key={index} variant="outline" className="text-xs">
                      {permName}
                    </Badge>
                  );
                })}
            </div>
            {category !== Object.keys(permissionsByCategory).pop() && (
              <Separator className="my-2" />
            )}
          </div>
        ))
      ) : (
        <div className="text-sm text-muted-foreground">
          No permissions assigned to this role
        </div>
      )}
    </div>
  );
};

export default RolePermissionDisplay;
