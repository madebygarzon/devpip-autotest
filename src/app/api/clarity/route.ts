// src/app/api/clarity/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getClarityData } from "@/lib/clarity";
import {
  getClaritySnapshots,
  saveClaritySnapshot,
  hasSnapshotForToday,
} from "@/lib/clarityDb";

// GET  ➜  devuelve el array completo de snapshots desde la base de datos
export async function GET(_req: NextRequest) {
  try {
    console.log("📊 Fetching Clarity snapshots from database...");
    const snapshots = await getClaritySnapshots(30); // Last 30 days

    if (snapshots.length === 0) {
      console.log("⚠️  No snapshots in database, returning empty default");
      return NextResponse.json([{
        date: new Date().toISOString().slice(0, 10),
        totals: {
          sessions: 0,
          distinctUsers: 0,
          engagementTimeAvg: 0,
          scrollDepthAvg: 0,
          rageClicks: 0,
          deadClicks: 0,
          quickBackClicks: 0,
          excessiveScrolls: 0,
          scriptErrors: 0,
          errorClicks: 0
        },
        byDevice: {},
        byBrowser: {},
        byOS: {},
        byCountry: {},
        bySource: {},
        byChannel: {},
        topPages: [],
        topReferrers: []
      }]);
    }

    console.log(`✅ Retrieved ${snapshots.length} snapshot(s) from database`);
    return NextResponse.json(snapshots);
  } catch (error) {
    console.error("❌ Error in GET /api/clarity:", error);
    return NextResponse.json(
      { error: "Failed to retrieve snapshots from database" },
      { status: 500 }
    );
  }
}

// POST ➜  fuerza una consulta a Clarity y guarda snapshot en la base de datos
export async function POST(_req: NextRequest) {
  try {
    // Check if we already have a snapshot for today
    const alreadyFetched = await hasSnapshotForToday();

    if (alreadyFetched) {
      console.log("ℹ️  Snapshot for today already exists in database");
      const snapshots = await getClaritySnapshots(1);

      return NextResponse.json({
        ok: true,
        message: "Snapshot for today already exists. No API call needed.",
        snapshot: snapshots[0],
        fromCache: true,
        apiCallsSaved: true
      });
    }

    console.log("🔄 Fetching fresh data from Clarity API...");
    const snapshot = await getClarityData();
    console.log("✅ Clarity API data received successfully");

    // Save to database
    console.log("💾 Saving snapshot to database...");
    await saveClaritySnapshot(snapshot);
    console.log(`✅ Snapshot for ${snapshot.date} saved to database`);

    // Get updated count
    const allSnapshots = await getClaritySnapshots();

    return NextResponse.json({
      ok: true,
      message: "Fresh data fetched from Clarity API and saved to database",
      added: snapshot.date,
      totalSnapshots: allSnapshots.length,
      snapshot,
      fromCache: false
    });

  } catch (e: any) {
    console.error("❌ Error in POST /api/clarity:", e);

    // ✅ Fallback: Return most recent snapshot from database
    try {
      const snapshots = await getClaritySnapshots(1);
      const latest = snapshots[0] || null;

      console.log("⚠️  Clarity API call failed, returning data from database");

      // Determine if it's a rate limit error
      const isRateLimit = e.message?.includes("429") || e.message?.includes("limit");
      const statusCode = isRateLimit ? 429 : 500;
      const warningMessage = isRateLimit
        ? "⚠️ Límite diario de API de Clarity alcanzado (10 llamadas/día). Mostrando datos guardados en base de datos."
        : "⚠️ Error al llamar a la API de Clarity. Mostrando datos guardados en base de datos.";

      return NextResponse.json({
        warning: warningMessage,
        latest,
        error: e.message,
        fromCache: true,
        limitReached: isRateLimit,
        snapshot: latest
      }, { status: statusCode });

    } catch (dbError) {
      console.error("❌ Failed to retrieve fallback data from database:", dbError);
      return NextResponse.json({
        error: "Failed to fetch from Clarity API and no cached data available in database",
        details: e.message
      }, { status: 500 });
    }
  }
}
