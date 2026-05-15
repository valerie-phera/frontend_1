import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
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
    overviewInsights = null,
    citations = [],
    state = null,
    reportId: reportIdIn = null,
  }) => {
    try {
      const deepDiveRecommendations = Array.isArray(recommendations)
        ? recommendations
        : [String(recommendations || "")];

      const overviewBullets = Array.isArray(overviewInsights)
        ? overviewInsights.map((t) => String(t || "")).filter(Boolean)
        : [];

      const W = 595;
      // Figma frame `Result_pdf_A4` (1033:3218) uses 595×940
      const H = 940;
      const M = 24;
      const CONTENT_W = 547;
      const HEADER_H = 62;
      const FOOTER_RESERVE = 102;
      const LINE = 14;
      const LINE_DEEP = 16;

      const yFromTop = (t) => H - t;

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
        // Figma (Secondary/50, Secondary/900)
        pillBg: rgb(241 / 255, 246 / 255, 244 / 255), // #F1F6F4
        pillText: rgb(38 / 255, 62 / 255, 58 / 255), // #263E3A
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
      pdfDoc.registerFontkit(fontkit);

      // Optional: load exact fonts used in Figma to reduce layout differences.
      // Put these files into `public/fonts/` (Vite serves them as static assets):
      // - Inter-Regular.ttf
      // - Inter-SemiBold.ttf (or Inter-Bold.ttf)
      // - OpenSans-Regular.ttf
      // - OpenSans-SemiBold.ttf
      const isSupportedFontBytes = (ab) => {
        if (!ab || ab.byteLength < 4) return false;
        const u8 = new Uint8Array(ab);
        const sig = String.fromCharCode(u8[0], u8[1], u8[2], u8[3]);
        // TTF: 0x00010000, 'true', 'typ1' ; OTF: 'OTTO'
        const isTtf =
          (u8[0] === 0x00 && u8[1] === 0x01 && u8[2] === 0x00 && u8[3] === 0x00) ||
          sig === "true" ||
          sig === "typ1";
        const isOtf = sig === "OTTO";
        // Reject WOFF/WOFF2
        const isWoff = sig === "wOFF" || sig === "wOF2";
        return (isTtf || isOtf) && !isWoff;
      };

      const loadFontBytes = async (path) => {
        try {
          const res = await fetch(path);
          if (!res.ok) return null;
          const ab = await res.arrayBuffer();
          if (!isSupportedFontBytes(ab)) return null;
          return ab;
        } catch {
          return null;
        }
      };

      const interRegularBytes = await loadFontBytes("/fonts/Inter-Regular.ttf");
      const interSemiBoldBytes = await loadFontBytes("/fonts/Inter-SemiBold.ttf");
      const openSansRegularBytes = await loadFontBytes("/fonts/OpenSans-Regular.ttf");
      const openSansSemiBoldBytes = await loadFontBytes("/fonts/OpenSans-SemiBold.ttf");

      // Fallback to built-in fonts if custom TTFs are missing.
      const safeEmbed = async (bytes, fallback) => {
        try {
          if (!bytes) return await pdfDoc.embedFont(fallback);
          return await pdfDoc.embedFont(bytes);
        } catch {
          return await pdfDoc.embedFont(fallback);
        }
      };

      const font =
        (interRegularBytes && (await safeEmbed(interRegularBytes, StandardFonts.Helvetica))) ||
        (openSansRegularBytes && (await safeEmbed(openSansRegularBytes, StandardFonts.Helvetica))) ||
        (await pdfDoc.embedFont(StandardFonts.Helvetica));

      const fontBold =
        (interSemiBoldBytes && (await safeEmbed(interSemiBoldBytes, StandardFonts.HelveticaBold))) ||
        (openSansSemiBoldBytes && (await safeEmbed(openSansSemiBoldBytes, StandardFonts.HelveticaBold))) ||
        (await pdfDoc.embedFont(StandardFonts.HelveticaBold));

      const logoBytes = await fetch(logoSrc).then((res) => res.arrayBuffer());
      const logoImage = await pdfDoc.embedPng(logoBytes);
      const logoHeaderW = 90;
      const logoHeaderH = 34; // Figma header logo box: 90×34
      const logoFooterW = 50.71;
      const logoFooterH = 19.35; // Figma footer logo box: 50.71×19.35

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
            const isRef = /^\[\d+\]$/.test(c);
            tokens.push({
              text: c,
              bold: !!run.bold,
              color: isRef ? col.refTeal : undefined,
            });
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
          page.drawText(t.text, {
            x: cursorX,
            y,
            size,
            font: f,
            color: t.color || color || col.body,
          });
          cursorX += f.widthOfTextAtSize(t.text, size);
        }
      };

      const drawWrapped = (text, x, size, maxWidth = CONTENT_W - 20, options = {}) => {
        const color = options.color ?? col.body;
        const lineHeight = options.lineHeight ?? LINE;
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

      const drawRoundedRect = ({ x, y, width, height, radius, color, borderColor, borderWidth }) => {
        // pdf-lib supports rounded rectangles directly via `borderRadius`
        // (unlike CSS, this is per-rectangle geometry).
        page.drawRectangle({
          x,
          y,
          width,
          height,
          color,
          borderColor,
          borderWidth,
          borderRadius: radius,
        });
      };

      const strokeDeepCardBorder = (topY, bottomY) => {
        drawRoundedRect({
          x: M,
          y: bottomY,
          width: CONTENT_W,
          height: topY - bottomY,
          radius: 10,
          borderColor: col.divider,
          borderWidth: 1,
          // IMPORTANT: drawn after content — do not fill (it would cover text)
          color: undefined,
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
          // Match header padding (top:14) and two lines with 4px gap
          y: yFromTop(28),
          size: dateSize,
          font,
          color: col.black,
        });
        page.drawText(`Report ID: ${reportId}`, {
          x: rightX,
          y: yFromTop(44),
          size: dateSize,
          font,
          color: col.black,
        });

        // Start content after header; align with Figma title block starting at y=77 (from top)
        y = yFromTop(77);

        page.drawText("Vaginal pH Test Report", {
          x: M,
          y,
          size: 20,
          font: fontBold,
          color: col.black,
        });
        y -= 26; // keep existing vertical rhythm (close to Figma gap 6px + font metrics)

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
          // Figma divider at y=151 from top, width=547
          start: { x: M, y: yFromTop(151) },
          end: { x: M + CONTENT_W, y: yFromTop(151) },
          thickness: 1,
          color: col.divider,
        });
        // Figma content block starts at y=167 from top
        y = yFromTop(167);
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

        drawRoundedRect({
          x: M,
          y: boxY,
          width: CONTENT_W,
          height: boxH,
          radius: 10,
          color: rgb(1, 1, 1),
          borderColor: col.divider,
          borderWidth: 1,
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
        // Match Figma card (1033:3231)
        const padY = 16;
        const padX = 14;
        const gap = 16;
        const radius = 10;

        const titleSize = 16; // style_FITONC
        const pillFontSize = 12; // style_PE9TTA-ish
        const pillH = 18; // approx (3px top + 12 + 4px bottom)

        const phStr = Number(phValue).toFixed(1);
        const phSize = 42; // style_JO4R5U
        const phLabelSize = 10; // style_3PSR8J

        const pillText = safe(phLevel);
        const pillW = Math.max(font.widthOfTextAtSize(pillText, pillFontSize) + 40, 92);

        const leftColW = 105; // layout_8Q6LOY
        const rightColW = CONTENT_W - padX * 2 - leftColW - gap;

        const interpSource = stripTags(safe(interpretation));

        // Right card (white) with left accent bar
        const accentW = 6; // fill_G0MJ7X bar (strokeWeight 6)
        const rightPad = 12;
        const rightTextMaxW = rightColW - accentW - rightPad * 2;
        const rightTextSize = 14; // style_EABB7T
        const rightLineH = 16;
        const rightLines = measureWrappedLines(interpSource, rightTextMaxW, rightTextSize);
        const rightCardH = Math.max(70, rightLines * rightLineH + 20);

        const leftStackH = pillH + 14 + phSize + 6 + phLabelSize;
        const contentH = Math.max(leftStackH, rightCardH);
        const blockH = padY + titleSize + 16 + contentH + padY;

        ensureSpace(blockH + 24);

        const top = y;
        const bottom = top - blockH;

        drawRoundedRect({
          x: M,
          y: bottom,
          width: CONTENT_W,
          height: blockH,
          radius,
          color: col.cardBg,
          borderColor: col.cardStroke,
          borderWidth: 1,
        });

        let cy = top - padY;
        page.drawText("Interpretation", {
          x: M + padX,
          y: cy - titleSize + 2,
          size: titleSize,
          font: fontBold,
          color: col.black,
        });

        cy -= titleSize + 16;

        // Left column
        const leftX = M + padX;

        // Pill (Figma: fill #EFF1FA, stroke/text #080F33, radius 100)
        page.drawRectangle({
          x: leftX,
          y: cy - pillH,
          width: pillW,
          height: pillH,
          color: col.pillBg ?? col.cardBg,
          borderColor: col.pillText,
          borderWidth: 0.5,
          borderRadius: 100,
        });
        // Icon: arrow-up is in Figma, but for PDF we keep a minimal dot marker
        page.drawCircle({
          x: leftX + 10,
          y: cy - pillH / 2,
          size: 3,
          color: col.pillText,
        });
        page.drawText(pillText, {
          x: leftX + 18,
          y: cy - pillH + 4,
          size: pillFontSize,
          font,
          color: col.pillText,
        });

        const phTopY = cy - pillH - 14;
        // Center the pH value in a 87×42 box (layout_ATL7TV)
        const phBoxW = 87;
        const phBoxH = 42;
        const phBoxX = leftX;
        const phBoxY = phTopY - phBoxH;
        const phW = fontBold.widthOfTextAtSize(phStr, phSize);
        page.drawText(phStr, {
          x: phBoxX + (phBoxW - phW) / 2,
          y: phBoxY,
          size: phSize,
          font: fontBold,
          color: col.phDark,
        });
        const labelW = font.widthOfTextAtSize("pH value", phLabelSize);
        page.drawText("pH value", {
          x: phBoxX + (phBoxW - labelW) / 2,
          y: phBoxY - 14,
          size: phLabelSize,
          font,
          color: col.phDark,
        });

        // Right column card
        const rightX = leftX + leftColW + gap;
        const rightTop = cy;
        const rightBottom = rightTop - rightCardH;
        drawRoundedRect({
          x: rightX,
          y: rightBottom,
          width: rightColW,
          height: rightCardH,
          radius,
          color: rgb(1, 1, 1),
          borderColor: col.divider,
          borderWidth: 1,
        });
        page.drawRectangle({
          x: rightX,
          y: rightBottom,
          width: accentW,
          height: rightCardH,
          color: col.accentBar,
          borderRadius: radius,
        });

        y = rightTop - 14;
        drawWrapped(interpSource, rightX + accentW + rightPad, rightTextSize, rightTextMaxW, {
          color: col.body,
          lineHeight: rightLineH,
        });

        y = bottom - 18;
      };

      const drawBulletParagraph = (html, opts = {}) => {
        const isDeep = activeBulletSection === "deepDive";
        const textSize = 14; // Figma body text for both sections
        const inner = opts.innerX ?? M;
        const bulletColor = isDeep ? col.bulletDeep : col.bullet;

        ensureSpace(textSize + 10);
        noteDeepCardTop();
        // Figma bullet is 7×7 (radius 3.5)
        page.drawCircle({
          x: inner + 14,
          y: y + 6,
          size: 3.5,
          color: bulletColor,
        });

        const textX = inner + 26;
        const maxW = opts.maxW ?? (CONTENT_W - 36);
        drawWrapped(html, textX, textSize, maxW, { color: col.body, lineHeight: 16 });
        // Spacing between bullet items
        y -= 10;
      };

      const linkChipLabel = (link) => {
        const s = String(link ?? "").trim();
        if (/^doi:/i.test(s)) return "DOI";
        if (/^PMC/i.test(s)) return "PMC";
        return s.length > 28 ? `${s.slice(0, 26)}…` : s;
      };

      const strokeSourcesCardSides = (bottomY, topY) => {
        // kept for backward-compat, but sources are now rendered as full rounded cards
        drawRoundedRect({
          x: M,
          y: bottomY,
          width: CONTENT_W,
          height: topY - bottomY,
          radius: 10,
          color: rgb(1, 1, 1),
          borderColor: col.divider,
          borderWidth: 1,
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
        y -= 10;
      };

      const drawSmallNoticeCard = (bulletText, noteText) => {
        // matches small card on page 2 (yellow bullet + separate note line)
        const padX = 10;
        const padY = 12;
        const maxW = CONTENT_W - (padX * 2 + 26);
        const bulletH = measureWrappedLines(bulletText, maxW, 14) * 16 + 10;
        const noteH = noteText ? measureWrappedLines(noteText, CONTENT_W - padX * 2, 14) * 16 + 6 : 0;
        const cardH = Math.max(78, padY * 2 + bulletH + (noteText ? 16 + noteH : 0));

        ensureSpace(cardH + 16);
        const top = y + 6;
        drawRoundedRect({
          x: M,
          y: top - cardH,
          width: CONTENT_W,
          height: cardH,
          radius: 10,
          color: rgb(1, 1, 1),
          borderColor: col.divider,
          borderWidth: 1,
        });

        // bullet line (yellow)
        const bulletY = top - padY - 14;
        page.drawCircle({
          x: M + padX + 14,
          y: bulletY + 6,
          size: 3.5,
          color: col.bulletDeep,
        });
        y = bulletY;
        drawWrapped(bulletText, M + padX + 26, 14, maxW, { color: col.body, lineHeight: 16 });

        if (noteText) {
          y -= 14;
          drawWrapped(noteText, M + padX, 14, CONTENT_W - padX * 2, { color: col.body, lineHeight: 16 });
        }

        y = top - cardH - 18;
      };

      const drawDisclaimerFooter = (p, idx, total) => {
        // Figma bottom divider at y=860 from top (1px line)
        const footerY = yFromTop(860);
        p.drawLine({
          start: { x: M, y: footerY },
          end: { x: M + CONTENT_W, y: footerY },
          thickness: 1,
          color: col.divider,
        });

        const disc =
          "This report is generated by pHera for informational purposes only. It does not constitute medical advice or diagnosis. Please consult a qualified healthcare provider for any medical concerns";

        const discSize = 10;
        // Figma disclaimer text block at y=872 from top
        let ty = yFromTop(872) + 6;
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
          // Figma footer row at y=907 from top
          y: yFromTop(907) - logoFooterH,
          width: logoFooterW,
          height: logoFooterH,
        });

        const pageLabel = `${idx}/${total}`;
        const pw = font.widthOfTextAtSize(pageLabel, discSize);
        p.drawText(pageLabel, {
          x: W - M - pw,
          y: yFromTop(907) - 12,
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
        page.drawText(isDeepDive ? "Deep dive" : "Your personalized insights", {
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
      const isOverviewBullets = overviewBullets.length > 0;
      const bullets = isOverviewBullets ? overviewBullets : deepDiveRecommendations;

      // In the PDF mock, the first section ("Your personalized insights") is a bordered white card.
      const drawInsightsCard = (items) => {
        const cardPadX = 10;
        const cardPadY = 8;
        const innerX = M + cardPadX;
        const maxW = CONTENT_W - 2 * cardPadX - 26; // minus bullet + gap
        const lineH = 16;
        const size = 14;

        const totalLines = items.reduce((acc, t) => acc + measureWrappedLines(t, maxW, size), 0);
        const cardH = Math.max(
          98,
          cardPadY * 2 + totalLines * lineH + Math.max(0, items.length - 1) * 10
        );

        ensureSpace(cardH + 16);
        const top = y + 6;
        drawRoundedRect({
          x: M,
          y: top - cardH,
          width: CONTENT_W,
          height: cardH,
          radius: 10,
          color: rgb(1, 1, 1),
          borderColor: col.divider,
          borderWidth: 1,
        });

        y = top - cardPadY - 14;
        for (const t of items) {
          drawBulletParagraph(t, { innerX, maxW });
        }
        y = top - cardH - 18;
      };

      if (isOverviewBullets && bullets.length) {
        // Draw heading once then the card
        drawInsightsHeading(false);
        firstBulletsPage = false;
        drawInsightsCard(bullets);
      } else {
        for (let i = 0; i < bullets.length; i++) {
        let maxW = CONTENT_W - (activeBulletSection === "deepDive" ? 48 : 36);
        let textSize = activeBulletSection === "deepDive" ? 14 : 12;
        let lineStep = activeBulletSection === "deepDive" ? LINE_DEEP : LINE;
        let approx =
          measureWrappedLines(bullets[i], maxW, textSize) * lineStep + 40;

        if (y - approx < FOOTER_RESERVE) {
          newPage();
          // For Overview ("Your personalized insights"), do NOT repeat the heading on
          // subsequent pages — just continue bullets. "Deep dive" starts only after Overview ends.
          if (!isOverviewBullets) {
            drawInsightsHeading(!firstBulletsPage);
          } else {
            activeBulletSection = "insights";
          }
          firstBulletsPage = false;
          maxW = CONTENT_W - (activeBulletSection === "deepDive" ? 48 : 36);
          textSize = activeBulletSection === "deepDive" ? 14 : 12;
          lineStep = activeBulletSection === "deepDive" ? LINE_DEEP : LINE;
          approx =
            measureWrappedLines(bullets[i], maxW, textSize) * lineStep + 40;
        }
        let pageGuard = 0;
        while (y - approx < FOOTER_RESERVE && pageGuard++ < 40) {
          newPage();
        }

        if (i === 0 && firstBulletsPage) {
          drawInsightsHeading(false);
          firstBulletsPage = false;
        }

        drawBulletParagraph(bullets[i]);
        }
      }

      // If we rendered Overview bullets into "Your personalized insights", also render
      // the full recommendations as the "Deep dive" section next.
      if (overviewBullets.length && deepDiveRecommendations.length) {
        // Small notice card (yellow bullet + extra line) before "Deep dive"
        // Heuristic: first deep-dive paragraph becomes the bullet line;
        // if the next paragraph is short and not a citation-heavy block, treat it as the note.
        const first = deepDiveRecommendations[0];
        const second = deepDiveRecommendations[1];
        const secondIsNote =
          typeof second === "string" &&
          stripTags(second).length > 0 &&
          stripTags(second).length < 140 &&
          !/\[\d+\]/.test(second);

        // Ensure it appears at top of next page, as in the design.
        newPage();
        drawSmallNoticeCard(first, secondIsNote ? second : "");

        const deepDiveStartIndex = secondIsNote ? 2 : 1;

        let deepDiveHeadingDrawn = false;
        for (let i = deepDiveStartIndex; i < deepDiveRecommendations.length; i++) {
          let maxW = CONTENT_W - (activeBulletSection === "deepDive" ? 48 : 36);
          let textSize = activeBulletSection === "deepDive" ? 14 : 12;
          let lineStep = activeBulletSection === "deepDive" ? LINE_DEEP : LINE;
          let approx =
            measureWrappedLines(deepDiveRecommendations[i], maxW, textSize) * lineStep + 40;

          // Draw the Deep dive heading only when we are sure the next bullet
          // will be rendered on the same page (prevents duplicated headings).
          if (!deepDiveHeadingDrawn) {
            ensureSpace(40);
            if (y - (approx + 22) < FOOTER_RESERVE) {
              newPage();
            }
            drawInsightsHeading(true);
            deepDiveHeadingDrawn = true;
          }

          if (y - approx < FOOTER_RESERVE) {
            newPage();
            drawInsightsHeading(true);
            maxW = CONTENT_W - (activeBulletSection === "deepDive" ? 48 : 36);
            textSize = activeBulletSection === "deepDive" ? 14 : 12;
            lineStep = activeBulletSection === "deepDive" ? LINE_DEEP : LINE;
            approx =
              measureWrappedLines(deepDiveRecommendations[i], maxW, textSize) * lineStep + 40;
          }

          drawBulletParagraph(deepDiveRecommendations[i]);
        }
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

      const drawSourcesCardPage = (items, startIndex, showHeading) => {
        closeDeepCardIfOpen();
        ensureSpace(56);
        if (y < FOOTER_RESERVE + 120) newPage();

        if (showHeading) {
          page.drawText("Sources", {
            x: M,
            y,
            size: 16,
            font: fontBold,
            color: col.body,
          });
          y -= 24;
        }

        const cardTop = y + 6;
        const innerPad = 10;
        const innerX = M + innerPad;
        const wrapW = CONTENT_W - 2 * innerPad - 18;

        // compute how many entries fit on this page
        let idx = startIndex;
        let cursorY = y - innerPad;
        const bottomLimit = FOOTER_RESERVE + 14;

        const estimateEntryH = (c) => {
          const parsed = splitCitationTitleAndBody(c.text);
          const paperTitle = (c.title && String(c.title).trim()) || parsed.title || "";
          const titleHtml = paperTitle ? `<strong>${safe(paperTitle)}</strong>` : "";
          const linesTitle = paperTitle ? measureWrappedLines(titleHtml, wrapW, 14) : 1;
          const linesMeta = parsed.body ? measureWrappedLines(parsed.body, wrapW, 11) : 0;
          const links = parsed.links;
          return (
            linesTitle * LINE_DEEP +
            (linesMeta ? linesMeta * 12 : 0) +
            (links.length ? LINE_DEEP : 0) +
            18
          );
        };

        while (idx < items.length) {
          const h = estimateEntryH(items[idx]);
          if (cursorY - h < bottomLimit) break;
          cursorY -= h;
          idx++;
        }

        const pageItems = items.slice(startIndex, idx);
        const hasMore = idx < items.length;

        const cardBottom = hasMore ? bottomLimit : cursorY - 6;
        const cardH = Math.max(98, cardTop - cardBottom);

        // rounded card container
        drawRoundedRect({
          x: M,
          y: cardTop - cardH,
          width: CONTENT_W,
          height: cardH,
          radius: 10,
          color: rgb(1, 1, 1),
          borderColor: col.divider,
          borderWidth: 1,
        });

        // render entries inside card, with separators
        y = cardTop - innerPad - 14;
        pageItems.forEach((c, localIdx) => {
          const globalIndex = startIndex + localIdx;
          const beforeY = y;
          drawSourceEntry(c, globalIndex, innerX, wrapW);
          const afterY = y;

          // separator line between entries (except last on this page)
          if (localIdx < pageItems.length - 1) {
            const lineY = afterY + 6;
            page.drawLine({
              start: { x: M + innerPad, y: lineY },
              end: { x: M + CONTENT_W - innerPad, y: lineY },
              thickness: 1,
              color: col.rowBorder,
            });
            y -= 8;
          } else {
            // keep spacing consistent
            y = afterY - 4;
          }
          if (y > beforeY - 2) y = beforeY - 18;
        });

        // advance cursor to below card
        y = cardTop - cardH - 18;
        return { nextIndex: idx, hasMore };
      };

      // Render Sources across pages (heading only on first page)
      let sourcesIndex = 0;
      if (normalizedCitations.length === 0) {
        drawSourcesCardPage([{ title: "", text: "No references listed for this report." }], 0, true);
      } else {
        let showHeading = true;
        while (sourcesIndex < normalizedCitations.length) {
          const { nextIndex } = drawSourcesCardPage(normalizedCitations, sourcesIndex, showHeading);
          sourcesIndex = nextIndex;
          showHeading = false;
          if (sourcesIndex < normalizedCitations.length) newPage();
        }
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
