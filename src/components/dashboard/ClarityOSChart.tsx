"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useClarity } from "@/hooks/useClarity";

export default function ClarityOSChart() {
  const { latest } = useClarity();
  if (!latest || !latest.byOS) return null;

  const data = Object.entries(latest.byOS || {})
    .map(([os, value]) => ({
      name: os,
      sessions: value,
    }))
    .sort((a, b) => b.sessions - a.sessions);

  if (data.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-medium text-white">Sessions by Operating System</h3>
      <div className="bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-8">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <XAxis
              dataKey="name"
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
            <Bar dataKey="sessions" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
