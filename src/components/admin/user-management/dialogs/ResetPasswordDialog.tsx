import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { userService } from "@/services/user-management/userService";
import { Eye, EyeOff, Key } from "lucide-react";
import { User } from "@/types";
import { UserPasswordUpdateRequest } from "@/services/api/types";

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

export function ResetPasswordDialog({
  open,
  onOpenChange,
  user,
}: ResetPasswordDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordData, setPasswordData] = useState<UserPasswordUpdateRequest>({
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async () => {
    if (passwordData.password !== passwordData.password_confirmation) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      await userService.updatePassword(user.id, passwordData);
      setSuccess(true);
      setPasswordData({
        password: "",
        password_confirmation: "",
      });
    } catch (err: any) {
      setError(err?.message || "Failed to update password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendResetEmail = async () => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      await userService.sendPasswordResetEmail(user.email);
      setSuccess(true);
      // Close dialog after successful email send
      setTimeout(() => {
        onOpenChange(false);
      }, 2000);
    } catch (err: any) {
      setError(err?.message || "Failed to send password reset email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Reset password for user: {user.name} ({user.email})
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex flex-col space-y-1.5">
            <h3 className="text-sm font-medium">Option 1: Set new password directly</h3>
            <p className="text-xs text-muted-foreground">
              Set a new password for this user directly.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={passwordData.password}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, password: e.target.value })
                }
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
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={passwordData.password_confirmation}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    password_confirmation: e.target.value,
                  })
                }
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowConfirmPassword((v) => !v)}
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <Button
            onClick={handleResetPassword}
            disabled={
              isSubmitting ||
              !passwordData.password ||
              !passwordData.password_confirmation ||
              passwordData.password !== passwordData.password_confirmation
            }
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 mr-2 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <div className="flex flex-col space-y-1.5">
            <h3 className="text-sm font-medium">Option 2: Send password reset email</h3>
            <p className="text-xs text-muted-foreground">
              Send a password reset link to the user's email address.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleSendResetEmail}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 mr-2 rounded-full border-2 border-t-transparent border-primary animate-spin"></div>
                Sending...
              </>
            ) : (
              <>
                <Key className="mr-2 h-4 w-4" />
                Send Reset Email
              </>
            )}
          </Button>

          {error && (
            <div className="text-destructive text-sm p-2 bg-destructive/10 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="text-green-600 text-sm p-2 bg-green-50 rounded-md">
              Operation completed successfully!
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
