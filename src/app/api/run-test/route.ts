// app/api/run-test/route.ts
import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";

const historyFile = path.join(process.cwd(), "data", "testHistory.json");

export async function POST(req: Request) {
  const body = await req.json();
  const testPath = body.testPath || "";
  const project = body.project || "default"; // fallback

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
          console.warn("Stream warning:", e);
        }
      };

      // 🟢 capturamos logs del test
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

      // 🟢 cuando termina
      child.on("close", async () => {
        await Promise.all([stdoutDone, stderrDone]);

        const sourceDir = path.join(process.cwd(), "playwright-report");
        const projectDir = path.join(process.cwd(), "public", "reports", project);

        // 🔄 Copiar HTML de reporte
        try {
          await fs.rm(projectDir, { recursive: true, force: true });
          await fs.mkdir(projectDir, { recursive: true });
          await copyDir(sourceDir, projectDir);
        } catch (err) {
          console.error("❌ Error copiando reporte:", err);
        }

        // 📂 Copiar screenshots/videos
        const testResultsDir = path.join(process.cwd(), "test-results");
        const assetsDir = path.join(projectDir, "assets");

        const screenshots: string[] = [];
        const videos: string[] = [];

        try {
          await fs.mkdir(assetsDir, { recursive: true });

          // 🔥 LLAMAMOS A LA FUNCIÓN AQUÍ
          await collectAndCopyMedia(testResultsDir, assetsDir, screenshots, videos, project);

          console.log(`✅ ${screenshots.length} screenshots y ${videos.length} videos copiados para ${project}`);
        } catch (err) {
          console.error("❌ Error copiando screenshots/videos:", err);
        }

        // 📊 Guardar historial
        const passed = allLines.filter((l) => l.includes("passed")).length;
        const failed = allLines.filter((l) => l.includes("failed")).length;

        const entry = {
          id: Date.now(),
          date: new Date().toISOString(),
          testPath: testPath || "all",
          project,
          passed,
          failed,
          screenshots,
          videos,
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

// 🔄 función recursiva para copiar archivos
async function collectAndCopyMedia(srcDir: string, destDir: string, screenshots: string[], videos: string[], project: string) {
  const entries = await fs.readdir(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      await fs.mkdir(destPath, { recursive: true });
      await collectAndCopyMedia(srcPath, destPath, screenshots, videos, project);
    } else {
      if (entry.name.endsWith(".png")) {
        await fs.copyFile(srcPath, destPath);
        // 🔥 Guardamos la ruta relativa completa
        const relativePath = path.relative(path.join(process.cwd(), "public"), destPath);
        screenshots.push(`/${relativePath.replace(/\\/g, "/")}`);
      }

      if (entry.name.endsWith(".webm")) {
        await fs.copyFile(srcPath, destPath);
        const relativePath = path.relative(path.join(process.cwd(), "public"), destPath);
        videos.push(`/${relativePath.replace(/\\/g, "/")}`);
      }
    }
  }
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
