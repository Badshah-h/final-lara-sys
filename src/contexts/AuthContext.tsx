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
  logout: async () => {},
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

  // Initialize axios with credentials
  useEffect(() => {
    axios.defaults.withCredentials = true;
  }, []);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Set authorization header
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Get user data
        const response = await axios.get(`${API_BASE_URL}/user`);
        setUser(response.data);
        setIsAuthenticated(true);

        // Clear any previous refresh attempts
        localStorage.removeItem("auth_refresh_attempted");
      } catch (error) {
        console.error("Failed to load user:", error);
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Get CSRF cookie
  const getCsrfCookie = async () => {
    try {
      // Extract the base URL without the /api suffix
      const baseUrl = API_BASE_URL.endsWith("/api")
        ? API_BASE_URL.substring(0, API_BASE_URL.length - 4)
        : API_BASE_URL;

      await axios.get(`${baseUrl}/sanctum/csrf-cookie`, {
        withCredentials: true,
      });
      console.log("CSRF cookie fetched successfully");
      return true;
    } catch (error) {
      console.error("Failed to get CSRF cookie:", error);
      return false;
    }
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

      // Store token
      const token =
        response.data.data?.token ||
        response.data.data?.access_token ||
        response.data.token ||
        response.data.access_token;

      if (token) {
        localStorage.setItem("token", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }

      // Set user data directly from the response if available
      if (response.data.data?.user) {
        setUser(response.data.data.user);
        setIsAuthenticated(true);
        return response.data;
      }

      // Otherwise try to get user data separately
      try {
        const userResponse = await axios.get(`${API_BASE_URL}/user`);
        setUser(userResponse.data);
        setIsAuthenticated(true);
      } catch (userError) {
        console.error("Failed to fetch user data:", userError);
        // Still return true since login was successful
      }

      return response.data;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
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

      // Store token
      const token = response.data.token || response.data.access_token;
      if (token) {
        localStorage.setItem("token", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }

      // Get user data
      const userResponse = await axios.get(`${API_BASE_URL}/user`);
      setUser(userResponse.data);
      setIsAuthenticated(true);

      return true;
    } catch (error) {
      console.error("Registration failed:", error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await axios.post(`${API_BASE_URL}/logout`);
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      // Always clear local state even if API call fails
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const hasRole = (role: string): boolean => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
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

// Define the hook as a separate function declaration first
function useAuth() {
  const context = useContext(AuthContext);
  return context;
}

// Export the hook separately
export { useAuth };
