import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Role, User } from "@/types";

interface UserRoleDisplayProps {
  user: User;
  allRoles?: Role[];
}

const UserRoleDisplay = ({ user, allRoles = [] }: UserRoleDisplayProps) => {
  // Handle different data structures for user roles
  const getUserRoles = (): Role[] => {
    // If user has roles array and it's not empty
    if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
      // Only show active roles
      return user.roles
        .filter((role) => !role.pivot || role.pivot.is_active)
        .map(role => ({
          id: role.id,
          name: role.name,
          description: role.description || '',
          userCount: 0,
          permissions: []
        }));
    }

    // If user has a single role string (legacy format)
    if (user.role && typeof user.role === 'string') {
      // Try to find the role in allRoles
      if (allRoles.length > 0) {
        const foundRole = allRoles.find(r => r.name.toLowerCase() === user.role?.toLowerCase());
        if (foundRole) {
          return [foundRole];
        }
      }

      // Create a simple role object from the string
      return [{
        id: user.role,
        name: user.role,
        description: '',
        userCount: 0,
        permissions: []
      }];
    }

    // If user has role IDs and we have allRoles to match against
    if (user.roleIds && Array.isArray(user.roleIds) && allRoles.length > 0) {
      return user.roleIds
        .map((roleId) => allRoles.find((r) => r.id === roleId))
        .filter(Boolean) as Role[];
    }

    return [];
  };

  const roles = getUserRoles();

  if (roles.length === 0) {
    return (
      <span className="text-muted-foreground text-sm">No role assigned</span>
    );
  }

  if (roles.length === 1) {
    return <Badge variant="outline">{roles[0].name}</Badge>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1">
            <Badge variant="outline">{roles[0].name}</Badge>
            {roles.length > 1 && (
              <Badge variant="secondary" className="text-xs">
                +{roles.length - 1}
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="w-auto">
          <div className="space-y-1">
            <p className="font-medium text-sm">Assigned Roles:</p>
            <ul className="list-disc pl-4 text-sm">
              {roles.map((role) => (
                <li key={role.id}>{role.name}</li>
              ))}
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default UserRoleDisplay;
