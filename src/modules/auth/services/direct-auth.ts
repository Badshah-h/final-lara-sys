/**
 * Direct Auth Service
 * 
 * This file provides direct authentication functions used by auth-test.tsx.
 * It serves as a compatibility layer for older code that imports from this path.
 */

import { authService } from "@/services/auth/authService";
import type { LoginCredentials } from "@/services/auth/authService";

/**
 * Login a user
 * @param credentials Login credentials
 * @returns Promise with login response
 */
export const login = async (credentials: LoginCredentials) => {
  return await authService.login(credentials);
};

/**
 * Logout the current user
 */
export const logout = async () => {
  return await authService.logout();
};

/**
 * Get the current authenticated user
 * @returns Promise with user data
 */
export const getUser = async () => {
  return await authService.getCurrentUser();
};
