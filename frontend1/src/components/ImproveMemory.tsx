import React, { useState } from "react";
import { improveCase, type MemorySummaryCase } from "../api";
import { Sparkles, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";

interface ImproveMemoryProps {
  activeCaseId: string | null;
  cases: MemorySummaryCase[];
  onSelectCase: (caseId: string | null) => void;
}

export const ImproveMemory: React.FC<ImproveMemoryProps> = ({
  activeCaseId,
  cases,
  onSelectCase,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleImprove = async () => {
    if (!activeCaseId) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await improveCase(activeCaseId);
      setSuccess(response.status || "Cognitive memory successfully improved and optimized.");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to execute memory improvement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-indigo-500" />
            Memory Optimizer
          </h2>
          <p className="text-xxs text-slate-400 dark:text-slate-500 mt-0.5">
            Iterate Cognee memory graphs to detect contradictions and optimize logical indices.
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:block">Case:</label>
          <select
            value={activeCaseId || ""}
            onChange={(e) => onSelectCase(e.target.value || null)}
            className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-accent-600"
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
        /* Empty State */
        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center shadow-sm">
          <AlertCircle className="h-10 w-10 text-slate-400 dark:text-slate-650 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-750 dark:text-slate-300">Workspace Selection Required</h3>
          <p className="text-xs text-slate-450 dark:text-slate-550 mt-1 max-w-sm mx-auto">
            Choose a case reference using the dropdown select field above to initiate graph optimization runs.
          </p>
        </div>
      ) : (
        /* Active View */
        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
          
          <div className="space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/10">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                Optimize Cognee Graph: <span className="font-mono text-indigo-650 dark:text-indigo-400">{activeCaseId}</span>
              </h4>
              <p className="text-xs text-slate-450 dark:text-slate-500 mt-1.5 leading-relaxed">
                Calling memory improvements prompts Cognee to re-evaluate and iterate over stored semantic relationships. This re-indexes nodes to ensure better contradiction matches and details logical summaries.
              </p>
            </div>
          </div>

          {/* Action Results */}
          {error && (
            <div className="flex items-start space-x-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 px-4 py-3.5 text-xs text-rose-600 dark:text-rose-455 border border-rose-100 dark:border-rose-900/30">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start space-x-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 px-4 py-3.5 text-xs text-emerald-600 dark:text-emerald-455 border border-emerald-100 dark:border-emerald-900/30">
              <CheckCircle2 className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-400">Optimization Finished</h5>
                <p className="mt-0.5 text-emerald-700 dark:text-emerald-350">{success}</p>
              </div>
            </div>
          )}

          {/* Trigger Button */}
          <button
            onClick={handleImprove}
            disabled={loading}
            className="w-full flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-semibold py-3 text-sm border border-transparent shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <RefreshCw className="animate-spin h-4 w-4" />
                <span>Running Cognee Graph Pass...</span>
              </span>
            ) : (
              <span>Optimize Memory Graph</span>
            )}
          </button>

        </div>
      )}
    </div>
  );
};
