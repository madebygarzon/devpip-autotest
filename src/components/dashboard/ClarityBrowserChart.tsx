"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useClarity } from "@/hooks/useClarity";

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#6366f1"];

export default function ClarityBrowserChart() {
  const { latest } = useClarity();
  if (!latest || !latest.byBrowser) return null;

  const data = Object.entries(latest.byBrowser || {})
    .map(([browser, value]) => ({
      name: browser,
      value,
    }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-medium text-white">Sessions by Browser</h3>
      <div className="bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-8">
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              dataKey="value"
              label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f1729',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Legend wrapperStyle={{ color: '#fff' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
