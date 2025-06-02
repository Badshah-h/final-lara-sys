import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Settings,
  PanelLeftOpen,
  PanelLeftClose,
  LogOut,
  FileBarChart2,
  Bot,
  PanelTop,
  Database,
  Bell,
  Search,
  Menu,
  User,
  ChevronDown,
  Shield,
  Activity,
  Zap,
  MessageSquare,
  Code,
  Palette,
  FlaskConical,
  Layers,
  BookOpen,
  Wrench,
  TestTube,
  Cpu,
  BrainCircuit,
  FileText,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/ModeToggle";

// Import all the dashboard components
import Dashboard from "./Dashboard";
import Analytics from "./Analytics";
import UserManagement from "./user-management/UserManagement";
import AIConfiguration from "./AIConfiguration";
import KnowledgeBase from "./KnowledgeBase";
import WidgetBuilder from "./WidgetBuilder";
import ThemeBuilderFixed from "./ThemeBuilderFixed";
import ApiTester from "../api-tester/ApiTester";

// Import chat components
import ChatWidget from "../chat/ChatWidget";

// Import storyboard components for development/testing
import AuthDebuggerStoryboard from "../../storyboards/AuthDebuggerStoryboard";
import AllAIModulesStoryboard from "../../storyboards/AllAIModulesStoryboard";
import RolesPermissionsStoryboard from "../../storyboards/RolesPermissionsStoryboard";
import KnowledgeBaseStoryboard from "../../storyboards/KnowledgeBaseStoryboard";
import BrandingEngineStoryboard from "../../storyboards/BrandingEngineStoryboard";
import PromptTemplateStoryboard from "../../storyboards/PromptTemplateStoryboard";
import ResponseFormatterStoryboard from "../../storyboards/ResponseFormatterStoryboard";
import FollowUpManagerStoryboard from "../../storyboards/FollowUpManagerStoryboard";
import AIModelManagerStoryboard from "../../storyboards/AIModelManagerStoryboard";
import CsrfDebuggerStoryboard from "../../storyboards/CsrfDebuggerStoryboard";
import EnhancedCsrfDebuggerStoryboard from "../../storyboards/EnhancedCsrfDebuggerStoryboard";

// Import debug components
import { CsrfDebugger } from "../debug/CsrfDebugger";
import { ThemeDebugger } from "../debug/ThemeDebugger";

type SidebarItem = {
  icon: React.ReactNode;
  label: string;
  view: string;
  active?: boolean;
  badge?: string;
  category?: string;
};

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get the view parameter from the URL
  const searchParams = new URLSearchParams(location.search);
  const currentView = searchParams.get('view') || 'dashboard';

  const sidebarItems: SidebarItem[] = [
    // Core Admin Modules
    {
      icon: <LayoutDashboard size={18} />,
      label: "Dashboard",
      view: "dashboard",
      active: currentView === "dashboard",
      category: "core"
    },
    {
      icon: <FileBarChart2 size={18} />,
      label: "Analytics",
      view: "analytics",
      active: currentView === "analytics",
      badge: "New",
      category: "core"
    },
    {
      icon: <Users size={18} />,
      label: "User Management",
      view: "user-management",
      active: currentView === "user-management",
      category: "core"
    },

    // AI & Configuration
    {
      icon: <Bot size={18} />,
      label: "AI Configuration",
      view: "ai-config",
      active: currentView === "ai-config",
      category: "ai"
    },
    {
      icon: <Database size={18} />,
      label: "Knowledge Base",
      view: "knowledge-base",
      active: currentView === "knowledge-base",
      category: "ai"
    },
    {
      icon: <BrainCircuit size={18} />,
      label: "AI Models Manager",
      view: "ai-models-storyboard",
      active: currentView === "ai-models-storyboard",
      category: "ai"
    },
    {
      icon: <Sparkles size={18} />,
      label: "All AI Modules",
      view: "all-ai-modules",
      active: currentView === "all-ai-modules",
      category: "ai"
    },
    {
      icon: <FileText size={18} />,
      label: "Prompt Templates",
      view: "prompt-templates",
      active: currentView === "prompt-templates",
      category: "ai"
    },
    {
      icon: <Layers size={18} />,
      label: "Response Formatter",
      view: "response-formatter",
      active: currentView === "response-formatter",
      category: "ai"
    },
    {
      icon: <Zap size={18} />,
      label: "Follow-up Manager",
      view: "followup-manager",
      active: currentView === "followup-manager",
      category: "ai"
    },
    {
      icon: <Palette size={18} />,
      label: "Branding Engine",
      view: "branding-engine",
      active: currentView === "branding-engine",
      category: "ai"
    },

    // Chat & Communication
    {
      icon: <MessageSquare size={18} />,
      label: "Chat Widget",
      view: "chat-widget",
      active: currentView === "chat-widget",
      category: "communication"
    },

    // Tools & Builders
    {
      icon: <PanelTop size={18} />,
      label: "Widget Builder",
      view: "widget-builder",
      active: currentView === "widget-builder",
      category: "tools"
    },
    {
      icon: <Palette size={18} />,
      label: "Theme Builder",
      view: "theme-builder",
      active: currentView === "theme-builder",
      category: "tools"
    },
    {
      icon: <Code size={18} />,
      label: "API Tester",
      view: "api-tester",
      active: currentView === "api-tester",
      category: "tools"
    },

    // Development & Testing
    {
      icon: <FlaskConical size={18} />,
      label: "Auth Debugger",
      view: "auth-debugger",
      active: currentView === "auth-debugger",
      category: "development",
      badge: "Dev"
    },
    {
      icon: <Shield size={18} />,
      label: "Roles & Permissions",
      view: "roles-permissions-storyboard",
      active: currentView === "roles-permissions-storyboard",
      category: "development",
      badge: "Dev"
    },
    {
      icon: <BookOpen size={18} />,
      label: "Knowledge Base Dev",
      view: "knowledge-base-storyboard",
      active: currentView === "knowledge-base-storyboard",
      category: "development",
      badge: "Dev"
    },
    {
      icon: <TestTube size={18} />,
      label: "CSRF Debugger",
      view: "csrf-debugger",
      active: currentView === "csrf-debugger",
      category: "development",
      badge: "Dev"
    },
    {
      icon: <Cpu size={18} />,
      label: "Enhanced CSRF Debug",
      view: "enhanced-csrf-debugger",
      active: currentView === "enhanced-csrf-debugger",
      category: "development",
      badge: "Dev"
    },
    {
      icon: <Wrench size={18} />,
      label: "Theme Debugger",
      view: "theme-debugger",
      active: currentView === "theme-debugger",
      category: "development",
      badge: "Dev"
    },

    // Settings
    {
      icon: <Settings size={18} />,
      label: "Settings",
      view: "settings",
      active: currentView === "settings",
      category: "system"
    },
  ];

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Get current page title
  const getCurrentPageTitle = () => {
    const currentItem = sidebarItems.find(item => item.active);
    return currentItem?.label || "Admin Panel";
  };

  // Handle navigation
  const handleNavigation = (view: string) => {
    if (view === "api-tester") {
      navigate("/api-tester");
    } else {
      navigate(`/dashboard?view=${view}`);
    }
    setIsMobileMenuOpen(false);
  };

  // Function to render the appropriate content based on the view parameter
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;

      case 'analytics':
        return <Analytics />;

      case 'user-management':
        return <UserManagement />;

      case 'ai-config':
        return <AIConfiguration />;

      case 'knowledge-base':
        return <KnowledgeBase />;

      case 'widget-builder':
        return <WidgetBuilder />;

      case 'theme-builder':
        return <ThemeBuilderFixed />;

      case 'chat-widget':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Chat Widget</h1>
                <p className="text-muted-foreground">
                  Interactive chat widget for customer support
                </p>
              </div>
            </div>
            <ChatWidget />
          </div>
        );

      // AI & Configuration Storyboards
      case 'all-ai-modules':
        return <AllAIModulesStoryboard />;

      case 'ai-models-storyboard':
        return <AIModelManagerStoryboard />;

      case 'prompt-templates':
        return <PromptTemplateStoryboard />;

      case 'response-formatter':
        return <ResponseFormatterStoryboard />;

      case 'followup-manager':
        return <FollowUpManagerStoryboard />;

      case 'branding-engine':
        return <BrandingEngineStoryboard />;

      // Development & Testing Components
      case 'auth-debugger':
        return <AuthDebuggerStoryboard />;

      case 'roles-permissions-storyboard':
        return <RolesPermissionsStoryboard />;

      case 'knowledge-base-storyboard':
        return <KnowledgeBaseStoryboard />;

      case 'csrf-debugger':
        return <CsrfDebugger />;

      case 'enhanced-csrf-debugger':
        return <EnhancedCsrfDebuggerStoryboard />;

      case 'theme-debugger':
        return <ThemeDebugger />;

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

  // Group sidebar items by category
  const groupedItems = sidebarItems.reduce((acc, item) => {
    const category = item.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, SidebarItem[]>);

  const categoryLabels = {
    core: 'Core Modules',
    ai: 'AI & Configuration',
    communication: 'Communication',
    tools: 'Tools & Builders',
    development: 'Development & Testing',
    system: 'System'
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          "border-r bg-card/50 backdrop-blur-sm transition-all duration-300 flex flex-col relative z-40",
          isSidebarCollapsed ? "w-[70px]" : "w-[320px]",
          "hidden lg:flex" // Hide on mobile, show on large screens
        )}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b bg-card/80">
          <div className="flex items-center justify-between">
            {!isSidebarCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    AdminHub
                  </h2>
                  <p className="text-xs text-muted-foreground">Control Center</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8 hover:bg-accent"
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen size={16} />
              ) : (
                <PanelLeftClose size={16} />
              )}
            </Button>
          </div>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-1 py-4 px-2 overflow-y-auto">
          {!isSidebarCollapsed ? (
            // Grouped view when expanded
            <div className="space-y-6">
              {Object.entries(groupedItems).map(([category, items]) => (
                <div key={category}>
                  <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    {categoryLabels[category as keyof typeof categoryLabels] || category}
                  </h3>
                  <ul className="space-y-1">
                    {items.map((item, index) => (
                      <li key={`${category}-${index}`}>
                        <Button
                          variant={item.active ? "secondary" : "ghost"}
                          className={cn(
                            "w-full justify-start h-9 text-sm transition-all duration-200",
                            item.active
                              ? "bg-primary/10 text-primary border-r-2 border-primary shadow-sm"
                              : "hover:bg-accent/50"
                          )}
                          onClick={() => handleNavigation(item.view)}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                              {item.icon}
                              <span className="ml-3 font-medium">{item.label}</span>
                            </div>
                            {item.badge && (
                              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            // Flat view when collapsed
            <ul className="space-y-1">
              {sidebarItems.map((item, index) => (
                <li key={index}>
                  <Button
                    variant={item.active ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-center h-10 transition-all duration-200 px-2",
                      item.active
                        ? "bg-primary/10 text-primary border-r-2 border-primary shadow-sm"
                        : "hover:bg-accent/50"
                    )}
                    onClick={() => handleNavigation(item.view)}
                    title={item.label}
                  >
                    {item.icon}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="mt-auto p-4 border-t bg-card/80">
          {!isSidebarCollapsed ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-2 rounded-lg bg-accent/30">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <ModeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  title="Logout"
                >
                  <LogOut size={16} />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Avatar className="h-8 w-8 mx-auto">
                <AvatarImage src={user.avatar || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-center space-y-1">
                <ModeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  title="Logout"
                >
                  <LogOut size={16} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={toggleMobileMenu} />
          <div className="fixed left-0 top-0 h-full w-[320px] bg-card border-r overflow-y-auto">
            {/* Mobile sidebar content - same as desktop but always expanded */}
            <div className="p-4 border-b bg-card/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      AdminHub
                    </h2>
                    <p className="text-xs text-muted-foreground">Control Center</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMobileMenu}
                  className="h-8 w-8"
                >
                  <PanelLeftClose size={16} />
                </Button>
              </div>
            </div>

            <nav className="flex-1 py-4 px-2">
              <div className="space-y-6">
                {Object.entries(groupedItems).map(([category, items]) => (
                  <div key={category}>
                    <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      {categoryLabels[category as keyof typeof categoryLabels] || category}
                    </h3>
                    <ul className="space-y-1">
                      {items.map((item, index) => (
                        <li key={`mobile-${category}-${index}`}>
                          <Button
                            variant={item.active ? "secondary" : "ghost"}
                            className={cn(
                              "w-full justify-start h-9 text-sm",
                              item.active
                                ? "bg-primary/10 text-primary border-r-2 border-primary"
                                : "hover:bg-accent/50"
                            )}
                            onClick={() => handleNavigation(item.view)}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center">
                                {item.icon}
                                <span className="ml-3 font-medium">{item.label}</span>
                              </div>
                              {item.badge && (
                                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 lg:px-6 h-16">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
                className="lg:hidden h-8 w-8"
              >
                <Menu size={16} />
              </Button>

              {/* Page title and breadcrumb */}
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-semibold text-foreground">
                  {getCurrentPageTitle()}
                </h1>
                <div className="hidden sm:flex items-center space-x-1 text-sm text-muted-foreground">
                  <span>/</span>
                  <span>Admin</span>
                  <span>/</span>
                  <span className="text-foreground">{getCurrentPageTitle()}</span>
                </div>
              </div>
            </div>

            {/* Center - Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search anything..."
                  className="pl-10 bg-background/50 border-border/50 focus:bg-background"
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-2">
              {/* Search button for mobile */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-8 w-8"
              >
                <Search size={16} />
              </Button>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="relative h-8 w-8"
              >
                <Bell size={16} />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full text-[10px] text-destructive-foreground flex items-center justify-center">
                  3
                </span>
              </Button>

              {/* Activity indicator */}
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                <Activity size={12} />
                <span className="text-xs font-medium">Online</span>
              </div>

              {/* Theme toggle for desktop */}
              <div className="hidden lg:block">
                <ModeToggle />
              </div>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 px-2 hover:bg-accent">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.avatar || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {user.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown size={12} className="text-muted-foreground" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Preferences
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Zap className="mr-2 h-4 w-4" />
                    Keyboard Shortcuts
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-background/50">
          <div className="p-4 lg:p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
