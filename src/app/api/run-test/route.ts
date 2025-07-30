// app/api/run-test/route.ts
import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";

const historyFile = path.join(process.cwd(), "data", "testHistory.json");

export async function POST(req: Request) {
  const body = await req.json();
  const testPath = body.testPath || "";
  const project = body.project || "";

  const args = ["playwright", "test"];
  if (testPath) args.push(testPath);
  if (project) args.push("--project", project);

  const child = spawn("npx", args, {
    cwd: process.cwd(),
    shell: true,
  });

  const stream = new ReadableStream({
    async start(controller) {
      const textEncoder = new TextEncoder();
      const allLines: string[] = [];

      const stripAnsi = (str: string) =>
        str.replace(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g, "");

      const safeEnqueue = (text: string) => {
        try {
          controller.enqueue(textEncoder.encode(text + "\n"));
        } catch (e) {
          console.warn(":", e);
        }
      };

      const stdoutDone = new Promise<void>((resolve) => {
        child.stdout.on("data", (data) => {
          const lines = data.toString().split("\n");
          for (const line of lines) {
            const cleanLine = stripAnsi(line);
            if (
              cleanLine &&
              !cleanLine.includes("To open last HTML report run:") &&
              !cleanLine.includes("npx playwright show-report")
            ) {
              safeEnqueue(cleanLine);
              allLines.push(cleanLine);
            }
          }
        });
        child.stdout.on("end", resolve);
      });

      const stderrDone = new Promise<void>((resolve) => {
        child.stderr.on("data", (data) => {
          const lines = data.toString().split("\n");
          for (const line of lines) {
            const cleanLine = stripAnsi(line);
            if (cleanLine) {
              safeEnqueue(`Error: ${cleanLine}`);
              allLines.push(`Error: ${cleanLine}`);
            }
          }
        });
        child.stderr.on("end", resolve);
      });

      child.on("error", (err) => {
        safeEnqueue(`Error: ${err.message}`);
      });

      child.on("close", async () => {
        await Promise.all([stdoutDone, stderrDone]);

        const sourceDir = path.join(process.cwd(), "playwright-report");
        const targetDir = path.join(process.cwd(), "public", "reports");

        try {
          await fs.rm(targetDir, { recursive: true, force: true });
          await fs.mkdir(targetDir, { recursive: true });
          await copyDir(sourceDir, targetDir);
        } catch (err) {
          console.error("Error copiando el reporte:", err);
        }

        const passed = allLines.filter((l) => l.includes("passed")).length;
        const failed = allLines.filter((l) => l.includes("failed")).length;
        const entry = {
          id: Date.now(),
          date: new Date().toISOString(),
          testPath: testPath || "all",
          passed,
          failed,
        };

        try {
          await fs.mkdir(path.dirname(historyFile), { recursive: true });
          const existing = await fs
            .readFile(historyFile, "utf-8")
            .then((d) => JSON.parse(d))
            .catch(() => []);
          existing.unshift(entry);
          await fs.writeFile(historyFile, JSON.stringify(existing, null, 2));
        } catch (e) {
          console.error("Error writing history", e);
        }

        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

async function copyDir(src: string, dest: string) {
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await fs.mkdir(destPath, { recursive: true });
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}
