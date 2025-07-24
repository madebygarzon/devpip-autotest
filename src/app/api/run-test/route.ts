// app/api/run-test/route.ts
import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: Request) {
  const body = await req.json();
  const testPath = body.testPath || "";

  const args = testPath
  ? ["playwright", "test", testPath]
  : ["playwright", "test"];

  const child = spawn("npx", args, {
    cwd: process.cwd(),
    shell: true,
  });

  const stream = new ReadableStream({
    async start(controller) {
      const textEncoder = new TextEncoder();

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
