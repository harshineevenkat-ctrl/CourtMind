import React from "react";
import { Sun, Moon, LogOut, Shield, Award } from "lucide-react";

interface NavbarProps {
  activeCaseId: string | null;
  cases: Array<{ case_id: string; status: string }>;
  onSelectCase: (caseId: string | null) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  user: string | null;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeCaseId,
  cases,
  onSelectCase,
  darkMode,
  onToggleDarkMode,
  user,
  onSignOut,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-all duration-300">
      <div className="flex h-16 items-center justify-between px-6">
        
        {/* Left Side: Brand and Hackathon Badge */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-900 text-white shadow-md shadow-accent-900/20">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-sans text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                CourtMind <span className="text-accent-600 dark:text-accent-400">AI</span>
              </span>
              <span className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 text-xxs font-medium text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30">
                <Award className="mr-0.5 h-3 w-3" />
                Hackathon Build
              </span>
            </div>
            <p className="text-xxs text-slate-400 dark:text-slate-500">Powered by Cognee Memory</p>
          </div>
        </div>

        {/* Middle: Active Case Selector Context */}
        {user && (
          <div className="hidden md:flex items-center space-x-3 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl px-4 py-1.5 border border-slate-200/30 dark:border-slate-700/30">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Active Case:
            </span>
            <select
              value={activeCaseId || ""}
              onChange={(e) => onSelectCase(e.target.value || null)}
              className="bg-transparent border-none text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-white dark:bg-slate-800">
                -- Select Active Case --
              </option>
              {cases.map((c) => (
                <option key={c.case_id} value={c.case_id} className="bg-white dark:bg-slate-800">
                  {c.case_id} ({c.status})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Right Side: Theme toggler, User info, Log Out */}
        <div className="flex items-center space-x-4">
          {/* Dark Mode Switcher */}
          <button
            onClick={onToggleDarkMode}
            className="p-2.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/50 dark:border-slate-700/50 transition-all duration-200"
            aria-label="Toggle Color Scheme"
          >
            {darkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </button>

          {user && (
            <div className="flex items-center space-x-3 pl-2 border-l border-slate-200 dark:border-slate-800">
              {/* User Details */}
              <div className="hidden lg:block text-right">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{user}</p>
                <p className="text-xxs text-slate-400 dark:text-slate-500">Licensed Attorney</p>
              </div>

              {/* Profile Avatar & LogOut Button */}
              <div className="relative group">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 font-bold text-sm">
                  {user.substring(0, 2).toUpperCase()}
                </div>
              </div>

              <button
                onClick={onSignOut}
                className="p-2.5 text-rose-500 hover:text-white hover:bg-rose-500 rounded-xl transition-all duration-200 border border-rose-200/20"
                title="Sign Out"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          )}
        </div>
        
      </div>
    </header>
  );
};
