"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog";

export default function TestContent() {
  const [selectedTest, setSelectedTest] = useState("");
  const [logLines, setLogLines] = useState<string[]>([]);
  const [logOpen, setLogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const [autoRunInterval, setAutoRunInterval] = useState<number>(12 * 60 * 60 * 1000);
  const [nextRunIn, setNextRunIn] = useState<number>(autoRunInterval);

  const runTest = async (testToRun = selectedTest) => {
    if (!testToRun) return;
    setIsLoading(true);
    setLogLines([]);

    const res = await fetch("/api/run-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testPath: testToRun === "all" ? "" : testToRun }),
    });

    if (!res.body) {
      setIsLoading(false);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter((line) => line.trim() !== "");
      setLogLines((prev) => [...prev, ...lines]);
    }

    setIsLoading(false);
    setLogOpen(true);

    setTimeout(() => {
      window.open("/reports/index.html", "_blank");
    }, 500);
  };

  const fetchHistory = async () => {
    const res = await fetch("/api/test-history");
    if (res.ok) {
      const data = await res.json();
      setHistory(data);
    }
    setHistoryOpen(true);
  };

  useEffect(() => {
    if (!autoRunInterval) return;

    const interval = setInterval(() => {
      runTest("all");
      setNextRunIn(autoRunInterval);
    }, autoRunInterval);

    const countdown = setInterval(() => {
      setNextRunIn((prev) => (prev > 1000 ? prev - 1000 : 0));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(countdown);
    };
  }, [autoRunInterval]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="font-sans flex flex-col gap-10 min-h-screen p-6 sm:p-12 ">
      <div className="w-full flex flex-col gap-4 max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold text-white drop-shadow-[0_0_8px_#00ffff80]">
          ⚡ Automated Test Runner
        </h2>
        <div className="flex flex-wrap gap-4">

          {/* SELECT DE TEST */}
          <Select value={selectedTest} onValueChange={setSelectedTest}>
            <SelectTrigger className="w-72 bg-gray-900 text-gray-200 border border-gray-700 rounded-lg shadow-[0_0_8px_#00ffff30]">
              <SelectValue placeholder="Select a test to run" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 text-gray-200 border border-gray-700">
              <SelectItem value="all">🔁 Run all tests</SelectItem>
              <SelectItem value="tests/home">🏠 Run all Home tests</SelectItem>
              <SelectItem value="tests/home/form.spec.ts">📄 Run Form Home Test</SelectItem>
              <SelectItem value="tests/home/home-anchor.spec.ts">📄 Run Home Anchor Test</SelectItem>
              <SelectItem value="tests/home/home-cards-navigation.spec.ts">🔗 Run Home Cards Navigation Test</SelectItem>
              <SelectItem value="tests/home/menu-links.spec.ts">🔗 Run Menu Links Test</SelectItem>
            </SelectContent>
          </Select>

          {/* SELECT DE AUTO RUN */}
          <Select onValueChange={(v) => {
            const ms = Number(v);
            setAutoRunInterval(ms);
            setNextRunIn(ms);
          }}>
            <SelectTrigger className="w-44 bg-gray-900 text-gray-200 border border-gray-700 rounded-lg shadow-[0_0_8px_#00ffff30]">
              <SelectValue placeholder="Auto run every..." />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 text-gray-200 border border-gray-700">
              <SelectItem value="30000">🕒 Every 30 sec</SelectItem>
              <SelectItem value="3600000">🕒 Every 1 hour</SelectItem>
              <SelectItem value="43200000">🕒 Every 12 hours</SelectItem>
              <SelectItem value="86400000">🕒 Every 24 hours</SelectItem>
            </SelectContent>
          </Select>
          <Link  href="/api/download-report" target="_blank">
           <Button
           
            
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_10px_#00ffff40] transition-transform hover:scale-105"
          >
            📥 download PDF of the report
          </Button>
          </Link>
          
          {/* BOTÓN DE EJECUCIÓN */}
          <Button 
            onClick={() => runTest()} 
            disabled={isLoading} 
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_10px_#00ffff40] transition-transform hover:scale-105">
            {isLoading ? (
              <span className="flex gap-2 items-center">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Running...
              </span>
            ) : (
              "Run Selected Test"
            )}
          </Button>

          {/* BOTÓN DE REPORTES */}
          <Link href="/reports/index.html" target="_blank">
            <Button className="bg-green-600 hover:bg-green-700 text-white shadow-[0_0_10px_#00ff9d40] transition-transform hover:scale-105">
              Show Report
            </Button>
          </Link>
        </div>

        {/* CONTADOR */}
        <p className="text-sm text-gray-400 mt-2">
          ⏳ Next auto-run in: <span className="text-cyan-300">{formatTime(nextRunIn)}</span>
        </p>
      </div>

      {/* DIALOG DE LOG */}
      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-900 text-gray-200 border border-gray-700 shadow-[0_0_15px_#00ffff30]">
          <DialogHeader>
            <DialogTitle className="text-cyan-400">Test Log Output</DialogTitle>
            <DialogDescription className="text-gray-400">Visual summary of the selected test execution</DialogDescription>
          </DialogHeader>

          <div className="flex gap-6 my-4">
            <span className="text-green-400 font-medium">
              ✅ {logLines.filter((l) => l.includes("passed")).length} passed
            </span>
            <span className="text-red-400 font-medium">
              ❌ {logLines.filter((l) => l.includes("failed")).length} failed
            </span>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg text-sm space-y-2">
            {logLines.map((line, index) => {
              const isPassed = line.includes("passed");
              const isFailed = line.includes("failed") || line.includes("expect(");
              const isTestTitle = /^\[\d+\/\d+\]/.test(line);
              const isErrorStack = /^\s+at\s/.test(line);
              const isIndented = line.startsWith("  ");

              if (line.includes("Error:")) {
                return (
                  <details key={index} className="bg-red-900/40 border border-red-400 p-3 rounded">
                    <summary className="text-red-400 cursor-pointer font-semibold">❌ Error Detected</summary>
                    <pre className="whitespace-pre-wrap text-red-300 mt-2 text-sm">{line}</pre>
                  </details>
                );
              }

              return (
                <div
                  key={index}
                  className={`flex items-start gap-2 ${
                    isPassed ? "text-green-400" : isFailed ? "text-red-400" : "text-gray-300"
                  }`}
                >
                  {isPassed && <span>✅</span>}
                  {isFailed && <span>❌</span>}
                  {!isPassed && !isFailed && isTestTitle && <span>🧪</span>}
                  {!isPassed && !isFailed && !isTestTitle && <span className="w-5" />}
                  <span className={`whitespace-pre-wrap ${isErrorStack || isIndented ? "pl-4 text-gray-500" : ""}`}>
                    {line}
                  </span>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* DIALOG DE HISTORIAL */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-900 text-gray-200 border border-gray-700 shadow-[0_0_15px_#00ffff30]">
          <DialogHeader>
            <DialogTitle className="text-cyan-400">Test History</DialogTitle>
            <DialogDescription className="text-gray-400">Summary of previous runs</DialogDescription>
          </DialogHeader>

          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-800 text-gray-300">
                <tr>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Test</th>
                  <th className="p-2 text-left text-green-400">Passed</th>
                  <th className="p-2 text-left text-red-400">Failed</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-b border-gray-700 hover:bg-gray-800/40 transition-colors">
                    <td className="p-2 whitespace-nowrap">{new Date(h.date).toLocaleString()}</td>
                    <td className="p-2 break-all">{h.testPath}</td>
                    <td className="p-2 text-green-400">{h.passed}</td>
                    <td className="p-2 text-red-400">{h.failed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
