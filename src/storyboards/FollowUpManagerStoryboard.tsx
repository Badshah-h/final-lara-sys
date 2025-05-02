import FollowUpManager from "@/components/admin/ai-configuration/FollowUpManager";

export default function FollowUpManagerStoryboard() {
  return (
    <div className="bg-background min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <FollowUpManager standalone={true} />
      </div>
    </div>
  );
}
