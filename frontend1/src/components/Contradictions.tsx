import React, { useEffect, useState } from "react";
import { runContradictionScan, type CaseContradictionsResponse, type MemorySummaryCase } from "../api";
import { ShieldAlert, ShieldCheck, Play, AlertCircle, FileText, Scale } from "lucide-react";

interface ContradictionsProps {
  activeCaseId: string | null;
  cases: MemorySummaryCase[];
  onSelectCase: (caseId: string | null) => void;
}

export const Contradictions: React.FC<ContradictionsProps> = ({
  activeCaseId,
  cases,
  onSelectCase,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CaseContradictionsResponse | null>(null);
  const [scannedCaseId, setScannedCaseId] = useState<string | null>(null);

  // Clear previous result if activeCaseId changes
  useEffect(() => {
    if (activeCaseId !== scannedCaseId) {
      setResult(null);
      setError(null);
    }
  }, [activeCaseId, scannedCaseId]);

  const handleScan = async () => {
    if (!activeCaseId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await runContradictionScan(activeCaseId);
      setResult(response);
      setScannedCaseId(activeCaseId);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to complete contradiction scan.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
            <Scale className="h-5 w-5 mr-2 text-accent-600 dark:text-accent-400" />
            Contradiction Scanner
          </h2>
          <p className="text-xxs text-slate-400 dark:text-slate-500 mt-0.5">
            Compare statements across hearings to identify inconsistencies in witness claims.
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
        /* Empty Case Choice Screen */
        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center shadow-sm">
          <AlertCircle className="h-10 w-10 text-slate-400 dark:text-slate-650 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-750 dark:text-slate-300">Workspace Selection Required</h3>
          <p className="text-xs text-slate-450 dark:text-slate-550 mt-1 max-w-sm mx-auto">
            Choose a case reference using the dropdown select field above to execute testimony scans.
          </p>
        </div>
      ) : (
        /* Active Screen */
        <div className="space-y-6">
          
          {/* Main Action Bar */}
          <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                Dossier Analysis: <span className="font-mono text-accent-650 dark:text-accent-400">{activeCaseId}</span>
              </h4>
              <p className="text-xxs text-slate-400 dark:text-slate-500 mt-1">
                Runs a logical checker over witness claims from multiple depositions stored in memory.
              </p>
            </div>
            
            <button
              onClick={handleScan}
              disabled={loading}
              className="inline-flex items-center justify-center space-x-2 rounded-xl bg-accent-900 hover:bg-accent-950 dark:bg-accent-700 dark:hover:bg-accent-600 px-5 py-3 text-xs font-semibold text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shrink-0"
            >
              <Play className="h-4 w-4" />
              <span>{loading ? "Scanning Testimony..." : "Run Contradiction Scan"}</span>
            </button>
          </div>

          {/* Connection Error Message */}
          {error && (
            <div className="flex items-start space-x-3 rounded-2xl bg-rose-50 dark:bg-rose-950/20 p-4 text-xs font-medium text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold">Scan Execution Refused</h5>
                <p className="text-xxs mt-0.5 text-rose-500 dark:text-rose-350">{error}</p>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="rounded-2xl border border-slate-250/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/10 p-12 text-center flex flex-col items-center justify-center space-y-4">
              <svg className="animate-spin h-8 w-8 text-accent-900 dark:text-accent-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-350">Analyzing deposition timelines...</p>
                <p className="text-xxs text-slate-400 dark:text-slate-500 mt-1">
                  Thinking... this can take up to a minute
                </p>
              </div>
            </div>
          )}

          {/* Scan Results Display */}
          {result && !loading && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Verdict Indicator */}
              {result.contradiction_check.contradiction ? (
                /* Contradiction Found Box */
                <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 p-5 flex items-start space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 shrink-0">
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-rose-800 dark:text-rose-450 uppercase tracking-wide">
                      Contradiction Detected
                    </h4>
                    <p className="text-xs font-semibold text-rose-700 dark:text-rose-350 mt-1 leading-relaxed">
                      {result.contradiction_check.explanation}
                    </p>
                    <span className="inline-flex items-center rounded-md bg-rose-100/50 dark:bg-rose-900/40 px-2 py-0.5 text-[9px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wide mt-3 border border-rose-200/50">
                      High Litigation Risk
                    </span>
                  </div>
                </div>
              ) : (
                /* Verified/Consistent Box */
                <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 p-5 flex items-start space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-450 uppercase tracking-wide">
                      Dossier Integrity Verified
                    </h4>
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-350 mt-1 leading-relaxed">
                      {result.contradiction_check.explanation}
                    </p>
                    <span className="inline-flex items-center rounded-md bg-emerald-100/50 dark:bg-emerald-900/40 px-2 py-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mt-3 border border-emerald-200/50">
                      Consistent Deposition
                    </span>
                  </div>
                </div>
              )}

              {/* Testimony Comparison Panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Hearing 1 statement */}
                <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col shadow-sm">
                  <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                    <FileText className="h-4 w-4 text-slate-450 dark:text-slate-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Hearing Deposition 1
                    </span>
                  </div>
                  <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed italic bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl flex-1 border border-slate-100 dark:border-slate-800">
                    "{result.hearing_1_statement || "No recorded testimony for hearing 1."}"
                  </p>
                </div>

                {/* Hearing 3 statement */}
                <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col shadow-sm">
                  <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                    <FileText className="h-4 w-4 text-slate-450 dark:text-slate-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Hearing Deposition 3
                    </span>
                  </div>
                  <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed italic bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl flex-1 border border-slate-100 dark:border-slate-800">
                    "{result.hearing_3_statement || "No recorded testimony for hearing 3."}"
                  </p>
                </div>

              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
};
