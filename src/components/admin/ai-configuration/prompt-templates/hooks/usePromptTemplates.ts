import { useState, useEffect } from 'react';
import { PromptTemplate } from '@/types/ai-configuration';
import { apiService } from '@/services/api';
import { showSuccessToast, showErrorToast } from '@/lib/utils';

export function usePromptTemplates() {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<PromptTemplate | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories] = useState([
    { id: 'all', name: 'All Categories' },
    { id: 'general', name: 'General' },
    { id: 'customer-support', name: 'Customer Support' },
    { id: 'sales', name: 'Sales' }
  ]);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.get<any>('/prompt-templates');

      // Handle different response structures
      let templatesData: PromptTemplate[] = [];
      if (Array.isArray(response)) {
        templatesData = response;
      } else if (response.data && Array.isArray(response.data)) {
        templatesData = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        templatesData = response.data.data;
      }

      setTemplates(templatesData);
    } catch (error) {
      console.error('Failed to fetch prompt templates:', error);
      showErrorToast('Error', 'Failed to load prompt templates');
      setTemplates([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchTemplates();
  };

  const handleAddTemplate = () => {
    setCurrentTemplate(null);
    setShowAddDialog(true);
  };

  const handleEditTemplate = (template: PromptTemplate) => {
    setCurrentTemplate(template);
    setShowEditDialog(true);
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await apiService.delete(`/prompt-templates/${id}`);
      setTemplates(prev => Array.isArray(prev) ? prev.filter(template => template.id !== id) : []);
      showSuccessToast('Success', 'Template deleted successfully');
    } catch (error) {
      console.error('Failed to delete template:', error);
      showErrorToast('Error', 'Failed to delete template');
      throw error;
    }
  };

  const handleCloneTemplate = async (template: PromptTemplate) => {
    try {
      const clonedData = {
        ...template,
        name: `${template.name} (Copy)`,
        isDefault: false,
      };
      delete (clonedData as any).id;

      const newTemplate = await apiService.post<PromptTemplate>('/prompt-templates', clonedData);
      setTemplates(prev => Array.isArray(prev) ? [...prev, newTemplate] : [newTemplate]);
      showSuccessToast('Success', `Template "${template.name}" copied successfully`);
    } catch (error) {
      console.error('Failed to clone template:', error);
      showErrorToast('Error', 'Failed to copy template');
      throw error;
    }
  };

  const handleSaveNewTemplate = async (templateData: Partial<PromptTemplate>) => {
    try {
      const newTemplate = await apiService.post<PromptTemplate>('/prompt-templates', templateData);
      setTemplates(prev => Array.isArray(prev) ? [...prev, newTemplate] : [newTemplate]);
      setShowAddDialog(false);
      showSuccessToast('Success', 'Template created successfully');
    } catch (error) {
      console.error('Failed to create template:', error);
      showErrorToast('Error', 'Failed to create template');
      throw error;
    }
  };

  const handleSaveEditedTemplate = async (id: string, templateData: Partial<PromptTemplate>) => {
    try {
      const updatedTemplate = await apiService.put<PromptTemplate>(`/prompt-templates/${id}`, templateData);
      setTemplates(prev => Array.isArray(prev) ? prev.map(t => t.id === id ? updatedTemplate : t) : [updatedTemplate]);
      setShowEditDialog(false);
      setCurrentTemplate(null);
      showSuccessToast('Success', 'Template updated successfully');
    } catch (error) {
      console.error('Failed to update template:', error);
      showErrorToast('Error', 'Failed to update template');
      throw error;
    }
  };

  const extractVariables = (template: string): string[] => {
    const regex = /\{([^}]+)\}/g;
    const variables: string[] = [];
    let match;

    while ((match = regex.exec(template)) !== null) {
      variables.push(match[1].trim());
    }

    return [...new Set(variables)];
  };

  const createTemplateMutation = {
    isPending: false,
  };

  const updateTemplateMutation = {
    isPending: false,
  };

  // Ensure templates is always an array before filtering
  const templatesArray = Array.isArray(templates) ? templates : [];

  // Filter templates based on search and category
  const filteredTemplates = templatesArray.filter(template => {
    const matchesSearch = (template.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (template.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates: filteredTemplates,
    isLoading,
    currentTemplate,
    showAddDialog,
    showEditDialog,
    searchQuery,
    selectedCategory,
    categories,
    setShowAddDialog,
    setShowEditDialog,
    setSearchQuery,
    setSelectedCategory,
    handleRefresh,
    handleAddTemplate,
    handleEditTemplate,
    handleDeleteTemplate,
    handleCloneTemplate,
    handleSaveNewTemplate,
    handleSaveEditedTemplate,
    fetchTemplates,
    extractVariables,
    createTemplateMutation,
    updateTemplateMutation,
  };
}
