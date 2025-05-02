import KnowledgeBaseManager from "@/components/admin/ai-configuration/KnowledgeBaseManager";

export default function KnowledgeBaseStoryboard() {
  return (
    <div className="bg-background min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <KnowledgeBaseManager standalone={true} />
      </div>
    </div>
  );
}
