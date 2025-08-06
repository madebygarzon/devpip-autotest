"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Loader from "../components/Loader";

interface Site {
  project: string;
  name: string;
  url: string;
}

export default function TestContent() {
  const sites: Site[] = [
    {
      project: "pip",
      name: "Partner in Publishing (Staging)",
      url: "https://st.partnerinpublishing.com",
    },
    {
      project: "gradepotential",
      name: "Grade Potential",
      url: "https://gradepotentialtutoring.ue1.rapydapps.cloud",
    },
    { project: "itopia", name: "Itopia", url: "https://itopia.com" },
    {
      project: "metricmarine",
      name: "Metric Marine",
      url: "https://www.metricmarine.com",
    },
  ];

  return (
    <div className="font-sans flex flex-col gap-10 min-h-screen p-6 sm:p-12 ">
      <h2 className="text-2xl font-semibold text-white drop-shadow-[0_0_8px_#00ffff80] mb-6">
        ⚡ Automated Test Runner
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {sites.map((site) => (
          <SiteTestCard key={site.project} site={site} />
        ))}
      </div>
    </div>
  );
}

function SiteTestCard({ site }: { site: Site }) {
  const [selectedTest, setSelectedTest] = useState("");
  const [autoRunInterval, setAutoRunInterval] = useState<number>(
    12 * 60 * 60 * 1000
  );
  const [nextRunIn, setNextRunIn] = useState<number>(autoRunInterval);
  const [isLoading, setIsLoading] = useState(false);

  const [logOpen, setLogOpen] = useState(false);
  const [logLines, setLogLines] = useState<string[]>([]);

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
  }, [autoRunInterval]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

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
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No response received from the server.",
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let tempLines: string[] = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim() !== "");
        tempLines = [...tempLines, ...lines];
        setLogLines((prev) => [...prev, ...lines]);
      }

      setLogOpen(true);

      setTimeout(() => {
        window.open("/reports/index.html", "_blank");
      }, 500);
    } catch (err) {
      console.error("Error running test:", err);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "An unexpected error occurred while running the tests.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const TESTS_BY_SITE: Record<string, { label: string; path: string }[]> = {
    pip: [
      {
        label: "📄 Run Form Home pip Test",
        path: "tests/pip/home/form.spec.ts",
      },
      {
        label: "📄 Run Menu Home Footer pip Test",
        path: "tests/pip/home/menu-links-footer.spec.ts",
      },
      {
        label: "📄 Run Home Anchor Test",
        path: "tests/pip/home/home-anchor.spec.ts",
      },
      {
        label: "🔗 Run Home Cards Navigation Test",
        path: "tests/pip/home/home-cards-navigation.spec.ts",
      },
      {
        label: "🔗 Run Menu Links Test",
        path: "tests/pip/home/menu-links.spec.ts",
      },
    ],
    gradepotential: [
      { label: "📄 Run Form Home gp Test", path: "tests/gp/home/form.spec.ts" },
      {
        label: "📄 Run Home Anchor Test",
        path: "tests/gp/home/home-anchor.spec.ts",
      },
      {
        label: "🔗 Run Home Cards Navigation Test",
        path: "tests/gp/home/home-cards-navigation.spec.ts",
      },
      {
        label: "🔗 Run Menu Links Test",
        path: "tests/gp/home/menu-links.spec.ts",
      },
    ],
    itopia: [
      {
        label: "📄 Run Form Home itopia Test",
        path: "tests/itopia/home/form.spec.ts",
      },
      {
        label: "📄 Run Home Anchor Test",
        path: "tests/itopia/home/home-anchor.spec.ts",
      },
      {
        label: "🔗 Run Home Cards Navigation Test",
        path: "tests/itopia/home/home-cards-navigation.spec.ts",
      },
      {
        label: "🔗 Run Menu Links Test",
        path: "tests/itopia/home/menu-links.spec.ts",
      },
    ],
    metricmarine: [
      { label: "📄 Run Form Home MM Test", path: "tests/mm/home/form.spec.ts" },
      {
        label: "📄 Run Home Anchor Test",
        path: "tests/mm/home/home-anchor.spec.ts",
      },
      {
        label: "🔗 Run Home Cards Navigation Test",
        path: "tests/mm/home/home-cards-navigation.spec.ts",
      },
      {
        label: "🔗 Run Menu Links Test",
        path: "tests/mm/home/menu-links.spec.ts",
      },
    ],
  };

  return (
    <Card className="bg-gray-900 border border-gray-700 rounded-2xl shadow-[0_0_15px_#00ffff20] p-4">
      <CardHeader>
        <CardTitle className="text-lg text-white">{site.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-xs text-gray-400">{site.url}</p>

        <Select value={selectedTest} onValueChange={setSelectedTest}>
          <SelectTrigger className="w-full bg-gray-800 text-gray-200 border border-gray-700 rounded-lg">
            <SelectValue placeholder="Select a test to run" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 text-gray-200 border border-gray-700">
            <SelectItem value="all">🔁 Run all tests</SelectItem>
            {TESTS_BY_SITE[site.project]?.map((test) => (
              <SelectItem key={test.path} value={test.path}>
                {test.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          onValueChange={(v) => {
            const ms = Number(v);
            setAutoRunInterval(ms);
            setNextRunIn(ms);
          }}
        >
          <SelectTrigger className="w-full bg-gray-800 text-gray-200 border border-gray-700 rounded-lg">
            <SelectValue placeholder="Auto run every..." />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 text-gray-200 border border-gray-700">
            <SelectItem value="30000">🕒 Every 30 sec</SelectItem>
            <SelectItem value="3600000">🕒 Every 1 hour</SelectItem>
            <SelectItem value="43200000">🕒 Every 12 hours</SelectItem>
            <SelectItem value="86400000">🕒 Every 24 hours</SelectItem>
          </SelectContent>
        </Select>

        {/* BOTONES */}
        <div className="flex flex-wrap gap-2 mt-2">
          <Button
            onClick={() => runTest()}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_10px_#00ffff40]"
          >
            {isLoading ? <Loader size={30} /> : "Run Test"}
          </Button>

          <Link href={`/api/download-report?project=${site.project}`} target="_blank">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              📥 PDF
            </Button>
          </Link>

          <Link href={`/reports/${site.project}/index.html`} target="_blank">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Show Report
            </Button>
          </Link>
        </div>

        {/* CONTADOR */}
        <p className="text-xs text-gray-400">
          ⏳ Next auto-run:{" "}
          <span className="text-cyan-300">{formatTime(nextRunIn)}</span>
        </p>
      </CardContent>

      {/* 📄 MODAL DE LOGS */}
      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-900 text-gray-200 border border-gray-700 shadow-[0_0_15px_#00ffff30]">
          <DialogHeader>
            <DialogTitle className="text-cyan-400">
              {site.name} - Test Log Output
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Visual summary of the selected test execution
            </DialogDescription>
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
              const isFailed =
                line.includes("failed") || line.includes("expect(");
              const isTestTitle = /^\[\d+\/\d+\]/.test(line);
              const isErrorStack = /^\s+at\s/.test(line);
              const isIndented = line.startsWith("  ");

              if (line.includes("Error:")) {
                return (
                  <details
                    key={index}
                    className="bg-red-900/40 border border-red-400 p-3 rounded"
                  >
                    <summary className="text-red-400 cursor-pointer font-semibold">
                      ❌ Error Detected
                    </summary>
                    <pre className="whitespace-pre-wrap text-red-300 mt-2 text-sm">
                      {line}
                    </pre>
                  </details>
                );
              }

              return (
                <div
                  key={index}
                  className={`flex items-start gap-2 ${
                    isPassed
                      ? "text-green-400"
                      : isFailed
                      ? "text-red-400"
                      : "text-gray-300"
                  }`}
                >
                  {isPassed && <span>✅</span>}
                  {isFailed && <span>❌</span>}
                  {!isPassed && !isFailed && isTestTitle && <span>🧪</span>}
                  {!isPassed && !isFailed && !isTestTitle && (
                    <span className="w-5" />
                  )}
                  <span
                    className={`whitespace-pre-wrap ${
                      isErrorStack || isIndented ? "pl-4 text-gray-500" : ""
                    }`}
                  >
                    {line}
                  </span>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
