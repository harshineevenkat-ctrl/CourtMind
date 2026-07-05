import React, { useState } from "react";
import { Lock, User, Scale } from "lucide-react";

interface SignInProps {
  onSignIn: (name: string) => void;
}

export const SignIn: React.FC<SignInProps> = ({ onSignIn }) => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your credential password.");
      return;
    }

    setLoading(true);

    // Simulate authenticating
    setTimeout(() => {
      setLoading(false);
      onSignIn(name.trim());
    }, 800);
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat p-6 transition-all duration-300"
      style={{ backgroundImage: `url('/courtroom_bg.png')` }}
    >
      {/* Semi-transparent overlay to ensure text contrast */}
      <div className="absolute inset-0 bg-slate-150/40 dark:bg-slate-950/80 backdrop-blur-xs transition-colors duration-300" />

      {/* Centered Glass Card */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-white/75 dark:bg-slate-900/80 backdrop-blur-xl border border-white/30 dark:border-slate-800/50 shadow-2xl p-8 sm:p-10 transition-all duration-300">
        
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-900 text-white shadow-lg shadow-accent-900/20 mb-4 transition-transform duration-300 hover:scale-105">
            <Scale className="h-7 w-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-sans font-extrabold tracking-tight text-slate-900 dark:text-white">
            CourtMind <span className="text-accent-600 dark:text-accent-400">AI</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
            AI-Powered Legal Memory Assistant
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-xl bg-rose-50 dark:bg-rose-950/20 px-4 py-3 text-xs font-medium text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
              Lawyer Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
                <User className="h-4.5 w-4.5" />
              </span>
              <input
                type="text"
                placeholder="Attorney Alexander"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 py-3 pl-11 pr-4 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-accent-600 dark:focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-600/10 transition-all"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
              Security Key
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
                <Lock className="h-4.5 w-4.5" />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 py-3 pl-11 pr-4 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-accent-600 dark:focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-600/10 transition-all"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center rounded-xl bg-accent-900 hover:bg-accent-950 dark:bg-accent-700 dark:hover:bg-accent-600 text-white font-semibold py-3 text-sm border border-transparent shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Verifying Case Files...</span>
              </span>
            ) : (
              <span>Access Secure Assistant</span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-200/50 dark:border-slate-800/30 pt-6">
          <p className="text-xxs text-slate-400 dark:text-slate-500">
            CONFIDENTIAL LEGAL PLATFORM • RESTRICTED ACCESS AUTHORIZED
          </p>
        </div>
      </div>
    </div>
  );
};
