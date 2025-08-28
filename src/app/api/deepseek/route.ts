// app/api/deepseek/route.ts
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import Fuse from "fuse.js";

const ASSISTANT_SYSTEM = `You are an AI assistant for "Dashboard PIP".
- Always be concise. Use plain, short sentences.
- Keep each section under 3 lines max.
- If context files exist, reference them briefly.
- Required sections: Summary, Root cause, Reproduce, Next steps, Engineer notes.
- Total response should not exceed 250 words.`;


// Configure where your artifacts live
const DATA_DIR = path.join(process.cwd(), "data");
const HISTORY_FILE = path.join(DATA_DIR, "testHistory.json");
// Adjust to where your test artifacts (md, logs) are stored
const RESULTS_DIR = path.join(process.cwd(), "test-results");

// Utility: safe read
async function safeRead(filePath: string): Promise<string | null> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return content;
  } catch {
    return null;
  }
}

// Utility: truncate long text
function truncate(text: string, max = 8000): string {
  if (!text || text.length <= max) return text;
  return text.slice(0, max - 20) + "\n\n[truncated…]";
}

// Parse structured hints from the incoming prompt (very forgiving)
function extractHints(raw: string) {
  // Test path
  const testMatch = raw.match(/(?:^|\n)\s*-\s*Test:\s*(.+)$/im);
  const testPath = testMatch?.[1]?.trim() ?? null;

  // Date
  const dateMatch = raw.match(/(?:^|\n)\s*-\s*Date:\s*(.+)$/im);
  const when = dateMatch?.[1]?.trim() ?? null;

  // Error Context md
  const ctxMatch = raw.match(/Error Context:\s*([^\s]+\.md)\b/i);
  const ctxRel = ctxMatch?.[1]?.trim() ?? null;

  // The freeform "Error:" line, often stack or a short message
  const errMatch = raw.match(/(?:^|\n)Error:\s*([\s\S]*?)(?:\n\S|$)/i);
  const errorLine = errMatch?.[1]?.trim() ?? null;

  return { testPath, when, ctxRel, errorLine };
}

export async function POST(req: Request) {
  const { prompt } = await req.json();

  // 1) Try to fetch history for context
  let history: any[] = [];
  try {
    const content = await safeRead(HISTORY_FILE);
    if (content) history = JSON.parse(content);
  } catch {
    // ignore, continue without history
  }

  // 2) Fuzzy find most relevant run(s)
  let topRuns: any[] = [];
  if (history.length) {
    const fuse = new Fuse(history, {
      keys: ["testPath", "project", "errors", "screenshots", "videos"],
      threshold: 0.3,
    });
    const results = fuse.search(prompt).slice(0, 3);
    topRuns = results.map((r) => r.item);
  }

  // 3) Extract structured hints from the prompt
  const { testPath, when, ctxRel, errorLine } = extractHints(prompt);

  // 4) If Error Context md exists, read it
  let errorContextMd: string | null = null;
  if (ctxRel) {
    // If the prompt path is relative like "test-results/.../error-context.md"
    const guessAbs = path.isAbsolute(ctxRel)
      ? ctxRel
      : path.join(process.cwd(), ctxRel.replace(/^\.?\//, ""));
    // Also try under RESULTS_DIR if not found
    errorContextMd = (await safeRead(guessAbs)) ?? (await safeRead(path.join(RESULTS_DIR, ctxRel)));
  }

  // 5) Build concise context block for the model
  const run = topRuns[0] || null;
  const runSummary = run
    ? `Project: ${run.project ?? "n/a"}
Test: ${run.testPath}
Date: ${new Date(run.date).toLocaleString()}
Passed: ${run.passed} | Failed: ${run.failed}
Screenshots: ${Array.isArray(run.screenshots) ? run.screenshots.length : 0}
Videos: ${Array.isArray(run.videos) ? run.videos.length : 0}
Errors: ${Array.isArray(run.errors) ? run.errors.length : 0}`
    : null;

  const supportiveLinks: string[] = [];
  if (run?.screenshots?.length) supportiveLinks.push(`Screenshot: ${run.screenshots[0]}`);
  if (run?.videos?.length) supportiveLinks.push(`Video: ${run.videos[0]}`);

  // 6) Compose final messages for DeepSeek
  const system = ASSISTANT_SYSTEM;
  const userParts: string[] = [];

  userParts.push("=== USER QUESTION ===");
  userParts.push(truncate(prompt, 2000));

  if (testPath || when || errorLine) {
    userParts.push("\n=== HINTS ===");
    if (testPath) userParts.push(`testPath: ${testPath}`);
    if (when) userParts.push(`date: ${when}`);
    if (errorLine) userParts.push(`errorLine: ${truncate(errorLine, 500)}`);
  }

  if (runSummary) {
    userParts.push("\n=== MATCHED RUN SUMMARY ===");
    userParts.push(runSummary);
  }

  if (supportiveLinks.length) {
    userParts.push("\n=== SUPPORTING ARTIFACTS ===");
    userParts.push(supportiveLinks.join("\n"));
  }

  if (errorContextMd) {
    userParts.push("\n=== ERROR CONTEXT MARKDOWN (excerpt) ===");
    userParts.push(truncate(errorContextMd, 5000));
  }

  // 7) Add response instructions for consistent structure
  userParts.push(`
  === REQUIRED OUTPUT FORMAT ===
  1) Summary (1–2 lines)
  2) Root cause (max 3 bullets)
  3) Reproduce (max 3 steps)
  4) Next steps (max 3 items)
  5) Engineer notes (≤2 lines)
  `);

  const finalUser = userParts.join("\n");

  // 8) If no API key, return a useful fallback
  if (!process.env.DEEPSEEK_API_KEY) {
    const fallback = [
      "The DEEPSEEK_API_KEY is not configured.",
      runSummary ? `\nMatched run:\n${runSummary}` : "",
      errorContextMd ? `\nFound error context markdown (excerpt shown above).` : "",
    ].join("\n");
    return NextResponse.json({
      choices: [{ message: { content: fallback } }],
    }, { status: 500 });
  }

  // 9) Call DeepSeek with system + user messages
  const dsRes = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: system },
        { role: "user", content: finalUser },
      ],
      // You can tweak temperature/top_p if you want more/less creativity
      temperature: 0.2,
      top_p: 0.9,
    }),
  });

  const data = await dsRes.json();
  const content =
    data?.choices?.[0]?.message?.content ??
    "No response from model.";

  return NextResponse.json({
    choices: [{ message: { content } }],
  });
}
