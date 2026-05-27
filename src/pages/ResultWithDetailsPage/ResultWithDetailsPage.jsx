import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDeviceFrame } from "../../components/Layout/DeviceFrame/DeviceFrame";

import BottomBlock from "../../components/BottomBlock/BottomBlock";
import Button from "../../components/Button/Button";
import ButtonReverse from "../../components/ButtonReverse/ButtonReverse";
import Container from "../../components/Container/Container";

import EditNotesGrey from "../../assets/icons/EditNotesGrey";
import DownloadIcon from "../../assets/icons/DownloadIcon";
import InfoCircle_24 from "../../assets/icons/InfoCircle_24";
import InfoCircleBlack from "../../assets/icons/InfoCircleBlack";
import StarsIcon from "../../assets/icons/StarsIcon";
import CitationsIcon from "../../assets/icons/CitationsIcon";
import ArrowUpLink from "../../assets/icons/ArrowUpLink";
import CheckBold from "../../assets/icons/CheckBold";
import PhBadge from "../../components/PhBadge/PhBadge";

import { getInterpretationParts } from "../../shared/utils/getInterpretation";
import {
    findScrollableAncestor,
    getScrollportClipBottom,
} from "../../shared/utils/scrollAncestor";
import useDetailsFromState from "../../hooks/useDetailsFromState";
import useExportResults from "../../hooks/useExportResults";
import useImportJson from "../../hooks/useImportJson";
import {
    PH_SCALE_MAX,
    PH_SCALE_MIN,
    SCALE_GRADIENT,
    clampPhScale,
    getMarkerLayout,
} from "../../shared/utils/phScaleMarker";

import styles from "./ResultWithDetailsPage.module.css";
import phInfoStyles from "../ResultPageTest/ResultPageTest.module.css";

const MIN_PH = PH_SCALE_MIN;
const MAX_PH = PH_SCALE_MAX;

const clampPhDisplay = (n) => clampPhScale(n, MIN_PH, MAX_PH);

const extractCitationLinks = (rawText) => {
    const text = String(rawText ?? "");

    const doiMatch = text.match(/doi:\s*([^\s,;]+)/i);
    const pmidMatch = text.match(/PMID:\s*([A-Za-z0-9]+)/i);
    const pmcidMatch =
        text.match(/PMCID:\s*([A-Za-z0-9]+)/i) ||
        text.match(/PubMed Central PMCID:\s*([A-Za-z0-9]+)/i);

    const links = [];
    if (doiMatch?.[1]) links.push({ kind: "doi", value: doiMatch[1] });
    if (pmidMatch?.[1]) links.push({ kind: "pmid", value: pmidMatch[1] });
    if (pmcidMatch?.[1]) links.push({ kind: "pmcid", value: pmcidMatch[1] });

    let main = text;
    main = main.replace(/doi:\s*[^\s,;]+/gi, "");
    main = main.replace(/PMID:\s*[A-Za-z0-9]+/gi, "");
    main = main.replace(/PMCID:\s*[A-Za-z0-9]+/gi, "");
    main = main.replace(/PubMed Central PMCID:\s*[A-Za-z0-9]+/gi, "");

    // cleanup duplicated punctuation/spaces after stripping
    main = main.replace(/\s{2,}/g, " ").replace(/\s+\./g, ".").trim();

    return { mainText: main, links };
};

/** Short label for citation link chips (full value kept in `key` / data). */
const citationLinkLabel = (link) => {
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
};

const citationLinkHref = (link) => {
    if (!link) return null;
    const canonicalize = (href) => {
        const s = String(href ?? "").trim();
        if (!s) return null;
        // DOI canonical
        const doiMatch =
            s.match(/https?:\/\/doi\.org\/(.+)$/i) ||
            s.match(/^doi:(.+)$/i);
        if (doiMatch?.[1]) {
            const doi = doiMatch[1].trim().replace(/^doi:\s*/i, "");
            return doi ? `https://doi.org/${doi}` : null;
        }

        // PubMed canonical
        const pmidMatch =
            s.match(/https?:\/\/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)\/?/i) ||
            s.match(/^PMID:(\d+)$/i);
        if (pmidMatch?.[1]) {
            return `https://pubmed.ncbi.nlm.nih.gov/${pmidMatch[1]}/`;
        }

        // PMC canonical (backend might use digits-only; text may include "PMC123")
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
        if (link.kind === "pmid") return `https://pubmed.ncbi.nlm.nih.gov/${v.replace(/^PMID:\s*/i, "")}/`;
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
};

const splitCitationTitleAndBody = (rawText) => {
    const { mainText, links } = extractCitationLinks(rawText);
    const parts = mainText.split(". ").map((p) => p.trim()).filter(Boolean);

    // typical format: "Authors. Title. Journal. Year ..."
    const title = parts[1] ? parts[1].replace(/\.$/, "") : mainText;
    const body = parts.length > 2 ? parts.slice(2).join(". ").trim() : "";

    return { title, body, links };
};

const renderWithItalicJournal = (text) => {
    const s = String(text ?? "");
    if (!s) return null;

    // Most citations look like: "<Journal>. <Year> ..."
    // Italicize the first segment before the first ". "
    const parts = s.split(". ");
    if (parts.length < 2) return s;

    const journal = (parts[0] ?? "").trim();
    const rest = parts.slice(1).join(". ").trim();

    // Avoid italicizing long fragments if parsing failed
    if (!journal || journal.length > 60) return s;

    return (
        <>
            <span className={styles.citationJournal}>{journal}</span>
            {rest ? `.${" "}${rest}` : "."}
        </>
    );
};

const formatInsightHtml = (text) =>
    String(text ?? "")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\[([^\]]+)\]/g, (m, inner) => {
            const parts = inner.split(/\s*,\s*/).map((s) => s.trim()).filter(Boolean);
            const nums = parts
                .map((p) => (/^\d+$/.test(p) ? parseInt(p, 10) : NaN))
                .filter((n) => Number.isFinite(n) && n > 0);
            if (nums.length === 0 || nums.length !== parts.length) {
                return `<span class="${styles.bracketRef}">${m}</span>`;
            }
            if (nums.length === 1) {
                const n = nums[0];
                return `<button type="button" class="${styles.bracketRefLink}" data-citation-ref="${n}" aria-label="View source ${n}">[${n}]</button>`;
            }
            const buttons = nums
                .map(
                    (n) =>
                        `<button type="button" class="${styles.bracketRefLink}" data-citation-ref="${n}" aria-label="View source ${n}">${n}</button>`
                )
                .join(", ");
            return `<span class="${styles.bracketRef}">[${buttons}]</span>`;
        });

const splitIntoSentences = (rawText) => {
    const text = String(rawText ?? "").replace(/\s+/g, " ").trim();
    if (!text) return [];

    // Basic sentence splitting for UI bullets.
    // Keeps punctuation, splits on space after . ! ? when the next chunk looks like a new sentence.
    return text
        .split(/(?<=[.!?])\s+(?=[A-Z0-9(])/)
        .map((s) => s.trim())
        .filter(Boolean);
};

/**
 * Split text into chunks that each start with a bold section label.
 * Supports `**Label:**` (backend) and `**Label** -` (overview normalization).
 */
const splitByBoldLabels = (rawText) => {
    const s = String(rawText ?? "").trim();
    if (!s) return [];

    const labelRe = /\*\*[^*]+:\*\*|\*\*[^*]+\*\*\s*-\s*/g;
    const matches = [...s.matchAll(labelRe)];
    if (matches.length === 0) return [s];

    const chunks = [];
    for (let i = 0; i < matches.length; i++) {
        const start = matches[i].index ?? 0;
        const end = i + 1 < matches.length ? (matches[i + 1].index ?? s.length) : s.length;
        const chunk = s.slice(start, end).trim();
        if (chunk) chunks.push(chunk);
    }
    return chunks.length > 0 ? chunks : [s];
};

/** pH result card (Figma) — static until backend provides card copy. */
const PH_RESULT_CARD_MOCK = {
    cardTitle: "Your pH is in the healthy range.",
    cardBody: "4.5 is balanced for your profile - your vaginal environment looks healthy.",
};

const toDeepDiveBulletItems = (raw) => {
    if (raw == null) return [];

    // Backend can send either a string or an array of strings.
    const parts = Array.isArray(raw) ? raw : [raw];

    // Requirements: split into bullets by sentences (not by paragraphs).
    // Keep `**bold**` + `[n]` patterns intact for `formatInsightHtml`.
    const sentences = parts
        .flatMap((p) => splitByBoldLabels(p))
        .flatMap((p) => splitIntoSentences(p))
        .map((s) => String(s ?? "").trim())
        .filter(Boolean);

    return sentences;
};

const toOverviewBulletItems = (raw) => {
    if (raw == null) return [];
    const parts = Array.isArray(raw) ? raw : [raw];
    return parts
        .flatMap((p) => splitByBoldLabels(p))
        .flatMap((p) => splitIntoSentences(p))
        .map((s) => stripTrailingDash(s))
        .filter(Boolean);
};

const withTrailingPeriod = (text) => {
    const t = String(text ?? "").trim();
    if (!t) return t;
    if (/[.!?]$/.test(t)) return t;
    return `${t}.`;
};

/** Strip trailing dash from overview bullet text (keeps `**Label** -` mid-line). */
const stripTrailingDash = (text) =>
    String(text ?? "")
        .trim()
        .replace(/[\s-–—]+$/, "")
        .trim();

const parseOverviewForUi = (raw) => {
    const text = Array.isArray(raw) ? raw.join(" ") : String(raw ?? "");
    const s = text.replace(/\s+/g, " ").trim();
    if (!s) return null;

    // First bold fragment becomes card title. Next text until next bold becomes body.
    const firstBold = s.match(/\*\*([^*]+)\*\*/);
    if (!firstBold?.index && firstBold?.index !== 0) return null;

    const title = (firstBold[1] ?? "").trim();
    if (!title) return null;

    const afterTitle = s.slice(firstBold.index + firstBold[0].length).trim();
    // Body ends where the next bold starts (if any).
    const nextBoldIdx = afterTitle.search(/\*\*[^*]+\*\*/);
    const bodyRaw =
        nextBoldIdx >= 0 ? afterTitle.slice(0, nextBoldIdx).trim() : afterTitle;

    // Remove dash between title and body (leading/trailing, e.g. "**Title** - body -")
    const body = bodyRaw
        .replace(/^[\s-–—]+/, "")
        .replace(/[\s-–—]+$/, "")
        .trim();

    const restRaw = nextBoldIdx >= 0 ? afterTitle.slice(nextBoldIdx).trim() : "";

    // In the remaining text, convert "**Label:**" into "**Label** -"
    // so UI shows dash after the highlighted label.
    const restNormalized = restRaw.replace(/\*\*([^*]+):\*\*/g, "**$1** -");

    const bullets = toOverviewBulletItems(restNormalized).map(formatInsightHtml);

    return { title: withTrailingPeriod(title), body, bullets };
};

const ResultWithDetailsPage = () => {
    const navigate = useNavigate();
    const { isDesktopCompletionLayout, triggerDesktopCompletion } = useDeviceFrame();
    const [infoOpen, setInfoOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");
    const { state } = useLocation();
    const phValue = state?.phValue;
    const phLevel = state?.phLevel;
    const timestamp = state?.timestamp;
    const backendInterpretation = state?.interpretation;
    const { lead: computedLead, suffix: computedSuffix } = getInterpretationParts(
        phLevel,
        Number(phValue).toFixed(2)
    );
    const interpretationLead = backendInterpretation ? String(backendInterpretation) : computedLead;
    const interpretationSuffix = backendInterpretation ? "" : computedSuffix;
    const interpretation = backendInterpretation ? String(backendInterpretation) : `${computedLead}${computedSuffix}`;
    const backendOverview = state?.overview;
    const currentRecommendations = state?.recommendations;
    const deepDiveRaw = {
        your_ph: state?.your_ph,
        your_symptoms: state?.your_symptoms,
        your_personal_baseline: state?.your_personal_baseline,
        your_health_context: state?.your_health_context,
        next_steps: state?.next_steps,
    };
    const rawCitations = state?.citations ?? [];
    const { handleExport } = useExportResults();
    const scaleRef = useRef(null);
    const [scaleWidthPx, setScaleWidthPx] = useState(0);
    const pageRef = useRef(null);
    const insightsHeadingRef = useRef(null);
    const insightsStickyHeaderRef = useRef(null);
    const tabScrollStabilizerRef = useRef(null);
    const tabSwitchScrollStateRef = useRef(null);
    const citationsContentRef = useRef(null);
    const pendingCitationRef = useRef(null);
    const [highlightedCitationRef, setHighlightedCitationRef] = useState(null);

    const getScrollOffset = () => (window.matchMedia("(max-width: 767px)").matches ? 80 : 140);

    const getInsightsStickyTop = () => (window.matchMedia("(max-width: 767px)").matches ? 56 : 0);

    const isInsightsHeaderPinned = () => {
        const header = insightsStickyHeaderRef.current;
        if (!header) return false;
        return Math.abs(header.getBoundingClientRect().top - getInsightsStickyTop()) <= 6;
    };

    const getPageScroller = () => {
        const host = pageRef.current ?? document.body;
        return findScrollableAncestor(host) || window;
    };

    const getScrollTop = (scroller) => {
        if (!scroller || scroller === window) return window.scrollY || 0;
        return scroller.scrollTop || 0;
    };

    const setScrollTop = (scroller, top) => {
        const t = Math.max(0, top);
        if (!scroller || scroller === window) {
            window.scrollTo({ top: t, behavior: "auto" });
            return;
        }
        scroller.scrollTo({ top: t, behavior: "auto" });
    };

    const setStabilizerHeight = (px) => {
        const el = tabScrollStabilizerRef.current;
        if (!el) return;
        el.style.height = px > 0 ? `${Math.ceil(px)}px` : "0px";
    };

    const stabilizePinnedHeaderOnTabSwitch = () => {
        const saved = tabSwitchScrollStateRef.current;
        tabSwitchScrollStateRef.current = null;
        if (!saved?.wasPinned) {
            setStabilizerHeight(0);
            return;
        }

        const scroller = getPageScroller();
        const prevTop = saved.scrollTop ?? 0;

        // If new tab is shorter, the browser clamps scrollTop. Add just enough bottom space
        // to keep the previous scrollTop stable so the sticky header doesn't "drop".
        const getMaxScrollTop = () => {
            if (!scroller || scroller === window) {
                const root = document.scrollingElement;
                if (!root) return 0;
                return Math.max(0, root.scrollHeight - root.clientHeight);
            }
            return Math.max(0, scroller.scrollHeight - scroller.clientHeight);
        };

        // First clear to measure natural height.
        setStabilizerHeight(0);
        const naturalMax = getMaxScrollTop();
        const deficit = prevTop - naturalMax;
        if (deficit > 1) {
            setStabilizerHeight(deficit + 4);
        }

        // Restore scrollTop (now it shouldn't clamp).
        setScrollTop(scroller, prevTop);
    };

    const scrollElementIntoView = (el) => {
        if (!el) return;

        const scroller = findScrollableAncestor(el);
        const offset = getScrollOffset();

        if (!scroller) {
            try {
                el.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
            } catch {
                // ignore
            }
            return;
        }

        const scrollerRect = scroller.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const topVisibleY = scrollerRect.top + offset;
        const clipBottom = getScrollportClipBottom(scroller, el);
        const isFullyVisible =
            elRect.top >= topVisibleY && elRect.bottom <= clipBottom;
        if (isFullyVisible) return;

        const targetTop = (elRect.top - scrollerRect.top) + scroller.scrollTop - offset;
        scroller.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
    };

    const scrollToCitation = (refNum) => {
        const el = document.getElementById(`citation-${refNum}`);
        scrollElementIntoView(el);
    };

    const scheduleScrollToCitation = (refNum) => {
        const run = () => scrollToCitation(refNum);
        requestAnimationFrame(() => requestAnimationFrame(run));
        const timeoutId = window.setTimeout(run, 100);
        return () => window.clearTimeout(timeoutId);
    };

    const goToSource = (refNum) => {
        if (!Number.isFinite(refNum) || refNum < 1) return;
        setHighlightedCitationRef(refNum);
        if (activeTab !== "sources") {
            pendingCitationRef.current = refNum;
            setActiveTab("sources");
        } else {
            scheduleScrollToCitation(refNum);
        }
    };

    const handleInsightContentClick = (e) => {
        const btn = e.target.closest("button[data-citation-ref]");
        if (!btn) return;
        e.preventDefault();
        const refNum = parseInt(btn.getAttribute("data-citation-ref"), 10);
        goToSource(refNum);
    };

    const onTabClick = (nextTab) => {
        if (nextTab === activeTab) return;
        const scroller = getPageScroller();
        tabSwitchScrollStateRef.current = {
            wasPinned: isInsightsHeaderPinned(),
            scrollTop: getScrollTop(scroller),
        };
        setActiveTab(nextTab);
    };

    const handleImportedData = (data) => {
        console.log("📥 Импортировано:", data);
    };

    const { fileInputRef, handleImportClick, handleFileUpload } = useImportJson(handleImportedData);

    useLayoutEffect(() => {
        const el = scaleRef.current;
        if (!el) return;
        const measure = () => setScaleWidthPx(el.getBoundingClientRect().width);
        measure();
        const ro = new ResizeObserver(() => measure());
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        if (phValue === undefined || phValue === null) {
            navigate("/result-without-details");
        }
    }, [state, navigate]);

    useEffect(() => {
        // Данные на эту страницу приходят через navigate(..., { state })
        console.log("[ResultWithDetailsPage] payload (location.state):", state);
        console.log("[ResultWithDetailsPage] recommendations:", state?.recommendations);
        console.log("[ResultWithDetailsPage] `citations`:", state?.citations);
    }, [state]);

    const detailOptions = useDetailsFromState(state);
    const detailsList = detailOptions.map((item, idx) => (
        <div key={`${item}-${idx}`} className={styles.item}>{item}</div>
    ));

    const phForScale = clampPhDisplay(phValue);
    const { leftPercent: markerLeftPercent, bgPosX: markerBgPosX } = getMarkerLayout(
        phForScale,
        scaleWidthPx,
        MIN_PH,
        MAX_PH,
    );

    const cleaned = formatInsightHtml(
        Array.isArray(currentRecommendations)
            ? currentRecommendations.join("\n\n")
            : currentRecommendations || ""
    );

    const paragraphs = cleaned      //converts text with paragraphs into an array of individual paragraphs
        .split(/\n\s*\n/)  // by double line break
        .map(p => p.trim())
        .filter(Boolean);

    const parsedOverview = parseOverviewForUi(backendOverview);
    const overviewParagraphs =
        parsedOverview?.bullets ??
        toOverviewBulletItems(backendOverview).map(formatInsightHtml);
    const deepDiveSections = [
        { title: "Your ph", raw: deepDiveRaw.your_ph },
        { title: "Your symptoms", raw: deepDiveRaw.your_symptoms },
        { title: "Your personal baseline", raw: deepDiveRaw.your_personal_baseline },
        { title: "Your health context", raw: deepDiveRaw.your_health_context },
        { title: "Next steps", raw: deepDiveRaw.next_steps },
    ]
        .map((s) => ({
            title: s.title,
            items: toDeepDiveBulletItems(s.raw).map((text) => ({ text })),
        }))
        .filter((s) => s.items.length > 0);
    const citations = Array.isArray(rawCitations)
        ? rawCitations
            .map((c) => {
                if (!c || typeof c !== "object") return null;
                // Backend can send either:
                // - { title, relevant_section } (old)
                // - { id, reference_citation } (current)
                // - { title, nlm_reference, pmid_url, doi_url, ... } (new)
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
            .filter(Boolean)
        : [];

    useLayoutEffect(() => {
        stabilizePinnedHeaderOnTabSwitch();
        // One extra frame helps when layout/DOM heights update late.
        requestAnimationFrame(() => stabilizePinnedHeaderOnTabSwitch());
    }, [activeTab, overviewParagraphs.length, deepDiveSections.length, citations.length]);

    useLayoutEffect(() => {
        if (activeTab !== "sources" || !pendingCitationRef.current) return;
        const refNum = pendingCitationRef.current;
        pendingCitationRef.current = null;
        return scheduleScrollToCitation(refNum);
    }, [activeTab, citations.length]);

    useEffect(() => {
        if (highlightedCitationRef == null) return;
        const t = window.setTimeout(() => setHighlightedCitationRef(null), 2500);
        return () => window.clearTimeout(t);
    }, [highlightedCitationRef]);

    const onExportClick = () => {
        handleExport({
            phValue,
            phLevel,
            timestamp,
            interpretation,
            detailOptions,
            recommendations: paragraphs,
            overviewInsights: overviewParagraphs,
            citations,
            state,
        });
    };

    return (
        <>
            <div ref={pageRef} className={styles.content} data-scroll-container>
                <Container>
                    <div className={styles.containerInner}>
                        <h1 className={styles.title}>Your full pH result</h1>
                        <div className={styles.visualBlock}>
                            <div className={styles.visualBlockTop}>
                                <PhBadge level={phLevel} />
                                <div className={styles.actions}>
                                    <button
                                        type="button"
                                        className={styles.actionsInner}
                                        aria-expanded={infoOpen}
                                        aria-controls="result-with-details-ph-info"
                                        onClick={() => setInfoOpen((v) => !v)}
                                    >
                                        <span
                                            className={`${phInfoStyles.infoIconWrap} ${infoOpen ? phInfoStyles.infoIconWrapActive : ""}`}
                                        >
                                            <InfoCircle_24 />
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.actionsInner}
                                        onClick={onExportClick}
                                        aria-label="Download results"
                                    >
                                        <DownloadIcon />
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="application/json"
                                        style={{ display: "none" }}
                                        onChange={handleFileUpload}
                                    />
                                </div>
                            </div>
                            <div className={styles.num}>{Number(phValue).toFixed(2)}</div>
                            <div className={styles.date}>{timestamp}</div>
                            <div ref={scaleRef} className={styles.scale} role="presentation">
                                <div
                                    className={styles.scaleMarkerWrap}
                                    style={{ left: `${markerLeftPercent}%` }}
                                    aria-hidden
                                >
                                    <div
                                        className={styles.scaleMarker}
                                        style={{
                                            backgroundImage: SCALE_GRADIENT,
                                            backgroundSize: `${scaleWidthPx}px 100%`,
                                            backgroundPosition: `${markerBgPosX}px 50%`,
                                            backgroundRepeat: "no-repeat",
                                        }}
                                    />
                                </div>
                            </div>
                            <div className={styles.meaning}>
                                <p>{MIN_PH.toFixed(1)}</p>
                                <p>{MAX_PH.toFixed(1)}</p>
                            </div>
                        </div>
                        <div
                            id="result-with-details-ph-info"
                            className={`${phInfoStyles.infoBlockWrap} ${infoOpen ? phInfoStyles.infoBlockWrapOpen : ""}`}
                            aria-hidden={!infoOpen}
                            onClick={() => setInfoOpen((v) => !v)}
                        >
                            <div className={phInfoStyles.infoBlockInner}>
                                <div className={phInfoStyles.infoBlock}>
                                    <div className={phInfoStyles.infoTilte}>
                                        <div className={phInfoStyles.infoIcon}><InfoCircleBlack /></div>
                                        <h3>What does vaginal pH mean?</h3>
                                    </div>
                                    <div className={phInfoStyles.infoItem}>
                                        <div className={`${phInfoStyles.infoPoint} ${phInfoStyles.normal}`}></div>
                                        <div className={phInfoStyles.infoInner}>
                                            <h4>pH 3.5 to 4.4</h4>
                                            <div className={phInfoStyles.valueNorm}>Normal</div>
                                            <p>Considered normal - protective acidity that keeps the microbiome balanced.</p>
                                        </div>
                                    </div>
                                    <div className={phInfoStyles.infoItem}>
                                        <div className={`${phInfoStyles.infoPoint} ${phInfoStyles.slightlyElevated}`}></div>
                                        <div className={phInfoStyles.infoInner}>
                                            <h4>pH 4.5 to 4.9</h4>
                                            <div className={phInfoStyles.valueSlElev}>Slightly elevated</div>
                                            <p>Considered mildly elevated - can be normal around your period or hormonal shifts.</p>
                                        </div>
                                    </div>
                                    <div className={phInfoStyles.infoItem}>
                                        <div className={`${phInfoStyles.infoPoint} ${phInfoStyles.elevated}`}></div>
                                        <div className={phInfoStyles.infoInner}>
                                            <h4>pH 5.0 to 7.0</h4>
                                            <div className={phInfoStyles.valueElev}>Elevated</div>
                                            <p>Considered elevated - outside the typical range. May reflect a microbiome change.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.infoBlock}>
                            <div className={styles.details}>
                                <div className={styles.wrapHeading}>
                                    <h4 className={styles.heading}>Details for this result</h4>
                                    <button
                                        className={styles.editBtn}
                                        onClick={() => navigate("/add-details/basic", { state })}
                                        aria-label="Edit details"
                                    >
                                        <EditNotesGrey />
                                    </button>
                                </div>
                                <div className={styles.wrapDetailslList}>
                                    {detailsList}
                                </div>
                            </div>
                            <div className={styles.data}>
                                <div ref={insightsStickyHeaderRef} className={styles.insightsStickyHeader}>
                                    <div
                                        ref={insightsHeadingRef}
                                        className={`${styles.wrapHeading} ${styles.insightsHeadingScrollTarget}`}
                                    >
                                        <h3 className={styles.heading}><StarsIcon className={styles.recommendationsIcon} />Your personalized insights</h3>
                                    </div>
                                <div className={styles.SectionTabs}>
                                    <div className={styles.tabList}>
                                        <div
                                            className={`${styles.tab} ${activeTab === "overview" ? styles.active : ""}`}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => onTabClick("overview")}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === " ") onTabClick("overview");
                                            }}
                                        >
                                            Overview
                                        </div>
                                        <div
                                            className={`${styles.tab} ${activeTab === "deepDive" ? styles.active : ""}`}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => onTabClick("deepDive")}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === " ") onTabClick("deepDive");
                                            }}
                                        >
                                            Deep Dive
                                        </div>
                                        <div
                                            className={`${styles.tab} ${activeTab === "sources" ? styles.active : ""}`}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => onTabClick("sources")}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === " ") onTabClick("sources");
                                            }}
                                        >
                                            Sources
                                        </div>
                                    </div>
                                </div>
                                </div>
                                <div className={styles.tabPanels}>
                                    <div
                                        className={`${styles.tabPanel} ${activeTab === "overview" ? styles.tabPanelActive : ""}`}
                                    >
                                        <div className={styles.phResultCard}>
                                            <div className={styles.phResultCardSign}>
                                                <CheckBold />
                                            </div>
                                            <div className={styles.phResultCardText}>
                                                <p className={styles.phResultCardTitle}>
                                                    {withTrailingPeriod(
                                                        parsedOverview?.title ?? PH_RESULT_CARD_MOCK.cardTitle
                                                    )}
                                                </p>
                                                <p className={styles.phResultCardBody}>
                                                    {parsedOverview?.body ?? PH_RESULT_CARD_MOCK.cardBody}
                                                </p>
                                            </div>
                                        </div>
                                        {overviewParagraphs.length > 0 ? (
                                            <div className={styles.wrapText} onClick={handleInsightContentClick}>
                                                {overviewParagraphs.map((t, index) => (
                                                    <div key={index} className={styles.text}>
                                                        <div className={styles.point} />
                                                        <p
                                                            className={styles.innerText}
                                                            dangerouslySetInnerHTML={{ __html: t }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <>
                                                <h4 className={styles.overviewTitle}>Your microbiome looks balanced.</h4>
                                                <div className={styles.wrapText} onClick={handleInsightContentClick}>
                                                    {[
                                                        "Your pH is maintained by Lactobacillus - good bacteria that produce lactic acid to fight off infections",
                                                        "Your pH is maintained by Lactobacillus - good bacteria that produce lactic acid to fight off infections",
                                                        "Your pH is maintained by Lactobacillus - good bacteria that produce lactic acid to fight off infections",
                                                        "Your pH is maintained by Lactobacillus - good bacteria that produce lactic acid to fight off infections",
                                                    ].map((t, index) => (
                                                        <div key={index} className={styles.text}>
                                                            <div className={styles.point} />
                                                            <p className={styles.innerText}>
                                                                {t}{" "}
                                                                <button
                                                                    type="button"
                                                                    className={styles.bracketRefLink}
                                                                    data-citation-ref="2"
                                                                    aria-label="View source 2"
                                                                >
                                                                    [2]
                                                                </button>
                                                                .
                                                            </p>
                                                        </div>
                                                    ))}
                                                    <p className={styles.overviewNote}>
                                                        Consult your healthcare provider can help ensure everything is as it should be.
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div
                                        className={`${styles.tabPanel} ${activeTab === "deepDive" ? styles.tabPanelActive : ""}`}
                                    >
                                        <div
                                            className={styles.deepDiveResearch}
                                            onClick={handleInsightContentClick}
                                        >
                                            {deepDiveSections.map((section) => (
                                                <section
                                                    key={section.title}
                                                    className={styles.deepDiveCard}
                                                >
                                                    <div className={styles.deepDiveCardTitleRow}>
                                                        <h4 className={styles.deepDiveCardTitle}>
                                                            {section.title}
                                                        </h4>
                                                        <hr
                                                            className={styles.deepDiveCardDivider}
                                                            aria-hidden
                                                        />
                                                    </div>
                                                    {section.items.map((item, index) => (
                                                        <div
                                                            key={index}
                                                            className={styles.deepDiveBulletRow}
                                                        >
                                                            <div
                                                                className={styles.deepDiveBullet}
                                                                aria-hidden
                                                            />
                                                            <p
                                                                className={styles.deepDiveBulletText}
                                                                dangerouslySetInnerHTML={{
                                                                    __html: formatInsightHtml(item.text),
                                                                }}
                                                            />
                                                        </div>
                                                    ))}
                                                </section>
                                            ))}
                                        </div>
                                    </div>

                                    <div
                                        className={`${styles.tabPanel} ${activeTab === "sources" ? styles.tabPanelActive : ""}`}
                                    >
                                        <div className={`${styles.source} ${styles.sourceNoGapFromRecommendations}`}>
                                            <div
                                                ref={citationsContentRef}
                                                id="result-with-details-citations"
                                                className={`${styles.sourcesSection} ${styles.citationsContent}`}
                                            >
                                                {/* <h4 className={styles.sourcesSectionTitle}>Sources</h4> */}
                                                <div className={styles.sourcesCard}>
                                                    {citations.length > 0 ? (
                                                        <div className={styles.quotesBlock}>
                                                            {citations.map((q, index) => {
                                                                const parsed = splitCitationTitleAndBody(q.text);
                                                                const title = (q.title && String(q.title).trim()) ? String(q.title).trim() : parsed.title;
                                                                const fullText = q.text == null ? "" : String(q.text);
                                                                const cleanedText = extractCitationLinks(fullText).mainText;
                                                                const links = [
                                                                    ...(Array.isArray(q.links) ? q.links : []),
                                                                    ...(Array.isArray(parsed.links) ? parsed.links : []),
                                                                ];
                                                                const seenHrefs = new Set();
                                                                const uniqueLinks = links.filter((l) => {
                                                                    const href = citationLinkHref(l);
                                                                    if (!href) return false;
                                                                    if (seenHrefs.has(href)) return false;
                                                                    seenHrefs.add(href);
                                                                    return true;
                                                                });
                                                                const citationNum = index + 1;
                                                                return (
                                                                    <div
                                                                        key={index}
                                                                        id={`citation-${citationNum}`}
                                                                        className={`${styles.citationItem} ${highlightedCitationRef === citationNum ? styles.citationItemHighlight : ""}`}
                                                                    >
                                                                        <div className={styles.citationNumber}>{citationNum}.</div>
                                                                        <div className={styles.citationContent}>
                                                                            <div className={styles.citationTitle}>{title}</div>
                                                                            {cleanedText ? (
                                                                                <div className={styles.citationText}>
                                                                                    {cleanedText}
                                                                                </div>
                                                                            ) : null}
                                                                            {uniqueLinks.length > 0 ? (
                                                                                <div className={styles.citationLinks}>
                                                                                    {uniqueLinks.map((l) => {
                                                                                        const href = citationLinkHref(l);
                                                                                        return (
                                                                                            <a
                                                                                                key={href}
                                                                                                className={styles.citationLink}
                                                                                                href={href}
                                                                                                target="_blank"
                                                                                                rel="noopener noreferrer"
                                                                                            >
                                                                                                <span>{citationLinkLabel(l)}</span>
                                                                                                <ArrowUpLink className={styles.citationLinkIcon} />
                                                                                            </a>
                                                                                        );
                                                                                    })}
                                                                                </div>
                                                                            ) : null}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <p className={styles.sourcesEmpty}>
                                                            No references listed for this report.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    ref={tabScrollStabilizerRef}
                                    className={styles.tabScrollStabilizer}
                                    aria-hidden
                                />
                            </div>
                        </div>
                    </div>
                </Container>
                <BottomBlock>
                    {/* Desktop: button triggers completion animation; hidden once completion is active */}
                    {/* Mobile: button navigates to test-complete page */}
                    {!isDesktopCompletionLayout && (
                        <Button onClick={() => {
                            // On both mobile + desktop, completion is the `/test-complete` route.
                            // DeviceFrame handles the desktop completion layout styling.
                            triggerDesktopCompletion();
                        }}>Finish test</Button>
                    )}
                    <div
                        className={`${styles.btns} ${isDesktopCompletionLayout ? styles.btnsDesktopCompletion : ""}`}
                    >
                        <ButtonReverse onClick={onExportClick} >Export results</ButtonReverse>
                        {/* <Button onClick={handleImportClick}>Import results</Button> */}
                    </div>
                    <div className={styles.privacyPolicyWrap}>
                        <p className={styles.privacyPolicy}>
                            Your data stays private and is never shared without your consent
                        </p>
                    </div>
                </BottomBlock>
            </div>
        </>
    );
};

export default ResultWithDetailsPage;
