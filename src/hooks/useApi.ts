import { useCallback } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/services/api/config";

// Mock data for roles and permissions
const mockRoles = [
  {
    id: "1",
    name: "Admin",
    description: "Full access to all features",
    permissions: ["1", "2", "3", "4", "5"],
    userCount: 2
  },
  {
    id: "2",
    name: "Editor",
    description: "Can edit content but not manage users",
    permissions: ["2", "3"],
    userCount: 5
  },
  {
    id: "3",
    name: "Viewer",
    description: "Read-only access to content",
    permissions: ["3"],
    userCount: 10
  }
];

const mockPermissionCategories = [
  {
    id: "1",
    category: "User Management",
    permissions: [
      { id: "1", name: "users.create", displayName: "Create Users", description: "Ability to create new users" },
      { id: "2", name: "users.read", displayName: "View Users", description: "Ability to view user details" },
      { id: "3", name: "users.update", displayName: "Edit Users", description: "Ability to edit user details" },
      { id: "4", name: "users.delete", displayName: "Delete Users", description: "Ability to delete users" }
    ]
  },
  {
    id: "2",
    category: "Content Management",
    permissions: [
      { id: "5", name: "content.create", displayName: "Create Content", description: "Ability to create new content" },
      { id: "6", name: "content.read", displayName: "View Content", description: "Ability to view content" },
      { id: "7", name: "content.update", displayName: "Edit Content", description: "Ability to edit content" },
      { id: "8", name: "content.delete", displayName: "Delete Content", description: "Ability to delete content" }
    ]
  }
];

// Define the hook's options interface
interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  autoExecute?: boolean;
  dependencies?: any[];
  skipCache?: boolean;
}

/**
 * Generic hook to make API calls with loading, error, and data state.
 * @param apiFunction - The API function that returns a Promise.
 * @param options - Optional hook behavior and callbacks.
 */
export function useApi() {
  // Simple mock API implementation that returns mock data
  const get = useCallback((endpoint: string) => {
    console.log(`Mock API GET request to ${endpoint}`);

    // Return mock data based on the endpoint
    if (endpoint === '/roles') {
      return Promise.resolve({ success: true, data: mockRoles });
    } else if (endpoint === '/permissions/categories') {
      return Promise.resolve({ success: true, data: mockPermissionCategories });
    }

    return Promise.resolve({ success: false, message: 'Endpoint not found' });
  }, []);

  const post = useCallback((endpoint: string, data: any) => {
    console.log(`Mock API POST request to ${endpoint}`, data);
    return Promise.resolve({ success: true, data: { id: Date.now().toString(), ...data } });
  }, []);

  const put = useCallback((endpoint: string, data: any) => {
    console.log(`Mock API PUT request to ${endpoint}`, data);
    return Promise.resolve({ success: true, data });
  }, []);

  const del = useCallback((endpoint: string) => {
    console.log(`Mock API DELETE request to ${endpoint}`);
    return Promise.resolve({ success: true });
  }, []);

  // Return the API methods
  return {
    get,
    post,
    put,
    delete: del
  };


}
