import  ResponseFormatterManager  from "@/components/admin/ai-configuration/response-formats/ResponseFormatterManager";

export default function ResponseFormatterStoryboard() {
  return (
    <div className="bg-background min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <ResponseFormatterManager />
      </div>
    </div>
  );
}
