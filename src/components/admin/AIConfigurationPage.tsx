import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Save, RefreshCw } from "lucide-react";

// Import all AI configuration components
import AIModelManager from "./ai-configuration/AIModelManager";
import PromptTemplateManager from "./ai-configuration/prompt-templates/PromptTemplateManager";
import ResponseFormatterManager from "./ai-configuration/response-formats/ResponseFormatterManager";
import DataSourcesManager from "./ai-configuration/data-sources/DataSourcesManager";
import BrandingEngineManager from "./ai-configuration/BrandingEngineManager";
import { FollowUpManager } from "./ai-configuration/FollowUpManager";
import { apiService } from "@/services/api";
import AIConfigSidebar from "./AIConfigSidebar";

interface AIConfiguration {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  models: any[];
  prompts: any[];
  dataSources: any[];
}

const AIConfigurationPage = () => {
  const [activeModule, setActiveModule] = useState("models");
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [configurations, setConfigurations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleModuleChange = useCallback(
    (module: string) => {
      // Prompt user if there are unsaved changes
      if (hasChanges) {
        const confirmChange = window.confirm(
          "You have unsaved changes. Are you sure you want to navigate away?",
        );
        if (!confirmChange) return;
      }
      setActiveModule(module);
    },
    [hasChanges],
  );

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      // Save configurations via API
      await apiService.post('/ai-configurations/save', { configurations });
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save configurations:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // This would be called by child components when they make changes
  const notifyChanges = useCallback(() => {
    setHasChanges(true);
  }, []);

  const renderActiveModule = () => {
    switch (activeModule) {
      case "models":
        return <AIModelManager onSave={() => setHasChanges(false)} />;
      case "knowledge-base":
        return <DataSourcesManager />;
      case "prompts":
        return <PromptTemplateManager />;
      case "formatting":
        return <ResponseFormatterManager />;
      case "branding":
        return <BrandingEngineManager />;
      case "follow-up":
        return <FollowUpManager />;
      default:
        return <AIModelManager onSave={() => setHasChanges(false)} />;
    }
  };

  const getModuleTitle = () => {
    switch (activeModule) {
      case "models":
        return "AI Models";
      case "knowledge-base":
        return "Knowledge Base";
      case "prompts":
        return "Prompt Templates";
      case "formatting":
        return "Response Formatting";
      case "branding":
        return "Branding Engine";
      case "follow-up":
        return "Follow-Up Engine";
      default:
        return "AI Models";
    }
  };

  const getModuleDescription = () => {
    switch (activeModule) {
      case "models":
        return "Configure AI models and providers";
      case "knowledge-base":
        return "Connect your AI to knowledge sources";
      case "prompts":
        return "Create and manage prompt templates";
      case "formatting":
        return "Configure how AI responses are structured";
      case "branding":
        return "Apply brand voice and styling to responses";
      case "follow-up":
        return "Configure follow-up suggestions";
      default:
        return "Configure AI models and providers";
    }
  };

  useEffect(() => {
    const fetchConfigurations = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.get<AIConfiguration[]>('/ai-configurations');
        setConfigurations(data);
      } catch (error) {
        console.error('Failed to fetch AI configurations:', error);
        setConfigurations([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfigurations();
  }, []);

  return (
    <div className="flex h-full">
      <AIConfigSidebar
        activeModule={activeModule}
        onModuleChange={handleModuleChange}
      />
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">{getModuleTitle()}</h1>
            <p className="text-muted-foreground">{getModuleDescription()}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
            <Button
              onClick={handleSaveChanges}
              disabled={!hasChanges || isSaving}
            >
              {isSaving ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        {renderActiveModule()}
      </div>
    </div>
  );
};

export default AIConfigurationPage;
