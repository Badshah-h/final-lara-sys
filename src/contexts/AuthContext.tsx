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
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const response = await authService.getCurrentUser();
          setUser(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to fetch user"),
        );
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string, remember = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login({ email, password, remember });
      setUser(response.data.user);
    } catch (err) {
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
      const response = await authService.register({
        name,
        email,
        password,
        password_confirmation,
      });
      setUser(response.data.user);
    } catch (err) {
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        isAuthenticated: !!user,
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

// Export the hook directly as a named function declaration for Fast Refresh compatibility
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
