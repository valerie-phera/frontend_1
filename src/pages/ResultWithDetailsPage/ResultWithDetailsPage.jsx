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

const ResultWithDetailsPage = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(true);
    const [infoOpen, setInfoOpen] = useState(false);
    const { state } = useLocation();
    const phValue = state?.phValue;
    const phLevel = state?.phLevel;
    const timestamp = state?.timestamp;
    const { lead: interpretationLead, suffix: interpretationSuffix } = getInterpretationParts(
        phLevel,
        Number(phValue).toFixed(2)
    );
    const interpretation = `${interpretationLead}${interpretationSuffix}`;
    const currentRecommendations = state?.recommendations;
    const rawCitations = state?.citations ?? [];
    const { handleExport } = useExportResults();
    const contentRef = useRef(null);
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
            .replace(/\[\d+(?:\s*,\s*\d+)*\]/g, "")
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    const paragraphs = cleaned      //converts text with paragraphs into an array of individual paragraphs
        .split(/\n\s*\n/)  // by double line break
        .map(p => p.trim())
        .filter(Boolean);

    const citations = Array.isArray(rawCitations)
        ? rawCitations
            .map((c) => {
                if (!c || typeof c !== "object") return null;
                const title = c.title;
                const text = c.relevant_section;
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
                        <h1 className={styles.title}>Your pH result</h1>
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
                                    <div className={styles.actionsInner} onClick={handleImportClick}>
                                        <DownloadIcon />
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="application/json"
                                        style={{ display: "none" }}
                                        onChange={handleFileUpload}
                                    />
                                    <div className={styles.actionsInner} onClick={onExportClick}>
                                        <ShareIcon />
                                    </div>
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
                                <div className={styles.wrapHeading} onClick={() => setIsOpen(!isOpen)}>
                                    <h3 className={styles.heading}>Recommendations</h3>
                                    <span className={`${styles.arrow} ${!isOpen ? styles.arrowOpen : ""}`}>
                                        <ArrowDownGrey />
                                    </span>
                                </div>
                                <div
                                    ref={contentRef}
                                    className={styles.wrapText}
                                    style={{
                                        maxHeight: isOpen ? 5000 : 0,
                                        opacity: isOpen ? 1 : 0,
                                        overflow: "hidden",
                                        transition: "max-height 0.35s ease, opacity 0.35s ease"
                                    }}
                                >
                                    {paragraphs.map((rec, index) => (
                                        <div key={index} className={styles.text}>
                                            <div className={styles.point}></div>
                                            <p
                                                className={styles.innerText}
                                                dangerouslySetInnerHTML={{ __html: rec }}
                                            />
                                        </div>
                                    ))}

                                    {citations.length > 0 && (
                                        <div className={styles.quotesBlock}>
                                            {citations.map((q, index) => (
                                                <div key={index} className={styles.quoteItem}>
                                                    <p className={styles.quoteText}>
                                                        {q.title ? (
                                                            <>
                                                                <span className={styles.quoteTitle}>{q.title}</span>
                                                                <span className={styles.quoteDash}> — </span>
                                                            </>
                                                        ) : null}
                                                        <span>{q.text}</span>
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
                <BottomBlock>
                    <Button >Finish test</Button>
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