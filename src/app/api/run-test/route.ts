import { spawn } from 'child_process';

export async function POST() {
  const child = spawn('npx', ['playwright', 'test', 'tests/home.spec.ts'], {
    cwd: process.cwd(),
    shell: true,
  });

  const stream = new ReadableStream({
    start(controller) {
      child.stdout.on('data', (data) => controller.enqueue(data));
      child.stderr.on('data', (data) => controller.enqueue(data));
      child.on('close', () => controller.close());
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}