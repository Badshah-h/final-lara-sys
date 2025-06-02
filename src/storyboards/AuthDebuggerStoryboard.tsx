import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { authService } from "@/services/auth/authService";
import { useAuth } from "@/contexts/AuthContext";

const AuthDebuggerStoryboard = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const refreshDebugInfo = async () => {
    setIsLoading(true);
    try {
      const authStatus = await authService.isAuthenticated();

      setDebugInfo({
        isAuthenticated: authStatus,
        user: user,
        sessionBased: true,
        authMethod: "Laravel Sanctum Session",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      setDebugInfo({
        isAuthenticated: false,
        error: error instanceof Error ? error.message : "Unknown error",
        authMethod: "Laravel Sanctum Session",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshDebugInfo();
  }, [user, isAuthenticated]);

  const handleTestLogin = async () => {
    try {
      await login("admin@example.com", "password");
      await refreshDebugInfo();
    } catch (error) {
      console.error("Test login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      await refreshDebugInfo();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Authentication Debugger</h1>
        <Button onClick={refreshDebugInfo} disabled={isLoading}>
          {isLoading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              <Badge variant={debugInfo.isAuthenticated ? "default" : "destructive"}>
                {debugInfo.isAuthenticated ? "Authenticated" : "Not Authenticated"}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium">Method:</span>
              <Badge variant="outline">{debugInfo.authMethod || "Unknown"}</Badge>
            </div>

            {debugInfo.error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{debugInfo.error}</p>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              Last updated: {debugInfo.timestamp}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-2">
                <div><strong>ID:</strong> {user.id}</div>
                <div><strong>Name:</strong> {user.name}</div>
                <div><strong>Email:</strong> {user.email}</div>
                <div><strong>Status:</strong> {user.status || "Unknown"}</div>
                {user.roles && user.roles.length > 0 && (
                  <div>
                    <strong>Roles:</strong>
                    <div className="flex gap-1 mt-1">
                      {user.roles.map((role) => (
                        <Badge key={role.id} variant="secondary">
                          {role.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No user data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Debug Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={handleTestLogin} variant="outline">
              Test Login (admin@example.com)
            </Button>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>

          <div className="p-4 bg-muted rounded-md">
            <h4 className="font-medium mb-2">Session-Based Authentication</h4>
            <p className="text-sm text-muted-foreground">
              This system uses Laravel Sanctum session-based authentication.
              Authentication state is managed through HTTP-only cookies and sessions,
              providing better security than token-based authentication.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthDebuggerStoryboard;
