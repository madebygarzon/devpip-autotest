"use client";

import React, { useState } from "react";
import Papa from "papaparse";
import { Card } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

// Helper to parse CSV and get metrics per day
function parseClarityCSV(csvText: string) {
  const { data, errors } = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  // Log non-fatal parse errors as warning
  if (errors.length > 0) {
    // Ignore "Too few fields" errors, just warn in console
    const realErrors = errors.filter(
      (e) => !(e.code === "TooFewFields" || e.message.includes("Too few fields"))
    );
    if (realErrors.length > 0) {
      throw new Error("CSV parse error: " + realErrors[0].message);
    }
    if (errors.length > realErrors.length) {
      console.warn("Papaparse warnings:", errors);
    }
  }

  // Only rows with date
  return (data as any[])
    .filter((row) => row["Date"] || row["date"])
    .map((row) => ({
      date: row["Date"] || row["date"] || "",
      sessions: Number(row["Total Sessions"] || row["Sessions"] || row["sessions"] || 0),
      rageClicks: Number(row["Rage Clicks"] || row["rageClicks"] || row["RageClicks"] || 0),
      deadClicks: Number(row["Dead Clicks"] || row["deadClicks"] || row["DeadClicks"] || 0),
      engagementTime: Number(
        row["Avg. Engagement Time (s)"] ||
          row["Engagement Time"] ||
          row["engagementTime"] ||
          0
      ),
    }));
}

export default function ClarityUploadKPIs() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = parseClarityCSV(evt.target?.result as string);
        setMetrics(parsed.filter((m) => m.date));
      } catch (err: any) {
        setError(err.message);
        setMetrics([]);
      }
    };
    reader.readAsText(file, "utf-8");
  };

  // Last available metric
  const latest = metrics.length > 0 ? metrics[metrics.length - 1] : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-light text-white tracking-tight">Clarity KPIs</h1>
        <p className="text-white/50 text-sm">Microsoft Clarity Analytics Dashboard</p>
      </div>

      {/* File Upload Section */}
      <div className="flex items-center gap-4 p-6 bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl">
        <label className="text-sm font-medium text-white/80">Cargar archivo Clarity CSV:</label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFile}
          className="flex-1 bg-white/5 text-white border border-white/10 rounded-lg px-3 py-2 text-sm hover:bg-white/8 focus:outline-none focus:ring-2 focus:ring-blue-500/50 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer"
        />
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg">
          <p className="text-rose-300 text-sm">Error al procesar el archivo: {error}</p>
        </div>
      )}

      {latest && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white/[0.02] backdrop-blur-sm border border-white/10 p-6">
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-2">Sesiones</h3>
            <p className="text-3xl font-light text-white">{latest.sessions.toLocaleString()}</p>
          </Card>
          <Card className="bg-white/[0.02] backdrop-blur-sm border border-white/10 p-6">
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-2">Rage Clicks</h3>
            <p className="text-3xl font-light text-rose-300">{latest.rageClicks.toLocaleString()}</p>
          </Card>
          <Card className="bg-white/[0.02] backdrop-blur-sm border border-white/10 p-6">
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-2">Dead Clicks</h3>
            <p className="text-3xl font-light text-amber-300">{latest.deadClicks.toLocaleString()}</p>
          </Card>
          <Card className="bg-white/[0.02] backdrop-blur-sm border border-white/10 p-6">
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-2">Engagement Time</h3>
            <p className="text-3xl font-light text-emerald-300">{latest.engagementTime}s</p>
          </Card>
        </div>
      )}

      {metrics.length > 0 && (
        <div className="w-full bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-medium text-white mb-6">Sesiones por Día (Histórico)</h3>
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics}
                margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
              >
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: '#ffffff80' }}
                  stroke="#ffffff20"
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#ffffff80' }}
                  stroke="#ffffff20"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f1729',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend
                  wrapperStyle={{ color: '#fff' }}
                />
                <Bar dataKey="sessions" fill="#6366f1" name="Sesiones" />
                <Bar dataKey="rageClicks" fill="#f43f5e" name="Rage Clicks" />
                <Bar dataKey="deadClicks" fill="#cbd5e1" name="Dead Clicks" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
