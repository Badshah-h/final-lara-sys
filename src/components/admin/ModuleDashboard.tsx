import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  MessageSquare,
  Bot,
  Database,
  BarChart3,
  Settings,
  Webhook,
  BookOpen,
  Code,
  ServerCog,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  containerVariants,
  itemVariants,
  cardHover,
  buttonTap
} from "@/lib/animations";

interface ModuleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  delay: number;
  onClick: (path: string) => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({
  title,
  description,
  icon,
  path,
  color,
  delay,
  onClick,
}) => {
  return (
    <motion.div
      className="relative overflow-hidden rounded-xl shadow-lg cursor-pointer group"
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      custom={delay}
      whileHover={cardHover}
      whileTap={buttonTap}
      onClick={() => onClick(path)}
    >
      <div
        className={cn(
          "absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300",
          `bg-${color}-500`
        )}
      />
      <div className="relative p-6 h-full flex flex-col">
        <motion.div
          className={cn("p-3 rounded-full w-fit mb-4", `bg-${color}-100 text-${color}-600 dark:bg-${color}-900 dark:text-${color}-400`)}
          whileHover={{ rotate: [0, -10, 10, -10, 0], transition: { duration: 0.5 } }}
        >
          {icon}
        </motion.div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm mb-4 flex-grow">{description}</p>
        <motion.div
          className={cn("text-sm font-medium", `text-${color}-600 dark:text-${color}-400`)}
          initial={{ opacity: 0, x: -10 }}
          whileHover={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          Explore {title} →
        </motion.div>
      </div>
    </motion.div>
  );
};

const ModuleDashboard = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleModuleClick = (path: string) => {
    navigate(path);
  };

  const modules = [
    {
      title: "Dashboard",
      description: "View system analytics and key performance metrics",
      icon: <BarChart3 size={24} />,
      path: "/dashboard",
      color: "blue",
      delay: 0,
    },
    {
      title: "User Management",
      description: "Manage users, roles, and permissions",
      icon: <Users size={24} />,
      path: "/dashboard?view=user-management",
      color: "green",
      delay: 1,
    },
    {
      title: "AI Configuration",
      description: "Configure AI models and response settings",
      icon: <Bot size={24} />,
      path: "/dashboard?view=ai-config",
      color: "purple",
      delay: 2,
    },
    {
      title: "Conversations",
      description: "View and manage chat conversations",
      icon: <MessageSquare size={24} />,
      path: "/dashboard?view=conversations",
      color: "orange",
      delay: 3,
    },
    {
      title: "Knowledge Base",
      description: "Manage your knowledge base and embeddings",
      icon: <Database size={24} />,
      path: "/dashboard?view=knowledge-base",
      color: "pink",
      delay: 4,
    },
    {
      title: "Widget Builder",
      description: "Create and customize chat widgets",
      icon: <Webhook size={24} />,
      path: "/dashboard?view=widget-builder",
      color: "yellow",
      delay: 5,
    },
    {
      title: "Analytics",
      description: "Detailed analytics and reporting",
      icon: <BarChart3 size={24} />,
      path: "/dashboard?view=analytics",
      color: "indigo",
      delay: 6,
    },
    {
      title: "Settings",
      description: "Configure system settings and preferences",
      icon: <Settings size={24} />,
      path: "/dashboard?view=settings",
      color: "slate",
      delay: 7,
    },
    {
      title: "API Tester",
      description: "Test API endpoints and integrations",
      icon: <Code size={24} />,
      path: "/dashboard?view=api-tester",
      color: "emerald",
      delay: 8,
    },
  ];

  if (!mounted) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h1 className="text-3xl font-bold mb-2">Welcome to the Admin Dashboard</h1>
        <p className="text-muted-foreground">Select a module to get started</p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {modules.map((module) => (
          <ModuleCard
            key={module.title}
            title={module.title}
            description={module.description}
            icon={module.icon}
            path={module.path}
            color={module.color}
            delay={module.delay}
            onClick={handleModuleClick}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default ModuleDashboard;
