import { useEffect, useState } from "react";
import { getMemorySummary, type MemorySummaryCase } from "./api";

// Core Layout components
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";

// Page Views
import { SignIn } from "./components/SignIn";
import { Dashboard } from "./components/Dashboard";
import { UploadCase } from "./components/UploadCase";
import { AIChat } from "./components/AIChat";
import { Contradictions } from "./components/Contradictions";
import { MemoryStatus } from "./components/MemoryStatus";
import { ImproveMemory } from "./components/ImproveMemory";
import { ForgetCase } from "./components/ForgetCase";

function App() {
  // 1. Authentication State
  const [user, setUser] = useState<string | null>(() => {
    return sessionStorage.getItem("lawyer_name");
  });

  // 2. Case Selection Workspace Context (Single Source of Truth)
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);

  // 3. Global Cases List (Synchronized with backend /memory/summary)
  const [cases, setCases] = useState<MemorySummaryCase[]>([]);

  // 4. Client-side Navigation State
  const [currentView, setCurrentView] = useState<string>("dashboard");

  // 5. Light/Dark Theme State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem("theme");
    if (stored) {
      return stored === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Handle manual theme changes
  useEffect(() => {
    const root = document.documentElement;
    const metaTheme = document.querySelector('meta[name="color-scheme"]');
    
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      if (metaTheme) metaTheme.setAttribute("content", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      if (metaTheme) metaTheme.setAttribute("content", "light");
    }
  }, [darkMode]);

  // Handle OS theme preferences update dynamically
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-update if the user has not pinned a specific theme preference
      if (!localStorage.getItem("theme")) {
        setDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Fetch /memory/summary dynamically to keep the global case list synchronized
  const refreshCasesList = async () => {
    try {
      const summary = await getMemorySummary();
      setCases(summary.cases || []);
      
      // If the currently active case was deleted, clear selection
      if (activeCaseId && !summary.cases.some((c) => c.case_id === activeCaseId)) {
        setActiveCaseId(null);
      }
    } catch (err) {
      console.error("Failed to synchronize cases directory list:", err);
    }
  };

  // Synchronize on login
  useEffect(() => {
    if (user) {
      refreshCasesList();
    }
  }, [user]);

  const handleSignIn = (name: string) => {
    setUser(name);
    sessionStorage.setItem("lawyer_name", name);
    setCurrentView("dashboard");
  };

  const handleSignOut = () => {
    setUser(null);
    setActiveCaseId(null);
    setCases([]);
    setCurrentView("dashboard");
    sessionStorage.removeItem("lawyer_name");
  };

  const handleSelectCase = (caseId: string | null) => {
    setActiveCaseId(caseId);
  };

  const handleUpdateCasesList = (updatedCases: MemorySummaryCase[]) => {
    setCases(updatedCases);
    // Auto-clear active case context if it no longer exists
    if (activeCaseId && !updatedCases.some((c) => c.case_id === activeCaseId)) {
      setActiveCaseId(null);
    }
  };

  // View router rendering logic
  const renderContentView = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <Dashboard
            activeCaseId={activeCaseId}
            onSelectCase={handleSelectCase}
            onUpdateCases={handleUpdateCasesList}
            onNavigate={setCurrentView}
          />
        );
      case "upload":
        return (
          <UploadCase
            onSelectCase={handleSelectCase}
            onRefreshCases={refreshCasesList}
            onNavigate={setCurrentView}
          />
        );
      case "chat":
        return (
          <AIChat
            activeCaseId={activeCaseId}
            cases={cases}
            onSelectCase={handleSelectCase}
          />
        );
      case "contradictions":
        return (
          <Contradictions
            activeCaseId={activeCaseId}
            cases={cases}
            onSelectCase={handleSelectCase}
          />
        );
      case "status":
        return (
          <MemoryStatus
            activeCaseId={activeCaseId}
            cases={cases}
            onSelectCase={handleSelectCase}
            onUpdateCases={handleUpdateCasesList}
          />
        );
      case "improve":
        return (
          <ImproveMemory
            activeCaseId={activeCaseId}
            cases={cases}
            onSelectCase={handleSelectCase}
          />
        );
      case "forget":
        return (
          <ForgetCase
            activeCaseId={activeCaseId}
            cases={cases}
            onSelectCase={handleSelectCase}
            onRefreshCases={refreshCasesList}
            onNavigate={setCurrentView}
          />
        );
      default:
        return (
          <Dashboard
            activeCaseId={activeCaseId}
            onSelectCase={handleSelectCase}
            onUpdateCases={handleUpdateCasesList}
            onNavigate={setCurrentView}
          />
        );
    }
  };

  // If unauthorized, lock access to the main dashboard layout
  if (!user) {
    return <SignIn onSignIn={handleSignIn} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">
      
      {/* Dynamic Global Navbar */}
      <Navbar
        activeCaseId={activeCaseId}
        cases={cases}
        onSelectCase={handleSelectCase}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        user={user}
        onSignOut={handleSignOut}
      />

      {/* Main Container Layout */}
      <div className="flex-1 flex min-h-0">
        
        {/* Navigation Sidebar */}
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          activeCaseId={activeCaseId}
        />

        {/* Scrollable Context Area */}
        <main className="flex-1 overflow-y-auto">
          {renderContentView()}
        </main>
        
      </div>
    </div>
  );
}

export default App;
