import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import Dashboard from "@/components/admin/Dashboard";
import AIConfigurationPage from "@/components/admin/AIConfigurationPage";
import WidgetBuilder from "@/components/admin/WidgetBuilder";
import UserManagement from "@/components/admin/user-management/UserManagement";
import KnowledgeBase from "@/components/admin/KnowledgeBase";
import Analytics from "@/components/admin/Analytics";

export default function AdminDashboardStoryboard() {
  const [activePage, setActivePage] = useState("Dashboard");

  // Render the appropriate component based on the active page
  const renderContent = () => {
    switch (activePage) {
      case "Dashboard":
        return <Dashboard />;
      case "AI Configuration":
        return <AIConfigurationPage />;
      case "Widget Builder":
        return <WidgetBuilder />;
      case "User Management":
        return <UserManagement />;
      case "Knowledge Base":
        return <KnowledgeBase />;
      case "Analytics":
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AdminLayout activePage={activePage} onNavigate={setActivePage}>
      {renderContent()}
    </AdminLayout>
  );
}
