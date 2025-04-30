import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Filter } from "lucide-react";

import { activityLogs } from "../data/mockData";

const ActivityLog = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>
              Track user actions and system events
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
            <Button variant="outline" size="sm">
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activityLogs.map((activity, index) => (
            <div
              key={index}
              className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0"
            >
              <Avatar className="h-9 w-9">
                <img src={activity.avatar} alt={activity.user} />
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{activity.user}</p>
                  <span className="text-xs text-muted-foreground">
                    {activity.timestamp}
                  </span>
                </div>
                <p className="text-sm">
                  {activity.action}{" "}
                  <span className="font-medium">{activity.target}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        <Button variant="outline" size="sm">
          View All Activity
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ActivityLog;
