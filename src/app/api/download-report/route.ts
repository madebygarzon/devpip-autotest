import { NextResponse } from "next/server";
import path from "path";
import { chromium } from "playwright";

export async function GET() {
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    const reportPath = path.join(process.cwd(), "public", "reports", "index.html");

    await page.goto(`file://${reportPath}`, { waitUntil: "networkidle" });

    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      document.querySelectorAll(".chip").forEach((chip) => {
        const header = chip.querySelector(".chip-header");
        if (header) {
          header.setAttribute("aria-expanded", "true");
        }

        const controlsId = header?.getAttribute("aria-controls");
        if (controlsId) {
          const controlled = document.getElementById(controlsId);
          if (controlled) {
            controlled.style.display = "block";
            controlled.style.maxHeight = "none";
            controlled.style.opacity = "1";
            controlled.style.visibility = "visible";
          }
        }
      });

      const style = document.createElement("style");
      style.innerHTML = `
        .chip * {
          display: block !important;
          max-height: none !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
      `;
      document.head.appendChild(style);
    });

    await page.evaluate(() => {
      document.querySelectorAll('[role="treeitem"]').forEach((el) => {
        const clickable = el.querySelector(".tree-item-title");
        if (clickable) {
          clickable.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        }
      });

      const style = document.createElement("style");
      style.innerHTML = `
        [role="treeitem"] .test-error-container,
        [role="treeitem"] .test-error-view,
        [role="treeitem"] pre,
        [role="treeitem"] code {
          display: block !important;
          max-height: none !important;
          opacity: 1 !important;
          visibility: visible !important;
        }
      `;
      document.head.appendChild(style);
    });

    await page.waitForTimeout(1500);

    await page.evaluate(() => {
      document.title = "DashboardPIP - Tests information Report";
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", bottom: "20px", left: "15px", right: "15px" },
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="dashboardpip-report.pdf"`,
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
