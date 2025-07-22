import fs from "fs";
import path from "path";
import { execSync } from "child_process";

export async function POST() {
  const cwd = process.cwd();
  const generatedReportPath = path.join(cwd, "playwright-report");
  const publicReportPath = path.join(cwd, "public", "reports");

  // 1. Ejecuta tests y genera el reporte
  execSync("npx playwright test --reporter=html", {
    cwd,
    shell: process.platform === "win32" ? "cmd.exe" : "/bin/bash",
    stdio: "ignore",
  });

  // 2. Elimina cualquier reporte anterior
  if (fs.existsSync(publicReportPath)) {
    fs.rmSync(publicReportPath, { recursive: true, force: true });
  }

  // 3. Copia el nuevo reporte a /public/reports
  fs.cpSync(generatedReportPath, publicReportPath, { recursive: true });

  return new Response("Report ready", { status: 200 });
}
