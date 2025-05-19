import { useState, useEffect, useMemo } from 'react';
import { PermissionCategory } from '@/types';

/**
 * Hook to filter permission categories based on a search query
 * 
 * @param categories - The permission categories to filter
 * @param searchQuery - The search query to filter by
 * @returns An object containing the filtered categories
 */
export function usePermissionFilter(
  categories: PermissionCategory[],
  searchQuery: string
) {
  const [filteredCategories, setFilteredCategories] = useState<PermissionCategory[]>(categories);

  // Filter categories based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCategories(categories);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    
    const filtered = categories.map(category => {
      // Filter permissions within the category
      const matchingPermissions = category.permissions.filter(permission => 
        permission.name.toLowerCase().includes(query) || 
        permission.description?.toLowerCase().includes(query)
      );
      
      // If any permissions match, return a new category with only those permissions
      if (matchingPermissions.length > 0) {
        return {
          ...category,
          permissions: matchingPermissions
        };
      }
      
      // If the category name matches, include all permissions
      if (category.category.toLowerCase().includes(query)) {
        return category;
      }
      
      // No match in this category
      return null;
    }).filter(Boolean) as PermissionCategory[];
    
    setFilteredCategories(filtered);
  }, [categories, searchQuery]);

  return { filteredCategories };
}
