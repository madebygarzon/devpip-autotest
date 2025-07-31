import { NextResponse } from "next/server";
import path from "path";
import { chromium } from "playwright";

export async function GET(req: Request) {
  try {
    // 1️⃣ Obtener el parámetro `project` de la URL
    const { searchParams } = new URL(req.url);
    const project = searchParams.get("project") || "pip";

    // 2️⃣ Ruta dinámica del reporte
    const reportPath = path.join(process.cwd(), "public", "reports", project, "index.html");

    // 3️⃣ Abrir el reporte con Playwright
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(`file://${reportPath}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    // 4️⃣ Expandir todos los bloques y forzar visibilidad
    await page.evaluate(() => {
      document.querySelectorAll('[aria-expanded="false"]').forEach((el) => {
        el.setAttribute("aria-expanded", "true");
      });

      const style = document.createElement("style");
      style.innerHTML = `
        .chip *, .test-file-test, .test-file-details-row, pre, code {
          display: block !important;
          max-height: none !important;
          opacity: 1 !important;
          visibility: visible !important;
        }
      `;
      document.head.appendChild(style);
    });

    await page.waitForTimeout(1500);

    // 5️⃣ Generar el PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", bottom: "20px", left: "15px", right: "15px" },
    });

    await browser.close();

    // 6️⃣ Responder con el PDF y nombre dinámico
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${project}-report.pdf"`,
      },
    });
  } catch (error) {
    console.error("❌ Error al generar PDF:", error);
    return NextResponse.json(
      { error: "No se pudo generar el PDF" },
      { status: 500 }
    );
  }
}
