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

  return (
    <div className="w-full font-sans p-4 sm:p-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
          Test History
        </h2>
        <p className="text-sm text-muted-foreground">
          Summary of previous test runs
        </p>
      </div>

      {/* States */}
      {loading ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : history.length === 0 ? (
        <div className="text-sm text-muted-foreground">No history found.</div>
      ) : (
        <div className="w-full overflow-x-auto rounded-xl border bg-card shadow-sm">
          <Table className="min-w-[860px]">
            <TableHeader className="sticky top-0 z-10 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="py-3 pl-4 w-[200px]">Date</TableHead>
                <TableHead className="py-3">Test</TableHead>
                <TableHead className="py-3 text-right pr-3">Passed</TableHead>
                <TableHead className="py-3 text-right pr-4">Failed</TableHead>
                <TableHead className="py-3">Screenshots</TableHead>
                <TableHead className="py-3">Videos</TableHead>
                <TableHead className="py-3 pr-4">Errors</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {history.map((h, i) => (
                <TableRow
                  key={h.id}
                  className="even:bg-muted/40 hover:bg-accent/40 transition-colors"
                >
                  {/* Date */}
                  <TableCell className="py-3 pl-4 whitespace-nowrap text-sm text-foreground">
                    {new Date(h.date).toLocaleString()}
                  </TableCell>

                  {/* Test path */}
                  <TableCell className="py-3 align-top">
                    <div
                      className="text-sm text-foreground/90 max-w-[520px] truncate"
                      title={h.testPath}
                    >
                      {h.testPath}
                    </div>
                  </TableCell>

                  {/* Passed */}
                  <TableCell className="py-3 pr-3 text-right align-top">
                    <span
                      className="inline-flex items-center rounded-full border border-emerald-600/30 bg-emerald-600/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400"
                      aria-label={`${h.passed} passed`}
                    >
                      {h.passed}
                    </span>
                  </TableCell>

                  {/* Failed */}
                  <TableCell className="py-3 pr-4 text-right align-top">
                    <span
                      className="inline-flex items-center rounded-full border border-red-600/30 bg-red-600/10 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:text-red-400"
                      aria-label={`${h.failed} failed`}
                    >
                      {h.failed}
                    </span>
                  </TableCell>

                  {/* Screenshots */}
                  <TableCell className="py-3 align-top">
                    {h.screenshots?.length ? (
                      <ul className="space-y-1">
                        {h.screenshots.map((src, idx) => (
                          <li key={idx}>
                            <a
                              href={src}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm underline underline-offset-4 hover:no-underline"
                            >
                              <Camera className="h-4 w-4" aria-hidden="true" />
                              <span>Screenshot {idx + 1}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  {/* Videos */}
                  <TableCell className="py-3 align-top">
                    {h.videos?.length ? (
                      <ul className="space-y-1">
                        {h.videos.map((src, idx) => (
                          <li key={idx}>
                            <a
                              href={src}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm underline underline-offset-4 hover:no-underline"
                            >
                              <Video className="h-4 w-4" aria-hidden="true" />
                              <span>Video {idx + 1}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  {/* Errors + Ask AI */}
                  <TableCell className="py-3 pr-4 align-top">
                    {h.errors?.length ? (
                      <ul className="max-h-40 overflow-y-auto space-y-2 pr-1">
                        {h.errors.map((e, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                              <button
                                type="button"
                                onClick={() => onAskAI?.(buildPrompt(e, h))}
                                className="shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-md border bg-transparent text-foreground/80 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                title="Ask AI to explain this error"
                                aria-label="Ask AI to explain this error"
                              >
                              <HelpCircle className="h-4 w-4" />
                            </button>
                            <span className="flex-1 break-words text-sm text-destructive font-mono/75 leading-relaxed">
                              {e}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
