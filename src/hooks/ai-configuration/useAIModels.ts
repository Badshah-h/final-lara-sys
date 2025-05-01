/**
 * Custom hook for AI model operations
 */
import { useState, useEffect, useCallback } from "react";
import { aiModelService } from "@/services/ai-configuration/aiModelService";
import { useApi } from "@/hooks/useApi";
import { AIModel, RoutingRule } from "@/types/ai-configuration";

export function useAIModels() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [routingRules, setRoutingRules] = useState<RoutingRule[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // API hooks
  const {
    isLoading: isLoadingModels,
    error: modelsError,
    execute: fetchModels,
  } = useApi(aiModelService.getModels.bind(aiModelService));

  const {
    isLoading: isLoadingRules,
    error: rulesError,
    execute: fetchRules,
  } = useApi(aiModelService.getRoutingRules.bind(aiModelService));

  const { isLoading: isUpdatingModel, execute: executeUpdateModel } = useApi<
    any,
    [string, Partial<AIModel>]
  >(aiModelService.updateModel.bind(aiModelService));

  const { isLoading: isUpdatingRules, execute: executeUpdateRules } = useApi<
    any,
    [RoutingRule[]]
  >(aiModelService.updateRoutingRules.bind(aiModelService));

  // Fetch models and rules on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const modelsResponse = await fetchModels();
        setModels(modelsResponse.data);

        const rulesResponse = await fetchRules();
        setRoutingRules(rulesResponse.data);
      } catch (error) {
        console.error("Error loading AI configuration data:", error);
      }
    };

    loadData();
  }, [fetchModels, fetchRules]);

  // Update a model
  const updateModel = useCallback(
    async (id: string, updates: Partial<AIModel>) => {
      try {
        const response = await executeUpdateModel(id, updates);

        // Update local state
        setModels((prevModels) =>
          prevModels.map((model) =>
            model.id === id ? { ...model, ...updates } : model,
          ),
        );

        setHasChanges(true);
        return response.data;
      } catch (error) {
        console.error(`Error updating model ${id}:`, error);
        throw error;
      }
    },
    [executeUpdateModel],
  );

  // Update routing rules
  const updateRoutingRules = useCallback(
    async (updatedRules: RoutingRule[]) => {
      try {
        const response = await executeUpdateRules(updatedRules);
        setRoutingRules(updatedRules);
        setHasChanges(true);
        return response.data;
      } catch (error) {
        console.error("Error updating routing rules:", error);
        throw error;
      }
    },
    [executeUpdateRules],
  );

  // Add a new routing rule
  const addRoutingRule = useCallback((rule: Omit<RoutingRule, "id">) => {
    const newRule = {
      ...rule,
      id: `rule-${Date.now()}`,
    };

    setRoutingRules((prev) => [...prev, newRule as RoutingRule]);
    setHasChanges(true);
    return newRule;
  }, []);

  // Delete a routing rule
  const deleteRoutingRule = useCallback((id: string) => {
    setRoutingRules((prev) => prev.filter((rule) => rule.id !== id));
    setHasChanges(true);
  }, []);

  // Save all changes
  const saveAllChanges = useCallback(async () => {
    try {
      // In a real implementation, we might batch these updates
      // or handle them in a transaction
      await executeUpdateRules(routingRules);
      setHasChanges(false);
      return true;
    } catch (error) {
      console.error("Error saving changes:", error);
      return false;
    }
  }, [executeUpdateRules, routingRules]);

  // Combine errors
  const error = modelsError || rulesError;

  // Determine if any operation is loading
  const isLoading = isLoadingModels || isLoadingRules;
  const isSaving = isUpdatingModel || isUpdatingRules;

  return {
    models,
    routingRules,
    isLoading,
    isSaving,
    error,
    hasChanges,
    updateModel,
    updateRoutingRules,
    addRoutingRule,
    deleteRoutingRule,
    saveAllChanges,
    refreshData: useCallback(async () => {
      const modelsResponse = await fetchModels();
      setModels(modelsResponse.data);
      const rulesResponse = await fetchRules();
      setRoutingRules(rulesResponse.data);
      setHasChanges(false);
    }, [fetchModels, fetchRules]),
  };
}
