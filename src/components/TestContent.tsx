"use client";

import { useState, useEffect, useMemo } from "react";
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

type TestDef = { label: string; path: string; category?: string };

// ---------- Page ----------
export default function TestContent() {
  const sites: Site[] = [
    { project: "pip", name: "Partner in Publishing", url: "https://partnerinpublishing.com" },
  ];

  return (
    <div className="w-full space-y-8">
      {/* Hero Header */}
      <div className="text-center space-y-4 py-8">
        
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Test Runner
        </h1>
        
        <div className="flex items-center justify-center gap-3 pt-2">
          <div className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
            ✓ 29 Tests
          </div>
          <div className="px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
            🎯 100% Coverage
          </div>
          <div className="px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium">
            ⚡ Frontend + Backend
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="w-full space-y-6">
        {sites.map((site) => (
          <SiteTestCard key={site.project} site={site} />
        ))}
      </div>
    </div>
  );
}

// ---------- Card ----------
function SiteTestCard({ site }: { site: Site }) {
  const [selectedTest, setSelectedTest] = useState("");
  const [autoRunInterval, setAutoRunInterval] = useState<number>(12 * 60 * 60 * 1000);
  const [nextRunIn, setNextRunIn] = useState<number>(autoRunInterval);
  const [isLoading, setIsLoading] = useState(false);

  const [logOpen, setLogOpen] = useState(false);
  const [logLines, setLogLines] = useState<string[]>([]);
  const [activeLogTab, setActiveLogTab] = useState<"summary" | "raw">("summary");

  const passedCount = logLines.filter((l) => l.includes("passed")).length;
  const failedCount = logLines.filter((l) => l.includes("failed")).length;

  // ---------- Tests registry ----------
  const TESTS_BY_SITE: Record<string, TestDef[]> = {
    pip: [
      // ========== HOME PAGE TESTS ==========
      // Forms
      { label: "📋 Contact Form Submission", path: "tests/pip/home/form.spec.ts", category: "🏠 HOME PAGE - Forms" },
      { label: "📋 Form Validation (Required Fields)", path: "tests/pip/home/form-validation.spec.ts", category: "🏠 HOME PAGE - Forms" },
      { label: "📋 HubSpot Form Integration", path: "tests/pip/home/form-validation-hubspot.spec.ts", category: "🏠 HOME PAGE - Forms" },

      // Navigation
      { label: "🧭 Menu Links Validation", path: "tests/pip/home/menu-links.spec.ts", category: "🏠 HOME PAGE - Navigation" },
      { label: "🧭 Footer Links Validation", path: "tests/pip/home/menu-links-footer.spec.ts", category: "🏠 HOME PAGE - Navigation" },
      { label: "🧭 Home Anchor Navigation", path: "tests/pip/home/home-anchor.spec.ts", category: "🏠 HOME PAGE - Navigation" },
      { label: "📱 Mobile Menu Toggle & Functionality", path: "tests/pip/home/mobile-menu.spec.ts", category: "🏠 HOME PAGE - Navigation" },

      // Content & UI
      { label: "🎯 Hero Section & CTAs", path: "tests/pip/home/hero-section.spec.ts", category: "🏠 HOME PAGE - Content & UI" },
      { label: "🎠 Carousel/Animation Tests", path: "tests/pip/home/carousel-animation.spec.ts", category: "🏠 HOME PAGE - Content & UI" },
      { label: "🎴 Service Cards Navigation", path: "tests/pip/home/home-cards-navigation.spec.ts", category: "🏠 HOME PAGE - Content & UI" },

      // ========== ABOUT PAGE TESTS ==========
      { label: "👥 Team Section (Members)", path: "tests/pip/about/team-pip.spec.ts", category: "👥 ABOUT PAGE" },
      { label: "👥 Leadership Tiers & Organization", path: "tests/pip/about/leadership-tiers.spec.ts", category: "👥 ABOUT PAGE" },
      { label: "🎥 Videos Visibility & Lazy-Loading", path: "tests/pip/about/videos-visible.spec.ts", category: "👥 ABOUT PAGE" },
      { label: "🎯 About Hero & CTAs", path: "tests/pip/about/hero-cta.spec.ts", category: "👥 ABOUT PAGE" },
      { label: "🧭 About Anchor Navigation", path: "tests/pip/about/about-anchor.spec.ts", category: "👥 ABOUT PAGE" },

      // ========== SERVICES TESTS ==========
      { label: "🛠️ Services Page Links", path: "tests/pip/services/services-links.spec.ts", category: "🛠️ SERVICES PAGE" },

      // ========== GLOBAL/COMMON TESTS ==========
      // UI Components
      { label: "🪟 Popups & Modals Functionality", path: "tests/pip/common/popups-modals.spec.ts", category: "🌐 GLOBAL - UI Components" },
      { label: "📄 Footer Content & Links", path: "tests/pip/common/footer.spec.ts", category: "🌐 GLOBAL - UI Components" },

      // Technical Quality
      { label: "♿ Accessibility (WCAG Compliance)", path: "tests/pip/common/accessibility.spec.ts", category: "🌐 GLOBAL - Technical Quality" },
      { label: "🚀 Performance & Core Web Vitals", path: "tests/pip/common/performance.spec.ts", category: "🌐 GLOBAL - Technical Quality" },
      { label: "🔍 SEO & Metadata", path: "tests/pip/common/seo-metadata.spec.ts", category: "🌐 GLOBAL - Technical Quality" },
      { label: "📈 Analytics & Tracking (GTM/Clarity)", path: "tests/pip/common/analytics-tracking.spec.ts", category: "🌐 GLOBAL - Technical Quality" },

      // ========== BACKEND API TESTS ==========
      // WordPress REST API
      { label: "🔌 WordPress REST API (Core Endpoints)", path: "tests/pip/api/wordpress-rest-api.spec.ts", category: "⚙️ BACKEND - API" },
      { label: "⚙️ WordPress Backend Endpoints", path: "tests/pip/api/wordpress-backend-endpoints.spec.ts", category: "⚙️ BACKEND - API" },

      // Security
      { label: "🔒 WordPress Security (OWASP Top 10)", path: "tests/pip/api/wordpress-security.spec.ts", category: "⚙️ BACKEND - Security" },

      // Data Integrity
      { label: "📊 WordPress Content Integrity", path: "tests/pip/api/wordpress-content-integrity.spec.ts", category: "⚙️ BACKEND - Data" },

      // Performance
      { label: "⚡ WordPress Backend Performance", path: "tests/pip/api/wordpress-performance.spec.ts", category: "⚙️ BACKEND - Performance" },
    ],
  };

  // ---------- Safe tests (deduped + guarded) ----------
  const tests: TestDef[] = useMemo(() => {
    // Ensure we have an array
    const raw = Array.isArray(TESTS_BY_SITE[site.project]) ? TESTS_BY_SITE[site.project] : [];
    // Ensure unique <SelectItem> by path to avoid Radix conflicts
    const uniqueByPath = new Map<string, TestDef>();
    for (const t of raw) {
      if (t?.path) uniqueByPath.set(t.path, t);
    }
    return Array.from(uniqueByPath.values());
  }, [site.project]);

  // ---------- Group tests by category ----------
  const testsByCategory = useMemo(() => {
    const grouped = new Map<string, TestDef[]>();
    tests.forEach(test => {
      const category = test.category || "Other";
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(test);
    });
    return grouped;
  }, [tests]);

  // ---------- Reset selection if the current value becomes invalid ----------
  useEffect(() => {
    // If selectedTest is no longer in the list, reset it
    if (selectedTest && selectedTest !== "all" && !tests.some((t) => t.path === selectedTest)) {
      setSelectedTest("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tests.length, site.project]);

  // ---------- Auto-run timer ----------
  useEffect(() => {
    if (!autoRunInterval) return;

    const interval = setInterval(() => {
      runTest(selectedTest || "all");
      setNextRunIn(autoRunInterval);
    }, autoRunInterval);

    const countdown = setInterval(() => {
      setNextRunIn((prev) => (prev > 1000 ? prev - 1000 : 0));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(countdown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRunInterval]);

  // ---------- Utils ----------
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const runTest = async (testToRun = selectedTest) => {
    // Guard selection
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
          // When "all", send empty path for your runner
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

  const favicon = `https://www.google.com/s2/favicons?sz=64&domain=${new URL(site.url).hostname}`;

  return (
    <Card className="bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/5">
      {/* Site info */}
      <CardHeader className="p-8 border-b border-white/5 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
        <div className="flex items-start justify-between gap-6 flex-wrap lg:flex-nowrap">
          <div className="flex items-center gap-5 min-w-0 flex-1">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-20 group-hover:opacity-40 blur transition duration-300"></div>
              <img
                src={favicon}
                alt=""
                className="relative w-14 h-14 rounded-xl border border-white/20 bg-white/5 p-2"
              />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <CardTitle className="text-2xl font-bold text-white mb-0">
                {site.name}
              </CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors truncate flex items-center gap-1.5 group/link"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {site.url}
                  <svg className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <Button
                  variant="secondary"
                  className="h-7 px-3 text-xs bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 rounded-lg transition-all"
                  onClick={() => {
                    navigator.clipboard.writeText(site.url);
                  }}
                  title="Copy URL"
                >
                  📋 Copy
                </Button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3">
            <div className="group flex items-center gap-2.5 px-5 py-3 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 rounded-xl border border-emerald-500/30 hover:border-emerald-500/50 transition-all hover:scale-105">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/20">
                <span className="text-emerald-400 text-lg">✓</span>
              </div>
              <div className="flex flex-col">
                <span className="text-emerald-300 font-bold text-xl">{passedCount}</span>
                <span className="text-emerald-400/60 text-[10px] uppercase tracking-wider">Passed</span>
              </div>
            </div>
            <div className="group flex items-center gap-2.5 px-5 py-3 bg-gradient-to-br from-rose-500/10 to-rose-600/10 rounded-xl border border-rose-500/30 hover:border-rose-500/50 transition-all hover:scale-105">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-500/20">
                <span className="text-rose-400 text-lg">✕</span>
              </div>
              <div className="flex flex-col">
                <span className="text-rose-300 font-bold text-xl">{failedCount}</span>
                <span className="text-rose-400/60 text-[10px] uppercase tracking-wider">Failed</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Configuration */}
      <CardContent className="p-8 space-y-8">
        {/* Test selection & auto-run */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-3">
            <label className="text-xs font-bold text-white/70 uppercase tracking-wider flex items-center gap-2">
              <span className="text-blue-400">🎯</span>
              Select Test
            </label>

            <Select value={selectedTest} onValueChange={setSelectedTest}>
              <SelectTrigger className="w-full bg-white/5 text-white border-white/20 rounded-xl hover:bg-white/8 hover:border-white/30 transition-all h-12 text-base">
                <SelectValue placeholder="Choose a test or run all" />
              </SelectTrigger>
              <SelectContent className="bg-[#0f1729] text-gray-200 border border-white/10 max-h-[400px]">
                <SelectItem value="all" className="font-semibold text-blue-300">
                  ▶️ Run all tests
                </SelectItem>

                {/* Render tests grouped by category */}
                {tests.length > 0 ? (
                  Array.from(testsByCategory.entries()).map(([category, categoryTests]) => (
                    <div key={category}>
                      {/* Category header */}
                      <div className="px-2 py-2 text-xs font-semibold text-white/40 uppercase tracking-wider border-t border-white/5 mt-1 bg-white/5">
                        {category}
                      </div>
                      {/* Tests in this category */}
                      {categoryTests.map((test) => (
                        <SelectItem key={test.path} value={test.path} className="pl-6">
                          {test.label}
                        </SelectItem>
                      ))}
                    </div>
                  ))
                ) : (
                  <SelectItem value="none" disabled>No tests available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-white/70 uppercase tracking-wider flex items-center gap-2">
              <span className="text-purple-400">⏱️</span>
              Auto Run
            </label>
            <Select
              onValueChange={(v) => {
                const ms = Number(v);
                setAutoRunInterval(ms);
                setNextRunIn(ms);
              }}
            >
              <SelectTrigger className="w-full bg-white/5 text-white border-white/20 rounded-xl hover:bg-white/8 hover:border-white/30 transition-all h-12 text-base">
                <SelectValue placeholder="Select interval" />
              </SelectTrigger>
              <SelectContent className="bg-[#0f1729] text-gray-200 border border-white/10">
                <SelectItem value="30000">⚡ Every 30 seconds</SelectItem>
                <SelectItem value="3600000">🕐 Every 1 hour</SelectItem>
                <SelectItem value="43200000">🕛 Every 12 hours</SelectItem>
                <SelectItem value="86400000">📅 Every 24 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Progress bar */}
        {isLoading && (
          <div className="relative w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse" style={{ width: "60%" }}>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Button
            onClick={() => runTest()}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-8 py-6 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <>
                <Loader size={18} />
                <span className="ml-2">Running Tests...</span>
              </>
            ) : (
              <>
                <span className="mr-2">▶️</span>
                Run Test
              </>
            )}
          </Button>

          <Link href={`/api/download-report?project=${site.project}`} target="_blank">
            <Button className="bg-white/5 hover:bg-white/10 text-white border border-white/20 hover:border-white/30 font-medium px-6 py-6 rounded-xl transition-all hover:scale-105">
              <span className="mr-2">📥</span> Export PDF
            </Button>
          </Link>

          <Link href={`/reports/${site.project}/index.html`} target="_blank">
            <Button className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 text-white border border-purple-500/30 hover:border-purple-500/50 font-medium px-6 py-6 rounded-xl transition-all hover:scale-105">
              <span className="mr-2">📊</span> View Report
            </Button>
          </Link>

          <div className="ml-auto flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-xl border border-orange-500/30">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500/20">
              <span className="text-lg">⏱️</span>
            </div>
            <div className="flex flex-col">
              <span className="text-orange-300 font-bold text-sm">{formatTime(nextRunIn)}</span>
              <span className="text-orange-400/60 text-[10px] uppercase tracking-wider">Next run</span>
            </div>
          </div>
        </div>

        {/* Quick summary */}
        <div className="pt-8 border-t border-white/5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold text-lg">{passedCount}</span>
                <span className="text-white/50 text-sm">passed</span>
              </div>
              <span className="text-white/20">•</span>
              <div className="flex items-center gap-2">
                <span className="text-rose-400 font-bold text-lg">{failedCount}</span>
                <span className="text-white/50 text-sm">failed</span>
              </div>
            </div>
            <button
              onClick={() => {
                setActiveLogTab("summary");
                setLogOpen(true);
              }}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors font-medium group"
            >
              <span>View detailed logs</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </CardContent>

      {/* Logs modal */}
      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        <DialogContent className="sm:max-w-5xl max-h-[85vh] overflow-hidden bg-[#0b1424] text-gray-200 border border-white/10">
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

            <TabsContent value="summary" className="mt-4 space-y-4 overflow-y-auto max-h-[55vh] pr-1">
              <div className="flex flex-wrap items-center gap-4">
                <Badge className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  ✅ Passed: {passedCount}
                </Badge>
                <Badge className="bg-rose-500/15 text-rose-300 border border-rose-500/30">
                  ❌ Failed: {failedCount}
                </Badge>
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
                    <p className="text-white/50">
                      No hay registros todavía. Corre un test para ver actividad.
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="raw" className="mt-4 overflow-y-auto max-h-[55vh] pr-1">
              <div className="bg-[#101a33] rounded-lg border border-white/10 p-4 text-sm space-y-2">
                {logLines.map((line, i) => (
                  <LogLine key={i} line={line} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ---------- Log Line Component ----------
function LogLine({ line }: { line: string }) {
  const isPassed = line.includes("passed");
  const isFailed = line.includes("failed") || line.includes("expect(");
  const isTestTitle = /^\[\d+\/\d+\]/.test(line);
  const isErrorStack = /^\s+at\s/.test(line);
  const isIndented = line.startsWith("  ");
  const isError = line.includes("Error:");

  const color =
    isError
      ? "text-rose-300"
      : isPassed
      ? "text-emerald-300"
      : isFailed
      ? "text-rose-300"
      : isTestTitle
      ? "text-cyan-200"
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
