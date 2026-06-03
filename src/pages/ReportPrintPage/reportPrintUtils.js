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
 * Patient blocks (Your details / Reported symptoms) must fit above the pre-insights probe,
 * not in the footer margin reserved for Overview and later sections.
 * @param {HTMLElement|null} pageEl
 * @param {HTMLElement|null} probeEl
 */
export function getPatientBlockLimit(pageEl, probeEl) {
  if (probeEl) {
    return probeEl.getBoundingClientRect().top - PAGE_CONTENT_FOOTER_GAP_PX;
  }
  return getFooterContentLimit(pageEl);
}

/** @param {HTMLElement|null} pageEl @param {HTMLElement|null} blockEl @param {HTMLElement|null} probeEl */
export function blockExtendsBelowPatientLimit(pageEl, blockEl, probeEl) {
  if (!pageEl || !blockEl) return false;
  const limit = getPatientBlockLimit(pageEl, probeEl);
  if (limit == null) return false;
  return blockEl.getBoundingClientRect().bottom > limit + 1;
}

/**
 * Whether a patient table fits in the gap after an anchor block and before the probe.
 * @param {HTMLElement|null} anchorEl – bottom of Interpretation or Your details
 * @param {HTMLElement|null} sectionEl – section to place
 * @param {HTMLElement|null} probeEl
 * @param {HTMLElement|null} pageEl
 * @param {number} [contentGapPx]
 */
export function patientSectionFitsAfterAnchor(
  anchorEl,
  sectionEl,
  probeEl,
  pageEl,
  contentGapPx = 24
) {
  if (!sectionEl) return true;

  const limit = getPatientBlockLimit(pageEl, probeEl);
  if (limit == null) return true;

  const anchorBottom =
    anchorEl?.getBoundingClientRect().bottom ??
    pageEl?.querySelector("[data-page-content]")?.getBoundingClientRect().top ??
    0;

  const neededBottom = anchorBottom + contentGapPx + sectionEl.getBoundingClientRect().height;
  return neededBottom <= limit + 1;
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

/** Like formatRecommendation but keeps `**bold**` markers for PDF/UI rich text. */
export function formatInsightRichText(text) {
  return collapseDuplicateBracketRefs(normalizeDeepDiveChunk(text))
    .replace(/<strong>([^<]*)<\/strong>/gi, "**$1**")
    .replace(/\s+/g, " ")
    .trim();
}

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

/** Same sentence splitting as ResultWithDetailsPage deep-dive bullets. */
export const splitIntoSentences = (rawText) => {
  const text = String(rawText ?? "").replace(/\s+/g, " ").trim();
  if (!text) return [];

  const out = [];
  let start = 0;

  const isDigit = (ch) => ch >= "0" && ch <= "9";

  const pushChunk = (endExclusive) => {
    const chunk = text.slice(start, endExclusive).trim();
    if (chunk) out.push(chunk);
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch !== "." && ch !== "!" && ch !== "?") continue;

    const next = text[i + 1];
    const followedBySpaceOrEnd = next === " " || next === undefined;
    if (!followedBySpaceOrEnd) continue;

    if (ch === ".") {
      const prev = text[i - 1];
      let j = i + 1;
      while (j < text.length && text[j] === " ") j++;
      const nextNonSpace = text[j];
      if (isDigit(prev) && isDigit(nextNonSpace)) continue;
    }

    pushChunk(i + 1);
    let k = i + 1;
    while (k < text.length && text[k] === " ") k++;
    start = k;
    i = k - 1;
  }

  pushChunk(text.length);
  return out;
};

/** @param {unknown} raw @returns {{ title: string|null, body: string }[]} */
export function insightFieldToDeepDiveSubsections(title, raw) {
  const paragraphs = getInsightSectionParagraphs(raw);
  if (!paragraphs.length) return [];

  return paragraphs.map((body, index) => ({
    title: index === 0 ? title : null,
    body,
  }));
}

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
    const body = formatInsightRichText(labeled[2]);
    if (!title && !body) return null;
    return { title: title || null, body };
  }

  const body = formatInsightRichText(original);
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
  const fromInsightFields = POST_OVERVIEW_SECTION_DEFS.flatMap(({ title, key }) =>
    insightFieldToDeepDiveSubsections(title, resolveInsightField(data, key))
  );

  let items = [];

  if (fromInsightFields.length > 0) {
    items = fromInsightFields;
  } else {
    const raw = data?.recommendations ?? data?.agent_reply;

    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      items = Object.entries(raw).flatMap(([title, value]) => {
        const label = String(title).trim();
        const subsections = insightFieldToDeepDiveSubsections(label || null, value);
        return subsections.length > 0 ? subsections : [];
      });
    } else {
      const chunks = collectDeepDiveChunks(raw) ?? [];
      items = chunks.map(parseDeepDiveItem).filter(Boolean);
    }
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
  return formatInsightRichText(text);
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
 * Bullet paragraphs for insight sections (your_ph, your_symptoms, your_personal_baseline, etc.).
 * @param {unknown} raw
 * @returns {string[]}
 */
export function getInsightSectionParagraphs(raw) {
  const seen = new Set();
  return extractInsightTextParts(raw)
    .flatMap((part) => {
      const text = String(part ?? "").trim();
      if (!text) return [];
      if (/\n\s*\n/.test(text)) {
        return text
          .split(/\n\s*\n/)
          .map((chunk) => chunk.trim())
          .filter(Boolean);
      }
      return [text];
    })
    .flatMap((part) => splitByBoldLabels(part))
    .flatMap((part) => splitIntoSentences(part))
    .map(formatOverviewParagraph)
    .filter(Boolean)
    .filter((paragraph) => {
      if (seen.has(paragraph)) return false;
      seen.add(paragraph);
      return true;
    });
}

/** @typedef {{ title: string, key: string, paragraphs: string[] }} PostOverviewSection */

/** Sections rendered after Overview in the PDF report. */
export const POST_OVERVIEW_SECTION_DEFS = [
  { title: "Your ph", key: "your_ph" },
  { title: "Your symptoms", key: "your_symptoms" },
  { title: "Your personal baseline", key: "your_personal_baseline" },
  { title: "Your health context", key: "your_health_context" },
  { title: "Next steps", key: "next_steps" },
];

const POST_OVERVIEW_FIELD_ALIASES = {
  your_ph: ["your_ph", "yourPh", "your-ph"],
  your_symptoms: ["your_symptoms", "yourSymptoms", "your-symptoms"],
  your_personal_baseline: [
    "your_personal_baseline",
    "yourPersonalBaseline",
    "your-personal-baseline",
  ],
  your_health_context: [
    "your_health_context",
    "yourHealthContext",
    "your-health-context",
  ],
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
 * Remove the last bullet from the last section (page overflow → next page).
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

/** @param {PostOverviewSection[]} sections @param {{ key: string, paragraph: string }} moved */
export function postOverviewSectionsHasParagraph(sections, moved) {
  const section = sections?.find((item) => item.key === moved.key);
  return section?.paragraphs.includes(moved.paragraph) ?? false;
}

/**
 * For each page slice, whether a post-overview section title should render
 * (false when the same section continues from a prior page).
 * @param {PostOverviewSection[][]} sectionListsInOrder
 * @returns {Map<string, boolean>[]}
 */
export function buildPostSectionTitleVisibility(sectionListsInOrder) {
  const seen = new Set();

  return sectionListsInOrder.map((sections) => {
    const visibility = new Map();
    for (const section of sections ?? []) {
      if (!section.paragraphs.length) continue;
      visibility.set(section.key, !seen.has(section.key));
      seen.add(section.key);
    }
    return visibility;
  });
}

/**
 * Merge split page slices back into canonical section order without duplicate bullets.
 * @param {PostOverviewSection[][]} lists
 * @param {PostOverviewSection[]} canonical
 */
export function consolidatePostOverviewSections(lists, canonical) {
  const seenByKey = new Map();

  for (const list of lists) {
    for (const section of list ?? []) {
      if (!seenByKey.has(section.key)) {
        seenByKey.set(section.key, new Set());
      }
      for (const paragraph of section.paragraphs) {
        seenByKey.get(section.key).add(paragraph);
      }
    }
  }

  return canonical
    .map(({ title, key, paragraphs }) => {
      const seen = seenByKey.get(key);
      if (!seen || seen.size === 0) return null;
      const ordered = paragraphs.filter((paragraph) => seen.has(paragraph));
      for (const paragraph of seen) {
        if (!ordered.includes(paragraph)) ordered.push(paragraph);
      }
      return ordered.length > 0 ? { title, key, paragraphs: ordered } : null;
    })
    .filter(Boolean);
}

/**
 * @param {PostOverviewSection[]} sections
 * @param {{ key: string, title: string, paragraph: string }} moved
 */
export function prependPostOverviewParagraph(sections, moved) {
  if (postOverviewSectionsHasParagraph(sections, moved)) {
    return clonePostOverviewSections(sections);
  }

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

/** @typedef {{
 *   overviewParagraphs: string[],
 *   showYourDetails: boolean,
 *   showSymptoms: boolean,
 *   postSections: PostOverviewSection[],
 *   deepDive: { title: string|null, body: string }[],
 *   citations: object[],
 * }} ContinuationPage */

/** @returns {ContinuationPage} */
export function createEmptyContinuationPage() {
  return {
    overviewParagraphs: [],
    showYourDetails: false,
    showSymptoms: false,
    postSections: [],
    deepDive: [],
    citations: [],
  };
}

/** @param {ContinuationPage} page */
export function continuationPageHasContent(page) {
  if (!page) return false;
  return (
    page.overviewParagraphs.length > 0 ||
    page.showYourDetails ||
    page.showSymptoms ||
    page.postSections.some((section) => section.paragraphs.length > 0) ||
    page.deepDive.length > 0 ||
    page.citations.length > 0
  );
}

/** @param {ContinuationPage[]} pages @param {number} pageIndex */
export function getContinuationPageCitationStartIndex(pages, pageIndex) {
  let start = 0;
  for (let i = 0; i < pageIndex; i += 1) {
    start += pages[i]?.citations?.length ?? 0;
  }
  return start;
}

/** @param {ContinuationPage} page */
function cloneContinuationPage(page) {
  return {
    ...page,
    overviewParagraphs: [...page.overviewParagraphs],
    postSections: clonePostOverviewSections(page.postSections),
    deepDive: [...page.deepDive],
    citations: [...page.citations],
  };
}

/** @param {ContinuationPage[]} pages @param {number} pageIndex */
function ensureNextContinuationPage(pages, pageIndex) {
  if (pageIndex + 1 < pages.length) return pages;
  return [...pages, createEmptyContinuationPage()];
}

/** @param {ContinuationPage[]} pages @param {number} pageIndex @returns {ContinuationPage[]|null} */
export function shrinkPostOverviewOnContinuationPage(pages, pageIndex) {
  const page = pages[pageIndex];
  if (!page) return null;

  const removed = removeLastPostOverviewParagraph(page.postSections);
  if (!removed || postOverviewSectionsEqual(page.postSections, removed.sections)) return null;

  let next = pages.map((entry, index) =>
    index === pageIndex ? { ...entry, postSections: removed.sections } : cloneContinuationPage(entry)
  );

  next = ensureNextContinuationPage(next, pageIndex);
  const targetIndex = pageIndex + 1;

  if (postOverviewSectionsHasParagraph(next[targetIndex].postSections, removed.moved)) {
    return next;
  }

  next[targetIndex] = {
    ...next[targetIndex],
    postSections: prependPostOverviewParagraph(next[targetIndex].postSections, removed.moved),
  };

  return next;
}

/** @param {ContinuationPage[]} pages @param {number} pageIndex @returns {ContinuationPage[]|null} */
export function shrinkOverviewOnContinuationPage(pages, pageIndex) {
  const page = pages[pageIndex];
  if (!page?.overviewParagraphs.length) return null;

  const moved = page.overviewParagraphs[page.overviewParagraphs.length - 1];
  let next = pages.map((entry, index) =>
    index === pageIndex
      ? { ...entry, overviewParagraphs: entry.overviewParagraphs.slice(0, -1) }
      : cloneContinuationPage(entry)
  );

  next = ensureNextContinuationPage(next, pageIndex);
  const targetIndex = pageIndex + 1;
  const target = next[targetIndex];

  if (target.overviewParagraphs[0] === moved) return next;

  next[targetIndex] = {
    ...target,
    overviewParagraphs: [moved, ...target.overviewParagraphs],
  };

  return next;
}

/** @param {ContinuationPage[]} pages @param {number} pageIndex @returns {ContinuationPage[]|null} */
export function shrinkCitationOnContinuationPage(pages, pageIndex) {
  const page = pages[pageIndex];
  if (!page?.citations.length) return null;

  const moved = page.citations[page.citations.length - 1];
  let next = pages.map((entry, index) =>
    index === pageIndex
      ? { ...entry, citations: entry.citations.slice(0, -1) }
      : cloneContinuationPage(entry)
  );

  next = ensureNextContinuationPage(next, pageIndex);
  const targetIndex = pageIndex + 1;
  const target = next[targetIndex];

  if (target.citations[0] === moved) return next;

  next[targetIndex] = {
    ...target,
    citations: [moved, ...target.citations],
  };

  return next;
}

/** @param {ContinuationPage[]} pages @param {number} pageIndex @returns {ContinuationPage[]|null} */
export function shrinkDeepDiveOnContinuationPage(pages, pageIndex) {
  const page = pages[pageIndex];
  if (!page?.deepDive.length) return null;

  const moved = page.deepDive[page.deepDive.length - 1];
  let next = pages.map((entry, index) =>
    index === pageIndex
      ? { ...entry, deepDive: entry.deepDive.slice(0, -1) }
      : cloneContinuationPage(entry)
  );

  next = ensureNextContinuationPage(next, pageIndex);
  const targetIndex = pageIndex + 1;
  const target = next[targetIndex];

  if (target.deepDive[0] === moved) return next;

  next[targetIndex] = {
    ...target,
    deepDive: [moved, ...target.deepDive],
  };

  return next;
}

/** @param {ContinuationPage[]} pages */
export function serializeContinuationPages(pages) {
  return pages
    .map((page) =>
      [
        page.overviewParagraphs.join("\x1e"),
        page.showYourDetails ? "1" : "0",
        page.showSymptoms ? "1" : "0",
        page.postSections
          .map((section) => `${section.key}\x1f${section.paragraphs.join("\x1e")}`)
          .join("\x1d"),
        page.deepDive.map((item) => `${item.title ?? ""}\x1f${item.body}`).join("\x1d"),
        String(page.citations.length),
      ].join("\x1c")
    )
    .join("\x1b");
}

/** @param {ContinuationPage[]} a @param {ContinuationPage[]} b */
export function continuationPagesEqual(a, b) {
  return serializeContinuationPages(a) === serializeContinuationPages(b);
}

/** @param {{
 *   postOverviewSections: PostOverviewSection[],
 *   citations: object[],
 *   insightsStartOnPage2: boolean,
 *   showYourDetails: boolean,
 *   showSymptoms: boolean,
 * }} options @returns {ContinuationPage} */
export function createInitialContinuationPage({
  postOverviewSections,
  citations,
  insightsStartOnPage2,
  showYourDetails,
  showSymptoms,
}) {
  return {
    overviewParagraphs: [],
    showYourDetails,
    showSymptoms,
    postSections: insightsStartOnPage2 ? clonePostOverviewSections(postOverviewSections) : [],
    deepDive: [],
    citations: [...citations],
  };
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
