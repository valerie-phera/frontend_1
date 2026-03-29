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
      const page = pdfDoc.addPage([595, 842]);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      let y = 820;
      const lineHeight = 16;

      const mainColor = rgb(0, 0.2039, 0.2392); // #00343D
      const gray = rgb(0.4, 0.4, 0.4);
      const borderColor = rgb(0.9, 0.9, 0.95);

      const safe = (v) => (v ? String(v) : "");

      const drawLine = (x1, x2) => {
        page.drawLine({
          start: { x: x1, y },
          end: { x: x2, y },
          thickness: 1,
          color: borderColor
        });
        y -= 15;
      };

      const drawWrapped = (text, x, size, maxWidth = 480) => {
        const words = safe(text).split(" ");
        let line = "";

        for (let w of words) {
          const t = line + w + " ";
          const width = font.widthOfTextAtSize(t, size);

          if (width > maxWidth) {
            page.drawText(line, { x, y, size, font });
            y -= lineHeight;
            line = w + " ";
          } else {
            line = t;
          }
        }

        if (line.trim()) {
          page.drawText(line, { x, y, size, font });
          y -= lineHeight;
        }
      };

      const drawBox = (title, callback) => {
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
      page.drawRectangle({
        x: 0,
        y: 780,
        width: 595,
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

      page.drawText("Summary", {
        x: 40,
        y,
        size: 18,
        font,
        color: gray
      });

      y -= 25;

      page.drawText(`pH Value: `, { x: 40, y, size: 14, font });
      page.drawText(safe(phValue), { x: 120, y, size: 14, font, color: mainColor });
      y -= 18;

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
          recommendations.forEach((r) => drawWrapped(`• ${r}`, 60, 12));
        });
      }

      page.drawText(
        "pHera • Empowering vaginal health through accessible testing",
        {
          x: 40,
          y: 40,
          size: 10,
          font,
          color: gray
        }
      );

      // LOGO
      const logoBytes = await fetch(logoSrc).then(res => res.arrayBuffer());
      const logoImage = await pdfDoc.embedPng(logoBytes);

      const logoWidth = 55;
      const logoHeight = (logoImage.height / logoImage.width) * logoWidth;

      page.drawImage(logoImage, {
        x: 595 - logoWidth - 40,
        y: 35,
        width: logoWidth,
        height: logoHeight
      });

      return await pdfDoc.save();
    } catch (err) {
      console.error("PDF generation failed:", err);
      throw err;
    }
  };

  return { exportPdf };
};

export default useExportPdf;