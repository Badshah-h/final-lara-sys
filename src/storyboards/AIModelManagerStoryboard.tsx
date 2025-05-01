import AIModelManager from "@/components/admin/ai-configuration/AIModelManager";

export default function AIModelManagerStoryboard() {
  return (
    <div className="bg-background min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <AIModelManager standalone={true} />
      </div>
    </div>
  );
}
