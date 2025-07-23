// app/api/run-test/route.ts
import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: Request) {
  const body = await req.json();
  const testPath = body.testPath || "";

  const child = spawn(
    "npx",
    ["playwright", "test", testPath, "--reporter=html"],
    {
      cwd: process.cwd(),
      shell: true,
    }
  );

  const stream = new ReadableStream({
    start(controller) {
      child.stdout.on("data", (data) => {
        const stripAnsi = (str: string) =>
          str.replace(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g, "");

        const lines = data.toString().split("\n");
        for (const line of lines) {
          const cleanLine = stripAnsi(line);
          if (
            !cleanLine.includes("To open last HTML report run:") &&
            !cleanLine.includes("npx playwright show-report")
          ) {
            controller.enqueue(new TextEncoder().encode(cleanLine + "\n"));
          }
        }
      });
      child.stderr.on("data", (data) => {
        const stripAnsi = (str: string) =>
          str.replace(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g, "");

        const lines = data.toString().split("\n");
        for (const line of lines) {
          const cleanLine = stripAnsi(line);
          controller.enqueue(new TextEncoder().encode(cleanLine + "\n"));
        }
      });
      child.on("close", async () => {
        
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
