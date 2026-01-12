"use client";

import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { useClarity } from "@/hooks/useClarity";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function ClarityDevicesChart() {
  const { latest } = useClarity();
  if (!latest) return null;

  const data = Object.entries(latest.byDevice).map(([device, value]) => ({
    name: device,
    value,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-light text-white tracking-tight">Device Analytics</h1>
        <p className="text-white/50 text-sm">Session distribution by device type</p>
      </div>

      {/* Chart Card */}
      <div className="bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-8">
        <h3 className="text-xl font-medium text-white mb-6">Sesiones por Dispositivo</h3>
        <div className="flex justify-center">
          <PieChart width={400} height={400}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={120}
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
            <Legend
              wrapperStyle={{ color: '#fff' }}
            />
          </PieChart>
        </div>
      </div>
    </div>
  );
}
