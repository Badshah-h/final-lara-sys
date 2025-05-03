import { useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { userService } from "@/services/user-management/userService";
import { Eye, EyeOff } from "lucide-react";

import { NewUser } from "../../../../types";

interface AddUserDialogProps {
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddUserDialog({
  children,
  open,
  onOpenChange,
}: AddUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newUser, setNewUser] = useState<NewUser>({
    name: "",
    email: "",
    role: "user",
    password: "",
  });
  const [sendEmail, setSendEmail] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleAddUser = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      // Generate a random password if not provided and send_email is true
      const password = newUser.password || (sendEmail ? generateRandomPassword() : '');

      if (!password && !sendEmail) {
        setError("Password is required when not sending a welcome email.");
        setIsSubmitting(false);
        return;
      }

      await userService.createUser({
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        password: password,
        send_email: sendEmail,
      });
      onOpenChange(false);
      setNewUser({ name: "", email: "", role: "user", password: "" });
    } catch (err: any) {
      setError(err?.message || "Failed to add user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate a random secure password
  const generateRandomPassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account and assign roles.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={newUser.role}
              onValueChange={(value) => setNewUser({ ...newUser, role: value })}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="send-email"
              checked={sendEmail}
              onCheckedChange={setSendEmail}
            />
            <Label htmlFor="send-email">
              Send welcome email with password setup link
            </Label>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">
                Password {!sendEmail && <span className="text-destructive">*</span>}
              </Label>
              {sendEmail && (
                <span className="text-xs text-muted-foreground">
                  Optional - will be generated if empty
                </span>
              )}
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={sendEmail ? "Optional - will be generated" : "Enter password"}
                value={newUser.password || ""}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required={!sendEmail}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {error && <div className="text-destructive text-sm mb-2">{error}</div>}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddUser}
            disabled={
              isSubmitting ||
              !newUser.name ||
              !newUser.email ||
              (!sendEmail && !newUser.password)
            }
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 mr-2 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                Adding...
              </>
            ) : (
              "Add User"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
