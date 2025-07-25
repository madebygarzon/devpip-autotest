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
    <div className="my-6">
      <h3 className="text-lg font-bold mb-2">Sesiones por Dispositivo</h3>
      <PieChart width={300} height={300}>
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
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
}
