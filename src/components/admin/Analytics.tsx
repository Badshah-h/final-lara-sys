import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDateRangePicker } from "@/components/date-range-picker";
import { Overview } from "@/components/dashboard/overview";
import { RecentSales } from "@/components/dashboard/recent-sales";
import { FileDown, RefreshCw } from 'lucide-react';
import * as analyticsService from '@/services/analytics/analyticsService';
import { toast } from "@/components/ui/use-toast";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Users,
  MessageSquare,
  TrendingUp,
  Clock,
  Download,
  Calendar
} from 'lucide-react';
import { apiService } from '@/services/api';

// Combined analytics data interface
interface CombinedAnalyticsData {
  overview: {
    totalConversations: number;
    conversationTrend: number;
    activeUsers: number;
    userTrend: number;
  };
  performanceMetrics: {
    avgResponseTime: number;
    responseTimeTrend: number;
  };
  usageMetrics: {
    totalTokens: number;
    tokenTrend: number;
  };
  chatMetrics: {
    dailyChats: Array<{ date: string; count: number }>;
  };
  recentSessions: Array<{
    id: string;
    user: {
      name: string;
      email: string;
      avatar?: string;
    };
    messageCount: number;
    date: string;
  }>;
}

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalMessages: number;
    avgResponseTime: number;
    userGrowth: number;
    messageGrowth: number;
  };
  userActivity: Array<{
    date: string;
    users: number;
    messages: number;
  }>;
  messageTypes: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  topPages: Array<{
    page: string;
    views: number;
    users: number;
  }>;
  responseMetrics: {
    avgResponseTime: number;
    satisfactionScore: number;
    resolutionRate: number;
  };
}

const Analytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState('7d');

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const analyticsData = await apiService.get<AnalyticsData>(`/analytics?range=${dateRange}`);
      setData(analyticsData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      // Set empty data structure on error
      setData({
        overview: {
          totalUsers: 0,
          activeUsers: 0,
          totalMessages: 0,
          avgResponseTime: 0,
          userGrowth: 0,
          messageGrowth: 0,
        },
        userActivity: [],
        messageTypes: [],
        topPages: [],
        responseMetrics: {
          avgResponseTime: 0,
          satisfactionScore: 0,
          resolutionRate: 0,
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const handleRefresh = () => {
    fetchAnalytics();
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/analytics/export?range=${dateRange}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const blob = await response.blob();
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `analytics-${dateRange}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Failed to export analytics:', error);
    }
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Track your system performance and user engagement
          </p>
        </div>
        <div className="flex gap-2">
          <Tabs value={dateRange} onValueChange={setDateRange}>
            <TabsList>
              <TabsTrigger value="7d">7 Days</TabsTrigger>
              <TabsTrigger value="30d">30 Days</TabsTrigger>
              <TabsTrigger value="90d">90 Days</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className={data.overview.userGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                {data.overview.userGrowth >= 0 ? '+' : ''}{data.overview.userGrowth}%
              </span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((data.overview.activeUsers / data.overview.totalUsers) * 100).toFixed(1)}% of total users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalMessages.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className={data.overview.messageGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                {data.overview.messageGrowth >= 0 ? '+' : ''}{data.overview.messageGrowth}%
              </span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.avgResponseTime}s</div>
            <p className="text-xs text-muted-foreground">
              Average system response time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
            <CardDescription>Daily active users and messages over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.userActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#8884d8" name="Users" />
                <Line type="monotone" dataKey="messages" stroke="#82ca9d" name="Messages" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Message Types</CardTitle>
            <CardDescription>Distribution of message types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.messageTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, percentage }) => `${type} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.messageTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Key performance indicators</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Satisfaction Score</span>
              <span className="text-sm text-muted-foreground">
                {data.responseMetrics.satisfactionScore}%
              </span>
            </div>
            <Progress value={data.responseMetrics.satisfactionScore} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Resolution Rate</span>
              <span className="text-sm text-muted-foreground">
                {data.responseMetrics.resolutionRate}%
              </span>
            </div>
            <Progress value={data.responseMetrics.resolutionRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Top Pages */}
      {data.topPages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
            <CardDescription>Most visited pages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topPages.map((page, index) => (
                <div key={page.page} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{index + 1}</Badge>
                    <span className="font-medium">{page.page}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{page.views} views</div>
                    <div className="text-xs text-muted-foreground">{page.users} users</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Analytics;
