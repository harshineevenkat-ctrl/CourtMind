import React, { useEffect, useRef, useState } from "react";
import { askCase, type MemorySummaryCase } from "../api";
import { Send, MessageSquare, AlertCircle, Bot, User, HelpCircle } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: Date;
}

interface AIChatProps {
  activeCaseId: string | null;
  cases: MemorySummaryCase[];
  onSelectCase: (caseId: string | null) => void;
}

export const AIChat: React.FC<AIChatProps> = ({
  activeCaseId,
  cases,
  onSelectCase,
}) => {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Store chat history mapped by case_id
  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeHistory = activeCaseId ? chatHistories[activeCaseId] || [] : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeHistory, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanQuestion = question.trim();
    if (!cleanQuestion || !activeCaseId) return;

    // Add user message to local history
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: cleanQuestion,
      timestamp: new Date(),
    };

    const updatedHistory = [...activeHistory, userMsg];
    setChatHistories((prev) => ({
      ...prev,
      [activeCaseId]: updatedHistory,
    }));
    setQuestion("");
    setLoading(true);

    try {
      // POST to backend API
      const result = await askCase(activeCaseId, cleanQuestion);
      
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: "assistant",
        text: result.answer,
        timestamp: new Date(),
      };

      setChatHistories((prev) => ({
        ...prev,
        [activeCaseId]: [...updatedHistory, assistantMsg],
      }));
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to retrieve answer from Cognee.");
      
      // Add error context inside chat
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: "assistant",
        text: `⚠️ Query Error: ${err instanceof Error ? err.message : "The server did not respond in time."}`,
        timestamp: new Date(),
      };

      setChatHistories((prev) => ({
        ...prev,
        [activeCaseId]: [...updatedHistory, errorMsg],
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto p-4 md:p-6">
      
      {/* Top Banner: Dropdown selection */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-accent-600 dark:text-accent-400" />
            Cognee Cognitive Retrieval
          </h2>
          <p className="text-xxs text-slate-400 dark:text-slate-500 mt-0.5">
            Query the semantic memory graph of selected litigation dossiers.
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:block">Case Selector:</label>
          <select
            value={activeCaseId || ""}
            onChange={(e) => onSelectCase(e.target.value || null)}
            className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-accent-600"
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

      {/* Chat Messages Panel */}
      <div className="flex-1 min-h-0 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 p-4 md:p-6 overflow-y-auto space-y-4">
        {!activeCaseId ? (
          /* Empty Case State */
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <HelpCircle className="h-12 w-12 text-slate-350 dark:text-slate-750 mb-3" />
            <h4 className="text-sm font-bold text-slate-750 dark:text-slate-300">No Case Selected</h4>
            <p className="text-xs text-slate-450 dark:text-slate-550 mt-1 max-w-sm">
              Please choose a case folder using the dropdown selection box at the top to load its cognitive memory logs.
            </p>
          </div>
        ) : activeHistory.length === 0 ? (
          /* Empty Chat State */
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
            <div className="h-10 w-10 rounded-full bg-accent-50 dark:bg-accent-950/30 flex items-center justify-center border border-accent-100 dark:border-accent-900/10 text-accent-700 dark:text-accent-400">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-750 dark:text-slate-300">
                Cognitive Inquiries: {activeCaseId}
              </h4>
              <p className="text-xs text-slate-450 dark:text-slate-500 mt-1.5 max-w-sm mx-auto">
                Ask queries relative to witness statements, temporal events, or logical links within this dossier. Cognee will crawl the semantic network to answer.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full pt-4">
              {[
                "Who was present at the first hearing?",
                "Identify contradictions in statement reports",
                "What timeline events took place on July 5th?",
                "Provide a logical summary of the witness file",
              ].map((sample) => (
                <button
                  key={sample}
                  onClick={() => setQuestion(sample)}
                  className="p-3 text-left rounded-xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 text-xxs text-slate-550 dark:text-slate-400 hover:border-accent-500 dark:hover:border-accent-400 hover:bg-accent-50/5 dark:hover:bg-accent-950/5 transition-all"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Render Messages */
          <div className="space-y-4">
            {activeHistory.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"} items-start space-x-2.5`}
                >
                  {!isUser && (
                    <div className="h-8.5 w-8.5 rounded-xl bg-accent-900 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Bot className="h-4.5 w-4.5" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      isUser
                        ? "bg-accent-900 text-white rounded-tr-xs shadow-md shadow-accent-900/5"
                        : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200/50 dark:border-slate-800 rounded-tl-xs shadow-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <p
                      className={`text-[9px] mt-1.5 text-right ${
                        isUser ? "text-accent-200" : "text-slate-400 dark:text-slate-500"
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {isUser && (
                    <div className="h-8.5 w-8.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 font-semibold text-xs border border-slate-350/20">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Thinking Loading State */}
            {loading && (
              <div className="flex justify-start items-start space-x-2.5">
                <div className="h-8.5 w-8.5 rounded-xl bg-accent-900 text-white flex items-center justify-center shrink-0 animate-pulse">
                  <Bot className="h-4.5 w-4.5" />
                </div>
                <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200/50 dark:border-slate-800 rounded-2xl rounded-tl-xs px-4 py-3.5 shadow-sm max-w-[80%]">
                  <div className="flex items-center space-x-2.5">
                    <div className="flex space-x-1">
                      <div className="h-1.5 w-1.5 bg-accent-600 dark:bg-accent-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="h-1.5 w-1.5 bg-accent-600 dark:bg-accent-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="h-1.5 w-1.5 bg-accent-600 dark:bg-accent-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-450 dark:text-slate-500 animate-pulse">
                      Thinking... this can take up to a minute
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Error Info Bar */}
      {error && (
        <div className="mt-2 flex items-center space-x-2 rounded-xl bg-rose-50 dark:bg-rose-950/20 px-4 py-2.5 text-xxs font-medium text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input Tray Form */}
      <form onSubmit={handleSend} className="mt-4 flex items-center space-x-2">
        <input
          type="text"
          placeholder={activeCaseId ? `Ask about "${activeCaseId}"...` : "Select a case folder first to chat"}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-accent-600 dark:focus:border-accent-400 focus:outline-none transition-all"
          disabled={!activeCaseId || loading}
        />
        <button
          type="submit"
          disabled={!activeCaseId || !question.trim() || loading}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-900 hover:bg-accent-950 dark:bg-accent-700 dark:hover:bg-accent-600 text-white shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};
