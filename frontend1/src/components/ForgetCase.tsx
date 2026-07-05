import React, { useEffect, useState } from "react";
import { forgetCase, type MemorySummaryCase } from "../api";
import { Trash2, AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";

interface ForgetCaseProps {
  activeCaseId: string | null;
  cases: MemorySummaryCase[];
  onSelectCase: (caseId: string | null) => void;
  onRefreshCases: () => Promise<void>;
  onNavigate: (view: string) => void;
}

export const ForgetCase: React.FC<ForgetCaseProps> = ({
  activeCaseId,
  cases,
  onSelectCase,
  onRefreshCases,
  onNavigate,
}) => {
  const [confirmId, setConfirmId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Clear confirmation input if case changes
  useEffect(() => {
    setConfirmId("");
    setError(null);
    setSuccess(false);
  }, [activeCaseId]);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCaseId || confirmId.trim() !== activeCaseId) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await forgetCase(activeCaseId);
      setSuccess(true);
      
      // Perform dynamic refetch fresh from memory/summary
      await onRefreshCases();
      
      // Clear selected case ID source of truth in App.tsx
      onSelectCase(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to execute delete/forget operation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-850 dark:text-white flex items-center">
            <Trash2 className="h-5 w-5 mr-2 text-rose-500" />
            Delete Workspace
          </h2>
          <p className="text-xxs text-slate-400 dark:text-slate-500 mt-0.5">
            Erase case semantic graphs and document assets permanently from memory.
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:block">Case:</label>
          <select
            value={activeCaseId || ""}
            onChange={(e) => onSelectCase(e.target.value || null)}
            className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-medium text-slate-750 dark:text-slate-205 focus:outline-none focus:ring-1 focus:ring-accent-600"
            disabled={loading}
          >
            <option value="">-- Choose Case Reference --</option>
            {cases.map((c) => (
              <option key={c.case_id} value={c.case_id}>
                {c.case_id} ({c.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {!activeCaseId ? (
        success ? (
          /* Success Screen */
          <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center shadow-sm space-y-6">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/10">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Case Successfully Forgotten</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                All records, indexing vectors, and relationships matching this Case ID have been purged.
              </p>
            </div>
            <button
              onClick={() => onNavigate("dashboard")}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        ) : (
          /* Empty Case Choice Screen */
          <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center shadow-sm">
            <AlertCircle className="h-10 w-10 text-slate-400 dark:text-slate-650 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-750 dark:text-slate-300">Workspace Selection Required</h3>
            <p className="text-xs text-slate-450 dark:text-slate-550 mt-1 max-w-sm mx-auto">
              Select the case reference you wish to delete using the dropdown selector above.
            </p>
          </div>
        )
      ) : (
        /* Active Delete Form */
        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
          
          {/* Warning Banner */}
          <div className="rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/20 p-4 flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <h4 className="text-xs font-bold text-rose-800 dark:text-rose-400 uppercase tracking-wider">
                Permanent Purge Action
              </h4>
              <p className="text-xxs text-rose-700 dark:text-rose-350 mt-1 leading-relaxed">
                You are about to delete case <strong className="font-mono">"{activeCaseId}"</strong>. This will destroy the vector indexes and memory graphs. The AI assistant will no longer be able to recall any depositions relative to this case ID. This action is irreversible.
              </p>
            </div>
          </div>

          {error && (
            <div className="flex items-start space-x-2 rounded-xl bg-rose-50 dark:bg-rose-950/20 px-4 py-3 text-xs text-rose-600 dark:text-rose-455 border border-rose-100 dark:border-rose-900/30">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Delete Input Form */}
          <form onSubmit={handleDelete} className="space-y-4">
            <div>
              <label className="block text-xxs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Type case reference to confirm
              </label>
              
              <div className="bg-slate-50 dark:bg-slate-950 px-4 py-3 rounded-xl border border-slate-200/50 dark:border-slate-800 mb-3 text-xs font-mono select-all text-slate-500 dark:text-slate-400">
                {activeCaseId}
              </div>

              <input
                type="text"
                placeholder="Type case reference here"
                value={confirmId}
                onChange={(e) => setConfirmId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 px-4 py-3 text-xs text-slate-850 dark:text-slate-100 placeholder-slate-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all"
                disabled={loading}
                autoComplete="off"
              />
            </div>

            <button
              type="submit"
              disabled={loading || confirmId !== activeCaseId}
              className="w-full flex items-center justify-center rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 text-xs border border-transparent shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <span className="flex items-center space-x-2">
                  <svg className="animate-spin h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Purging Vector DB...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <Trash2 className="h-4 w-4" />
                  <span>Permanently Forget Case</span>
                </span>
              )}
            </button>

          </form>

        </div>
      )}
    </div>
  );
};
