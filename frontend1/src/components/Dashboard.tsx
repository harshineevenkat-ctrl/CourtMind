import React, { useEffect, useState } from "react";
import { getMemorySummary, type MemorySummaryResponse, type MemorySummaryCase } from "../api";
import { FolderOpen, FileText, Plus, Database, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";

interface DashboardProps {
  activeCaseId: string | null;
  onSelectCase: (caseId: string | null) => void;
  onUpdateCases: (cases: MemorySummaryCase[]) => void;
  onNavigate: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  activeCaseId,
  onSelectCase,
  onUpdateCases,
  onNavigate,
}) => {
  const [data, setData] = useState<MemorySummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await getMemorySummary();
      setData(summary);
      onUpdateCases(summary.cases || []);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load memory summary.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div className="space-y-8 p-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-sans font-extrabold tracking-tight text-slate-900 dark:text-white">
            Legal Memory Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Overview of litigation assets and active Cognee semantic memory state.
          </p>
        </div>
        <button
          onClick={() => onNavigate("upload")}
          className="inline-flex items-center justify-center space-x-2 rounded-xl bg-accent-900 hover:bg-accent-950 dark:bg-accent-700 dark:hover:bg-accent-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Upload New Case</span>
        </button>
      </div>

      {error && (
        <div className="flex items-start space-x-3 rounded-2xl bg-rose-50 dark:bg-rose-950/20 p-4 text-sm text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h5 className="font-semibold">Backend Connection Issue</h5>
            <p className="text-xs mt-1">{error}</p>
            <button
              onClick={fetchSummary}
              className="mt-3 text-xs font-bold underline hover:text-rose-700 dark:hover:text-rose-300"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <svg className="animate-spin h-10 w-10 text-accent-900 dark:text-accent-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Querying Cognee Memory Summary...</span>
        </div>
      ) : (
        <>
          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Stat Card 1: Total Cases */}
            <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex items-center space-x-5 shadow-sm transition-all hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 dark:bg-accent-950/30 text-accent-600 dark:text-accent-400 border border-accent-100 dark:border-accent-900/20">
                <FolderOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xxs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Total Managed Cases
                </p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                  {data?.total_cases ?? 0}
                </p>
              </div>
            </div>

            {/* Stat Card 2: Total Documents */}
            <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex items-center space-x-5 shadow-sm transition-all hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/20">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xxs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Total File Assets
                </p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                  {data?.total_documents ?? 0}
                </p>
              </div>
            </div>

            {/* Stat Card 3: Memory Engine */}
            <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex items-center space-x-5 shadow-sm transition-all hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/20">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xxs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Memory Lifecycle
                </p>
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-2 flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-1 shrink-0" />
                  Cognee Active
                </p>
              </div>
            </div>

          </div>

          {/* Cases List Section */}
          <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-sans font-bold text-slate-800 dark:text-white">Active Case Dossiers</h3>
              <p className="text-xxs text-slate-400 dark:text-slate-500 mt-0.5">Click a case to make it the active workspace.</p>
            </div>
            
            {!data?.cases || data.cases.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <FolderOpen className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-3" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No Legal Cases Registered</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
                  Upload witness statement PDFs or legal transcripts to populate the Cognee memory layer.
                </p>
                <button
                  onClick={() => onNavigate("upload")}
                  className="mt-4 text-xs font-bold text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300 underline"
                >
                  Configure first case dossier
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">Case ID / Reference</th>
                      <th className="px-6 py-4">Cognitive State</th>
                      <th className="px-6 py-4">Status Context</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {data.cases.map((c) => {
                      const isActive = activeCaseId === c.case_id;
                      return (
                        <tr
                          key={c.case_id}
                          onClick={() => onSelectCase(c.case_id)}
                          className={`group cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${
                            isActive ? "bg-accent-50/40 dark:bg-accent-950/10" : ""
                          }`}
                        >
                          <td className="px-6 py-4.5">
                            <div className="flex items-center space-x-3">
                              <div className={`h-2 w-2 rounded-full ${isActive ? "bg-accent-600 animate-pulse" : "bg-slate-300 dark:bg-slate-700"}`} />
                              <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">
                                {c.case_id}
                              </span>
                              {isActive && (
                                <span className="text-[10px] font-semibold bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400 px-2 py-0.5 rounded-md border border-accent-200/50 dark:border-accent-800/50">
                                  Active Context
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4.5">
                            <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 capitalize border border-slate-200/30 dark:border-slate-700/30">
                              {c.status || "Stored"}
                            </span>
                          </td>
                          <td className="px-6 py-4.5">
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {isActive
                                ? "Click select options in sidebar to operate"
                                : "Click row to load this case ID"}
                            </span>
                          </td>
                          <td className="px-6 py-4.5 text-right">
                            <div className="flex items-center justify-end text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
                              <span className="text-xs mr-1 opacity-0 group-hover:opacity-100 transition-opacity">Select Workspace</span>
                              <ChevronRight className="h-4 w-4" />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
