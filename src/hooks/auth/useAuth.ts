/**
 * Custom hook for authentication management
 */
import { useState, useEffect, useCallback } from "react";
import { useApi } from "@/hooks/useApi";
import { authService, type User, type LoginCredentials, type RegisterData } from "@/services/auth/authService";
import { ApiResponse } from "@/services/api/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: authService.isAuthenticated(),
    isLoading: true,
  });

  // API hooks
  const {
    isLoading: isLoggingIn,
    error: loginError,
    execute: executeLogin,
  } = useApi<ApiResponse<{ token: string; user: User }>, [LoginCredentials]>(
    authService.login.bind(authService),
    {
      onSuccess: (response) => {
        setAuthState({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
        });
      },
    }
  );

  const {
    isLoading: isRegistering,
    error: registerError,
    execute: executeRegister,
  } = useApi<ApiResponse<{ token: string; user: User }>, [RegisterData]>(
    authService.register.bind(authService),
    {
      onSuccess: (response) => {
        setAuthState({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
        });
      },
    }
  );

  const {
    isLoading: isLoggingOut,
    error: logoutError,
    execute: executeLogout,
  } = useApi<ApiResponse<null>, []>(
    authService.logout.bind(authService),
    {
      onSuccess: () => {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }
  );

  // Fetch current user on mount
  const fetchCurrentUser = useCallback(async () => {
    if (authState.isAuthenticated) {
      try {
        const response = await authService.getCurrentUser();
        setAuthState({
          user: response.data,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, [authState.isAuthenticated]);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Wrapper functions for better error handling
  const login = async (credentials: LoginCredentials) => {
    try {
      await executeLogin(credentials);
    } catch (error) {
      setAuthState(prev => ({ ...prev, isAuthenticated: false, user: null }));
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      await executeRegister(data);
    } catch (error) {
      setAuthState(prev => ({ ...prev, isAuthenticated: false, user: null }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await executeLogout();
    } catch (error) {
      // Force logout even if API fails
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      throw error;
    }
  };

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading || isLoggingIn || isRegistering || isLoggingOut,
    login,
    register,
    logout,
    loginError,
    registerError,
    logoutError,
    refreshUser: fetchCurrentUser,
  };
} 