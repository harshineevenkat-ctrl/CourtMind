import React from "react";
import {
  LayoutDashboard,
  Upload,
  MessageSquare,
  AlertTriangle,
  Database,
  Sparkles,
  Trash2,
} from "lucide-react";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  activeCaseId: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  activeCaseId,
}) => {
  // Config for navigation items
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      requiresCase: false,
    },
    {
      id: "upload",
      label: "Upload Case",
      icon: Upload,
      requiresCase: false,
    },
    {
      id: "chat",
      label: "AI Chat",
      icon: MessageSquare,
      requiresCase: true,
    },
    {
      id: "contradictions",
      label: "Contradictions",
      icon: AlertTriangle,
      requiresCase: true,
    },
    {
      id: "status",
      label: "Memory Status",
      icon: Database,
      requiresCase: false, // Can show summary + select case detailed memory
    },
    {
      id: "improve",
      label: "Improve Memory",
      icon: Sparkles,
      requiresCase: true,
    },
    {
      id: "forget",
      label: "Forget Case",
      icon: Trash2,
      requiresCase: true,
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden md:flex flex-col h-[calc(100vh-4rem)] sticky top-16">
      <nav className="flex-1 space-y-1.5 px-4 py-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          const isDisabled = item.requiresCase && !activeCaseId;

          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && onViewChange(item.id)}
              disabled={isDisabled}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-accent-900 text-white shadow-md shadow-accent-900/10"
                  : isDisabled
                  ? "text-slate-300 dark:text-slate-700 cursor-not-allowed"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              }`}
              title={isDisabled ? `Select a case to unlock ${item.label}` : item.label}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`h-4.5 w-4.5 ${isActive ? "text-white" : isDisabled ? "text-slate-300 dark:text-slate-700" : "text-slate-400 dark:text-slate-500"}`} />
                <span>{item.label}</span>
              </div>
              
              {isDisabled && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 font-semibold border border-slate-200/25 dark:border-slate-700/25">
                  Locked
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {activeCaseId ? (
        <div className="p-4 m-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/30">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Active Workspace</p>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate mt-1">{activeCaseId}</p>
        </div>
      ) : (
        <div className="p-4 m-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/30 dark:border-amber-900/20">
          <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">Warning</p>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">Select or upload a case to unlock full features.</p>
        </div>
      )}
    </aside>
  );
};
