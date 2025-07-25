"use client";

import { Card } from "../ui/card";
import { useClarity } from "@/hooks/useClarity";

export default function ClarityKPIs() {
  const { latest, isLoading } = useClarity();

  if (isLoading) return <p>Cargando métricas...</p>;
  if (!latest) return <p>No hay datos disponibles.</p>;

  const { totals } = latest;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-4">
      <Card className="p-4">
        <h3 className="text-lg font-bold">Sesiones</h3>
        <p className="text-2xl">{totals.sessions}</p>
      </Card>
      <Card className="p-4">
        <h3 className="text-lg font-bold">Rage Clicks</h3>
        <p className="text-2xl">{totals.rageClicks}</p>
      </Card>
      <Card className="p-4">
        <h3 className="text-lg font-bold">Dead Clicks</h3>
        <p className="text-2xl">{totals.deadClicks}</p>
      </Card>
      <Card className="p-4">
        <h3 className="text-lg font-bold">Engagement Time</h3>
        <p className="text-2xl">{totals.engagementTimeAvg}s</p>
      </Card>
    </div>
  );
}
