import React, { useRef, useState } from "react";
import { uploadCase, type CaseUploadResponse } from "../api";
import { Upload, File, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

interface UploadCaseProps {
  onSelectCase: (caseId: string) => void;
  onRefreshCases: () => Promise<void>;
  onNavigate: (view: string) => void;
}

export const UploadCase: React.FC<UploadCaseProps> = ({
  onSelectCase,
  onRefreshCases,
  onNavigate,
}) => {
  const [caseId, setCaseId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<CaseUploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        setError("Only PDF files are supported for Cognee ingestion.");
        setFile(null);
      } else {
        setError(null);
        setFile(selectedFile);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type !== "application/pdf") {
        setError("Only PDF files are supported for Cognee ingestion.");
        setFile(null);
      } else {
        setError(null);
        setFile(droppedFile);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanCaseId = caseId.trim();
    if (!cleanCaseId) {
      setError("Please specify a unique Case ID.");
      return;
    }

    // URL path safety validation
    if (!/^[a-zA-Z0-9_-]+$/.test(cleanCaseId)) {
      setError("Case ID must contain only alphanumeric characters, dashes (-) or underscores (_).");
      return;
    }

    if (!file) {
      setError("Please select a PDF document to upload.");
      return;
    }

    setLoading(true);
    try {
      const response = await uploadCase(cleanCaseId, file);
      setSuccess(response);
      onSelectCase(cleanCaseId); // make this uploaded case active automatically
      await onRefreshCases(); // refresh active cases lists
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An error occurred during upload.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-sans font-extrabold tracking-tight text-slate-900 dark:text-white">
          Upload Legal Dossier
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Ingest new documents into Cognee's semantic structure graph.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
        
        {success ? (
          /* Success Screen */
          <div className="space-y-6 text-center py-6">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/20 mb-2">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-850 dark:text-white">Memory Ingestion Successful</h3>
              <p className="text-sm text-slate-550 dark:text-slate-400 mt-2 max-w-sm mx-auto">
                Case dossier <strong className="font-semibold text-slate-800 dark:text-slate-100">"{success.case_id}"</strong> has been successfully uploaded and processed.
              </p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/40 dark:border-slate-700/40 rounded-xl p-4 text-left max-w-md mx-auto text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Cognee Action:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{success.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target File:</span>
                <span className="text-slate-700 dark:text-slate-350 truncate max-w-[200px]" title={success.file}>
                  {success.file}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                onClick={() => {
                  setCaseId("");
                  setFile(null);
                  setSuccess(null);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-750 dark:text-slate-350 transition-colors"
              >
                Upload Another PDF
              </button>
              <button
                onClick={() => onNavigate("chat")}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-xl bg-accent-900 hover:bg-accent-950 dark:bg-accent-700 dark:hover:bg-accent-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                <span>Proceed to AI Chat</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Upload Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="flex items-start space-x-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 p-4 text-xs font-medium text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Input Case ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                Case Identifier (Unique ID)
              </label>
              <input
                type="text"
                placeholder="e.g. case_state_v_johnson"
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-accent-600 dark:focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-600/10 transition-all"
                disabled={loading}
              />
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5">
                Use alphanumeric characters, underscores, or dashes only.
              </p>
            </div>

            {/* Ingestion Dropzone */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                Legal Document Ingestion (PDF)
              </label>
              
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => !loading && fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  file
                    ? "border-accent-500 dark:border-accent-400 bg-accent-50/10 dark:bg-accent-950/5"
                    : "border-slate-250 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-slate-50/20 dark:bg-slate-950/10"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="application/pdf"
                  className="hidden"
                  disabled={loading}
                />
                
                {file ? (
                  <div className="space-y-3">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 dark:bg-accent-950/30 text-accent-600 dark:text-accent-400 border border-accent-100 dark:border-accent-900/10">
                      <File className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-750 dark:text-slate-200 max-w-[280px] truncate mx-auto">
                        {file.name}
                      </p>
                      <p className="text-xxs text-slate-400 dark:text-slate-500 mt-0.5">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="text-xs font-bold text-rose-500 hover:text-rose-600 hover:underline"
                      disabled={loading}
                    >
                      Clear Selection
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50">
                      <Upload className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-650 dark:text-slate-350">
                        Drag & Drop PDF or <span className="text-accent-600 dark:text-accent-400 hover:underline">Browse files</span>
                      </p>
                      <p className="text-xxs text-slate-400 dark:text-slate-500 mt-1">
                        Only witness testimonies, court transcripts, or evidence dossiers in PDF format
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Ingestion Submit Trigger */}
            <button
              type="submit"
              disabled={loading || !caseId || !file}
              className="w-full flex items-center justify-center rounded-xl bg-accent-900 hover:bg-accent-950 dark:bg-accent-700 dark:hover:bg-accent-600 text-white font-semibold py-3 text-sm border border-transparent shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <span className="flex items-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Structuring Cognee Memory Graph...</span>
                </span>
              ) : (
                <span>Initialize Case Memory</span>
              )}
            </button>

          </form>
        )}
        
      </div>
    </div>
  );
};
