/**
 * Auth Module
 * 
 * This module exports the authentication service and related components.
 * It serves as a bridge to maintain compatibility with code that imports from @/modules/auth.
 */

// Re-export the auth service from the services directory
export { authService as AuthService } from "@/services/auth/authService";
export type { User, LoginCredentials, RegisterData, ResetPasswordData, ForgotPasswordData } from "@/services/auth/authService";
