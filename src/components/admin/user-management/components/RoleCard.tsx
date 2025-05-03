import {
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState, useMemo } from "react";
import RolePermissionDisplay from "./RolePermissionDisplay";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Role } from "@/types";
import { getRoleBadgeVariant } from "@/utils/helpers";

interface RoleCardProps {
  role: Role;
  onEdit?: (role: Role) => void;
  onDelete?: (role: Role) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

const RoleCard = ({
  role,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}: RoleCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Group permissions by category
  const permissionsByCategory = useMemo(() => {
    if (!role.permissions || !Array.isArray(role.permissions)) {
      return {};
    }

    // Extract categories from permission names
    const categories: Record<string, string[]> = {};

    role.permissions.forEach(permission => {
      // Extract category from permission name (e.g., "user.create" -> "user")
      const category = permission.split('.')[0] || 'General';
      const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);

      if (!categories[formattedCategory]) {
        categories[formattedCategory] = [];
      }

      categories[formattedCategory].push(permission);
    });

    return categories;
  }, [role.permissions]);

  // Get all unique categories
  const permissionCategories = useMemo(() =>
    Object.keys(permissionsByCategory).length > 0
      ? Object.keys(permissionsByCategory)
      : ['User', 'Role', 'Permission', 'System'],
    [permissionsByCategory]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{role.name}</CardTitle>
            <CardDescription>{role.description}</CardDescription>
          </div>
          <Badge variant={getRoleBadgeVariant(role.name)}>
            {role.userCount || 0} {role.userCount === 1 ? "User" : "Users"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {permissionCategories.map((category: string) => (
            <div key={category} className="flex items-center justify-between">
              <Label>{category}</Label>
              {permissionsByCategory[category] && permissionsByCategory[category].length > 0 ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-500" />
              )}
            </div>
          ))}
        </div>

        <Collapsible
          open={isExpanded}
          onOpenChange={setIsExpanded}
          className="pt-2"
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex w-full justify-between p-0 h-8"
            >
              <span className="text-sm font-medium">
                {isExpanded
                  ? "Hide detailed permissions"
                  : "Show detailed permissions"}
              </span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <RolePermissionDisplay role={role} />
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {canDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete && onDelete(role)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}
        {canEdit && (
          <Button
            variant="default"
            size="sm"
            onClick={() => onEdit && onEdit(role)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default RoleCard;
