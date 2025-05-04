import { useState, useEffect } from "react";
import { userService } from "@/services/user-management/userService";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface UserActivityLogsProps {
  userId: string;
}

const UserActivityLogs = ({ userId }: UserActivityLogsProps) => {
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  const fetchActivityLogs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await userService.getUserActivityLogs(userId, {
        page: currentPage,
        per_page: 10,
      });
      setActivityLogs(response.data);
      setTotalLogs(response.meta?.total || 0);
    } catch (err) {
      setError(err as Error);
      setActivityLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityLogs();
  }, [userId, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getActionLabel = (action: string) => {
    const actionMap: Record<string, string> = {
      login: "Logged in",
      logout: "Logged out",
      created_user: "Created user",
      updated_user: "Updated user",
      deleted_user: "Deleted user",
      updated_user_status: "Updated user status",
      updated_user_password: "Updated password",
      sent_password_reset: "Sent password reset",
    };
    return actionMap[action] || action;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Activity Logs</CardTitle>
            <CardDescription>User activity history</CardDescription>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchActivityLogs}
            disabled={isLoading}
            title="Refresh activity logs"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Loader2 className="h-12 w-12 mb-2 animate-spin" />
                    <p>Loading activity logs...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center text-destructive">
                    <AlertCircle className="h-8 w-8 mb-2" />
                    <p>Error loading activity logs</p>
                    <p className="text-sm">{error.message || "Please try again."}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchActivityLogs}
                      className="mt-2"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : activityLogs.length > 0 ? (
              activityLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">
                    {getActionLabel(log.action)}
                  </TableCell>
                  <TableCell>
                    {log.target && <span>{log.target}</span>}
                    {log.details && (
                      <span className="text-xs text-muted-foreground block">
                        {typeof log.details === "string"
                          ? log.details
                          : JSON.stringify(log.details)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{log.ip_address || "N/A"}</TableCell>
                  <TableCell>
                    {log.created_at
                      ? formatDistanceToNow(new Date(log.created_at), {
                          addSuffix: true,
                        })
                      : "N/A"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  No activity logs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {totalLogs > 0 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * 10 + 1}-
              {Math.min(currentPage * 10, totalLogs)} of {totalLogs} logs
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={isLoading || currentPage <= 1}
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground mx-2">
                Page {currentPage} of {Math.ceil(totalLogs / 10) || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={
                  isLoading ||
                  (totalLogs > 0 && currentPage * 10 >= totalLogs)
                }
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserActivityLogs;
