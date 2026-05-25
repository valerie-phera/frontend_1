import { createElement } from "react";
import { createRoot } from "react-dom/client";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import ReportPrintDocument from "../pages/ReportPrintPage/ReportPrintDocument";

const PAGE_WIDTH_PX = 595;
const PAGE_HEIGHT_PX = 940;
const CAPTURE_SCALE = 2;
/** Wait for pagination useLayoutEffects to settle before html2canvas */
const LAYOUT_SETTLE_MS = 160;

/**
 * Collect clickable `<a href>` bounds relative to a report page (for PDF link annotations).
 * @param {HTMLElement} pageEl
 * @returns {{ x: number, y: number, w: number, h: number, url: string }[]}
 */
function collectPageLinkRects(pageEl) {
  const pageRect = pageEl.getBoundingClientRect();
  const scaleX = PAGE_WIDTH_PX / (pageRect.width || PAGE_WIDTH_PX);
  const scaleY = PAGE_HEIGHT_PX / (pageRect.height || PAGE_HEIGHT_PX);
  const links = [];

  pageEl.querySelectorAll("a[href]").forEach((anchor) => {
    const url = anchor.getAttribute("href")?.trim();
    if (!url || url === "#" || /^javascript:/i.test(url)) return;

    const rect = anchor.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;

    links.push({
      x: (rect.left - pageRect.left) * scaleX,
      y: (rect.top - pageRect.top) * scaleY,
      w: rect.width * scaleX,
      h: rect.height * scaleY,
      url,
    });
  });

  return links;
}

/** @param {import("jspdf").jsPDF} pdf @param {{ x: number, y: number, w: number, h: number, url: string }[]} linkRects */
function applyPageLinkAnnotations(pdf, linkRects) {
  for (const { x, y, w, h, url } of linkRects) {
    pdf.link(x, y, w, h, { url });
  }
}

/**
 * Renders the /report-print layout off-screen and returns PDF bytes (same visual as print preview).
 * @param {object} reportData – {@link buildReportPrintState} payload
 * @returns {Promise<Uint8Array>}
 */
export async function exportReportPdf(reportData) {
  const host = document.createElement("div");
  host.setAttribute("data-report-pdf-export-host", "");
  document.body.appendChild(host);

  const root = createRoot(host);

  try {
    await document.fonts?.ready;

    const pages = await new Promise((resolve, reject) => {
      let layoutPass = 0;

      const onLayoutReady = () => {
        layoutPass += 1;
        const pass = layoutPass;

        window.setTimeout(() => {
          if (pass !== layoutPass) return;

          try {
            const nodes = host.querySelectorAll("[data-report-print]");
            if (!nodes.length) {
              reject(new Error("Report pages not found for PDF export"));
              return;
            }
            resolve(Array.from(nodes));
          } catch (err) {
            reject(err);
          }
        }, LAYOUT_SETTLE_MS);
      };

      root.render(
        createElement(ReportPrintDocument, {
          data: reportData,
          captureMode: true,
          onLayoutReady,
        })
      );
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [PAGE_WIDTH_PX, PAGE_HEIGHT_PX],
      hotfixes: ["px_scaling"],
    });

    for (let i = 0; i < pages.length; i += 1) {
      const pageEl = pages[i];
      const linkRects = collectPageLinkRects(pageEl);
      const canvas = await html2canvas(pageEl, {
        scale: CAPTURE_SCALE,
        width: PAGE_WIDTH_PX,
        height: PAGE_HEIGHT_PX,
        windowWidth: PAGE_WIDTH_PX,
        windowHeight: PAGE_HEIGHT_PX,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      if (i > 0) {
        pdf.addPage([PAGE_WIDTH_PX, PAGE_HEIGHT_PX], "px");
      }
      pdf.addImage(imgData, "JPEG", 0, 0, PAGE_WIDTH_PX, PAGE_HEIGHT_PX);
      applyPageLinkAnnotations(pdf, linkRects);
    }

    return new Uint8Array(pdf.output("arraybuffer"));
  } finally {
    root.unmount();
    host.remove();
  }
}
