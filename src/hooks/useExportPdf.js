import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { getPdfDetailSections } from "../shared/utils/pdfDetailSections";

/** @param {string} rawText */
function extractCitationLinks(rawText) {
  const text = String(rawText ?? "");
  const doiMatch = text.match(/doi:\s*([^\s,;]+)/i);
  const pmidMatch = text.match(/PMID:\s*([A-Za-z0-9]+)/i);
  const pmcidMatch =
    text.match(/PMCID:\s*([A-Za-z0-9]+)/i) ||
    text.match(/PubMed Central PMCID:\s*([A-Za-z0-9]+)/i);

  const links = [];
  if (doiMatch?.[1]) links.push(`doi:${doiMatch[1]}`);
  if (pmidMatch?.[1]) links.push(`PMID:${pmidMatch[1]}`);
  if (pmcidMatch?.[1]) links.push(`PMCID:${pmcidMatch[1]}`);

  let main = text;
  main = main.replace(/doi:\s*[^\s,;]+/gi, "");
  main = main.replace(/PMID:\s*[A-Za-z0-9]+/gi, "");
  main = main.replace(/PMCID:\s*[A-Za-z0-9]+/gi, "");
  main = main.replace(/PubMed Central PMCID:\s*[A-Za-z0-9]+/gi, "");
  main = main.replace(/\s{2,}/g, " ").replace(/\s+\./g, ".").trim();

  return { mainText: main, links };
}

/** @param {string} rawText */
function splitCitationTitleAndBody(rawText) {
  const { mainText, links } = extractCitationLinks(rawText);
  const parts = mainText.split(". ").map((p) => p.trim()).filter(Boolean);
  const title = parts[1] ? parts[1].replace(/\.$/, "") : mainText;
  const body = parts.length > 2 ? parts.slice(2).join(". ").trim() : "";
  return { title, body, links };
}

const useExportPdf = (logoSrc) => {
  const exportPdf = async ({
    phValue,
    phLevel,
    timestamp,
    interpretation,
    detailOptions,
    recommendations,
    citations = [],
    state = null,
    reportId: reportIdIn = null,
  }) => {
    try {
      if (!Array.isArray(recommendations)) {
        recommendations = [String(recommendations || "")];
      }

      const W = 595;
      const H = 842;
      const M = 24;
      const CONTENT_W = 547;
      const HEADER_H = 62;
      const FOOTER_RESERVE = 102;
      const LINE = 14;
      const LINE_DEEP = 16;

      const col = {
        headerBg: rgb(161 / 255, 192 / 255, 182 / 255),
        black: rgb(0, 0, 0),
        muted: rgb(113 / 255, 118 / 255, 128 / 255),
        divider: rgb(213 / 255, 215 / 255, 218 / 255),
        cardBg: rgb(241 / 255, 246 / 255, 244 / 255),
        cardStroke: rgb(47 / 255, 142 / 255, 150 / 255),
        sectionGreen: rgb(62 / 255, 93 / 255, 87 / 255),
        phDark: rgb(0, 52 / 255, 61 / 255),
        body: rgb(31 / 255, 31 / 255, 31 / 255),
        accentBar: rgb(93 / 255, 170 / 255, 178 / 255),
        rowBorder: rgb(233 / 255, 234 / 255, 235 / 255),
        pillBorder: rgb(38 / 255, 62 / 255, 58 / 255),
        refTeal: rgb(47 / 255, 142 / 255, 150 / 255),
        bullet: rgb(111 / 255, 152 / 255, 143 / 255),
        bulletDeep: rgb(230 / 255, 167 / 255, 51 / 255),
        citeMuted: rgb(65 / 255, 70 / 255, 81 / 255),
      };

      const safe = (v) => (v == null ? "" : String(v));
      const stripTags = (s) => safe(s).replace(/<\/?[^>]+>/g, "");

      const reportId =
        safe(reportIdIn) ||
        `PH-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const logoBytes = await fetch(logoSrc).then((res) => res.arrayBuffer());
      const logoImage = await pdfDoc.embedPng(logoBytes);
      const logoHeaderW = 90;
      const logoHeaderH = (logoImage.height / logoImage.width) * logoHeaderW;
      const logoFooterW = 50.71;
      const logoFooterH = (logoImage.height / logoImage.width) * logoFooterW;

      let page = pdfDoc.addPage([W, H]);
      let y = H - 20;

      let activeBulletSection = "insights";
      let deepCardTop = null;

      const { yourDetails, reportedSymptoms } = state
        ? getPdfDetailSections(state)
        : { yourDetails: [], reportedSymptoms: [] };

      const fallbackDetailRows =
        yourDetails.length === 0 && reportedSymptoms.length === 0 && detailOptions?.length
          ? detailOptions.map((t) => ({ label: "•", value: safe(t) }))
          : [];

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
          const chunks = safe(run.text).split(/(\s+)/);
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
        let cursorX = x;
        for (const t of tokens) {
          if (!t.text) continue;
          const f = t.bold ? fontBold : font;
          page.drawText(t.text, { x: cursorX, y, size, font: f, color: color || col.body });
          cursorX += f.widthOfTextAtSize(t.text, size);
        }
      };

      const drawWrapped = (text, x, size, maxWidth = CONTENT_W - 20, options = {}) => {
        const color = options.color ?? col.body;
        const runs = parseStrongRuns(text);
        const tokens = tokenizeRuns(runs);

        let lineTokens = [];
        let lineWidth = 0;

        const flushLine = () => {
          if (lineTokens.length === 0) return;
          ensureSpace(LINE);
          drawLineTokens(lineTokens, x, size, color);
          y -= LINE;
          lineTokens = [];
          lineWidth = 0;
        };

        for (const token of tokens) {
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

      const strokeDeepCardBorder = (topY, bottomY) => {
        const left = M;
        const right = M + CONTENT_W;
        const t = 1;
        page.drawLine({
          start: { x: left, y: topY },
          end: { x: right, y: topY },
          thickness: t,
          color: col.divider,
        });
        page.drawLine({
          start: { x: left, y: bottomY },
          end: { x: right, y: bottomY },
          thickness: t,
          color: col.divider,
        });
        page.drawLine({
          start: { x: left, y: bottomY },
          end: { x: left, y: topY },
          thickness: t,
          color: col.divider,
        });
        page.drawLine({
          start: { x: right, y: bottomY },
          end: { x: right, y: topY },
          thickness: t,
          color: col.divider,
        });
      };

      const closeDeepCardIfOpen = () => {
        if (deepCardTop === null) return;
        const bottomY = y - 6;
        const topY = deepCardTop;
        if (topY > bottomY + 4) {
          strokeDeepCardBorder(topY, bottomY);
        }
        deepCardTop = null;
      };

      const noteDeepCardTop = () => {
        if (activeBulletSection !== "deepDive") return;
        if (deepCardTop !== null) return;
        deepCardTop = y + 10;
      };

      const newPage = () => {
        closeDeepCardIfOpen();
        page = pdfDoc.addPage([W, H]);
        y = H - 20;
        drawChrome();
      };

      const ensureSpace = (needed = LINE) => {
        if (y - needed < FOOTER_RESERVE) {
          newPage();
        }
      };

      const drawChrome = () => {
        page.drawRectangle({
          x: 0,
          y: H - HEADER_H,
          width: W,
          height: HEADER_H,
          color: col.headerBg,
        });

        page.drawImage(logoImage, {
          x: M,
          y: H - HEADER_H + (HEADER_H - logoHeaderH) / 2,
          width: logoHeaderW,
          height: logoHeaderH,
        });

        const dateStr = safe(timestamp);
        const dateSize = 12;
        const rightX = W - M - Math.max(
          font.widthOfTextAtSize(dateStr, dateSize),
          font.widthOfTextAtSize(`Report ID: ${reportId}`, dateSize)
        );

        page.drawText(dateStr, {
          x: rightX,
          y: H - 28,
          size: dateSize,
          font,
          color: col.black,
        });
        page.drawText(`Report ID: ${reportId}`, {
          x: rightX,
          y: H - 44,
          size: dateSize,
          font,
          color: col.black,
        });

        y = H - HEADER_H - 18;

        page.drawText("Vaginal pH Test Report", {
          x: M,
          y,
          size: 20,
          font: fontBold,
          color: col.black,
        });
        y -= 26;

        page.drawText("Generated by pHera", {
          x: M,
          y,
          size: 14,
          font,
          color: col.muted,
        });
        y -= 16;

        page.drawText("For personal use and sharing with a healthcare provider", {
          x: M,
          y,
          size: 14,
          font,
          color: col.muted,
        });
        y -= 22;

        page.drawLine({
          start: { x: M, y: y + 8 },
          end: { x: M + CONTENT_W, y: y + 8 },
          thickness: 1,
          color: col.divider,
        });
        y -= 20;
      };

      const drawTableBox = (title, rows) => {
        if (!rows.length) return;

        ensureSpace(50);
        const pad = 8;
        const titleSize = 16;
        const rowSize = 12;
        const innerW = CONTENT_W - 2 * pad;
        let est =
          6 +
          18 +
          rows.length * (rowSize + 6) +
          12;

        ensureSpace(est);

        const boxTop = y;
        const boxH = est;
        const boxY = y - boxH;

        page.drawRectangle({
          x: M,
          y: boxY,
          width: CONTENT_W,
          height: boxH,
          borderColor: col.divider,
          borderWidth: 1,
          color: rgb(1, 1, 1),
        });

        let ty = boxTop - 6 - titleSize;
        page.drawText(title, {
          x: M + pad,
          y: ty,
          size: titleSize,
          font: fontBold,
          color: col.sectionGreen,
        });
        ty -= 22;

        rows.forEach((row, i) => {
          const isLast = i === rows.length - 1;
          const label = safe(row.label);
          const value = safe(row.value);
          page.drawText(label, {
            x: M + pad,
            y: ty,
            size: rowSize,
            font: fontBold,
            color: col.muted,
          });
          const vw = font.widthOfTextAtSize(value, rowSize);
          page.drawText(value, {
            x: M + CONTENT_W - pad - vw,
            y: ty,
            size: rowSize,
            font: fontBold,
            color: col.black,
          });
          if (!isLast) {
            page.drawLine({
              start: { x: M + pad, y: ty - 8 },
              end: { x: M + CONTENT_W - pad, y: ty - 8 },
              thickness: 1,
              color: col.rowBorder,
            });
          }
          ty -= rowSize + 8;
        });

        y = boxY - 12;
      };

      const measureWrappedLines = (text, maxWidth, size) => {
        const runs = parseStrongRuns(text);
        const tokens = tokenizeRuns(runs);
        let lineTokens = [];
        let lineWidth = 0;
        let lines = 0;

        const flush = () => {
          if (lineTokens.length) {
            lines++;
            lineTokens = [];
            lineWidth = 0;
          }
        };

        for (const token of tokens) {
          if (token.text.includes("\n")) {
            const split = token.text.split("\n");
            split.forEach((part, idx) => {
              if (part) {
                const t = { ...token, text: part };
                const w = widthOfToken(t, size);
                if (lineWidth + w > maxWidth && lineTokens.length > 0) flush();
                lineTokens.push(t);
                lineWidth += w;
              }
              if (idx < split.length - 1) flush();
            });
            continue;
          }
          const tokenWidth = widthOfToken(token, size);
          if (lineWidth + tokenWidth > maxWidth && lineTokens.length > 0) flush();
          lineTokens.push(token);
          lineWidth += tokenWidth;
        }
        flush();
        return Math.max(lines, 1);
      };

      const drawInterpretationBlock = () => {
        const pad = 14;
        const interpSource = safe(interpretation);
        const barW = 6;
        const textMaxW = CONTENT_W - 2 * pad - barW - 12;
        const linesInterp = measureWrappedLines(interpSource, textMaxW, 12);
        const interpBlockH = linesInterp * LINE + 16;

        const pillText = safe(phLevel);
        const phStr = Number(phValue).toFixed(1);
        const pillFontSize = 12;
        const pillW = Math.max(font.widthOfTextAtSize(pillText, pillFontSize) + 24, 72);
        const pillH = 22;

        const blockH =
          pad +
          18 +
          22 +
          pillH +
          8 +
          40 +
          14 +
          12 +
          interpBlockH +
          pad;

        ensureSpace(blockH + 24);

        const top = y;
        const bottom = top - blockH;

        page.drawRectangle({
          x: M,
          y: bottom,
          width: CONTENT_W,
          height: blockH,
          color: col.cardBg,
          borderColor: col.cardStroke,
          borderWidth: 1,
        });

        let cy = top - pad;
        page.drawText("Interpretation", {
          x: M + pad,
          y: cy,
          size: 16,
          font: fontBold,
          color: col.black,
        });
        cy -= 22;

        page.drawRectangle({
          x: M + pad,
          y: cy - pillH + 3,
          width: pillW,
          height: pillH,
          color: col.cardBg,
          borderColor: col.pillBorder,
          borderWidth: 0.5,
        });
        page.drawText(pillText, {
          x: M + pad + 10,
          y: cy - 5,
          size: pillFontSize,
          font,
          color: col.pillBorder,
        });

        cy -= pillH + 8;
        page.drawText(phStr, {
          x: M + pad,
          y: cy,
          size: 36,
          font: fontBold,
          color: col.phDark,
        });
        cy -= 42;
        page.drawText("pH value", {
          x: M + pad,
          y: cy,
          size: 10,
          font,
          color: col.phDark,
        });
        cy -= 12;

        const interpBottom = cy - interpBlockH;
        page.drawRectangle({
          x: M + pad,
          y: interpBottom,
          width: barW,
          height: interpBlockH,
          color: col.accentBar,
        });

        y = cy;
        drawWrapped(interpSource, M + pad + barW + 10, 12, textMaxW, { color: col.body });

        y = bottom - 18;
      };

      const drawBulletParagraph = (html) => {
        const isDeep = activeBulletSection === "deepDive";
        const textSize = isDeep ? 14 : 12;
        const inner = isDeep ? M + 10 : M;
        const bulletColor = isDeep ? col.bulletDeep : col.bullet;

        ensureSpace(textSize + 8);
        noteDeepCardTop();
        page.drawText("•", {
          x: inner + 10,
          y,
          size: isDeep ? 16 : 14,
          font: fontBold,
          color: bulletColor,
        });

        const textX = inner + 28;
        const maxW = CONTENT_W - (isDeep ? 48 : 36);
        drawWrapped(html, textX, textSize, maxW, { color: col.body });
        y -= isDeep ? 12 : 8;
      };

      const linkChipLabel = (link) => {
        const s = String(link ?? "").trim();
        if (/^doi:/i.test(s)) return "DOI";
        if (/^PMC/i.test(s)) return "PMC";
        return s.length > 28 ? `${s.slice(0, 26)}…` : s;
      };

      const strokeSourcesCardSides = (bottomY, topY) => {
        const left = M;
        const right = M + CONTENT_W;
        const t = 1;
        page.drawLine({
          start: { x: left, y: bottomY },
          end: { x: right, y: bottomY },
          thickness: t,
          color: col.divider,
        });
        page.drawLine({
          start: { x: left, y: bottomY },
          end: { x: left, y: topY },
          thickness: t,
          color: col.divider,
        });
        page.drawLine({
          start: { x: right, y: bottomY },
          end: { x: right, y: topY },
          thickness: t,
          color: col.divider,
        });
      };

      const drawSourceEntry = (c, index, innerX, wrapW) => {
        const parsed = splitCitationTitleAndBody(c.text);
        let paperTitle = (c.title && String(c.title).trim()) || parsed.title || "";
        if (!paperTitle) {
          paperTitle = stripTags(c.text).replace(/\s+/g, " ").trim().slice(0, 180);
        }
        const metaLines = parsed.body;
        const links = parsed.links;

        const numX = innerX;
        const colX = innerX + 18;
        const maxCol = wrapW;

        const titleHtml = paperTitle ? `<strong>${safe(paperTitle)}</strong>` : "";
        const linesTitle = paperTitle ? measureWrappedLines(titleHtml, maxCol, 14) : 1;
        const linesMeta = metaLines ? measureWrappedLines(metaLines, maxCol, 11) : 0;
        const blockH =
          linesTitle * LINE_DEEP +
          (linesMeta ? linesMeta * 12 : 0) +
          (links.length ? LINE_DEEP : 0) +
          20;

        if (y - blockH < FOOTER_RESERVE) {
          newPage();
        }

        const rowTop = y;
        page.drawText(`${index + 1}.`, {
          x: numX,
          y: rowTop,
          size: 14,
          font: fontBold,
          color: col.refTeal,
        });

        y = rowTop;
        if (paperTitle) {
          drawWrapped(titleHtml, colX, 14, maxCol, { color: col.body });
        }
        if (metaLines) {
          drawWrapped(metaLines, colX, 11, maxCol, { color: col.citeMuted });
        }
        if (links.length) {
          ensureSpace(LINE_DEEP);
          page.drawText(links.map(linkChipLabel).join("     "), {
            x: colX,
            y,
            size: 14,
            font: fontBold,
            color: col.refTeal,
          });
          y -= LINE_DEEP;
        }
        y -= 12;
      };

      const drawDisclaimerFooter = (p, idx, total) => {
        const footerY = 72;
        p.drawLine({
          start: { x: M, y: footerY },
          end: { x: M + CONTENT_W, y: footerY },
          thickness: 1,
          color: col.divider,
        });

        const disc =
          "This report is generated by pHera for informational purposes only. It does not constitute medical advice or diagnosis. Please consult a qualified healthcare provider for any medical concerns";

        const discSize = 10;
        let ty = footerY - 14;
        const maxW = CONTENT_W;

        const words = disc.split(/\s+/);
        let line = "";
        for (const w of words) {
          const test = line ? `${line} ${w}` : w;
          if (font.widthOfTextAtSize(test, discSize) > maxW && line) {
            p.drawText(line, { x: M, y: ty, size: discSize, font, color: col.muted });
            ty -= 12;
            line = w;
          } else {
            line = test;
          }
        }
        if (line) {
          p.drawText(line, { x: M, y: ty, size: discSize, font, color: col.muted });
        }

        p.drawImage(logoImage, {
          x: M,
          y: 24,
          width: logoFooterW,
          height: logoFooterH,
        });

        const pageLabel = `${idx}/${total}`;
        const pw = font.widthOfTextAtSize(pageLabel, discSize);
        p.drawText(pageLabel, {
          x: W - M - pw,
          y: 30,
          size: discSize,
          font,
          color: col.muted,
        });
      };

      /* ---- Page 1 content ---- */
      drawChrome();

      drawInterpretationBlock();

      if (yourDetails.length) {
        drawTableBox("Your details", yourDetails);
      } else if (fallbackDetailRows.length) {
        drawTableBox("Your details", fallbackDetailRows);
      }

      if (reportedSymptoms.length) {
        drawTableBox("Reported symptoms", reportedSymptoms);
      }

      const drawInsightsHeading = (isDeepDive) => {
        page.drawText(isDeepDive ? "Deep dive" : "Your tailored insights", {
          x: M,
          y,
          size: 16,
          font: fontBold,
          color: col.body,
        });
        y -= 22;
        activeBulletSection = isDeepDive ? "deepDive" : "insights";
        if (isDeepDive) {
          y -= 10;
          deepCardTop = null;
        }
      };

      let firstBulletsPage = true;

      for (let i = 0; i < recommendations.length; i++) {
        let maxW = CONTENT_W - (activeBulletSection === "deepDive" ? 48 : 36);
        let textSize = activeBulletSection === "deepDive" ? 14 : 12;
        let lineStep = activeBulletSection === "deepDive" ? LINE_DEEP : LINE;
        let approx =
          measureWrappedLines(recommendations[i], maxW, textSize) * lineStep + 40;

        if (y - approx < FOOTER_RESERVE) {
          newPage();
          drawInsightsHeading(!firstBulletsPage);
          firstBulletsPage = false;
          maxW = CONTENT_W - (activeBulletSection === "deepDive" ? 48 : 36);
          textSize = activeBulletSection === "deepDive" ? 14 : 12;
          lineStep = activeBulletSection === "deepDive" ? LINE_DEEP : LINE;
          approx =
            measureWrappedLines(recommendations[i], maxW, textSize) * lineStep + 40;
        }
        let pageGuard = 0;
        while (y - approx < FOOTER_RESERVE && pageGuard++ < 40) {
          newPage();
        }

        if (i === 0 && firstBulletsPage) {
          drawInsightsHeading(false);
          firstBulletsPage = false;
        }

        drawBulletParagraph(recommendations[i]);
      }

      closeDeepCardIfOpen();

      const normalizedCitations = Array.isArray(citations)
        ? citations
            .map((c) => {
              if (!c || typeof c !== "object") return null;
              const title = c.title == null ? "" : String(c.title);
              const text =
                c.relevant_section ??
                c.reference_citation ??
                c.nlm_reference ??
                c.nlmReference ??
                c.reference ??
                c.citation ??
                "";
              if (!title && !text) return null;
              return { title, text: String(text) };
            })
            .filter(Boolean)
        : [];

      closeDeepCardIfOpen();
      ensureSpace(56);
      if (y < FOOTER_RESERVE + 90) newPage();

      page.drawText("Sources", {
        x: M,
        y,
        size: 16,
        font: fontBold,
        color: col.body,
      });
      y -= 12;

      const sourcesTopBorderY = y + 2;
      page.drawLine({
        start: { x: M, y: sourcesTopBorderY },
        end: { x: M + CONTENT_W, y: sourcesTopBorderY },
        thickness: 1,
        color: col.divider,
      });
      y -= 20;

      const innerPad = 10;
      const innerX = M + innerPad;
      const wrapW = CONTENT_W - 2 * innerPad - 18;

      if (normalizedCitations.length) {
        normalizedCitations.forEach((c, index) => {
          drawSourceEntry(c, index, innerX, wrapW);
        });
      } else {
        ensureSpace(LINE);
        drawWrapped(
          "No references listed for this report.",
          innerX,
          11,
          CONTENT_W - 2 * innerPad,
          { color: col.muted }
        );
        y -= 8;
      }

      const sourcesBottomY = y - 10;
      if (sourcesTopBorderY - sourcesBottomY > 2) {
        strokeSourcesCardSides(sourcesBottomY, sourcesTopBorderY);
      }

      const pages = pdfDoc.getPages();
      const totalPages = pages.length;
      pages.forEach((p, i) => drawDisclaimerFooter(p, i + 1, totalPages));

      return await pdfDoc.save();
    } catch (err) {
      console.error("PDF generation failed:", err);
      throw err;
    }
  };

  return { exportPdf };
};

export default useExportPdf;
