"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import Loader from "../components/Loader";

// ---------- Types ----------
interface Site {
  project: string;
  name: string;
  url: string;
}

// ---------- Page ----------
export default function TestContent() {
  const sites: Site[] = [
    { project: "pip",           name: "Partner in Publishing", url: "https://partnerinpublishing.com" },
    { project: "gradepotential",name: "Grade Potential",                 url: "https://gradepotentialtutoring.com" },
    { project: "itopia",        name: "Itopia",                          url: "https://itopia.com" },
    { project: "metricmarine",  name: "Metric Marine",                   url: "https://www.metricmarine.com" },
  ];

  return (
    <div className="font-sans flex flex-col gap-8 min-h-screen p-6 sm:p-10 bg-gradient-to-b from-[#0b1220] to-[#0b1220]">
      {/* Page Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white drop-shadow-[0_0_10px_#00ffff66]">
            ⚡ Automated Test Runner
          </h2>
          <p className="text-sm text-white/60 mt-1">
            Elige el test, programa el intervalo y ejecuta. Simple y claro.
          </p>
        </div>
        <Badge className="bg-cyan-600/30 text-cyan-200 border border-cyan-500/40">
          Partner in Publishing 
        </Badge>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        {sites.map((site) => (
          <SiteTestCard key={site.project} site={site} />
        ))}
      </div>
    </div>
  );
}

// ---------- Card ----------
function SiteTestCard({ site }: { site: Site }) {
  // State (logic intact)
  const [selectedTest, setSelectedTest] = useState("");
  const [autoRunInterval, setAutoRunInterval] = useState<number>(12 * 60 * 60 * 1000);
  const [nextRunIn, setNextRunIn] = useState<number>(autoRunInterval);
  const [isLoading, setIsLoading] = useState(false);

  const [logOpen, setLogOpen] = useState(false);
  const [logLines, setLogLines] = useState<string[]>([]);
  const [activeLogTab, setActiveLogTab] = useState<"summary" | "raw">("summary");

  // Derived UI state
  const passedCount = logLines.filter(l => l.includes("passed")).length;
  const failedCount = logLines.filter(l => l.includes("failed")).length;

  // Countdown/autorun (logic intact)
  useEffect(() => {
    if (!autoRunInterval) return;

    const interval = setInterval(() => {
      runTest(selectedTest || "all");
      setNextRunIn(autoRunInterval);
    }, autoRunInterval);

    const countdown = setInterval(() => {
      setNextRunIn(prev => (prev > 1000 ? prev - 1000 : 0));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(countdown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRunInterval]);

  // Helpers
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  // Core action (logic intact)
  const runTest = async (testToRun = selectedTest) => {
    if (!testToRun) {
      Swal.fire({
        icon: "warning",
        title: "Select a test",
        text: "You must select a test before running.",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
      });
      return;
    }

    setIsLoading(true);
    setLogLines([]);

    try {
      const res = await fetch("/api/run-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testPath: testToRun === "all" ? "" : testToRun,
          project: site.project,
        }),
      });

      if (!res.body) {
        setIsLoading(false);
        Swal.fire({ icon: "error", title: "Error", text: "No response received from the server." });
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

      setActiveLogTab("summary");
      setLogOpen(true);

      setTimeout(() => {
        window.open("/reports/index.html", "_blank");
      }, 500);
    } catch (err) {
      console.error("Error running test:", err);
      Swal.fire({ icon: "error", title: "Oops...", text: "An unexpected error occurred while running the tests." });
    } finally {
      setIsLoading(false);
    }
  };

  // Tests map (logic intact)
  const TESTS_BY_SITE: Record<string, { label: string; path: string }[]> = {
    pip: [
      { label: "📄 Run Form Home pip Test", path: "tests/pip/home/form.spec.ts" },
      { label: "📄 Run Menu Home Footer pip Test", path: "tests/pip/home/menu-links-footer.spec.ts" },
      { label: "📄 Run Home Anchor Test", path: "tests/pip/home/home-anchor.spec.ts" },
      { label: "🔗 Run Home Cards Navigation Test", path: "tests/pip/home/home-cards-navigation.spec.ts" },
      { label: "🔗 Run Menu Links Test", path: "tests/pip/home/menu-links.spec.ts" },
      { label: "📄 Run About Anchor Test", path: "tests/pip/about/about-anchor.spec.ts" },
      { label: "⏯️ Run About Videos Test", path: "tests/pip/about/videos-visible.spec.ts" },
      { label: "🧑🏻 Run About Team Test", path: "tests/pip/about/team-pip.spec.ts" },
    ],
    gradepotential: [
      { label: "📄 Run Form Home gp Test", path: "tests/gp/home/form.spec.ts" },
      { label: "📄 Run Home Anchor Test", path: "tests/gp/home/home-anchor.spec.ts" },
      { label: "🔗 Run Home Cards Navigation Test", path: "tests/gp/home/home-cards-navigation.spec.ts" },
      { label: "🔗 Run Menu Links Test", path: "tests/gp/home/menu-links.spec.ts" },
    ],
    itopia: [
      { label: "📄 Run Form Home itopia Test", path: "tests/itopia/home/form.spec.ts" },
      { label: "📄 Run Home Anchor Test", path: "tests/itopia/home/home-anchor.spec.ts" },
      { label: "🔗 Run Home Cards Navigation Test", path: "tests/itopia/home/home-cards-navigation.spec.ts" },
      { label: "🔗 Run Menu Links Test", path: "tests/itopia/home/menu-links.spec.ts" },
    ],
    metricmarine: [
      { label: "📄 Run Form Home MM Test", path: "tests/mm/home/form.spec.ts" },
      { label: "📄 Run Home Anchor Test", path: "tests/mm/home/home-anchor.spec.ts" },
      { label: "🔗 Run Home Cards Navigation Test", path: "tests/mm/home/home-cards-navigation.spec.ts" },
      { label: "🔗 Run Menu Links Test", path: "tests/mm/home/menu-links.spec.ts" },
    ],
  };

  // Favicon util (presentation only)
  const favicon = `https://www.google.com/s2/favicons?sz=64&domain=${new URL(site.url).hostname}`;

  return (
    <Card className="bg-[#0f1729] border border-white/10 rounded-2xl shadow-[0_0_20px_#00ffff20] overflow-hidden">
      {/* Header: Identity */}
      <CardHeader className="space-y-0 p-5 border-b border-white/10 bg-[#0b1424]">
        <div className="flex items-center gap-4">
          <img src={favicon} alt="" className="size-8 rounded" />
          <div className="min-w-0">
            <CardTitle className="text-white text-lg truncate">{site.name}</CardTitle>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-cyan-300/90 truncate">{site.url}</span>
              <Button
                variant="secondary"
                className="h-6 px-2 text-[11px] bg-cyan-600/20 text-cyan-200 hover:bg-cyan-600/30 border border-cyan-500/30"
                onClick={() => navigator.clipboard.writeText(site.url)}
                title="Copy URL"
              >
                Copy
              </Button>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {/* Status pills */}
            <Badge className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              ✅ {passedCount}
            </Badge>
            <Badge className="bg-rose-500/15 text-rose-300 border border-rose-500/30">
              ❌ {failedCount}
            </Badge>
          </div>
        </div>
      </CardHeader>

      {/* Body: Plan + Actions + Status */}
      <CardContent className="p-5">
        {/* Plan */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* What to run */}
          <div className="lg:col-span-2">
            <label className="text-xs uppercase tracking-wide text-white/60">Test</label>
            <Select value={selectedTest} onValueChange={setSelectedTest}>
              <SelectTrigger className="w-full mt-1 bg-[#121a2e] text-gray-200 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/40">
                <SelectValue placeholder="Select a test to run" />
              </SelectTrigger>
              <SelectContent className="bg-[#0f182b] text-gray-200 border border-white/10">
                <SelectItem value="all">🔁 Run all tests</SelectItem>
                {TESTS_BY_SITE[site.project]?.map((test) => (
                  <SelectItem key={test.path} value={test.path}>
                    {test.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* When to run */}
          <div>
            <label className="text-xs uppercase tracking-wide text-white/60">Auto run</label>
            <Select
              onValueChange={(v) => {
                const ms = Number(v);
                setAutoRunInterval(ms);
                setNextRunIn(ms);
              }}
            >
              <SelectTrigger className="w-full mt-1 bg-[#121a2e] text-gray-200 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/40">
                <SelectValue placeholder="Auto run every..." />
              </SelectTrigger>
              <SelectContent className="bg-[#0f182b] text-gray-200 border border-white/10">
                <SelectItem value="30000">🕒 Every 30 sec</SelectItem>
                <SelectItem value="3600000">🕒 Every 1 hour</SelectItem>
                <SelectItem value="43200000">🕒 Every 12 hours</SelectItem>
                <SelectItem value="86400000">🕒 Every 24 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Actions (sticky inside card) */}
        <div className="sticky top-2 z-10 mt-5 -mx-5 px-5 py-3 bg-[#0f1729]/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur border-y border-white/10">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => runTest()}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_12px_#00ffff55]"
            >
              {isLoading ? <Loader size={30} /> : "Run Test"}
            </Button>

            <Link href={`/api/download-report?project=${site.project}`} target="_blank">
              <Button className="bg-blue-600/70 hover:bg-blue-700 text-white">
                📥 PDF
              </Button>
            </Link>

            <Link href={`/reports/${site.project}/index.html`} target="_blank">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Show Report
              </Button>
            </Link>

            <div className="ml-auto text-xs text-white/70">
              ⏳ Next auto-run: <span className="text-cyan-300">{formatTime(nextRunIn)}</span>
            </div>
          </div>
        </div>

        {/* Status section */}
        <div className="mt-5 space-y-3">
          {/* Progress bar shown only while running */}
          {isLoading && (
            <div className="w-full h-2 rounded-full overflow-hidden bg-white/10">
              <div
                className="h-full bg-cyan-400 animate-[progress_1.5s_linear_infinite]"
                style={{ width: "60%" }}
              />
            </div>
          )}

          {/* Quick stats */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-emerald-300">✅ {passedCount} passed</span>
            <span className="text-rose-300">❌ {failedCount} failed</span>
            <span className="text-white/60">•</span>
            <button
              className="text-cyan-300 hover:text-cyan-200 underline underline-offset-4"
              onClick={() => { setActiveLogTab("summary"); setLogOpen(true); }}
            >
              View logs
            </button>
          </div>
        </div>
      </CardContent>

      {/* Logs modal with tabs */}
      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        <DialogContent className="sm:max-w-5xl max-h-[85vh] overflow-hidden bg-[#0b1424] text-gray-200 border border-white/10 shadow-[0_0_20px_#00ffff40]">
          <DialogHeader>
            <DialogTitle className="text-cyan-300">{site.name} — Test Output</DialogTitle>
            <DialogDescription className="text-white/60">
              Visual summary and full output of the selected test.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeLogTab} onValueChange={(v: string) => setActiveLogTab(v as any)} className="mt-2">
            <TabsList className="bg-white/5">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="raw">Raw log</TabsTrigger>
            </TabsList>

            {/* Summary tab: counts + last N lines */}
            <TabsContent value="summary" className="mt-4 space-y-4 overflow-y-auto max-h-[55vh] pr-1">
              <div className="flex flex-wrap items-center gap-4">
                <Badge className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">✅ Passed: {passedCount}</Badge>
                <Badge className="bg-rose-500/15 text-rose-300 border border-rose-500/30">❌ Failed: {failedCount}</Badge>
                <Badge className="bg-white/10 text-white/80 border border-white/15">
                  Total lines: {logLines.length}
                </Badge>
              </div>

              <div className="bg-[#101a33] rounded-lg border border-white/10">
                <div className="px-4 py-2 text-xs uppercase tracking-wide text-white/60 border-b border-white/10">
                  Latest activity
                </div>
                <div className="p-4 text-sm space-y-2">
                  {logLines.slice(-20).map((line, i) => (
                    <LogLine key={i} line={line} />
                  ))}
                  {logLines.length === 0 && (
                    <p className="text-white/50">No hay registros todavía. Corre un test para ver actividad.</p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Raw tab: full log with color cues */}
            <TabsContent value="raw" className="mt-4 overflow-y-auto max-h-[55vh] pr-1">
              <div className="bg-[#101a33] rounded-lg border border-white/10 p-4 text-sm space-y-2">
                {logLines.map((line, i) => <LogLine key={i} line={line} />)}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ---------- Presentational piece for a single log line ----------
function LogLine({ line }: { line: string }) {
  // Simple semantic coloring without changing logic
  const isPassed = line.includes("passed");
  const isFailed = line.includes("failed") || line.includes("expect(");
  const isTestTitle = /^\[\d+\/\d+\]/.test(line);
  const isErrorStack = /^\s+at\s/.test(line);
  const isIndented = line.startsWith("  ");
  const isError = line.includes("Error:");

  const color =
    isError ? "text-rose-300"
    : isPassed ? "text-emerald-300"
    : isFailed ? "text-rose-300"
    : isTestTitle ? "text-cyan-200"
    : "text-white/80";

  return (
    <div className={`flex items-start gap-2 ${color}`}>
      <span className="w-5">
        {isError ? "🚨" : isPassed ? "✅" : isFailed ? "❌" : isTestTitle ? "🧪" : ""}
      </span>
      <span className={`whitespace-pre-wrap ${isErrorStack || isIndented ? "pl-4 text-white/50" : ""}`}>
        {line}
      </span>
    </div>
  );
}

/* --------------------------
   Tailwind animation helper
   -------------------------- */
/* Add this to your globals.css if you want the progress animation:
@keyframes progress {
  0%   { transform: translateX(-60%); }
  100% { transform: translateX(120%); }
}
*/
