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
        <p className="text-white/60 text-lg max-w-2xl mx-auto">
          Complete history of test executions with detailed results and artifacts
        </p>
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-gradient-to-r from-slate-900/80 to-slate-950/80 backdrop-blur-xl border-b border-white/10">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="py-4 pl-6 w-[180px] text-white/70 font-bold text-xs uppercase tracking-wider">📅 Date</TableHead>
                  <TableHead className="py-4 w-auto max-w-[300px] text-white/70 font-bold text-xs uppercase tracking-wider">🧪 Test</TableHead>
                  <TableHead className="py-4 text-right pr-3 w-[100px] text-white/70 font-bold text-xs uppercase tracking-wider">✓ Passed</TableHead>
                  <TableHead className="py-4 text-right pr-4 w-[100px] text-white/70 font-bold text-xs uppercase tracking-wider">✕ Failed</TableHead>
                  <TableHead className="py-4 w-[140px] text-white/70 font-bold text-xs uppercase tracking-wider">📸 Screenshots</TableHead>
                  <TableHead className="py-4 w-[140px] text-white/70 font-bold text-xs uppercase tracking-wider">🎬 Videos</TableHead>
                  <TableHead className="py-4 pr-6 w-auto text-white/70 font-bold text-xs uppercase tracking-wider">⚠️ Errors</TableHead>
                </TableRow>
              </TableHeader>

            <TableBody>
              {history.map((h, i) => (
                <TableRow
                  key={h.id}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-all duration-200"
                >
                  {/* Date */}
                  <TableCell className="py-4 pl-6 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <span className="text-xs">📅</span>
                      </div>
                      <span className="text-sm text-white/80 font-medium">
                        {new Date(h.date).toLocaleString()}
                      </span>
                    </div>
                  </TableCell>

                  {/* Test path */}
                  <TableCell className="py-4 align-top max-w-[300px]">
                    <div
                      className="text-sm text-white/70 truncate font-mono"
                      title={h.testPath}
                    >
                      {h.testPath}
                    </div>
                  </TableCell>

                  {/* Passed */}
                  <TableCell className="py-4 pr-3 text-right align-top">
                    <span
                      className="inline-flex items-center justify-center min-w-[50px] rounded-lg border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 px-3 py-1.5 text-sm font-bold text-emerald-300"
                      aria-label={`${h.passed} passed`}
                    >
                      {h.passed}
                    </span>
                  </TableCell>

                  {/* Failed */}
                  <TableCell className="py-4 pr-4 text-right align-top">
                    <span
                      className="inline-flex items-center justify-center min-w-[50px] rounded-lg border border-rose-500/30 bg-gradient-to-br from-rose-500/10 to-rose-600/10 px-3 py-1.5 text-sm font-bold text-rose-300"
                      aria-label={`${h.failed} failed`}
                    >
                      {h.failed}
                    </span>
                  </TableCell>

                  {/* Screenshots */}
                  <TableCell className="py-4 align-top">
                    {h.screenshots?.length ? (
                      <ul className="space-y-2">
                        {h.screenshots.map((src, idx) => (
                          <li key={idx}>
                            <a
                              href={src}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 transition-all text-xs font-medium group"
                            >
                              <Camera className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" aria-hidden="true" />
                              <span>Screenshot {idx + 1}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-white/30 text-sm">—</span>
                    )}
                  </TableCell>

                  {/* Videos */}
                  <TableCell className="py-4 align-top">
                    {h.videos?.length ? (
                      <ul className="space-y-2">
                        {h.videos.map((src, idx) => (
                          <li key={idx}>
                            <a
                              href={src}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-300 hover:bg-pink-500/20 transition-all text-xs font-medium group"
                            >
                              <Video className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" aria-hidden="true" />
                              <span>Video {idx + 1}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-white/30 text-sm">—</span>
                    )}
                  </TableCell>

                  {/* Errors + Ask AI */}
                  <TableCell className="py-4 pr-6 align-top">
                    {h.errors?.length ? (
                      <ul className="max-h-40 overflow-y-auto space-y-3 pr-1">
                        {h.errors.map((e, idx) => (
                          <li key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-rose-500/5 border border-rose-500/20">
                            <button
                              type="button"
                              onClick={() => onAskAI?.(buildPrompt(e, h))}
                              className="shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600/80 to-pink-600/80 text-white hover:from-purple-600 hover:to-pink-600 transition-all hover:scale-105 shadow-lg"
                              title="Ask AI to explain this error"
                              aria-label="Ask AI to explain this error"
                            >
                              <HelpCircle className="h-4 w-4" />
                            </button>
                            <span className="flex-1 break-words text-xs text-rose-300 font-mono leading-relaxed">
                              {e}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-white/30 text-sm">—</span>
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
