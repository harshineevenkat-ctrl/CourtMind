import React, { useEffect, useState } from "react";
import { getMemorySummary, getCaseMemory, type MemorySummaryResponse, type CaseMemoryResponse, type MemorySummaryCase } from "../api";
import { Database, LayoutList, Server, Award, AlertCircle, RefreshCw, Cpu, Layers } from "lucide-react";

interface MemoryStatusProps {
  activeCaseId: string | null;
  cases: MemorySummaryCase[];
  onSelectCase: (caseId: string | null) => void;
  onUpdateCases: (cases: MemorySummaryCase[]) => void;
}

export const MemoryStatus: React.FC<MemoryStatusProps> = ({
  activeCaseId,
  cases,
  onSelectCase,
  onUpdateCases,
}) => {
  const [summaryData, setSummaryData] = useState<MemorySummaryResponse | null>(null);
  const [caseMemoryData, setCaseMemoryData] = useState<CaseMemoryResponse | null>(null);

  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingCaseMemory, setLoadingCaseMemory] = useState(false);

  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [caseMemoryError, setCaseMemoryError] = useState<string | null>(null);

  const fetchSummary = async () => {
    setLoadingSummary(true);
    setSummaryError(null);
    try {
      const summary = await getMemorySummary();
      setSummaryData(summary);
      onUpdateCases(summary.cases || []);
    } catch (err) {
      console.error(err);
      setSummaryError(err instanceof Error ? err.message : "Failed to load global memory summary.");
    } finally {
      setLoadingSummary(false);
    }
  };

  const fetchCaseMemory = async (caseId: string) => {
    setLoadingCaseMemory(true);
    setCaseMemoryError(null);
    try {
      const memory = await getCaseMemory(caseId);
      setCaseMemoryData(memory);
    } catch (err) {
      console.error(err);
      setCaseMemoryError(err instanceof Error ? err.message : `Failed to load memory data for case "${caseId}".`);
      setCaseMemoryData(null);
    } finally {
      setLoadingCaseMemory(false);
    }
  };

  // Run on mount to fetch summary fresh
  useEffect(() => {
    fetchSummary();
  }, []);

  // Fetch individual case memory details when activeCaseId changes
  useEffect(() => {
    if (activeCaseId) {
      fetchCaseMemory(activeCaseId);
    } else {
      setCaseMemoryData(null);
      setCaseMemoryError(null);
    }
  }, [activeCaseId]);

  return (
    <div className="space-y-8 p-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-sans font-extrabold tracking-tight text-slate-900 dark:text-white">
            Cognee Memory Status
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time metadata inspections of vector database records and index graph health.
          </p>
        </div>
        
        <button
          onClick={() => {
            fetchSummary();
            if (activeCaseId) fetchCaseMemory(activeCaseId);
          }}
          disabled={loadingSummary || loadingCaseMemory}
          className="inline-flex items-center justify-center space-x-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-350 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loadingSummary || loadingCaseMemory ? "animate-spin" : ""}`} />
          <span>Refresh Indicators</span>
        </button>
      </div>

      {/* Connection Errors */}
      {summaryError && (
        <div className="flex items-start space-x-3 rounded-2xl bg-rose-50 dark:bg-rose-950/20 p-4 text-sm text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h5 className="font-semibold">Summary Connection Failed</h5>
            <p className="text-xs mt-1">{summaryError}</p>
          </div>
        </div>
      )}

      {/* Global Ingestion Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        {/* Prominent Stat 1: Total Cases */}
        <div className="rounded-2xl border border-slate-250/50 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex items-center space-x-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 dark:bg-accent-950/30 text-accent-600 dark:text-accent-400 border border-accent-100 dark:border-accent-900/10">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xxs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Total Cases Ingested
            </p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
              {loadingSummary ? "..." : summaryData?.total_cases ?? 0}
            </p>
          </div>
        </div>

        {/* Prominent Stat 2: Total Documents */}
        <div className="rounded-2xl border border-slate-250/50 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex items-center space-x-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/10">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xxs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Total Documents Registered
            </p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
              {loadingSummary ? "..." : summaryData?.total_documents ?? 0}
            </p>
          </div>
        </div>

      </div>

      {/* Case Specific Cognitive Metrics */}
      <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center">
              <Server className="h-5 w-5 mr-2 text-indigo-500" />
              Cognitive Ingestion Index
            </h3>
            <p className="text-xxs text-slate-400 dark:text-slate-500 mt-0.5">
              Inspect semantic weights and index structures of selected case context.
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:block">Case Selector:</label>
            <select
              value={activeCaseId || ""}
              onChange={(e) => onSelectCase(e.target.value || null)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none"
              disabled={loadingCaseMemory}
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

        {activeCaseId ? (
          /* Selected Case Details Display */
          <div className="space-y-4">
            {caseMemoryError && (
              <div className="flex items-start space-x-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 px-4 py-3 text-xs text-rose-600 dark:text-rose-450 border border-rose-100 dark:border-rose-900/30">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span>{caseMemoryError}</span>
              </div>
            )}

            {loadingCaseMemory ? (
              <div className="flex justify-center items-center py-10 space-x-2">
                <svg className="animate-spin h-5 w-5 text-accent-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-xs text-slate-400">Inspecting database indices...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                
                {/* Node Status */}
                <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-5 border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-700/30 mb-3">
                    <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Cognee State</span>
                    <Cpu className="h-4 w-4 text-slate-400" />
                  </div>
                  <p className="text-lg font-bold text-slate-800 dark:text-white capitalize">
                    {caseMemoryData?.cognee_status || "Not Processed"}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-550 mt-1">Status of memory processing node.</p>
                </div>

                {/* Embeddings Created */}
                <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-5 border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-700/30 mb-3">
                    <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Vector Embeddings</span>
                    <Database className="h-4 w-4 text-slate-400" />
                  </div>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">
                    {caseMemoryData?.embeddings_created ?? 0}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-550 mt-1">Raw multi-dimensional text vectors generated.</p>
                </div>

                {/* Memory Relations Stored */}
                <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-5 border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-700/30 mb-3">
                    <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Semantic Nodes</span>
                    <Award className="h-4 w-4 text-slate-400" />
                  </div>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">
                    {caseMemoryData?.memory_stored ?? 0}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-550 mt-1">Relationships and links logged inside graph database.</p>
                </div>

              </div>
            )}
          </div>
        ) : (
          /* Not selected case placeholder */
          <div className="py-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <p className="text-xs text-slate-450 dark:text-slate-500">
              No Case selected. Choose a dossier above to view physical vector size details.
            </p>
          </div>
        )}
      </div>

      {/* Complete Ingested Cases Table List */}
      <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center">
            <LayoutList className="h-5 w-5 mr-2 text-accent-600 dark:text-accent-400" />
            Global Dossier Index
          </h3>
          <p className="text-xxs text-slate-400 dark:text-slate-500 mt-0.5">
            Full directory of cases registered in memory summary.
          </p>
        </div>

        {loadingSummary ? (
          <div className="flex justify-center items-center py-10 space-x-2">
            <svg className="animate-spin h-5 w-5 text-accent-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-xs text-slate-400">Loading case directory...</span>
          </div>
        ) : !summaryData?.cases || summaryData.cases.length === 0 ? (
          <div className="py-12 text-center text-slate-400 dark:text-slate-650 text-xs">
            No registered cases are stored on this memory host server.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-850/40 text-slate-450 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Dossier Reference</th>
                  <th className="px-6 py-4">Cognee Indexed State</th>
                  <th className="px-6 py-4 text-right">Context Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {summaryData.cases.map((c) => {
                  const isActive = activeCaseId === c.case_id;
                  return (
                    <tr
                      key={c.case_id}
                      onClick={() => onSelectCase(c.case_id)}
                      className={`cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${
                        isActive ? "bg-accent-50/40 dark:bg-accent-950/10" : ""
                      }`}
                    >
                      <td className="px-6 py-4 font-semibold text-xs text-slate-700 dark:text-slate-200">
                        {c.case_id}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-650 dark:text-slate-350 border border-slate-200/30 dark:border-slate-700/30">
                          {c.status || "Initialized"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-xs">
                        {isActive ? (
                          <span className="font-bold text-accent-650 dark:text-accent-400">Currently Inspected</span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-550 group-hover:text-slate-600">Select Details</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
