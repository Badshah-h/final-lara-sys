import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AIModelManager from "@/components/admin/ai-configuration/AIModelManager";
import KnowledgeBaseManager from "@/components/admin/ai-configuration/KnowledgeBaseManager";
import PromptTemplateManager from "@/components/admin/ai-configuration/PromptTemplateManager";
import ResponseFormatterManager from "@/components/admin/ai-configuration/response-formats/ResponseFormatterManager";
import BrandingEngineManager from "@/components/admin/ai-configuration/BrandingEngineManager";
import { FollowUpManager } from "@/components/admin/ai-configuration/FollowUpManager";
import {
  Bot,
  Database,
  MessageSquare,
  Wand2,
  Sparkles,
  MessageCircle,
} from "lucide-react";

export default function AllAIModulesStoryboard() {
  return (
    <div className="bg-background min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">AI Configuration Modules</h1>

        <Tabs defaultValue="models" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="models">
              <Bot className="mr-2 h-4 w-4" /> AI Models
            </TabsTrigger>
            <TabsTrigger value="knowledge-base">
              <Database className="mr-2 h-4 w-4" /> Knowledge Base
            </TabsTrigger>
            <TabsTrigger value="prompts">
              <MessageSquare className="mr-2 h-4 w-4" /> Prompt Templates
            </TabsTrigger>
            <TabsTrigger value="formatting">
              <Wand2 className="mr-2 h-4 w-4" /> Response Formatting
            </TabsTrigger>
            <TabsTrigger value="branding">
              <Sparkles className="mr-2 h-4 w-4" /> Branding Engine
            </TabsTrigger>
            <TabsTrigger value="follow-up">
              <MessageCircle className="mr-2 h-4 w-4" /> Follow-Up Engine
            </TabsTrigger>
          </TabsList>

          <TabsContent value="models">
            <AIModelManager standalone={true} />
          </TabsContent>

          <TabsContent value="knowledge-base">
            <KnowledgeBaseManager standalone={true} />
          </TabsContent>

          <TabsContent value="prompts">
            <PromptTemplateManager standalone={true} />
          </TabsContent>

          <TabsContent value="formatting">
            <ResponseFormatterManager />
          </TabsContent>

          <TabsContent value="branding">
            <BrandingEngineManager standalone={true} />
          </TabsContent>

          <TabsContent value="follow-up">
            <FollowUpManager standalone={true} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
