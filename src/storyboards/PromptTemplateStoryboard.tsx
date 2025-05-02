import PromptTemplateManager from "@/components/admin/ai-configuration/PromptTemplateManager";

export default function PromptTemplateStoryboard() {
  return (
    <div className="bg-background min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <PromptTemplateManager standalone={true} />
      </div>
    </div>
  );
}
