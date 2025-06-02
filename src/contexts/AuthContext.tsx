import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import { API_BASE_URL } from "@/services/api/config";

interface User {
  id: string;
  name: string;
  email: string;
  roles?: string[];
  permissions?: string[];
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<any>;
  register: (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  register: async () => false,
  logout: async () => { },
  hasRole: () => false,
  hasPermission: () => false,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Configure axios for Sanctum
  useEffect(() => {
    axios.defaults.withCredentials = true;
    axios.defaults.headers.common['Accept'] = 'application/json';
    axios.defaults.headers.common['Content-Type'] = 'application/json';
  }, []);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/user`);
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        // User not authenticated
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Get CSRF cookie for Sanctum
  const getCsrfCookie = async () => {
    const baseUrl = API_BASE_URL.endsWith("/api")
      ? API_BASE_URL.substring(0, API_BASE_URL.length - 4)
      : API_BASE_URL;

    await axios.get(`${baseUrl}/sanctum/csrf-cookie`);
  };

  const login = async (
    email: string,
    password: string,
    remember: boolean = false,
  ): Promise<any> => {
    try {
      // Get CSRF cookie first
      await getCsrfCookie();

      // Attempt login
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email,
        password,
        remember,
      });

      // Set user data from response
      if (response.data.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      }

      return response.data;
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
  ): Promise<boolean> => {
    try {
      // Get CSRF cookie first
      await getCsrfCookie();

      // Attempt registration
      const response = await axios.post(`${API_BASE_URL}/register`, {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      // Set user data from response
      if (response.data.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return true;
      }

      return false;
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await axios.post(`${API_BASE_URL}/logout`);
    } catch (error) {
      // Logout failed, but we'll clear local state anyway
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const hasRole = (role: string): boolean => {
    return user?.roles?.includes(role) || false;
  };

  const hasPermission = (permission: string): boolean => {
    return user?.permissions?.includes(permission) || false;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    hasRole,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
