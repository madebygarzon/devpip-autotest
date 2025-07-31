import fs from "fs";
import path from "path";
import { execSync } from "child_process";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const project = body.project || "pip"; 

    const cwd = process.cwd();
    const generatedReportPath = path.join(cwd, "playwright-report");
    const projectReportPath = path.join(cwd, "public", "reports", project);

    execSync(`npx playwright test --project=${project} --reporter=html`, {
      cwd,
      shell: process.platform === "win32" ? "cmd.exe" : "/bin/bash",
      stdio: "ignore",
    });

    if (fs.existsSync(projectReportPath)) {
      fs.rmSync(projectReportPath, { recursive: true, force: true });
    }

    fs.mkdirSync(projectReportPath, { recursive: true });
    fs.cpSync(generatedReportPath, projectReportPath, { recursive: true });

    return new Response(
      JSON.stringify({ message: `Report for ${project} is ready.` }),
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Error generating report:", err);
    return new Response(
      JSON.stringify({ error: "Could not generate report." }),
      { status: 500 }
    );
  }
}
