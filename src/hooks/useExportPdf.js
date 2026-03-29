import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const useExportPdf = (logoSrc) => {

  const exportPdf = async ({
    phValue,
    phLevel,
    timestamp,
    interpretation,
    detailOptions,
    recommendations
  }) => {
    try {
      if (!Array.isArray(recommendations)) {
        recommendations = [String(recommendations || "")];
      }
      
      const pdfDoc = await PDFDocument.create();
      let page = pdfDoc.addPage([595, 842]);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      let y = 820;
      const lineHeight = 16;
      const pageWidth = 595;
      const pageHeight = 842;
      const bottomMargin = 70; // keep some space for footer/logo
      const topStartY = 790;

      const mainColor = rgb(0, 0.2039, 0.2392); // #00343D
      const gray = rgb(0.4, 0.4, 0.4);
      const borderColor = rgb(0.9, 0.9, 0.95);

      const safe = (v) => (v ? String(v) : "");

      const stripTags = (s) => safe(s).replace(/<\/?[^>]+>/g, "");

      // Embed logo once and reuse on each page footer
      const logoBytes = await fetch(logoSrc).then((res) => res.arrayBuffer());
      const logoImage = await pdfDoc.embedPng(logoBytes);
      const logoWidth = 55;
      const logoHeight = (logoImage.height / logoImage.width) * logoWidth;

      const drawFooter = (p, pageIndex, totalPages) => {
        // divider line
        p.drawLine({
          start: { x: 40, y: 60 },
          end: { x: pageWidth - 40, y: 60 },
          thickness: 1,
          color: borderColor
        });

        const footerText = "pHera • Empowering vaginal health through accessible testing";
        const footerFontSize = 10;
        const footerTextX = 40;
        const footerTextY = 40;

        p.drawText(footerText, {
          x: 40,
          y: 40,
          size: footerFontSize,
          font,
          color: gray
        });

        p.drawImage(logoImage, {
          x: pageWidth - logoWidth - 40,
          y: 28,
          width: logoWidth,
          height: logoHeight
        });

        if (totalPages > 1) {
          const label = `Page ${pageIndex} of ${totalPages}`;
          const labelWidth = font.widthOfTextAtSize(label, footerFontSize);
          const footerTextWidth = font.widthOfTextAtSize(footerText, footerFontSize);
          const gap = 10;
          const maxXBeforeLogo = pageWidth - 40 - logoWidth - 10;

          let labelX = footerTextX + footerTextWidth + gap;
          let labelY = footerTextY;

          // If the label would collide with the logo area, put it below on the left.
          if (labelX + labelWidth > maxXBeforeLogo) {
            labelX = footerTextX;
            labelY = 28;
          }

          p.drawText(label, {
            x: labelX,
            y: labelY,
            size: footerFontSize,
            font,
            color: gray
          });
        }
      };

      const drawHeader = (variant = "full") => {
        if (variant === "full") {
          page.drawRectangle({
            x: 0,
            y: 780,
            width: pageWidth,
            height: 70,
            color: mainColor
          });

          page.drawText("pHera — Vaginal pH Report", {
            x: 40,
            y: 815,
            size: 22,
            font,
            color: rgb(1, 1, 1)
          });

          page.drawText(safe(timestamp), {
            x: 450,
            y: 790,
            size: 12,
            font,
            color: rgb(1, 1, 1)
          });

          y = 750;
          return;
        }

        // compact header for subsequent pages
        page.drawRectangle({
          x: 0,
          y: 812,
          width: pageWidth,
          height: 30,
          color: mainColor
        });

        page.drawText("pHera — Vaginal pH Report", {
          x: 40,
          y: 822,
          size: 12,
          font,
          color: rgb(1, 1, 1)
        });

        page.drawText(safe(timestamp), {
          x: 420,
          y: 822,
          size: 10,
          font,
          color: rgb(1, 1, 1)
        });

        y = topStartY;
      };

      const newPage = () => {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        drawHeader("compact");
      };

      const ensureSpace = (needed = lineHeight) => {
        if (y - needed < bottomMargin) newPage();
      };

      // Supports very small subset of HTML: <strong>...</strong>
      const parseStrongRuns = (input) => {
        const s = safe(input);
        const parts = s.split(/(<strong>[\s\S]*?<\/strong>)/g).filter(Boolean);
        return parts.map((p) => {
          const isStrong = p.startsWith("<strong>") && p.endsWith("</strong>");
          const raw = isStrong ? p.replace(/^<strong>/, "").replace(/<\/strong>$/, "") : p;
          return { text: stripTags(raw), bold: isStrong };
        });
      };

      const tokenizeRuns = (runs) => {
        const tokens = [];
        for (const run of runs) {
          const chunks = safe(run.text).split(/(\s+)/); // keep whitespace
          for (const c of chunks) {
            if (c === "") continue;
            tokens.push({ text: c, bold: !!run.bold });
          }
        }
        return tokens;
      };

      const widthOfToken = (token, size) => {
        const f = token.bold ? fontBold : font;
        return f.widthOfTextAtSize(token.text, size);
      };

      const drawLineTokens = (tokens, x, size, color) => {
        ensureSpace(lineHeight);
        let cursorX = x;
        for (const t of tokens) {
          if (!t.text) continue;
          const f = t.bold ? fontBold : font;
          page.drawText(t.text, { x: cursorX, y, size, font: f, color });
          cursorX += f.widthOfTextAtSize(t.text, size);
        }
      };

      const drawLine = (x1, x2) => {
        ensureSpace(15);
        page.drawLine({
          start: { x: x1, y },
          end: { x: x2, y },
          thickness: 1,
          color: borderColor
        });
        y -= 15;
      };

      const drawWrapped = (text, x, size, maxWidth = 480, options = {}) => {
        const color = options.color;
        const runs = parseStrongRuns(text);
        const tokens = tokenizeRuns(runs);

        let lineTokens = [];
        let lineWidth = 0;

        const flushLine = () => {
          if (lineTokens.length === 0) return;
          ensureSpace(lineHeight);
          drawLineTokens(lineTokens, x, size, color);
          y -= lineHeight;
          lineTokens = [];
          lineWidth = 0;
        };

        for (const token of tokens) {
          // handle hard line breaks if they appear
          if (token.text.includes("\n")) {
            const split = token.text.split("\n");
            split.forEach((part, idx) => {
              if (part) {
                const t = { ...token, text: part };
                const w = widthOfToken(t, size);
                if (lineWidth + w > maxWidth && lineTokens.length > 0) flushLine();
                lineTokens.push(t);
                lineWidth += w;
              }
              if (idx < split.length - 1) flushLine();
            });
            continue;
          }

          const tokenWidth = widthOfToken(token, size);
          if (lineWidth + tokenWidth > maxWidth && lineTokens.length > 0) {
            flushLine();
          }
          lineTokens.push(token);
          lineWidth += tokenWidth;
        }

        flushLine();
      };

      const drawBox = (title, callback) => {
        // Ensure we have room for box header area
        ensureSpace(70);
        page.drawRectangle({
          x: 40,
          y: y - 10,
          width: 515,
          height: -5,
          color: rgb(0.96, 0.98, 1)
        });

        y -= 30;

        page.drawText(title, {
          x: 55,
          y,
          size: 14,
          font,
          color: mainColor
        });

        y -= 20;
        callback();
        y -= 15;
      };

      // HEADER
      drawHeader("full");

      page.drawText("Summary", {
        x: 40,
        y,
        size: 18,
        font,
        color: gray
      });

      y -= 25;

      ensureSpace(40);
      page.drawText(`pH Value: `, { x: 40, y, size: 14, font });
      page.drawText(safe(phValue), { x: 120, y, size: 14, font, color: mainColor });
      y -= 18;

      ensureSpace(40);
      page.drawText(`Level: `, { x: 40, y, size: 14, font });
      page.drawText(safe(phLevel), { x: 120, y, size: 14, font, color: mainColor });
      y -= 25;

      drawLine(40, 550);

      drawBox("Interpretation", () => {
        drawWrapped(interpretation, 55, 12);
      });

      if (detailOptions.length > 0) {
        drawBox("Your Details", () => {
          detailOptions.forEach((d) => drawWrapped(`• ${d}`, 60, 12));
        });
      }

      if (recommendations.length > 0) {
        drawBox("Recommendations", () => {
          recommendations.forEach((r, idx) => {
            drawWrapped(`• ${r}`, 60, 12);
            // extra spacing between paragraphs/items
            if (idx < recommendations.length - 1) {
              ensureSpace(8);
              y -= 8;
            }
          });
        });
      }

      // Draw footer on each page, and add page numbers if multiple pages.
      const pages = pdfDoc.getPages();
      const totalPages = pages.length;
      pages.forEach((p, idx) => drawFooter(p, idx + 1, totalPages));

      return await pdfDoc.save();
    } catch (err) {
      console.error("PDF generation failed:", err);
      throw err;
    }
  };

  return { exportPdf };
};

export default useExportPdf;