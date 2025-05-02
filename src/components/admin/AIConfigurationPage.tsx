import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import AIConfigSidebar from "./AIConfigSidebar";
import AIModelManager from "./ai-configuration/AIModelManager";
import KnowledgeBaseManager from "./ai-configuration/KnowledgeBaseManager";
import PromptTemplateManager from "./ai-configuration/PromptTemplateManager";
import ResponseFormatterManager from "./ai-configuration/ResponseFormatterManager";
import BrandingEngineManager from "./ai-configuration/BrandingEngineManager";
import FollowUpManager from "./ai-configuration/FollowUpManager";

const AIConfigurationPage = () => {
  const [activeModule, setActiveModule] = useState("models");
  const [hasChanges, setHasChanges] = useState(false);

  const handleSaveChanges = () => {
    // Implement save functionality
    setHasChanges(false);
  };

  const renderActiveModule = () => {
    switch (activeModule) {
      case "models":
        return <AIModelManager />;
      case "knowledge-base":
        return <KnowledgeBaseManager />;
      case "prompts":
        return <PromptTemplateManager />;
      case "formatting":
        return <ResponseFormatterManager />;
      case "branding":
        return <BrandingEngineManager />;
      case "follow-up":
        return <FollowUpManager />;
      default:
        return <AIModelManager />;
    }
  };

  return (
    <div className="flex h-full">
      <AIConfigSidebar
        activeModule={activeModule}
        onModuleChange={setActiveModule}
      />
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">
              {activeModule === "models" && "AI Models"}
              {activeModule === "knowledge-base" && "Knowledge Base"}
              {activeModule === "prompts" && "Prompt Templates"}
              {activeModule === "formatting" && "Response Formatting"}
              {activeModule === "branding" && "Branding Engine"}
              {activeModule === "follow-up" && "Follow-Up Engine"}
            </h1>
            <p className="text-muted-foreground">
              {activeModule === "models" && "Configure AI models and providers"}
              {activeModule === "knowledge-base" &&
                "Connect your AI to knowledge sources"}
              {activeModule === "prompts" &&
                "Create and manage prompt templates"}
              {activeModule === "formatting" &&
                "Configure how AI responses are structured"}
              {activeModule === "branding" &&
                "Apply brand voice and styling to responses"}
              {activeModule === "follow-up" &&
                "Configure follow-up suggestions"}
            </p>
          </div>
          <Button onClick={handleSaveChanges} disabled={!hasChanges}>
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </div>

        {renderActiveModule()}
      </div>
    </div>
  );
};

export default AIConfigurationPage;
