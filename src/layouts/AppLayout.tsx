
import React, { useState } from "react";
import { NavLink, Navigate, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Menu, X, User, Briefcase, ChevronRight, Bot, Bell, LogOut, Upload, 
  Settings, PanelLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!user) {
    return <Navigate to="/login" />;
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-semibold text-neon">NeonResume</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={toggleSidebar}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto py-4 px-3">
            <nav className="space-y-6">
              <div className="space-y-2">
                <h3 className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Main
                </h3>
                <div className="space-y-1">
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      cn(
                        "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-neon"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-neon"
                      )
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-4 w-4" />
                      <span>Dashboard</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-sidebar-foreground" />
                  </NavLink>

                  <NavLink
                    to="/resumes"
                    className={({ isActive }) =>
                      cn(
                        "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-neon"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-neon"
                      )
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Upload className="h-4 w-4" />
                      <span>My Resumes</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-sidebar-foreground" />
                  </NavLink>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Features
                </h3>
                <div className="space-y-1">
                  <NavLink
                    to="/agent"
                    className={({ isActive }) =>
                      cn(
                        "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-neon"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-neon"
                      )
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Bot className="h-4 w-4" />
                      <span>AI Agent</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-sidebar-foreground" />
                  </NavLink>

                  <NavLink
                    to="/jobs"
                    className={({ isActive }) =>
                      cn(
                        "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-neon"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-neon"
                      )
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Bell className="h-4 w-4" />
                      <span>Job Alerts</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-sidebar-foreground" />
                  </NavLink>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Account
                </h3>
                <div className="space-y-1">
                  <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                      cn(
                        "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-neon"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-neon"
                      )
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-sidebar-foreground" />
                  </NavLink>

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50 hover:text-neon"
                  >
                    <div className="flex items-center gap-3">
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-sidebar-foreground" />
                  </button>
                </div>
              </div>
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="border-t border-sidebar-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-accent">
                <User className="h-5 w-5 text-neon" />
              </div>
              <div className="truncate">
                <p className="text-sm font-medium text-sidebar-foreground">{user.username}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center border-b border-border px-4 gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hidden lg:flex"
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
          <div className="ml-auto"></div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
