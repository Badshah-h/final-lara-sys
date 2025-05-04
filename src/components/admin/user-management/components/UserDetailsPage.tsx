import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { userService } from "@/services/user-management/userService";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Edit, Trash2 } from "lucide-react";
import UserActivityLogs from "../tabs/UserActivityLogs";
import { EditUserDialog } from "../dialogs/EditUserDialog";
import { DeleteUserDialog } from "../dialogs/DeleteUserDialog";
import StatusIcon from "./StatusIcon";
import UserRoleDisplay from "./UserRoleDisplay";

const UserDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);
        const response = await userService.getUser(id);
        setUser(response.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleUserUpdated = async () => {
    if (!id) return;

    try {
      const response = await userService.getUser(id);
      setUser(response.data);
    } catch (err) {
      console.error("Failed to refresh user data:", err);
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading user details...</span>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-destructive mb-4">
          {error?.message || "Failed to load user details"}
        </p>
        <Button onClick={handleBackClick}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleBackClick}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowEditDialog(true)}
          >
            <Edit className="mr-2 h-4 w-4" /> Edit User
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete User
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <Card className="w-full md:w-1/3">
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Avatar className="h-32 w-32 mb-4">
              <AvatarImage src={user.avatar || undefined} alt={user.name} />
              <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-muted-foreground mb-2">{user.email}</p>

            <div className="flex items-center gap-2 mb-2">
              <StatusIcon status={user.status} />
              <span className="capitalize">{user.status}</span>
            </div>

            <div className="mb-4">
              <UserRoleDisplay user={user} />
            </div>

            {user.last_active && (
              <p className="text-sm text-muted-foreground">
                Last active: {new Date(user.last_active).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>

        <div className="w-full md:w-2/3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="profile">Profile Details</TabsTrigger>
              <TabsTrigger value="activity">Activity Log</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>User Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Full Name</h3>
                      <p>{user.name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                      <p>{user.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                      <div className="flex items-center gap-2">
                        <StatusIcon status={user.status} />
                        <span className="capitalize">{user.status}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Role</h3>
                      <UserRoleDisplay user={user} />
                    </div>
                    {user.last_active && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Last Active</h3>
                        <p>{new Date(user.last_active).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <UserActivityLogs userId={user.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {showEditDialog && (
        <EditUserDialog
          user={user}
          open={showEditDialog}
          onOpenChange={(open) => {
            setShowEditDialog(open);
            if (!open) handleUserUpdated();
          }}
        />
      )}

      {showDeleteDialog && (
        <DeleteUserDialog
          user={user}
          open={showDeleteDialog}
          onOpenChange={(open) => {
            setShowDeleteDialog(open);
            if (!open && !error) {
              navigate("/admin/user-management");
            }
          }}
        />
      )}
    </div>
  );
};

export default UserDetailsPage;
