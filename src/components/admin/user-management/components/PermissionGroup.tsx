import { PermissionCategory } from "../../../../types";
import PermissionCheckbox from "./PermissionCheckbox";

interface PermissionGroupProps {
  category: PermissionCategory;
  selectedPermissions: string[];
  setStateFunction: Function;
  currentState: any;
  idPrefix?: string;
}

const PermissionGroup = ({
  category,
  selectedPermissions,
  setStateFunction,
  currentState,
  idPrefix = "perm",
}: PermissionGroupProps) => {
  return (
    <div className="space-y-2">
      <h4 className="font-medium text-sm">{category.category}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {category.permissions.map((permission) => (
          <PermissionCheckbox
            key={permission.id}
            permission={permission}
            checked={selectedPermissions.includes(permission.id)}
            setStateFunction={setStateFunction}
            currentState={currentState}
            idPrefix={idPrefix}
          />
        ))}
      </div>
    </div>
  );
};

export default PermissionGroup;
