import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { apiService } from "@/services/api";

interface FollowUpQuestion {
  id: string;
  question: string;
  category: string;
  isActive: boolean;
}

export interface FollowUpManagerProps {
  standalone?: boolean;
}

export const FollowUpManager = ({ standalone = false }: FollowUpManagerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [followUps, setFollowUps] = useState<FollowUpQuestion[]>([]);

  useEffect(() => {
    const fetchFollowUps = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.get<FollowUpQuestion[]>('/follow-up-questions');
        setFollowUps(data);
      } catch (error) {
        console.error('Failed to fetch follow-up questions:', error);
        setFollowUps([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFollowUps();
  }, []);

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.get<FollowUpQuestion[]>('/follow-up-questions');
      setFollowUps(data);
      toast({
        title: "Follow-up suggestions refreshed successfully",
        description: "Your follow-up suggestions have been refreshed.",
        variant: "default"
      });
    } catch (error) {
      console.error('Failed to refresh follow-up questions:', error);
      toast({
        title: "Error",
        description: "Failed to refresh follow-up suggestions.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Follow-Up Suggestions</h2>
          <p className="text-muted-foreground">
            Configure automatic follow-up suggestions for user queries
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
          <Button>Add New Suggestion</Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="text-center p-8">
          <h3 className="text-xl font-medium mb-2">Follow-Up Suggestions Manager Coming Soon</h3>
          <p className="text-muted-foreground">
            This feature is currently under development. Check back soon for updates.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default FollowUpManager;
