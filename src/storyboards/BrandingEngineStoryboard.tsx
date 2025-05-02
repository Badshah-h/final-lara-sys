import BrandingEngineManager from "@/components/admin/ai-configuration/BrandingEngineManager";

export default function BrandingEngineStoryboard() {
  return (
    <div className="bg-background min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <BrandingEngineManager standalone={true} />
      </div>
    </div>
  );
}
