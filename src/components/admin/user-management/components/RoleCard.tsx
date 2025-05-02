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
import { useState } from "react";
import RolePermissionDisplay from "./RolePermissionDisplay";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface RoleCardProps {
  role: {
    id: string;
    name: string;
    description?: string;
    permissions?: any[];
    userCount?: number;
  };
  onEdit?: (role: any) => void;
  onDelete?: (role: any) => void;
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

  // Define common permission categories
  const permissionCategories = [
    "User Management",
    "AI Configuration",
    "Widget Builder",
    "Knowledge Base",
    "System Settings",
  ];

  // Check if role has permissions in a specific category
  const hasPermissionInCategory = (category: string) => {
    if (!role.permissions || !Array.isArray(role.permissions)) {
      return false;
    }

    return role.permissions.some((permission) => {
      const permId =
        typeof permission === "string" ? permission : permission.id;

      switch (category) {
        case "User Management":
          return permId.includes("user");
        case "AI Configuration":
          return permId.includes("ai") || permId.includes("model");
        case "Widget Builder":
          return permId.includes("widget");
        case "Knowledge Base":
          return permId.includes("kb") || permId.includes("knowledge");
        case "System Settings":
          return permId.includes("system") || permId.includes("setting");
        default:
          return false;
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{role.name}</CardTitle>
            <CardDescription>{role.description}</CardDescription>
          </div>
          <Badge variant="outline">
            {role.userCount || 0} {role.userCount === 1 ? "User" : "Users"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {permissionCategories.map((category) => (
            <div key={category} className="flex items-center justify-between">
              <Label>{category}</Label>
              {hasPermissionInCategory(category) ? (
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
