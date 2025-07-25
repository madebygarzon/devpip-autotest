export interface ClaritySnapshot {
  date: string; // ISO‑8601 (AAAA‑MM‑DD)
  totals: {
    sessions: number;
    engagementTimeAvg: number; // segundos
    rageClicks: number;
    deadClicks: number;
  };
  byDevice: Record<string, number>; // { Desktop: 120, Mobile: 80 }
  byCountry: Record<string, number>; // { CO: 70, US: 50, ... }
  topPages: { url: string; sessions: number }[];
}

const CLARITY_URL =
  "https://www.clarity.ms/export-data/api/v1/project-live-insights";

export async function getClarityData(): Promise<ClaritySnapshot> {
  const headers = { Authorization: `Bearer ${process.env.CLARITY_TOKEN!}` };

  // 1️⃣ llamada principal (Device + métricas globales)
  const res = await fetch(
    `${CLARITY_URL}?projectId=${process.env.CLARITY_PROJECT_ID}&numOfDays=1&dimension1=Device`,
    { headers }
  );
  if (!res.ok) throw new Error("Clarity API falló");
  const json: any[] = await res.json();

  // 2️⃣ segunda llamada: URLs populares
  const resPages = await fetch(
    `${CLARITY_URL}?projectId=${process.env.CLARITY_PROJECT_ID}&numOfDays=1&dimension1=URL`,
    { headers }
  );
  const jsonPages: any[] = await resPages.json();

  // ====== Procesar json principal ======
  const traffic = json.find((m) => m.metricName === "Traffic");
  const rage = json.find((m) => m.metricName === "RageClickCount");
  const dead = json.find((m) => m.metricName === "DeadClickCount");
  const engagement = json.find((m) => m.metricName === "EngagementTime");

  const sumBy = (info: any[], key: string) =>
    info.reduce((acc, cur) => acc + Number(cur[key] || 0), 0);

  const totalSessions = sumBy(traffic?.information ?? [], "totalSessionCount");
  const totalRage = sumBy(rage?.information ?? [], "sessionsCount");
  const totalDead = sumBy(dead?.information ?? [], "sessionsCount");
  const avgEngagement =
    engagement && engagement.information.length
      ? sumBy(engagement.information, "activeTime") /
        engagement.information.length
      : 0;

  // 📲 Por dispositivo
  const byDevice: Record<string, number> = {};
  (traffic?.information ?? []).forEach((item: any) => {
    const device = item.Device || "Other";
    byDevice[device] = (byDevice[device] ?? 0) + Number(item.totalSessionCount);
  });

  // ====== Procesar páginas populares ======
  const topPages = (
    jsonPages.find((m) => m.metricName === "Traffic")?.information || []
  )
    .map((item: any) => ({
      url: item.URL || "(unknown)",
      sessions: Number(item.totalSessionCount || 0),
    }))
    .filter((p: any) => p.sessions > 0)
    .slice(0, 10);

  return {
    date: new Date().toISOString().slice(0, 10),
    totals: {
      sessions: totalSessions,
      engagementTimeAvg: avgEngagement,
      rageClicks: totalRage,
      deadClicks: totalDead,
    },
    byDevice,
    byCountry: {}, // podemos poblarlo en otra llamada si quieres
    topPages,
  };
}
