"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TestRun {
  id: string;
  date: string;          // o Date si tu API ya devuelve un ISO‑string
  testPath: string;
  passed: number;
  failed: number;
}

export default function TestHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
useEffect(() => {
  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/test-history");
      if (!res.ok) return;

      const data: TestRun[] = await res.json();   // tipado explícito
      setHistory(
        data.sort((a, b) => b.failed - a.failed)  // ahora a y b son TestRun
      );
    } catch (err) {
      console.error("Error loading test history:", err);
    } finally {
      setLoading(false);
    }
  };
  fetchHistory();
}, []);

  return (
    <div className="w-full font-sans flex flex-col gap-10 p-6 sm:p-12">
      <div className="w-full">
        <h2 className="text-2xl font-semibold text-neutral-800 dark:text-white">Test History</h2>
        <p className="text-sm text-muted-foreground mb-4">Summary of previous test runs</p>

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
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((h) => (
                  <TableRow key={h.id} className="even:bg-muted/40">
                    <TableCell className="p-3 whitespace-nowrap">
                      {new Date(h.date).toLocaleString()}
                    </TableCell>
                    <TableCell className="p-3 break-all">{h.testPath}</TableCell>
                    <TableCell className="p-3 text-green-600">{h.passed}</TableCell>
                    <TableCell className="p-3 text-red-600">{h.failed}</TableCell>
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
