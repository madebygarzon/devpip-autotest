"use client";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [log, setLog] = useState("");

  const runTest = async () => {
    setLog("");
    const res = await fetch("/api/run-test", { method: "POST" });
    if (!res.body) return;
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      setLog((prev) => prev + decoder.decode(value));
    }
  };

  const showReport = async () => {
    const res = await fetch("/api/show-report", { method: "POST" });

    if (!res.ok) {
      alert("Error al generar el reporte");
      return;
    }

    console.log("Reporte generado, abriendo en nueva pestaña...");

    setTimeout(() => {
      window.open("/reports/index.html", "_blank");
    }, 1500);
  };
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        
        

        
        <div className="flex flex-col gap-4 w-full max-w-xl">
          <div className="flex gap-4">
            <button
              onClick={runTest}
              className="rounded border px-4 py-2 bg-blue-500 text-white"
            >
              Run Home Test
            </button>
            <a
              href="/reports/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded border px-4 py-2 bg-green-500 text-white text-center"
            >
              Show Report
            </a>
          </div>
          <pre className="whitespace-pre-wrap p-2 h-64 overflow-auto rounded">
            {log}
          </pre>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
