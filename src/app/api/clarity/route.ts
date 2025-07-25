// src/app/api/clarity/route.ts
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { getClarityData } from "@/lib/clarity";

const CACHE_PATH = path.resolve(process.cwd(), "data/clarityCache.json");
const MAX_DAYS = 30; // guarda un mes

async function readCache() {
  try {
    const raw = await fs.readFile(CACHE_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeCache(cache: any) {
  await fs.mkdir(path.dirname(CACHE_PATH), { recursive: true });
  await fs.writeFile(CACHE_PATH, JSON.stringify(cache, null, 2));
}

// GET  ➜  devuelve el array completo de snapshots
export async function GET(_req: NextRequest) {
  const cache = await readCache();
  return NextResponse.json(cache);
}

// POST ➜  fuerza una consulta a Clarity y guarda snapshot
export async function POST(_req: NextRequest) {
  try {
    const snapshot = await getClarityData();
    let cache = await readCache();
    cache = cache.filter((s: any) => s.date !== snapshot.date);
    cache.push(snapshot);
    cache = cache.slice(-MAX_DAYS);
    await writeCache(cache);
    return NextResponse.json({ ok: true, added: snapshot.date });
  } catch (e: any) {
    console.error(e);
    // ✅ Fallback: seguimos devolviendo último snapshot
    const cache = await readCache();
    return NextResponse.json({
      warning: "Clarity limit reached – devolviendo snapshot más reciente",
      latest: cache.at(-1) || null,
    });
  }
}
