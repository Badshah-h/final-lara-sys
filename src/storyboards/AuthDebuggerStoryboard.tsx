import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { JsonViewer } from "@/components/ui/json-viewer";
import { tokenService } from "@/services/auth/tokenService";
import { authService } from "@/services/auth/authService";

const AuthDebuggerStoryboard = () => {
  const [authState, setAuthState] = useState({
    token: null as string | null,
    csrfToken: null as string | null,
    tokenExpiry: null as string | null,
    tokenDecoded: null as any,
    isAuthenticated: false,
    currentUser: null as any,
  });

  const refreshState = async () => {
    const token = tokenService.getToken();
    const csrfToken = tokenService.getCsrfToken();
    let tokenDecoded = null;
    let tokenExpiry = null;
    let currentUser = null;
    let isAuthenticated = false;

    if (token) {
      tokenDecoded = tokenService.decodeToken(token);
      isAuthenticated = tokenService.validateToken();
      if (tokenDecoded?.exp) {
        tokenExpiry = new Date(tokenDecoded.exp * 1000).toLocaleString();
      }

      try {
        const response = await authService.getCurrentUser();
        currentUser = response.data;
      } catch (error) {
        // Error fetching current user
      }
    }

    setAuthState({
      token,
      csrfToken,
      tokenExpiry,
      tokenDecoded,
      isAuthenticated,
      currentUser,
    });
  };

  useEffect(() => {
    refreshState();
  }, []);

  const initCsrfToken = async () => {
    try {
      await tokenService.initCsrfToken();
      refreshState();
    } catch (error) {
      // Error initializing CSRF token
    }
  };

  const clearTokens = () => {
    tokenService.clearToken();
    tokenService.setCsrfToken("");
    refreshState();
  };

  return (
    <div className="bg-background min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Authentication Debugger</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Auth Token</span>
                <Badge variant={authState.token ? "success" : "destructive"}>
                  {authState.token ? "Present" : "Missing"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Authenticated:</span>{" "}
                  {authState.isAuthenticated ? "Yes" : "No"}
                </div>
                {authState.tokenExpiry && (
                  <div>
                    <span className="font-medium">Expires:</span>{" "}
                    {authState.tokenExpiry}
                  </div>
                )}
                <div className="mt-4">
                  <Button onClick={clearTokens} variant="destructive" size="sm">
                    Clear Tokens
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>CSRF Token</span>
                <Badge
                  variant={authState.csrfToken ? "success" : "destructive"}
                >
                  {authState.csrfToken ? "Present" : "Missing"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {authState.csrfToken && (
                  <div>
                    <span className="font-medium">Token (first 10 chars):</span>{" "}
                    {authState.csrfToken.substring(0, 10)}...
                  </div>
                )}
                <div className="mt-4">
                  <Button onClick={initCsrfToken} variant="outline" size="sm">
                    Initialize CSRF Token
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Current User</CardTitle>
            </CardHeader>
            <CardContent>
              {authState.currentUser ? (
                <JsonViewer
                  data={authState.currentUser}
                  height="200px"
                  showCopyButton={true}
                />
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No user data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Decoded Token</CardTitle>
            </CardHeader>
            <CardContent>
              {authState.tokenDecoded ? (
                <JsonViewer
                  data={authState.tokenDecoded}
                  height="200px"
                  showCopyButton={true}
                />
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No token data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Cookies</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <pre className="text-sm">
                  {document.cookie.split(";").map((cookie) => (
                    <div key={cookie} className="py-1 border-b border-border">
                      {cookie.trim()}
                    </div>
                  ))}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="flex justify-center mt-4">
            <Button onClick={refreshState}>Refresh Data</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthDebuggerStoryboard;
