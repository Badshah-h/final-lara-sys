import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Bot,
  Database,
  MessageSquare,
  Wand2,
  Sparkles,
  MessageCircle,
  ChevronRight,
} from "lucide-react";

interface AIConfigSidebarProps {
  activeModule?: string;
  onModuleChange?: (module: string) => void;
}

const AIConfigSidebar = ({
  activeModule = "models",
  onModuleChange,
}: AIConfigSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);

  const modules = [
    {
      id: "models",
      name: "AI Models",
      icon: <Bot size={20} />,
      description: "Configure AI models and providers",
    },
    {
      id: "knowledge-base",
      name: "Knowledge Base",
      icon: <Database size={20} />,
      description: "Connect your AI to knowledge sources",
    },
    {
      id: "prompts",
      name: "Prompt Templates",
      icon: <MessageSquare size={20} />,
      description: "Create and manage prompt templates",
    },
    {
      id: "formatting",
      name: "Response Formatting",
      icon: <Wand2 size={20} />,
      description: "Configure how AI responses are structured",
    },
    {
      id: "branding",
      name: "Branding Engine",
      icon: <Sparkles size={20} />,
      description: "Apply brand voice and styling to responses",
    },
    {
      id: "follow-up",
      name: "Follow-Up Engine",
      icon: <MessageCircle size={20} />,
      description: "Configure follow-up suggestions",
    },
  ];

  return (
    <div
      className={`border-r bg-background transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}
    >
      <div className="flex h-14 items-center justify-between border-b px-4">
        {!collapsed && <h3 className="font-medium">AI Configuration</h3>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          <ChevronRight
            size={18}
            className={`transition-transform ${collapsed ? "rotate-180" : ""}`}
          />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-3.5rem)]">
        <div className="p-2">
          {modules.map((module) => (
            <Button
              key={module.id}
              variant={activeModule === module.id ? "secondary" : "ghost"}
              className={`w-full justify-start mb-1 ${collapsed ? "px-2" : ""} ${activeModule === module.id ? "bg-secondary font-medium" : ""}`}
              onClick={() => {
                if (typeof onModuleChange === "function") {
                  onModuleChange(module.id);
                }
              }}
            >
              <span
                className={`${activeModule === module.id ? "text-primary" : "text-muted-foreground"} mr-3`}
              >
                {module.icon}
              </span>
              {!collapsed && (
                <div className="flex flex-col items-start">
                  <span
                    className={activeModule === module.id ? "text-primary" : ""}
                  >
                    {module.name}
                  </span>
                  {activeModule === module.id && (
                    <span className="text-xs text-muted-foreground">
                      {module.description}
                    </span>
                  )}
                </div>
              )}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AIConfigSidebar;
