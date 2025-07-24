import { promises as fs } from "fs";
import path from "path";

const historyFile = path.join(process.cwd(), "data", "testHistory.json");

export async function GET() {
  try {
    const data = await fs.readFile(historyFile, "utf-8");
    return new Response(data, { status: 200, headers: { "Content-Type": "application/json" } });
  } catch {
    return new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } });
  }
}
