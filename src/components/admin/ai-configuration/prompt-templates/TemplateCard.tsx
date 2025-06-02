import { Edit, Copy, Trash2, Tag, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PromptTemplate } from "@/types/ai-configuration";
import { useState } from "react";

interface TemplateCardProps {
  template: PromptTemplate;
  categoryName: string;
  onEdit: (template: PromptTemplate) => void;
  onDelete: (id: string) => void;
  onClone: (template: PromptTemplate) => void;
}

export const TemplateCard = ({
  template,
  categoryName,
  onEdit,
  onDelete,
  onClone,
}: TemplateCardProps) => {
  const [isCloning, setIsCloning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClone = async () => {
    try {
      setIsCloning(true);
      await onClone(template);
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setIsCloning(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(template.id);
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper function to safely render variables
  const renderVariables = () => {
    if (!template.variables || !Array.isArray(template.variables)) {
      return null;
    }

    return template.variables.map((variable, index) => {
      // Handle both string variables and object variables
      let variableName: string;
      let variableKey: string;

      if (typeof variable === 'string') {
        variableName = variable;
        variableKey = `${template.id}-var-${variable}-${index}`;
      } else if (typeof variable === 'object' && variable !== null) {
        // Handle object variables with name property
        variableName = variable.name || `Variable ${index + 1}`;
        variableKey = `${template.id}-var-${variableName}-${index}`;
      } else {
        // Fallback for unexpected types
        variableName = `Variable ${index + 1}`;
        variableKey = `${template.id}-var-fallback-${index}`;
      }

      return (
        <Badge key={variableKey} variant="outline">
          {variableName}
        </Badge>
      );
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              {template.name}
              {template.isDefault && (
                <Badge className="ml-2" variant="secondary">
                  Default
                </Badge>
              )}
            </CardTitle>
            <CardDescription>{template.description}</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(template)}
              title="Edit template"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClone}
              disabled={isCloning}
              title="Copy template"
              className="relative"
            >
              {isCloning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={handleDelete}
              disabled={template.isDefault || isDeleting}
              title={template.isDefault ? "Cannot delete default template" : "Delete template"}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-md">
            <pre className="whitespace-pre-wrap text-sm">
              {template.template}
            </pre>
          </div>
          <div>
            <Label>Variables</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {renderVariables()}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Badge variant="outline" className="flex items-center gap-1">
          <Tag className="h-3 w-3" />
          {categoryName}
        </Badge>
        {template.usageCount !== undefined && (
          <span className="text-sm text-muted-foreground">
            Used {template.usageCount} times
          </span>
        )}
      </CardFooter>
    </Card>
  );
};
