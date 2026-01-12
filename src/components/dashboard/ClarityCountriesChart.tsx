"use client";

import { useClarity } from "@/hooks/useClarity";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function ClarityCountriesChart() {
  const { latest } = useClarity();
  if (!latest || !latest.byCountry) return null;

  const data = Object.entries(latest.byCountry || {})
    .map(([country, value]) => ({
      name: country,
      sessions: value,
    }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 10); // Top 10 countries

  if (data.length === 0) return null;

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
