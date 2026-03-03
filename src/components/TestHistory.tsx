"use client";

import { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { HelpCircle, Camera, Video } from "lucide-react";

interface TestRun {
  id: string;
  date: string;
  testPath: string;
  passed: number;
  failed: number;
  screenshots?: string[];
  videos?: string[];
  errors?: string[];
}

interface TestHistoryProps {
  // Called when user clicks the "Ask AI" icon on an error
  onAskAI?: (prompt: string) => void;
}

export default function TestHistory({ onAskAI }: TestHistoryProps) {
  const [history, setHistory] = useState<TestRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/test-history");
        if (!res.ok) return;
        const data: TestRun[] = await res.json();
        setHistory(data.sort((a, b) => b.failed - a.failed));
      } catch (err) {
        console.error("Error loading test history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Build a helpful prompt with context for the AI
  const buildPrompt = (error: string, run: TestRun) => {
    // NOTE: Keep the prompt concise but contextual.
    return [
      `Explain me this automated test error.`,
      `Include cause in plain language, likely root-cause, and next steps.`,
      ``,
      `Context:`,
      `- Test: ${run.testPath}`,
      `- Date: ${new Date(run.date).toLocaleString()}`,
      `- Passed: ${run.passed} | Failed: ${run.failed}`,
      ``,
      `Error:`,
      error
    ].join("\n");
  };

  const totalPassed = history.reduce((sum, h) => sum + h.passed, 0);
  const totalFailed = history.reduce((sum, h) => sum + h.failed, 0);
  const totalRuns = history.length;

  return (
    <div className="w-full space-y-8">
      {/* Hero Header */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
          Test History
        </h1>
        <div className="flex items-center justify-center gap-3 pt-2">
          <div className="px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
            📊 {totalRuns} Total Runs
          </div>
          <div className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
            ✓ {totalPassed} Passed
          </div>
          <div className="px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium">
            ✕ {totalFailed} Failed
          </div>
        </div>
      </div>

      {/* States */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
            <p className="text-white/50">Loading test history...</p>
          </div>
        </div>
      ) : history.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📋</span>
            </div>
            <p className="text-white/60 text-lg font-medium">No test history found</p>
            <p className="text-white/40 text-sm">Run some tests to see their history here</p>
          </div>
        </div>
      ) : (
        <div className="w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-xl shadow-2xl shadow-emerald-500/5">
          <div className="w-full">
            <Table className="table-fixed w-full">
              <TableHeader className="sticky top-0 z-10 bg-gradient-to-r from-slate-900/80 to-slate-950/80 backdrop-blur-xl border-b border-white/10">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="py-4 pl-6 w-[15%] text-white/70 font-bold text-xs uppercase tracking-wider">📅 Date</TableHead>
                  <TableHead className="py-4 w-[15%] text-white/70 font-bold text-xs uppercase tracking-wider">🧪 Test</TableHead>
                  <TableHead className="py-4 text-center w-[8%] text-white/70 font-bold text-xs uppercase tracking-wider">✓ Pass</TableHead>
                  <TableHead className="py-4 text-center w-[8%] text-white/70 font-bold text-xs uppercase tracking-wider">✕ Fail</TableHead>
                  <TableHead className="py-4 w-[12%] text-white/70 font-bold text-xs uppercase tracking-wider">📸 Screens</TableHead>
                  <TableHead className="py-4 w-[12%] text-white/70 font-bold text-xs uppercase tracking-wider">🎬 Videos</TableHead>
                  <TableHead className="py-4 pr-6 w-[30%] text-white/70 font-bold text-xs uppercase tracking-wider">⚠️ Errors</TableHead>
                </TableRow>
              </TableHeader>

            <TableBody>
              {history.map((h, i) => (
                <TableRow
                  key={h.id}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-all duration-200"
                >
                  {/* Date */}
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-2 group relative">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                        <span className="text-xs">📅</span>
                      </div>
                      <span className="text-xs text-white/80 font-medium truncate">
                        {new Date(h.date).toLocaleDateString()}
                      </span>
                      <div className="absolute left-0 top-full mt-1 px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-xs text-white/90 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-xl">
                        {new Date(h.date).toLocaleString()}
                      </div>
                    </div>
                  </TableCell>

                  {/* Test path */}
                  <TableCell className="py-4 align-top">
                    <div className="group relative">
                      <div
                        className="text-xs text-white/70 truncate font-mono cursor-help"
                      >
                        {h.testPath}
                      </div>
                      <div className="absolute left-0 top-full mt-1 px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-xs text-white/90 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-xl max-w-md break-words">
                        {h.testPath}
                      </div>
                    </div>
                  </TableCell>

                  {/* Passed */}
                  <TableCell className="py-4 text-center align-top">
                    <span
                      className="inline-flex items-center justify-center w-full max-w-[60px] mx-auto rounded-lg border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 px-2 py-1.5 text-xs font-bold text-emerald-300"
                      aria-label={`${h.passed} passed`}
                    >
                      {h.passed}
                    </span>
                  </TableCell>

                  {/* Failed */}
                  <TableCell className="py-4 text-center align-top">
                    <span
                      className="inline-flex items-center justify-center w-full max-w-[60px] mx-auto rounded-lg border border-rose-500/30 bg-gradient-to-br from-rose-500/10 to-rose-600/10 px-2 py-1.5 text-xs font-bold text-rose-300"
                      aria-label={`${h.failed} failed`}
                    >
                      {h.failed}
                    </span>
                  </TableCell>

                  {/* Screenshots */}
                  <TableCell className="py-4 align-top">
                    {h.screenshots?.length ? (
                      <div className="flex flex-col gap-1.5">
                        {h.screenshots.slice(0, 2).map((src, idx) => (
                          <a
                            key={idx}
                            href={src}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 transition-all text-[10px] font-medium group w-fit"
                          >
                            <Camera className="h-3 w-3 shrink-0 group-hover:scale-110 transition-transform" aria-hidden="true" />
                            <span className="truncate">#{idx + 1}</span>
                          </a>
                        ))}
                        {h.screenshots.length > 2 && (
                          <span className="text-[10px] text-purple-300/60 pl-2">+{h.screenshots.length - 2} more</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-white/30 text-xs">—</span>
                    )}
                  </TableCell>

                  {/* Videos */}
                  <TableCell className="py-4 align-top">
                    {h.videos?.length ? (
                      <div className="flex flex-col gap-1.5">
                        {h.videos.slice(0, 2).map((src, idx) => (
                          <a
                            key={idx}
                            href={src}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-300 hover:bg-pink-500/20 transition-all text-[10px] font-medium group w-fit"
                          >
                            <Video className="h-3 w-3 shrink-0 group-hover:scale-110 transition-transform" aria-hidden="true" />
                            <span className="truncate">#{idx + 1}</span>
                          </a>
                        ))}
                        {h.videos.length > 2 && (
                          <span className="text-[10px] text-pink-300/60 pl-2">+{h.videos.length - 2} more</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-white/30 text-xs">—</span>
                    )}
                  </TableCell>

                  {/* Errors + Ask AI */}
                  <TableCell className="py-4 pr-6 align-top">
                    {h.errors?.length ? (
                      <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                        {h.errors.map((e, idx) => (
                          <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-rose-500/5 border border-rose-500/20 group/error relative">
                            <button
                              type="button"
                              onClick={() => onAskAI?.(buildPrompt(e, h))}
                              className="shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600/80 to-pink-600/80 text-white hover:from-purple-600 hover:to-pink-600 transition-all hover:scale-105 shadow-lg"
                              title="Ask AI to explain this error"
                              aria-label="Ask AI to explain this error"
                            >
                              <HelpCircle className="h-3.5 w-3.5" />
                            </button>
                            <span className="flex-1 text-[10px] text-rose-300 font-mono leading-relaxed truncate cursor-help">
                              {e}
                            </span>
                            <div className="absolute left-0 top-full mt-1 px-3 py-2 bg-slate-900 border border-rose-500/30 rounded-lg text-xs text-rose-300 font-mono opacity-0 invisible group-hover/error:opacity-100 group-hover/error:visible transition-all duration-200 z-50 shadow-xl max-w-lg break-words whitespace-pre-wrap">
                              {e}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-white/30 text-xs">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </div>
      )}
    </div>
  );
}
