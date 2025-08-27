"use client";

import { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { HelpCircle } from "lucide-react";

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
      `Explain this automated test error for a non-technical teammate.`,
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
    <div className="w-full font-sans flex flex-col gap-10 p-6 sm:p-12">
      <div className="w-full">
        <h2 className="text-2xl font-semibold text-neutral-800 dark:text-white">
          Test History
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Summary of previous test runs
        </p>

        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : history.length === 0 ? (
          <p className="text-gray-500 text-sm">No history found.</p>
        ) : (
          <div className="w-full overflow-x-auto rounded-lg border shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="p-3 w-[180px]">Date</TableHead>
                  <TableHead className="p-3">Test</TableHead>
                  <TableHead className="p-3 text-green-700">Passed</TableHead>
                  <TableHead className="p-3 text-red-700">Failed</TableHead>
                  <TableHead className="p-3">Screenshots</TableHead>
                  <TableHead className="p-3">Videos</TableHead>
                  <TableHead className="p-3">Errors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((h) => (
                  <TableRow key={h.id} className="even:bg-muted/40">
                    <TableCell className="p-3 whitespace-nowrap">
                      {new Date(h.date).toLocaleString()}
                    </TableCell>
                    <TableCell className="p-3 break-all">
                      {h.testPath}
                    </TableCell>
                    <TableCell className="p-3 text-green-600">
                      {h.passed}
                    </TableCell>
                    <TableCell className="p-3 text-red-600">
                      {h.failed}
                    </TableCell>

                    {/* Screenshots */}
                    <TableCell className="p-3">
                      {h.screenshots?.length ? (
                        h.screenshots.map((src, idx) => (
                          <a
                            key={idx}
                            href={src}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline block"
                          >
                            📷 Screenshot {idx + 1}
                          </a>
                        ))
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>

                    {/* Videos */}
                    <TableCell className="p-3">
                      {h.videos?.length ? (
                        h.videos.map((src, idx) => (
                          <a
                            key={idx}
                            href={src}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-500 underline block"
                          >
                            🎥 Video {idx + 1}
                          </a>
                        ))
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>

                    {/* Errors with "Ask AI" icon */}
                    <TableCell className="p-3">
                      {h.errors?.length ? (
                        <ul className="text-red-500 text-sm max-h-40 overflow-y-auto space-y-2">
                          {h.errors.map((e, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="flex-1 break-words">
                                {e}
                              </span>
                              <button
                                type="button"
                                onClick={() => onAskAI?.(buildPrompt(e, h))}
                                className="shrink-0 inline-flex items-center justify-center rounded-md border px-2 py-1 text-xs hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2"
                                title="Ask AI to explain this error"
                                aria-label="Ask AI to explain this error"
                              >
                                <HelpCircle className="w-4 h-4" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
