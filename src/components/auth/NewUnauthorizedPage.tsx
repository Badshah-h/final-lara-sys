import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewAuthLayout } from "./NewAuthLayout";
import { useNewAuth } from "@/contexts/NewAuthContext";

export default function NewUnauthorizedPage() {
  const { logout } = useNewAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <NewAuthLayout
      title="Access Denied"
      subtitle="You don't have permission to access this page"
    >
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="rounded-full bg-destructive/10 p-6">
          <ShieldAlert className="h-12 w-12 text-destructive" />
        </div>

        <div className="text-center space-y-2">
          <p className="text-muted-foreground">
            Please contact your administrator if you believe this is an error.
          </p>
        </div>

        <div className="flex flex-col w-full space-y-4">
          <Button asChild>
            <Link to="/">Return to Home</Link>
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            Sign in with a different account
          </Button>
        </div>
      </div>
    </NewAuthLayout>
  );
}
