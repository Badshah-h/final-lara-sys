
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Calendar,
  Users,
  Bot,
  Database,
  BarChart3,
  Settings,
  MessageSquare,
  Code,
  Webhook,
  ServerCog
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Dashboard from "./admin/Dashboard";
import ModuleDashboard from "./admin/ModuleDashboard";
import AIConfiguration from "./admin/AIConfiguration";
import WidgetBuilder from "./admin/WidgetBuilder";
import KnowledgeBase from "./admin/KnowledgeBase";
import UserManagement from "./admin/user-management";

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  // Get the view parameter from the URL
  const searchParams = new URLSearchParams(location.search);
  const currentView = searchParams.get('view') || 'dashboard';

  useEffect(() => {
    setMounted(true);

    // Add animation classes to cards with delay
    const cards = document.querySelectorAll('.module-card');
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('animate-fade-in');
      }, index * 100);
    });
  }, []);

  const modules = [
    {
      id: "dashboard",
      name: "Dashboard",
      description: "View system analytics and metrics",
      icon: <BarChart3 className="h-8 w-8" />,
      color: "blue",
      path: "/dashboard?view=dashboard"
    },
    {
      id: "user-management",
      name: "User Management",
      description: "Manage users, roles and permissions",
      icon: <Users className="h-8 w-8" />,
      color: "green",
      path: "/dashboard?view=user-management"
    },
    {
      id: "ai-config",
      name: "AI Configuration",
      description: "Configure AI models and responses",
      icon: <Bot className="h-8 w-8" />,
      color: "purple",
      path: "/dashboard?view=ai-config"
    },
    {
      id: "knowledge-base",
      name: "Knowledge Base",
      description: "Manage your knowledge base content",
      icon: <Database className="h-8 w-8" />,
      color: "amber",
      path: "/dashboard?view=knowledge-base"
    },
    {
      id: "conversations",
      name: "Conversations",
      description: "View and manage chat conversations",
      icon: <MessageSquare className="h-8 w-8" />,
      color: "orange",
      path: "/dashboard?view=conversations"
    },
    {
      id: "widget-builder",
      name: "Widget Builder",
      description: "Create and customize chat widgets",
      icon: <Code className="h-8 w-8" />,
      color: "indigo",
      path: "/dashboard?view=widget-builder"
    },
    {
      id: "analytics",
      name: "Analytics",
      description: "Detailed analytics and reporting",
      icon: <BarChart3 className="h-8 w-8" />,
      color: "cyan",
      path: "/dashboard?view=analytics"
    },
    {
      id: "api-tester",
      name: "API Tester",
      description: "Test API endpoints and integrations",
      icon: <Webhook className="h-8 w-8" />,
      color: "emerald",
      path: "/api-tester"
    },
    {
      id: "settings",
      name: "Settings",
      description: "Configure system settings",
      icon: <Settings className="h-8 w-8" />,
      color: "slate",
      path: "/dashboard?view=settings"
    },
  ];

  const handleModuleClick = (path: string) => {
    navigate(path);
  };

  // Function to render the appropriate content based on the view parameter
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'user-management':
        return <UserManagement />;
      case 'ai-config':
        return <AIConfiguration />;
      case 'knowledge-base':
        return <KnowledgeBase />;
      case 'widget-builder':
        return <WidgetBuilder />;
      case 'conversations':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Conversations</h1>
                <p className="text-muted-foreground">
                  View and manage all chat conversations
                </p>
              </div>
            </div>
            <div className="border rounded-md p-8 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Conversations Module
              </h2>
              <p className="text-muted-foreground mb-4">
                This module is under development. It will allow you to view and
                manage all chat conversations.
              </p>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Analytics</h1>
                <p className="text-muted-foreground">
                  Monitor and analyze conversation metrics
                </p>
              </div>
            </div>
            <div className="border rounded-md p-8 text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Analytics Module</h2>
              <p className="text-muted-foreground mb-4">
                This module is under development. It will provide detailed
                analytics and reporting.
              </p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">
                  Configure system settings and preferences
                </p>
              </div>
            </div>
            <div className="border rounded-md p-8 text-center">
              <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Settings Module</h2>
              <p className="text-muted-foreground mb-4">
                This module is under development. It will allow you to configure
                system settings and preferences.
              </p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string, text: string, hover: string }> = {
      blue: { bg: "bg-blue-100 dark:bg-blue-900", text: "text-blue-600 dark:text-blue-400", hover: "hover:bg-blue-200 dark:hover:bg-blue-800" },
      green: { bg: "bg-green-100 dark:bg-green-900", text: "text-green-600 dark:text-green-400", hover: "hover:bg-green-200 dark:hover:bg-green-800" },
      purple: { bg: "bg-purple-100 dark:bg-purple-900", text: "text-purple-600 dark:text-purple-400", hover: "hover:bg-purple-200 dark:hover:bg-purple-800" },
      amber: { bg: "bg-amber-100 dark:bg-amber-900", text: "text-amber-600 dark:text-amber-400", hover: "hover:bg-amber-200 dark:hover:bg-amber-800" },
      orange: { bg: "bg-orange-100 dark:bg-orange-900", text: "text-orange-600 dark:text-orange-400", hover: "hover:bg-orange-200 dark:hover:bg-orange-800" },
      indigo: { bg: "bg-indigo-100 dark:bg-indigo-900", text: "text-indigo-600 dark:text-indigo-400", hover: "hover:bg-indigo-200 dark:hover:bg-indigo-800" },
      cyan: { bg: "bg-cyan-100 dark:bg-cyan-900", text: "text-cyan-600 dark:text-cyan-400", hover: "hover:bg-cyan-200 dark:hover:bg-cyan-800" },
      emerald: { bg: "bg-emerald-100 dark:bg-emerald-900", text: "text-emerald-600 dark:text-emerald-400", hover: "hover:bg-emerald-200 dark:hover:bg-emerald-800" },
      slate: { bg: "bg-slate-100 dark:bg-slate-900", text: "text-slate-600 dark:text-slate-400", hover: "hover:bg-slate-200 dark:hover:bg-slate-800" },
    };

    return colorMap[color] || colorMap.blue;
  };

  // If we're on the main dashboard page with no specific view, show the module cards
  if (location.pathname === '/dashboard' && !location.search) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8 opacity-0 animate-slide-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
          <h1 className="text-3xl font-bold mb-2">Welcome to the Admin Dashboard</h1>
          <p className="text-muted-foreground">Select a module to get started</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
          {modules.map((module, index) => {
            const colorClasses = getColorClasses(module.color);

            return (
              <Card
                key={module.id}
                className={`module-card w-full max-w-md cursor-pointer opacity-0 transform transition-all duration-300 hover:shadow-lg ${colorClasses.hover} card-hover-effect group`}
                onClick={() => handleModuleClick(module.path)}
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`rounded-full p-3 ${colorClasses.bg} ${colorClasses.text} animate-float`}>
                      {module.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1">{module.name}</h3>
                      <p className="text-muted-foreground text-sm">{module.description}</p>
                    </div>
                  </div>
                  <div className={`mt-4 text-sm font-medium ${colorClasses.text} flex justify-end group-hover:translate-x-1 transition-transform duration-300`}>
                    Explore {module.name} →
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // If we have a specific view parameter, render the appropriate content
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:flex flex-col w-64 bg-card border-r h-screen sticky top-0">
          <div className="p-4 border-b">
            <h2 className="text-2xl font-bold">AI Chat Admin</h2>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                Modules
              </h3>
              <div className="space-y-1 mt-2">
                {modules.map((module) => (
                  <button
                    key={module.id}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${currentView === module.id ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'
                      }`}
                    onClick={() => handleModuleClick(module.path)}
                  >
                    {module.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="p-4 border-t">
            <button
              className="w-full text-left px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted"
              onClick={() => navigate('/dashboard')}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden border-b sticky top-0 bg-background z-10">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-xl font-bold">AI Chat Admin</h2>
            <div className="relative">
              <select
                className="appearance-none bg-transparent border rounded-md px-3 py-2 pr-8 text-sm"
                value={currentView}
                onChange={(e) => navigate(`/dashboard?view=${e.target.value}`)}
              >
                {modules.map(module => (
                  <option key={module.id} value={module.id}>
                    {module.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="mb-6 flex items-center justify-between">
            <button
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 md:hidden"
              onClick={() => navigate('/dashboard')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold">{modules.find(m => m.id === currentView)?.name || 'Dashboard'}</h1>
            <div className="w-20"></div> {/* Spacer for alignment */}
          </div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Home;
