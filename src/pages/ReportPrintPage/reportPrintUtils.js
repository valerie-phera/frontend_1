import { collapseDuplicateBracketRefs } from "../../shared/utils/collapseDuplicateBracketRefs";

/** Min space below "Your tailored insights" title for ≥2 lines (19px) + card padding */
export const INSIGHTS_TITLE_LINE_HEIGHT = 19;
export const INSIGHTS_MIN_BODY_LINES = 2;
export const INSIGHTS_SECTION_GAP = 10;
export const INSIGHTS_CARD_PAD_TOP = 8;
export const MIN_INSIGHTS_BLOCK_PX =
  INSIGHTS_TITLE_LINE_HEIGHT +
  INSIGHTS_SECTION_GAP +
  INSIGHTS_CARD_PAD_TOP +
  INSIGHTS_TITLE_LINE_HEIGHT * INSIGHTS_MIN_BODY_LINES;

/** Gap between overview items (matches ResultWithDetailsPage `.wrapText`) */
export const INSIGHTS_PARA_GAP_PX = 8;

/** Minimum clear space between last content line and footer divider */
export const PAGE_CONTENT_FOOTER_GAP_PX = 24;

/** @param {HTMLElement|null} pageEl */
export function getFooterContentLimit(pageEl) {
  const footer = pageEl?.querySelector("[data-footer-start]");
  if (!footer) return null;
  return footer.getBoundingClientRect().top - PAGE_CONTENT_FOOTER_GAP_PX;
}

/**
 * How many px the lowest [data-flow-block] extends below the footer safe line.
 * @param {HTMLElement|null} pageEl
 */
export function measureContentOverflow(pageEl) {
  const limit = getFooterContentLimit(pageEl);
  if (limit == null) return 0;

  const blocks = pageEl.querySelectorAll("[data-page-content] [data-flow-block]");
  let overflow = 0;

  for (const block of blocks) {
    const bottom = block.getBoundingClientRect().bottom;
    if (bottom > limit) {
      overflow = Math.max(overflow, bottom - limit);
    }
  }

  return overflow;
}

/** @param {HTMLElement|null} pageEl @param {HTMLElement|null} blockEl */
export function blockExtendsBelowFooter(pageEl, blockEl) {
  if (!pageEl || !blockEl) return false;
  const limit = getFooterContentLimit(pageEl);
  if (limit == null) return false;
  return blockEl.getBoundingClientRect().bottom > limit + 1;
}

/**
 * Sources overflow when the last citation row crosses the footer safe line.
 * More reliable than the section box alone (flex + overflow:hidden can clip content).
 * @param {HTMLElement|null} pageEl
 */
export function sourcesSectionOverflowsPage(pageEl) {
  const sourcesEl = pageEl?.querySelector("[data-sources-section]");
  if (!sourcesEl) return false;

  const limit = getFooterContentLimit(pageEl);
  if (limit == null) return false;

  const lastRow = sourcesEl.querySelector("[data-citation-row]:last-child");
  if (lastRow) {
    return lastRow.getBoundingClientRect().bottom > limit + 1;
  }

  return blockExtendsBelowFooter(pageEl, sourcesEl);
}

/** @param {string[]} a @param {string[]} b */
export function insightParagraphsEqual(a, b) {
  if (a === b) return true;
  if (!a || !b || a.length !== b.length) return false;
  return a.every((text, i) => text === b[i]);
}

/**
 * Insights on page 1 only when they can follow Reported symptoms in reading order.
 * Your details may stay on page 1 even when symptoms moved to page 2.
 */
export function canPlaceInsightsOnPage1(reportedSymptoms, showSymptoms) {
  return reportedSymptoms.length === 0 || showSymptoms;
}

/** @param {...string[]} groups */
export function mergeInsightParagraphs(...groups) {
  const seen = new Set();
  const merged = [];
  for (const group of groups) {
    for (const text of group ?? []) {
      if (seen.has(text)) continue;
      seen.add(text);
      merged.push(text);
    }
  }
  return merged;
}

/**
 * Split overview paragraphs between page 1 (above footer) and page 2.
 * @param {number} availablePx – distance from probe bottom to footer top
 * @param {string[]} paragraphs
 * @param {HTMLElement|null} measureSection – hidden [data-insights-measure] node
 */
export function paginateInsightParagraphs(availablePx, paragraphs, measureSection) {
  const all = Array.isArray(paragraphs) ? paragraphs : [];
  const budgetPx = Math.max(0, availablePx - PAGE_CONTENT_FOOTER_GAP_PX);

  if (!all.length) {
    return { page1: [], page2: [] };
  }

  if (!measureSection || budgetPx < MIN_INSIGHTS_BLOCK_PX) {
    return { page1: [], page2: all };
  }

  const fullHeight = measureSection.getBoundingClientRect().height;
  if (fullHeight <= budgetPx + 1) {
    return { page1: all, page2: [] };
  }

  const titleEl = measureSection.querySelector("[data-insights-title]");
  const cardEl = measureSection.querySelector("[data-insights-card]");
  const paraEls = [...measureSection.querySelectorAll("[data-insight-para]")];

  if (!titleEl || !cardEl || paraEls.length !== all.length) {
    return { page1: [], page2: all };
  }

  const paraHeights = paraEls.map((el) => el.getBoundingClientRect().height);
  const parasBlockHeight = paraHeights.reduce(
    (sum, h, i) => sum + h + (i > 0 ? INSIGHTS_PARA_GAP_PX : 0),
    0
  );
  const chromeHeight = Math.max(0, fullHeight - parasBlockHeight);

  let used = chromeHeight;
  const page1Indices = [];

  for (let i = 0; i < all.length; i += 1) {
    const gap = page1Indices.length > 0 ? INSIGHTS_PARA_GAP_PX : 0;
    const next = paraHeights[i];
    if (used + gap + next <= budgetPx + 1) {
      used += gap + next;
      page1Indices.push(i);
    } else {
      break;
    }
  }

  if (page1Indices.length > 0) {
    const bodyHeight = page1Indices.reduce(
      (sum, idx, j) => sum + paraHeights[idx] + (j > 0 ? INSIGHTS_PARA_GAP_PX : 0),
      0
    );
    if (bodyHeight < INSIGHTS_TITLE_LINE_HEIGHT * INSIGHTS_MIN_BODY_LINES) {
      return { page1: [], page2: all };
    }
  }

  const page1Set = new Set(page1Indices);
  const page1 = page1Indices.map((i) => all[i]);
  const page2 = all.filter((_, i) => !page1Set.has(i));

  return { page1, page2 };
}

export const formatRecommendation = (text) =>
  collapseDuplicateBracketRefs(text)
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

/** Strip HTML from deep-dive chunks (same source as ResultWithDetailsPage paragraphs). */
export function normalizeDeepDiveChunk(raw) {
  return String(raw ?? "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<button[^>]*>([^<]*)<\/button>/gi, "$1")
    .replace(/<span[^>]*>([^<]*)<\/span>/gi, "$1")
    .trim();
}

/**
 * Split one block into multiple items when it contains several **Title** / <strong> headers.
 * @param {string} text
 * @returns {string[]}
 */
export function splitDeepDiveParts(text) {
  const normalized = normalizeDeepDiveChunk(text);
  if (!normalized) return [];

  const parts = normalized
    .split(/(?=\*\*[^*]+\*\*)|(?=<strong>)/i)
    .map((p) => p.trim())
    .filter(Boolean);

  return parts.length > 0 ? parts : [normalized];
}

/**
 * @param {unknown} raw
 * @returns {string[]}
 */
export function collectDeepDiveChunks(raw) {
  if (Array.isArray(raw)) {
    return raw.flatMap((item) => {
      const s = normalizeDeepDiveChunk(item);
      if (!s) return [];
      if (/\n\s*\n/.test(s)) {
        return s
          .split(/\n\s*\n/)
          .map((chunk) => chunk.trim())
          .filter(Boolean);
      }
      return splitDeepDiveParts(s);
    });
  }

  if (raw && typeof raw === "object") {
    return null;
  }

  if (typeof raw === "string" && raw.trim()) {
    const s = normalizeDeepDiveChunk(raw);
    return s
      .split(/\n\s*\n/)
      .flatMap((chunk) => splitDeepDiveParts(chunk.trim()))
      .filter(Boolean);
  }

  return [];
}

export const splitIntoSentences = (rawText) => {
  const text = String(rawText ?? "").replace(/\s+/g, " ").trim();
  if (!text) return [];
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z0-9(])/)
    .map((s) => s.trim())
    .filter(Boolean);
};

const DEFAULT_OVERVIEW = [
  "If your discharge changes suddenly, or you feel itching, burning, or unusual odor. This could alter your pH and signal an imbalance like bacterial vaginosis or yeast infections [4].",
  "Consult your healthcare provider can help ensure everything is as it should be.",
];

const DEFAULT_DEEP_DIVE_RAW = [
  "A vaginal pH of 4.5 is within the normal range for premenopausal women. This pH level is typically maintained by the presence of Lactobacillus bacteria, which produce lactic acid and help protect against infections [2], [4]. Creamy discharge can be a normal part of your vaginal health, especially if it is not accompanied by other symptoms like itching, burning, or an unusual odor [4].",
  "Hormonal changes and vaginal flora can influence discharge and pH. Your regular menstrual cycle and current pH suggest that your vaginal environment is likely healthy and estrogenized, which supports the growth of Lactobacillus and the production of glycogen [2], [4]. However, if you notice changes in your discharge or experience discomfort, it could be worth discussing with your healthcare provider to rule out conditions like bacterial vaginosis or yeast infections, which can alter pH and discharge characteristics [4].",
];

/** @typedef {{ title: string|null, body: string }} DeepDiveSubsection */

/**
 * Same parsing as ResultWithDetailsPage: leading **Title** → subsection label.
 * @param {unknown} raw
 * @returns {DeepDiveSubsection|null}
 */
export function parseDeepDiveItem(raw) {
  const original = normalizeDeepDiveChunk(raw);
  if (!original) return null;

  const boldMatch = original.match(/^\*\*([^*]+)\*\*(?:\s*)([\s\S]*)$/);
  const strongMatch = original.match(/^<strong>([^<]*)<\/strong>(?:\s*)([\s\S]*)$/i);
  const labeled = boldMatch || strongMatch;

  if (labeled) {
    const title = labeled[1].trim();
    const body = formatRecommendation(labeled[2]);
    if (!title && !body) return null;
    return { title: title || null, body };
  }

  const body = formatRecommendation(original);
  return body ? { title: null, body } : null;
}

/** @param {DeepDiveSubsection[]} a @param {DeepDiveSubsection[]} b */
export function deepDiveSectionsEqual(a, b) {
  if (a === b) return true;
  if (!a || !b || a.length !== b.length) return false;
  return a.every((s, i) => s.title === b[i].title && s.body === b[i].body);
}

/** @param {object} data @returns {DeepDiveSubsection[]} */
export function getDeepDiveSections(data) {
  const raw = data?.recommendations ?? data?.agent_reply;

  let items = [];

  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    items = Object.entries(raw)
      .map(([title, value]) => {
        const body = formatRecommendation(
          Array.isArray(value) ? value.join("\n\n") : String(value ?? "")
        );
        const label = String(title).trim();
        if (!label && !body) return null;
        return { title: label || null, body };
      })
      .filter(Boolean);
  } else {
    const chunks = collectDeepDiveChunks(raw) ?? [];
    items = chunks.map(parseDeepDiveItem).filter(Boolean);
  }

  if (!items.length) {
    const hasExplicitRecommendations =
      data != null && Object.prototype.hasOwnProperty.call(data, "recommendations");
    const hasAgentReply = data?.agent_reply != null;
    if (hasExplicitRecommendations || hasAgentReply) {
      return [];
    }
    return DEFAULT_DEEP_DIVE_RAW.map(parseDeepDiveItem).filter(Boolean);
  }

  return items;
}

/** @deprecated Use getDeepDiveSections — flat strings for legacy callers */
export function getDeepDiveParagraphs(data) {
  return getDeepDiveSections(data).map((s) =>
    s.title ? `${s.title}${s.body ? ` ${s.body}` : ""}` : s.body
  );
}

/** @param {unknown} text */
export function formatOverviewParagraph(text) {
  return formatRecommendation(normalizeDeepDiveChunk(text));
}

/**
 * Split text into chunks that each start with a bold section label.
 * Supports `**Label:**` (backend) and `**Label** -` (overview normalization).
 * @param {unknown} rawText
 * @returns {string[]}
 */
export function splitByBoldLabels(rawText) {
  const s = String(rawText ?? "").trim();
  if (!s) return [];

  const labelRe = /\*\*[^*]+:\*\*|\*\*[^*]+\*\*\s*-\s*/g;
  const matches = [...s.matchAll(labelRe)];
  if (matches.length === 0) return [s];

  const chunks = [];
  const firstIdx = matches[0]?.index ?? 0;
  if (firstIdx > 0) {
    const leading = s.slice(0, firstIdx).trim();
    if (leading) chunks.push(leading);
  }

  for (let i = 0; i < matches.length; i += 1) {
    const start = matches[i].index ?? 0;
    const end = i + 1 < matches.length ? (matches[i + 1].index ?? s.length) : s.length;
    const chunk = s.slice(start, end).trim();
    if (chunk) chunks.push(chunk);
  }

  return chunks.length > 0 ? chunks : [s];
}

/**
 * Normalize backend insight payloads (string, array, or nested object) into text parts.
 * @param {unknown} raw
 * @returns {string[]}
 */
export function extractInsightTextParts(raw) {
  if (raw == null) return [];

  if (typeof raw === "string" || typeof raw === "number" || typeof raw === "boolean") {
    const s = normalizeDeepDiveChunk(raw);
    return s ? [s] : [];
  }

  if (Array.isArray(raw)) {
    return raw.flatMap((item) => extractInsightTextParts(item));
  }

  if (typeof raw === "object") {
    const record = /** @type {Record<string, unknown>} */ (raw);
    if (typeof record.text === "string") return extractInsightTextParts(record.text);
    if (typeof record.content === "string") return extractInsightTextParts(record.content);
    if (typeof record.body === "string") return extractInsightTextParts(record.body);
    return Object.values(record).flatMap((value) => extractInsightTextParts(value));
  }

  return [];
}

/**
 * Bullet paragraphs for insight sections (your_ph, your_symptoms, next_steps, etc.).
 * @param {unknown} raw
 * @returns {string[]}
 */
export function getInsightSectionParagraphs(raw) {
  return extractInsightTextParts(raw)
    .flatMap((part) => splitByBoldLabels(part))
    .flatMap((part) => splitIntoSentences(part))
    .map(formatOverviewParagraph)
    .filter(Boolean);
}

/** @typedef {{ title: string, key: string, paragraphs: string[] }} PostOverviewSection */

/** Sections rendered after Overview in the PDF report. */
export const POST_OVERVIEW_SECTION_DEFS = [
  { title: "Your ph", key: "your_ph" },
  { title: "Your symptoms", key: "your_symptoms" },
  { title: "Next steps", key: "next_steps" },
];

const POST_OVERVIEW_FIELD_ALIASES = {
  your_ph: ["your_ph", "yourPh", "your-ph"],
  your_symptoms: ["your_symptoms", "yourSymptoms", "your-symptoms"],
  next_steps: ["next_steps", "nextSteps", "next-steps"],
};

/** @param {object|null|undefined} data @param {string} key */
export function resolveInsightField(data, key) {
  const aliases = POST_OVERVIEW_FIELD_ALIASES[key] ?? [key];

  for (const alias of aliases) {
    const direct = data?.[alias];
    if (direct != null && direct !== "") return direct;
  }

  const nested = data?.recommendations ?? data?.agent_reply;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    for (const alias of aliases) {
      const value = nested[alias];
      if (value != null && value !== "") return value;
    }
  }

  return null;
}

/** @param {PostOverviewSection[]} sections */
export function clonePostOverviewSections(sections) {
  return sections.map((section) => ({
    ...section,
    paragraphs: [...section.paragraphs],
  }));
}

/** @param {PostOverviewSection[]} a @param {PostOverviewSection[]} b */
export function postOverviewSectionsEqual(a, b) {
  if (a === b) return true;
  if (!a || !b || a.length !== b.length) return false;
  return a.every(
    (section, index) =>
      section.key === b[index].key &&
      section.title === b[index].title &&
      insightParagraphsEqual(section.paragraphs, b[index].paragraphs)
  );
}

/**
 * Remove the last bullet from the last section (for page-1 overflow).
 * @param {PostOverviewSection[]} sections
 */
export function removeLastPostOverviewParagraph(sections) {
  const next = clonePostOverviewSections(sections);

  for (let i = next.length - 1; i >= 0; i -= 1) {
    if (next[i].paragraphs.length === 0) continue;
    const paragraph = next[i].paragraphs.pop();
    const moved = {
      key: next[i].key,
      title: next[i].title,
      paragraph,
    };
    return {
      sections: next.filter((section) => section.paragraphs.length > 0),
      moved,
    };
  }

  return null;
}

/**
 * @param {PostOverviewSection[]} sections
 * @param {{ key: string, title: string, paragraph: string }} moved
 */
export function prependPostOverviewParagraph(sections, moved) {
  const next = clonePostOverviewSections(sections);
  const existing = next.find((section) => section.key === moved.key);

  if (existing) {
    existing.paragraphs.unshift(moved.paragraph);
    return next;
  }

  return [
    {
      key: moved.key,
      title: moved.title,
      paragraphs: [moved.paragraph],
    },
    ...next,
  ];
}

/** @param {object} data @returns {PostOverviewSection[]} */
export function getPostOverviewSections(data) {
  return POST_OVERVIEW_SECTION_DEFS.map(({ title, key }) => ({
    title,
    key,
    paragraphs: getInsightSectionParagraphs(resolveInsightField(data, key)),
  })).filter((section) => section.paragraphs.length > 0);
}

/** @param {object} data */
export function getOverviewParagraphs(data) {
  const raw = data?.overview;

  if (Array.isArray(raw)) {
    if (raw.length === 0) return [];
    const items = raw.map(formatOverviewParagraph).filter(Boolean);
    if (items.length > 0) return items;
    return [];
  }

  if (raw === undefined || raw === null) {
    return DEFAULT_OVERVIEW;
  }

  const fromState = splitIntoSentences(raw).map(formatOverviewParagraph).filter(Boolean);
  return fromState.length > 0 ? fromState : [];
}

export function generateReportId() {
  return `PH-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function formatReportIdForFilename(reportId) {
  const id = reportId ?? generateReportId();
  return id.startsWith("ID-") ? id : `ID-${id}`;
}

function getLocalTimezoneAbbreviation(date = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat("en-US", { timeZoneName: "short" }).formatToParts(date);
    const tz = parts.find((p) => p.type === "timeZoneName")?.value;
    if (tz) return tz.replace(/\s+/g, "");
  } catch {
    // fall through
  }
  return "UTC";
}

/** Basename for exported report files (no extension). */
export function buildPheraReportBasename(reportId, date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  const datePart = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const timePart = `${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
  const timezone = getLocalTimezoneAbbreviation(date);
  const idPart = formatReportIdForFilename(reportId);
  return `phera-report_${datePart}_${timePart}_${timezone}_${idPart}`;
}

/** Full filename: phera-report_YYYY-MM-DD_HH-MM-SS_TZ_ID-PH-….ext */
export function buildPheraReportFilename(reportId, extension, date = new Date()) {
  const ext = extension.startsWith(".") ? extension.slice(1) : extension;
  return `${buildPheraReportBasename(reportId, date)}.${ext}`;
}

/** Payload for /report-print and HTML→PDF export (route state shape). */
export function buildReportPrintState({
  phValue,
  phLevel,
  timestamp,
  interpretation,
  state = null,
  reportId = null,
  recommendations = undefined,
  overview = undefined,
}) {
  const base = state && typeof state === "object" ? { ...state } : {};
  if (recommendations !== undefined) {
    base.recommendations = recommendations;
  }
  if (overview !== undefined) {
    base.overview = overview;
  }
  return {
    ...base,
    phValue,
    phLevel,
    timestamp,
    interpretation: interpretation ?? base.interpretation ?? "",
    reportId: reportId ?? base.reportId ?? generateReportId(),
  };
}

/** @param {object} state */
export function buildReportCitations(state) {
  const raw = state?.citations ?? [];
  return raw
    .map((c) => {
      if (!c || typeof c !== "object") return null;
      const title = c.title;
      const text =
        c.relevant_section ??
        c.reference_citation ??
        c.nlm_reference ??
        c.nlmReference ??
        c.reference ??
        c.citation;
      if (!title && !text) return null;
      const urlLinks = [
        c.doi_url ? { kind: "doi", url: String(c.doi_url) } : null,
        c.pmid_url ? { kind: "pmid", url: String(c.pmid_url) } : null,
        c.pmcid_url ? { kind: "pmcid", url: String(c.pmcid_url) } : null,
      ].filter(Boolean);
      return {
        title: title == null ? "" : String(title),
        text: text == null ? "" : String(text),
        links: urlLinks,
      };
    })
    .filter(Boolean);
}

/** Same as ResultWithDetailsPage — pull DOI/PMID/PMC out of citation body text. */
export function extractCitationLinks(rawText) {
  const text = String(rawText ?? "");

  const doiMatch = text.match(/doi:\s*([^\s,;]+)/i);
  const bareDoiMatch = text.match(/\b(10\.\d{4,}\/[^\s,;)]+)/i);
  const pmidMatch = text.match(/PMID:\s*([A-Za-z0-9]+)/i);
  const pmcidMatch =
    text.match(/PMCID:\s*([A-Za-z0-9]+)/i) ||
    text.match(/PubMed Central PMCID:\s*([A-Za-z0-9]+)/i);

  const links = [];
  if (doiMatch?.[1]) links.push({ kind: "doi", value: doiMatch[1] });
  else if (bareDoiMatch?.[1]) links.push({ kind: "doi", value: bareDoiMatch[1] });
  if (pmidMatch?.[1]) links.push({ kind: "pmid", value: pmidMatch[1] });
  if (pmcidMatch?.[1]) links.push({ kind: "pmcid", value: pmcidMatch[1] });

  let main = text;
  main = main.replace(/doi:\s*[^\s,;]+/gi, "");
  main = main.replace(/https?:\/\/(?:dx\.)?doi\.org\/[^\s,;)]+/gi, "");
  main = main.replace(/\b10\.\d{4,}\/[^\s,;)]+/gi, "");
  main = main.replace(/PMID:\s*[A-Za-z0-9]+/gi, "");
  main = main.replace(/PMCID:\s*[A-Za-z0-9]+/gi, "");
  main = main.replace(/PubMed Central PMCID:\s*[A-Za-z0-9]+/gi, "");
  main = main.replace(/\s{2,}/g, " ").replace(/\s+\./g, ".").trim();

  return { mainText: main, links };
}

/** @param {string} rawText */
export function splitCitationTitleAndBody(rawText) {
  const { mainText, links } = extractCitationLinks(rawText);
  const parts = mainText.split(". ").map((p) => p.trim()).filter(Boolean);
  const title = parts[1] ? parts[1].replace(/\.$/, "") : mainText;
  const body = parts.length > 2 ? parts.slice(2).join(". ").trim() : "";
  return { title, body, links };
}

/** @param {unknown} link */
export function citationLinkLabel(link) {
  if (!link) return "";
  if (typeof link === "object" && link.kind) {
    if (link.kind === "doi") return "DOI";
    if (link.kind === "pmid") return "PMID";
    if (link.kind === "pmcid") return "PMCID";
  }
  const s = String(link ?? "").trim();
  if (/^doi:/i.test(s)) return "DOI";
  if (/^PMCID:/i.test(s)) return "PMCID";
  if (/^PMID:/i.test(s)) return "PMID";
  return s;
}

/** @param {unknown} link */
export function citationLinkHref(link) {
  if (!link) return null;

  const canonicalize = (href) => {
    const s = String(href ?? "").trim();
    if (!s) return null;
    const doiMatch =
      s.match(/https?:\/\/(?:dx\.)?doi\.org\/(.+)$/i) || s.match(/^doi:(.+)$/i);
    if (doiMatch?.[1]) {
      const doi = doiMatch[1].trim().replace(/^doi:\s*/i, "");
      return doi ? `https://doi.org/${doi}` : null;
    }
    const pmidMatch =
      s.match(/https?:\/\/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)\/?/i) ||
      s.match(/^PMID:(\d+)$/i);
    if (pmidMatch?.[1]) {
      return `https://pubmed.ncbi.nlm.nih.gov/${pmidMatch[1]}/`;
    }
    const pmcMatch =
      s.match(/https?:\/\/pmc\.ncbi\.nlm\.nih\.gov\/articles\/(PMC)?(\d+)\/?/i) ||
      s.match(/^PMCID:\s*(PMC)?(\d+)$/i);
    if (pmcMatch?.[2]) {
      return `https://pmc.ncbi.nlm.nih.gov/articles/${pmcMatch[2]}/`;
    }
    return s;
  };

  if (typeof link === "object" && link.url) return canonicalize(link.url);
  if (typeof link === "object" && link.kind && link.value) {
    const v = String(link.value).trim();
    if (!v) return null;
    if (link.kind === "doi") return `https://doi.org/${v.replace(/^doi:\s*/i, "")}`;
    if (link.kind === "pmid") {
      return `https://pubmed.ncbi.nlm.nih.gov/${v.replace(/^PMID:\s*/i, "")}/`;
    }
    if (link.kind === "pmcid") {
      const id = v.replace(/^PMCID:\s*/i, "").replace(/^PMC/i, "").trim();
      return `https://pmc.ncbi.nlm.nih.gov/articles/${id}/`;
    }
  }
  const s = String(link).trim();
  const doi = s.match(/^doi:(.+)$/i)?.[1]?.trim();
  const pmid = s.match(/^PMID:(.+)$/i)?.[1]?.trim();
  const pmcid = s.match(/^PMCID:(.+)$/i)?.[1]?.trim();
  if (doi) return `https://doi.org/${doi}`;
  if (pmid) return `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;
  if (pmcid) return `https://pmc.ncbi.nlm.nih.gov/articles/${pmcid.replace(/^PMC/i, "")}/`;
  return null;
}

/** @param {unknown[]} urlLinks @param {unknown[]} textLinks */
function mergeUniqueCitationLinks(urlLinks, textLinks) {
  const merged = [...(Array.isArray(urlLinks) ? urlLinks : []), ...(Array.isArray(textLinks) ? textLinks : [])];
  const seen = new Set();
  return merged.filter((l) => {
    const href = citationLinkHref(l);
    if (!href) return false;
    if (seen.has(href)) return false;
    seen.add(href);
    return true;
  });
}

/** @param {{ title?: string, text?: string, links?: { kind?: string, url?: string, value?: string }[] }} citation */
export function parseCitationMeta(citation) {
  const fullText = String(citation?.text ?? "");
  const { mainText, links: textLinks } = extractCitationLinks(fullText);
  const parsed = splitCitationTitleAndBody(fullText);

  const title =
    citation?.title && String(citation.title).trim()
      ? String(citation.title).trim()
      : parsed.title;

  const uniqueLinks = mergeUniqueCitationLinks(citation?.links, textLinks);
  const links = uniqueLinks
    .map((l) => {
      const href = citationLinkHref(l);
      if (!href) return null;
      return { label: citationLinkLabel(l), href };
    })
    .filter(Boolean);

  return {
    title: title || "Reference",
    detailText: mainText,
    links,
  };
}
