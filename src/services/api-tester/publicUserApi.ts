import apiService from '@/services/api/api';

/**
 * Interface for a user returned from the public users API
 */
export interface PublicUser {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  last_active: string | null;
  roles: string[];
}

/**
 * Interface for the response from the public users API
 */
export interface PublicUsersResponse {
  users: PublicUser[];
  total: number;
}

/**
 * Fetch the list of public users
 * @returns Promise with the public users data
 */
export async function fetchPublicUsers(): Promise<PublicUsersResponse> {
  try {
    const response = await apiService.get<PublicUsersResponse>('/public/users');
    return response;
  } catch (error) {
    console.error('Error fetching public users:', error);
    throw error;
  }
}

/**
 * Test the public users API endpoint
 * @returns Promise with a success message or error
 */
export async function testPublicUsersApi(): Promise<{ success: boolean; message: string; data?: PublicUsersResponse }> {
  try {
    console.log('Testing public users API endpoint...');
    const startTime = performance.now();
    
    const response = await fetchPublicUsers();
    
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    return {
      success: true,
      message: `Successfully fetched ${response.total} users in ${duration}ms`,
      data: response
    };
  } catch (error) {
    return {
      success: false,
      message: `Error testing public users API: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

export default {
  fetchPublicUsers,
  testPublicUsersApi
};
