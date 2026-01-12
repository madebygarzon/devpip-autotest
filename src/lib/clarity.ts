export interface ClaritySnapshot {
  date: string; // ISO‑8601 (AAAA‑MM‑DD)
  totals: {
    sessions: number;
    distinctUsers: number;
    engagementTimeAvg: number; // segundos
    scrollDepthAvg: number; // porcentaje
    rageClicks: number;
    deadClicks: number;
    quickBackClicks: number;
    excessiveScrolls: number;
    scriptErrors: number;
    errorClicks: number;
  };
  byDevice: Record<string, number>; // { Desktop: 120, Mobile: 80 }
  byBrowser: Record<string, number>; // { Chrome: 150, Firefox: 50 }
  byOS: Record<string, number>; // { Windows: 100, macOS: 80 }
  byCountry: Record<string, number>; // { CO: 70, US: 50, ... }
  bySource: Record<string, number>; // { Direct: 100, Google: 50 }
  byChannel: Record<string, number>; // { Organic: 80, Paid: 20 }
  topPages: { url: string; sessions: number; pageTitle?: string }[];
  topReferrers: { url: string; sessions: number }[];
}

const CLARITY_URL =
  "https://www.clarity.ms/export-data/api/v1/project-live-insights";

// Configuración de estrategia de llamadas API
// Puedes elegir: 'minimal' (2 llamadas), 'balanced' (3 llamadas), 'full' (5 llamadas)
const API_STRATEGY = (process.env.CLARITY_API_STRATEGY || 'minimal') as 'minimal' | 'balanced' | 'full';

export async function getClarityData(): Promise<ClaritySnapshot> {
  const headers = { Authorization: `Bearer ${process.env.CLARITY_TOKEN!}` };
  const projectId = process.env.CLARITY_PROJECT_ID;

  // Helper para hacer llamadas con múltiples dimensiones
  const fetchDimensions = async (dim1?: string, dim2?: string, dim3?: string) => {
    let url = `${CLARITY_URL}?projectId=${projectId}&numOfDays=1`;
    if (dim1) url += `&dimension1=${dim1}`;
    if (dim2) url += `&dimension2=${dim2}`;
    if (dim3) url += `&dimension3=${dim3}`;

    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`Clarity API failed: ${res.status}`);
    return res.json();
  };

  // ====== ESTRATEGIAS DE OPTIMIZACIÓN ======

  let baseData, deviceData, urlData, referrerData, trafficSourceData;

  if (API_STRATEGY === 'minimal') {
    // 🟢 MINIMAL: Solo 2 llamadas API
    // Llamada 1: Métricas globales + Device + Browser + OS (3 dimensiones)
    // Llamada 2: URL + ReferrerURL (para páginas y referrers)
    [baseData, urlData] = await Promise.all([
      fetchDimensions("Device", "Browser", "OS"),
      fetchDimensions("URL", "ReferrerURL"),
    ]);
    deviceData = baseData; // Reutilizamos la misma data

  } else if (API_STRATEGY === 'balanced') {
    // 🟡 BALANCED: 3 llamadas API
    // Llamada 1: Métricas globales + Device + Browser + OS
    // Llamada 2: URL + PageTitle (para páginas)
    // Llamada 3: Country + Source + Channel (para tráfico)
    [baseData, urlData, trafficSourceData] = await Promise.all([
      fetchDimensions("Device", "Browser", "OS"),
      fetchDimensions("URL"),
      fetchDimensions("Country", "Source", "Channel"),
    ]);
    deviceData = baseData;
    referrerData = urlData; // Incluiremos referrers si están disponibles

  } else {
    // 🔴 FULL: 5 llamadas API (más detallado)
    // Llamada 1: Métricas globales
    // Llamada 2: Device + Browser + OS
    // Llamada 3: Country + Source + Channel
    // Llamada 4: URL
    // Llamada 5: ReferrerURL
    [baseData, deviceData, trafficSourceData, urlData, referrerData] = await Promise.all([
      fetchDimensions(),
      fetchDimensions("Device", "Browser", "OS"),
      fetchDimensions("Country", "Source", "Channel"),
      fetchDimensions("URL"),
      fetchDimensions("ReferrerURL"),
    ]);
  }

  // ====== Helpers ======
  const sumBy = (info: any[], key: string) =>
    info.reduce((acc, cur) => acc + Number(cur[key] || 0), 0);

  const avgBy = (info: any[], key: string) =>
    info.length ? sumBy(info, key) / info.length : 0;

  const findMetric = (data: any[], name: string) =>
    data.find((m) => m.metricName === name);

  const buildDimensionMap = (data: any[], metricName: string, dimensionKey: string) => {
    const metric = findMetric(data, metricName);
    const map: Record<string, number> = {};
    (metric?.information ?? []).forEach((item: any) => {
      const key = item[dimensionKey] || "Other";
      map[key] = (map[key] ?? 0) + Number(item.totalSessionCount || item.sessionsCount || 0);
    });
    return map;
  };

  // ====== Totales ======
  const trafficBase = findMetric(baseData, "Traffic");
  const rageBase = findMetric(baseData, "RageClickCount");
  const deadBase = findMetric(baseData, "DeadClickCount");
  const quickBackBase = findMetric(baseData, "QuickbackClick");
  const excessiveScrollBase = findMetric(baseData, "ExcessiveScroll");
  const scriptErrorBase = findMetric(baseData, "ScriptErrorCount");
  const errorClickBase = findMetric(baseData, "ErrorClickCount");
  const engagementBase = findMetric(baseData, "EngagementTime");
  const scrollDepthBase = findMetric(baseData, "ScrollDepth");

  const totals = {
    sessions: sumBy(trafficBase?.information ?? [], "totalSessionCount"),
    distinctUsers: sumBy(trafficBase?.information ?? [], "distantUserCount"),
    engagementTimeAvg: avgBy(engagementBase?.information ?? [], "activeTime"),
    scrollDepthAvg: avgBy(scrollDepthBase?.information ?? [], "scrollDepth"),
    rageClicks: sumBy(rageBase?.information ?? [], "sessionsCount"),
    deadClicks: sumBy(deadBase?.information ?? [], "sessionsCount"),
    quickBackClicks: sumBy(quickBackBase?.information ?? [], "sessionsCount"),
    excessiveScrolls: sumBy(excessiveScrollBase?.information ?? [], "sessionsCount"),
    scriptErrors: sumBy(scriptErrorBase?.information ?? [], "sessionsCount"),
    errorClicks: sumBy(errorClickBase?.information ?? [], "sessionsCount"),
  };

  // ====== Por dimensiones ======
  const byDevice = buildDimensionMap(deviceData, "Traffic", "Device");
  const byBrowser = buildDimensionMap(deviceData, "Traffic", "Browser");
  const byOS = buildDimensionMap(deviceData, "Traffic", "OS");

  // Estas dimensiones solo están disponibles en modo balanced o full
  const byCountry = trafficSourceData
    ? buildDimensionMap(trafficSourceData, "Traffic", "Country")
    : {};
  const bySource = trafficSourceData
    ? buildDimensionMap(trafficSourceData, "Traffic", "Source")
    : {};
  const byChannel = trafficSourceData
    ? buildDimensionMap(trafficSourceData, "Traffic", "Channel")
    : {};

  // ====== Top Pages ======
  const topPages = (findMetric(urlData, "Traffic")?.information || [])
    .map((item: any) => ({
      url: item.URL || "(unknown)",
      sessions: Number(item.totalSessionCount || 0),
      pageTitle: item.PageTitle || undefined,
    }))
    .filter((p: any) => p.sessions > 0)
    .sort((a: any, b: any) => b.sessions - a.sessions)
    .slice(0, 10);

  // ====== Top Referrers ======
  // En modo minimal, intentamos extraer de urlData si tiene ReferrerURL
  const referrerSource = referrerData || urlData;
  const topReferrers = (findMetric(referrerSource, "Traffic")?.information || [])
    .map((item: any) => ({
      url: item.ReferrerURL || "(direct)",
      sessions: Number(item.totalSessionCount || 0),
    }))
    .filter((p: any) => p.url !== "(direct)" && p.sessions > 0)
    .sort((a: any, b: any) => b.sessions - a.sessions)
    .slice(0, 10);

  return {
    date: new Date().toISOString().slice(0, 10),
    totals,
    byDevice,
    byBrowser,
    byOS,
    byCountry,
    bySource,
    byChannel,
    topPages,
    topReferrers,
  };
}
