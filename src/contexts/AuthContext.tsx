import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService, User } from "../services/auth/authService";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<any>;
  register: (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
  ) => Promise<any>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Check if user is authenticated on mount and periodically validate session
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check if token exists before validating it
        const hasToken = tokenService.getToken() !== null;

        if (hasToken) {
          console.log("Token found, validating and fetching user data");
          // Add a small delay to ensure token is properly initialized
          // This helps avoid race conditions during app initialization
          await new Promise((resolve) => setTimeout(resolve, 100));

          try {
            // Attempt to refresh token if needed before getting user data
            if (tokenService.isTokenExpired(300)) {
              // 5 minutes threshold
              console.log("Token is expiring soon, attempting refresh");
              await authService.refreshToken();
            }

            const response = await authService.getCurrentUser();
            setUser(response.data);
            console.log("User data fetched successfully", response.data);
          } catch (apiError: any) {
            if (apiError.status === 401) {
              console.warn("Token validation failed - clearing invalid token");
              // Don't call full logout here as it redirects, just clear the token
              tokenService.clearToken();
              setUser(null); // Ensure user state is cleared
            } else {
              console.error("Error fetching user data:", apiError);
              setError(
                apiError instanceof Error
                  ? apiError
                  : new Error("Failed to fetch user"),
              );
            }
          }
        } else {
          console.log("No authentication token found");
          setUser(null);
        }
      } catch (err) {
        console.error("Authentication check failed:", err);
        setError(
          err instanceof Error ? err : new Error("Authentication check failed"),
        );
      } finally {
        setIsLoading(false);
      }
    };

    // Initial session check
    checkAuth();

    // Set an interval to check the session every 5 minutes
    const intervalId = setInterval(checkAuth, 5 * 60 * 1000); // Every 5 minutes

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, []); // This will run once when the component mounts

  const login = async (email: string, password: string, remember = false) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log(`Attempting login for ${email} with remember: ${remember}`);
      const response = await authService.login({ email, password, remember });

      // Set the user in state
      setUser(response.data.user);
      console.log("Login successful, user data received:", response.data.user);

      // Check if there's a stored redirect path
      const redirectPath = sessionStorage.getItem("auth_redirect");
      if (redirectPath) {
        console.log(`Found stored redirect path: ${redirectPath}`);
        sessionStorage.removeItem("auth_redirect");
      }

      return response;
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err : new Error("Login failed"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    password_confirmation: string,
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log(`Attempting registration for ${email}`);
      const response = await authService.register({
        name,
        email,
        password,
        password_confirmation,
      });

      // Set the user in state
      setUser(response.data.user);
      console.log(
        "Registration successful, user data received:",
        response.data.user,
      );

      return response;
    } catch (err) {
      console.error("Registration error:", err);
      setError(err instanceof Error ? err : new Error("Registration failed"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.logout();
      setUser(null);
      // Optionally, redirect user to login page
      window.location.href = "/login"; // Or use a routing library if applicable
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Logout failed"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const hasRole = (role: string): boolean => {
    if (!user || !user.roles) return false;
    return user.roles.some((r) => r.name.toLowerCase() === role.toLowerCase());
  };

  const hasPermission = (permission: string): boolean => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  };

  // Compute isAuthenticated based on user existence
  // We already validate the token when fetching the user, so we don't need to check it again
  // This prevents race conditions where token is valid but not yet fully processed
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        isAuthenticated,
        login,
        register,
        logout,
        hasRole,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Export the hook as a const arrow function for Fast Refresh compatibility
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
