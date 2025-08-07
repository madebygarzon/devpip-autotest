import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import Fuse from 'fuse.js';

const ASSISTANT_PREFIX =
  'I am a virtual assistant designed to support the analysis of test results In Dashboard PIP Panel.';

export async function POST(req: Request) {
  const { prompt } = await req.json();

  let responseText: string | null = null;

  try {
    const filePath = path.join(process.cwd(), 'data', 'testHistory.json');
    const content = await fs.readFile(filePath, 'utf-8');
    const history: any[] = JSON.parse(content);

    const fuse = new Fuse(history, {
      keys: ['testPath', 'project', 'errors', 'screenshots', 'videos'],
      threshold: 0.4,
    });

    const results = fuse.search(prompt);

    if (results.length > 0) {
      const formatted = results.slice(0, 3).map((r) => {
        const item = r.item as any;
        return `${item.project} - ${item.testPath}: ${item.passed} passed, ${item.failed} failed on ${new Date(item.date).toLocaleString()}`;
      });
      responseText = `${ASSISTANT_PREFIX} According to the test history, the most relevant results are:\n${formatted.join('\n')}`;
    }
  } catch {
    // If reading or parsing fails, fallback to DeepSeek
  }

  if (!responseText) {
    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json(
        {
          choices: [
            {
              message: {
                content: `${ASSISTANT_PREFIX} The DEEPSEEK_API_KEY is not configured.`,
              },
            },
          ],
        },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const deepSeekText = data.choices?.[0]?.message?.content ?? 'No response';
    responseText = `${ASSISTANT_PREFIX} ${deepSeekText}`;
  }

  return NextResponse.json({ choices: [{ message: { content: responseText } }] });
}
