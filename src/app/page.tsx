"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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

export default function Home() {
  const [selectedTest, setSelectedTest] = useState("");
  const [logLines, setLogLines] = useState<string[]>([]);
  const [logOpen, setLogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const runTest = async () => {
  setIsLoading(true);
  setLogLines([]);
  const res = await fetch("/api/run-test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ testPath: selectedTest }),
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

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="flex flex-col gap-4 w-full max-w-xl">
          <div className="flex gap-4">
            <Select value={selectedTest} onValueChange={setSelectedTest}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select a test to run" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">🔁 Run all tests</SelectItem>
                <SelectItem value="tests/home">
                  🏠 Run all Home tests
                </SelectItem>
                <SelectItem value="tests/home/form.spec.ts">
                  📄 Run Form Home Test
                </SelectItem>
                <SelectItem value="tests/home/home-anchor.spec.ts">
                  📄 Run Home Anchor Test
                </SelectItem>
                <SelectItem value="tests/home/home-cards-navigation.spec.ts">
                  🔗 Run Home Cards Navigation Test
                </SelectItem>
                <SelectItem value="tests/home/menu-links.spec.ts">
                  🔗 Run Menu Links Test
                </SelectItem>
              </SelectContent>
            </Select>

            {isLoading ? (
              <Button disabled className="flex items-center gap-2 bg-blue-300 cursor-wait">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Running...
              </Button>
            ) : (
              <Button
                onClick={runTest}
                className="rounded border px-4 py-2 bg-blue-500 text-white"
              >
                Run Selected Test
              </Button>
            )}

            <Link href="/reports/index.html" target="_blank">
              <Button className="rounded border px-4 py-2 bg-green-500 text-white text-center">
                Show Report
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Test Log Output</DialogTitle>
            <DialogDescription>
              Visual summary of the selected test execution
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-4 mb-2">
            <span className="text-green-600 font-medium">
              ✅ {logLines.filter((l) => l.includes("passed")).length} passed
            </span>
            <span className="text-red-600 font-medium">
              ❌ {logLines.filter((l) => l.includes("failed")).length} failed
            </span>
          </div>

          <div className="p-2 text-gray-200 rounded border text-sm space-y-1">
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
                    className="bg-red-50  border border-red-200 p-2 rounded"
                  >
                    <summary className="text-red-700 cursor-pointer">
                      ❌ Error Detected
                    </summary>
                    <pre className="whitespace-pre-wrap text-red-800">
                      {line}
                    </pre>
                  </details>
                );
              }

              return (
                <div
                  key={index}
                  className={`flex text-gray-200 items-start gap-2 ${
                    isPassed
                      ? "text-green-700"
                      : isFailed
                      ? "text-red-700"
                      : "text-gray-800"
                  }`}
                >
                  {isPassed && <span>✅</span>}
                  {isFailed && <span>❌</span>}
                  {!isPassed && !isFailed && isTestTitle && <span>🧪</span>}
                  {!isPassed && !isFailed && !isTestTitle && (
                    <span className="w-5 text-gray-200" />
                  )}
                  <span
                    className={`text-gray-200 whitespace-pre-wrap ${
                      isErrorStack || isIndented ? "pl-4" : ""
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

      <footer className="row-start-3 flex gap-[24px] font-extrabold text-xs flex-wrap items-center justify-center" >
        by DevPip Team
      </footer>
    </div>
  );
}
