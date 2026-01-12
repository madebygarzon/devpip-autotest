import { NextRequest, NextResponse } from "next/server";
import { getTestHistory } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const project = searchParams.get("project");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const testRuns = await getTestHistory(
      project || undefined,
      limit,
      offset
    );

    // Transform to the format expected by the frontend
    const formattedData = testRuns.map((run) => ({
      id: run.legacyId ? Number(run.legacyId) : run.createdAt.getTime(),
      date: run.createdAt.toISOString(),
      testPath: run.testPath,
      project: run.project.name,
      passed: run.passed,
      failed: run.failed,
      screenshots: run.media
        .filter((m) => m.type === "SCREENSHOT")
        .map((m) => m.url),
      videos: run.media.filter((m) => m.type === "VIDEO").map((m) => m.url),
      errors: run.errors.map((e) => e.message),
    }));

    return NextResponse.json(formattedData, { status: 200 });
  } catch (error) {
    console.error("Error fetching test history:", error);
    return NextResponse.json(
      { error: "Failed to fetch test history" },
      { status: 500 }
    );
  }
}
