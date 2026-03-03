import { NextResponse } from "next/server";
import path from "path";
import { chromium } from "playwright";

export async function GET(req: Request) {
  try {
    // 1️⃣ Obtener parámetros de la URL
    const { searchParams } = new URL(req.url);
    const project = searchParams.get("project") || "pip";
    const category = searchParams.get("category") || "";
    const test = searchParams.get("test") || "";

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

    // 6️⃣ Generar nombre descriptivo para el PDF
    const generateFilename = () => {
      const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      // Clean category/test names for filename (remove emojis and special chars)
      const cleanString = (str: string) =>
        str.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').toLowerCase();

      if (category && category !== "all") {
        // Use category name
        const categoryClean = cleanString(category);
        return `${project}-${categoryClean}-${timestamp}.pdf`;
      } else if (test && test !== "all") {
        // Extract test name from path (e.g., "tests/pip/home/form.spec.ts" -> "form")
        const testName = test.split('/').pop()?.replace('.spec.ts', '') || 'test';
        return `${project}-${testName}-${timestamp}.pdf`;
      } else {
        // Default: all tests
        return `${project}-all-tests-${timestamp}.pdf`;
      }
    };

    const filename = generateFilename();

    // 7️⃣ Responder con el PDF y nombre descriptivo
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
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
