"use client";

import { useClarity } from "@/hooks/useClarity";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Globe, Info } from "lucide-react";

export default function ClarityCountriesChart() {
  const { latest } = useClarity();
  if (!latest) return null;

  const data = Object.entries(latest.byCountry || {})
    .map(([country, value]) => ({
      name: country,
      sessions: value,
    }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 10); // Top 10 countries

  const apiStrategy = process.env.NEXT_PUBLIC_CLARITY_API_STRATEGY || 'minimal';

  if (data.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-medium text-white">Top 10 Countries</h3>
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Globe className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-medium text-white">Country Data Not Available</h4>
              <p className="text-sm text-white/70">
                Geographic data requires the <code className="px-2 py-1 bg-white/10 rounded text-emerald-300 font-mono text-xs">balanced</code> or <code className="px-2 py-1 bg-white/10 rounded text-emerald-300 font-mono text-xs">full</code> API strategy.
              </p>
              <p className="text-xs text-white/50 mt-2">
                Current strategy: <span className="text-emerald-400 font-semibold">{apiStrategy}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-medium text-white">Top 10 Countries</h3>
      <div className="bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-8">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: '#ffffff80' }}
              stroke="#ffffff20"
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12, fill: '#ffffff80' }}
              stroke="#ffffff20"
              width={60}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f1729',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Bar dataKey="sessions" fill="#10b981" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
