/**
 * User API service
 */
import { BaseApiService } from "@/services/api/base";
import {
  ApiResponse,
  UserCreateRequest,
  PaginatedResponse,
  UserUpdateRequest,
  UserQueryParams,
} from "@/services/api/types";
import { User } from "@/types";

export class UserService extends BaseApiService {
  /**
   * Get all users with optional filtering and pagination
   */
  async getUsers(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    return this.get<PaginatedResponse<User>>("/users", params);
  }

  /**
   * Get a single user by ID
   */
  async getUser(id: string): Promise<ApiResponse<User>> {
    return this.get<ApiResponse<User>>(`/users/${id}`);
  }

  /**
   * Create a new user
   */
  async createUser(userData: UserCreateRequest): Promise<ApiResponse<User>> {
    return this.post<ApiResponse<User>>("/users", userData);
  }

  /**
   * Update an existing user
   */
  async updateUser(
    id: string,
    userData: UserUpdateRequest,
  ): Promise<ApiResponse<User>> {
    return this.patch<ApiResponse<User>>(`/users/${id}`, userData);
  }

  /**
   * Delete a user
   */
  async deleteUser(id: string): Promise<ApiResponse<null>> {
    return this.delete<ApiResponse<null>>(`/users/${id}`);
  }

  /**
   * Send password reset email to user
   */
  async sendPasswordReset(email: string): Promise<ApiResponse<null>> {
    return this.post<ApiResponse<null>>("/users/password-reset", { email });
  }

  /**
   * Change user status (activate/deactivate)
   */
  async changeUserStatus(
    id: string,
    status: string,
  ): Promise<ApiResponse<User>> {
    return this.patch<ApiResponse<User>>(`/users/${id}/status`, { status });
  }
}
