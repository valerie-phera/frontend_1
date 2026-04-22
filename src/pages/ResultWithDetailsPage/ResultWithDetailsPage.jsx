import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import BottomBlock from "../../components/BottomBlock/BottomBlock";
import Button from "../../components/Button/Button";
import Container from "../../components/Container/Container";

import ArrowDownGrey from "../../assets/icons/ArrowDownGrey";
import EditNotesGrey from "../../assets/icons/EditNotesGrey";
import DownloadIcon from "../../assets/icons/DownloadIcon";
import ShareIcon from "../../assets/icons/ShareIcon";
import InfoCircle_24 from "../../assets/icons/InfoCircle_24";
import InfoCircleBlack from "../../assets/icons/InfoCircleBlack";
import RecomendationsIcon from "../../assets/icons/RecomendationsIcon";
import CitationsIcon from "../../assets/icons/CitationsIcon";
import ArrowUpLink from "../../assets/icons/ArrowUpLink";
import PhBadge from "../../components/PhBadge/PhBadge";

import { getInterpretationParts } from "../../shared/utils/getInterpretation";
import useDetailsFromState from "../../hooks/useDetailsFromState";
import useExportResults from "../../hooks/useExportResults";
import useImportJson from "../../hooks/useImportJson";

import styles from "./ResultWithDetailsPage.module.css";
import phInfoStyles from "../ResultPageTest/ResultPageTest.module.css";

const MIN_PH = 3.5;
const MAX_PH = 7.0;
const MARKER_PX = 24;

const clampPhDisplay = (n) => {
    const x = Number(n);
    if (Number.isNaN(x)) return MIN_PH;
    return Math.min(MAX_PH, Math.max(MIN_PH, x));
};

const phToPercent = (ph) => ((ph - MIN_PH) / (MAX_PH - MIN_PH)) * 100;

const SCALE_SEGMENT_COLORS = ["#C6C955", "#60866E", "#526338", "#33372D", "#0C1446"];
const SCALE_GRADIENT = `linear-gradient(90deg, ${SCALE_SEGMENT_COLORS.map((c, i) => {
    const a = (i / 5) * 100;
    const b = ((i + 1) / 5) * 100;
    return `${c} ${a}% ${b}%`;
}).join(", ")})`;

const extractCitationLinks = (rawText) => {
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

    // cleanup duplicated punctuation/spaces after stripping
    main = main.replace(/\s{2,}/g, " ").replace(/\s+\./g, ".").trim();

    return { mainText: main, links };
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

const ResultWithDetailsPage = () => {
    const navigate = useNavigate();
    const [citationsOpen, setCitationsOpen] = useState(false);
    const [infoOpen, setInfoOpen] = useState(false);
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
    const currentRecommendations = state?.recommendations;
    const rawCitations = state?.citations ?? [];
    const { handleExport } = useExportResults();
    const scaleRef = useRef(null);
    const [scaleWidthPx, setScaleWidthPx] = useState(0);

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
    const markerPos = phToPercent(phForScale);
    const markerBgPosX =
        scaleWidthPx > 0
            ? -((markerPos / 100) * scaleWidthPx - MARKER_PX / 2)
            : 0;

    const cleaned = Array.isArray(currentRecommendations)
        ? currentRecommendations.join("\n\n")
        : (currentRecommendations || "")
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\[[^\]]+\]/g, (m) => `<span class="${styles.bracketRef}">${m}</span>`);

    const paragraphs = cleaned      //converts text with paragraphs into an array of individual paragraphs
        .split(/\n\s*\n/)  // by double line break
        .map(p => p.trim())
        .filter(Boolean);

    const citations = Array.isArray(rawCitations)
        ? rawCitations
            .map((c) => {
                if (!c || typeof c !== "object") return null;
                // Backend can send either:
                // - { title, relevant_section } (old)
                // - { id, reference_citation } (current)
                const title = c.title;
                const text = c.relevant_section ?? c.reference_citation;
                if (!title && !text) return null;
                return {
                    title: title == null ? "" : String(title),
                    text: text == null ? "" : String(text),
                };
            })
            .filter(Boolean)
        : [];

    const onExportClick = () => {
        handleExport({
            phValue,
            phLevel,
            timestamp,
            interpretation,
            detailOptions,
            recommendations: paragraphs
        });
    };

    return (
        <>
            <div className={styles.content} data-scroll-container>
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
                                        onClick={handleImportClick}
                                        aria-label="Import results"
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
                                    <button
                                        type="button"
                                        className={styles.actionsInner}
                                        onClick={onExportClick}
                                        aria-label="Share results"
                                    >
                                        <ShareIcon />
                                    </button>
                                </div>
                            </div>
                            <div className={styles.num}>{Number(phValue).toFixed(2)}</div>
                            <div className={styles.date}>{timestamp}</div>
                            <div ref={scaleRef} className={styles.scale} role="presentation">
                                <div className={styles.scalePart1}></div>
                                <div className={styles.scalePart2}></div>
                                <div className={styles.scalePart3}></div>
                                <div className={styles.scalePart4}></div>
                                <div className={styles.scalePart5}></div>
                                <div
                                    className={styles.scaleMarkerWrap}
                                    style={{ left: `${markerPos}%` }}
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
                            <p className={styles.textResult}>
                                <strong>{interpretationLead}</strong>
                                {interpretationSuffix}
                            </p>
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
                            <div className={styles.recommendations}>
                                <div className={styles.wrapHeading}>
                                    <h3 className={styles.heading}><RecomendationsIcon className={styles.recommendationsIcon}/> Personalised tailored insights</h3>
                                </div>
                                <div className={styles.wrapText}>
                                    {paragraphs.map((rec, index) => (
                                        <div key={index} className={styles.text}>
                                            <div className={styles.point}></div>
                                            <p
                                                className={styles.innerText}
                                                dangerouslySetInnerHTML={{ __html: rec }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {citations.length > 0 && (
                                <div className={styles.recommendations}>
                                    <button
                                        type="button"
                                        className={styles.wrapHeadingButton}
                                        onClick={() => setCitationsOpen((v) => !v)}
                                        aria-expanded={citationsOpen}
                                    >
                                        <h3 className={styles.heading}>
                                            <CitationsIcon className={styles.recommendationsIcon} /> Research sources
                                        </h3>
                                        <span className={`${styles.arrow} ${!citationsOpen ? styles.arrowOpen : ""}`}>
                                            <ArrowDownGrey />
                                        </span>
                                    </button>
                                    <div
                                        className={styles.wrapText}
                                        style={{
                                            maxHeight: citationsOpen ? 5000 : 0,
                                            opacity: citationsOpen ? 1 : 0,
                                            overflow: "hidden",
                                            transition: "max-height 0.35s ease, opacity 0.35s ease"
                                        }}
                                    >
                                        <div className={styles.quotesBlock}>
                                            {citations.map((q, index) => {
                                                const { title, body, links } = splitCitationTitleAndBody(q.text);
                                                return (
                                                    <div key={index} className={styles.citationItem}>
                                                        <div className={styles.citationNumber}>{index + 1}.</div>
                                                        <div className={styles.citationContent}>
                                                            <div className={styles.citationTitle}>{title}</div>
                                                            {body ? (
                                                                <div className={styles.citationText}>
                                                                    {renderWithItalicJournal(body)}
                                                                </div>
                                                            ) : null}
                                                            {links.length > 0 ? (
                                                                <div className={styles.citationLinks}>
                                                                    {links.map((l) => (
                                                                        <span key={l} className={styles.citationLink}>
                                                                            <span>{l}</span>
                                                                            <ArrowUpLink className={styles.citationLinkIcon} />
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Container>
                <BottomBlock>
                    <Button onClick={() => navigate("/test-complete")}>Finish test</Button>
                    <div className={styles.btns}>
                        <Button onClick={onExportClick} >Export results</Button>
                        <Button onClick={handleImportClick}>Import results</Button>
                    </div>
                    <div className={styles.privacyPolicyWrap}>
                        <p className={styles.privacyPolicy}>
                            Your data stays private and is never shared without your consent
                        </p>
                    </div>
                </BottomBlock>
            </div>
        </>
    )
};

export default ResultWithDetailsPage;