// app/api/run-test/route.ts
import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";

const historyFile = path.join(process.cwd(), "data", "testHistory.json");

const PROJECT_FAVICONS: Record<string, string> = {
  pip: "https://partnerinpublishing.com/wp-content/uploads/2024/05/cropped-Group-3.png",
  gradepotential: "https://gradepotentialtutoring.ue1.rapydapps.cloud/favicon.ico",
  itopia: "https://itopia.com/favicon.ico",
  metricmarine: "https://www.metricmarine.com/favicon.ico",
};

export async function POST(req: Request) {
  const body = await req.json();
  const testPath = body.testPath || "";
  const project = body.project || "default";

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

      const safeEnqueue = (text: string) => {
        try {
          controller.enqueue(textEncoder.encode(text + "\n"));
        } catch (e) {
          console.warn("⚠️ Stream warning:", e);
        }
      };

      const stripAnsi = (str: string) =>
        str.replace(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g, "");

      const stdoutDone = new Promise<void>((resolve) => {
        child.stdout.on("data", (data) => {
          const lines = data.toString().split("\n");
          for (const line of lines) {
            const clean = stripAnsi(line);
            if (clean) {
              safeEnqueue(clean);
              allLines.push(clean);
            }
          }
        });
        child.stdout.on("end", resolve);
      });

      const stderrDone = new Promise<void>((resolve) => {
        child.stderr.on("data", (data) => {
          const lines = data.toString().split("\n");
          for (const line of lines) {
            const clean = stripAnsi(line);
            if (clean) {
              safeEnqueue(`Error: ${clean}`);
              allLines.push(`Error: ${clean}`);
            }
          }
        });
        child.stderr.on("end", resolve);
      });

      child.on("close", async () => {
        await Promise.all([stdoutDone, stderrDone]);

        const sourceDir = path.join(process.cwd(), "playwright-report");
        const projectDir = path.join(process.cwd(), "public", "reports", project);

        // ✅ 1. Copiar reporte HTML generado
        try {
          await fs.rm(projectDir, { recursive: true, force: true });
          await fs.mkdir(projectDir, { recursive: true });
          await copyDir(sourceDir, projectDir);
        } catch (err) {
          console.error("❌ Error copiando reporte:", err);
        }

        // ✅ 2. Modificar título y favicon de index.html
        const indexFile = path.join(projectDir, "index.html");
        try {
          let html = await fs.readFile(indexFile, "utf8");

          // 🎯 Cambiar título
          html = html.replace(/<title>.*<\/title>/, `<title>${project.toUpperCase()} Test Report</title>`);

          // 🎯 Cambiar favicon (o agregarlo si no existe)
          const faviconUrl = PROJECT_FAVICONS[project] || "/default-favicon.ico";
          const faviconTag = `<link rel="icon" href="${faviconUrl}?v=${Date.now()}">`;

          if (html.includes('<link rel="icon"')) {
            html = html.replace(/<link rel="icon".*?>/, faviconTag);
          } else {
            html = html.replace("</head>", `${faviconTag}\n</head>`);
          }

          await fs.writeFile(indexFile, html, "utf8");
          console.log(`✅ Título y favicon editados en ${indexFile}`);
        } catch (err) {
          console.error("❌ Error modificando título/favicon:", err);
        }

        // ✅ 3. Copiar screenshots y videos
        const testResultsDir = path.join(process.cwd(), "test-results");
        const assetsDir = path.join(projectDir, "assets");

        const screenshots: string[] = [];
        const videos: string[] = [];

        try {
          await fs.mkdir(assetsDir, { recursive: true });
          await collectAndCopyMedia(testResultsDir, assetsDir, screenshots, videos, project);
        } catch (err) {
          console.error("❌ Error copiando media:", err);
        }

        // ✅ 4. Guardar en el historial
        const passed = allLines.filter((l) => /\b\d+\spassed\b/.test(l)).length;
        const failed = allLines.filter((l) => /\b\d+\sfailed\b/.test(l)).length;

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
          const existing = await fs.readFile(historyFile, "utf-8").then((d) => JSON.parse(d)).catch(() => []);
          existing.unshift(entry);
          await fs.writeFile(historyFile, JSON.stringify(existing, null, 2));
        } catch (e) {
          console.error("❌ Error escribiendo historial:", e);
        }

        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

// 🔁 Copiar archivos (incluyendo media)
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

// 🔁 Copiar directorio entero (reporte principal)
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
