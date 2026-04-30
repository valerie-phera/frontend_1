import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import BottomBlock from "../../components/BottomBlock/BottomBlock";
import Button from "../../components/Button/Button";
import Container from "../../components/Container/Container";
import PhBadge from "../../components/PhBadge/PhBadge";
import DownloadIcon from "../../assets/icons/DownloadIcon";
import InfoCircle_24 from "../../assets/icons/InfoCircle_24";
import InfoCircleBlack from "../../assets/icons/InfoCircleBlack";

import Minus from "../../assets/icons/Minus";
import Plus from "../../assets/icons/Plus";
import Lock from "../../assets/icons/Lock";

import { getInterpretationParts } from "../../shared/utils/getInterpretation";
import {
    consumePendingInterceptResultToBasic,
    resolveBasicFormState,
} from "../../shared/utils/basicFormSessionStorage";
import useExportResults from "../../hooks/useExportResults";

import styles from "./ResultPageTest.module.css";

const MIN_PH = 3.5;
const MAX_PH = 7.0;
const DEFAULT_PH = 4.3;
const PH_STEP = 0.1;

const clampPh = (n) => {
    const r = Math.round(n * 10) / 10;
    return Math.min(MAX_PH, Math.max(MIN_PH, r));
};

const phToPercent = (ph) => ((ph - MIN_PH) / (MAX_PH - MIN_PH)) * 100;

/** Same segment colors and 20% steps as `.scalePart1`…`.scalePart5` in CSS */
const SCALE_SEGMENT_COLORS = ["#C6C955", "#60866E", "#526338", "#33372D", "#0C1446"];
const SCALE_GRADIENT = `linear-gradient(90deg, ${SCALE_SEGMENT_COLORS.map((c, i) => {
    const a = (i / 5) * 100;
    const b = ((i + 1) / 5) * 100;
    return `${c} ${a}% ${b}%`;
}).join(", ")})`;

/** Must match `.scaleMarker` width/height in `ResultPageTest.module.css` */
const MARKER_PX = 24;

const ResultPageTest = () => {
    const navigate = useNavigate();
    const { handleExport } = useExportResults();

    useLayoutEffect(() => {
        const meta = consumePendingInterceptResultToBasic();
        if (!meta) return;
        const { phValue, timestamp, recommendations } = meta;
        const resolved = resolveBasicFormState({ phValue, timestamp });
        navigate("/add-details/basic", {
            replace: true,
            state: {
                phValue,
                timestamp,
                recommendations: recommendations ?? [],
                age: resolved.age,
                lifeStage: resolved.lifeStage,
                ethnicBackground: resolved.ethnicChips,
                ethnicOtherText: resolved.ethnicOtherText,
            },
        });
    }, [navigate]);

    const getPhLevel = (ph) => {
        if (ph < 4.5) return "Normal";
        if (ph >= 4.5 && ph <= 4.9) return "Slightly Elevated";
        return "Elevated";
    };

    const formatDate = () => {
        const now = new Date();

        const day = String(now.getDate()).padStart(2, "0");
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const year = String(now.getFullYear()).slice(-2);

        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;

        const date = `${day}.${month}.${year} | ${hours}:${minutes} ${ampm}`;
        return date;
    };

    const [phValue, setPhValue] = useState(DEFAULT_PH);
    const [isDragging, setIsDragging] = useState(false);
    const [infoOpen, setInfoOpen] = useState(false);
    const [scaleWidthPx, setScaleWidthPx] = useState(0);
    const scaleRef = useRef(null);

    useLayoutEffect(() => {
        const el = scaleRef.current;
        if (!el) return;
        const measure = () => setScaleWidthPx(el.getBoundingClientRect().width);
        measure();
        const ro = new ResizeObserver(() => measure());
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const clientXToPh = useCallback((clientX) => {
        const el = scaleRef.current;
        if (!el) return DEFAULT_PH;
        const rect = el.getBoundingClientRect();
        const t = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
        return clampPh(MIN_PH + t * (MAX_PH - MIN_PH));
    }, []);

    useEffect(() => {
        if (!isDragging) return;
        const onMove = (e) => setPhValue(clientXToPh(e.clientX));
        const onUp = () => setIsDragging(false);
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
        window.addEventListener("pointercancel", onUp);
        return () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            window.removeEventListener("pointercancel", onUp);
        };
    }, [isDragging, clientXToPh]);

    const onMarkerPointerDown = (e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        e.preventDefault();
        setIsDragging(true);
        setPhValue(clientXToPh(e.clientX));
    };

    const onScalePointerDown = (e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        if (e.target.closest("[data-scale-marker]")) return;
        setPhValue(clientXToPh(e.clientX));
    };

    const bumpPh = (delta) => {
        setPhValue((prev) => clampPh(prev + delta));
    };

    const phLevel = getPhLevel(phValue);
    const timestamp = formatDate();
    const markerPos = phToPercent(phValue);
    const markerBgPosX =
        scaleWidthPx > 0
            ? -((markerPos / 100) * scaleWidthPx - MARKER_PX / 2)
            : 0;
    const atMin = phValue <= MIN_PH;
    const atMax = phValue >= MAX_PH;

    const recommendations = [];
    const { lead: interpretationLead, suffix: interpretationSuffix } =
        getInterpretationParts(phLevel, phValue.toFixed(1));
    const interpretation = `${interpretationLead}${interpretationSuffix}`;

    const onExportClick = () => {
        handleExport({
            phValue,
            phLevel,
            timestamp,
            interpretation,
            detailOptions: [],
            recommendations,
        });
    };

    return (
        <>
            <div className={styles.content}>
                <Container>
                    <div className={styles.containerInner}>
                        <div className={styles.title}>Enter your pH </div>
                        <div className={styles.visualBlock}>
                            <div className={styles.visualBlockTop}>
                                <PhBadge level={phLevel} />
                                <div className={styles.actions}>
                                    <button
                                        type="button"
                                        className={styles.actionsInner}
                                        aria-expanded={infoOpen}
                                        aria-controls="result-ph-info"
                                        onClick={() => setInfoOpen((v) => !v)}
                                    >
                                        <span
                                            className={`${styles.infoIconWrap} ${infoOpen ? styles.infoIconWrapActive : ""}`}
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
                                </div>
                            </div>
                            <div className={styles.numWrap}>
                                <button
                                    type="button"
                                    className={styles.minus}
                                    disabled={atMin}
                                    aria-label="Decrease pH"
                                    onClick={() => bumpPh(-PH_STEP)}
                                >
                                    <Minus />
                                </button>
                                <div className={styles.num}>{phValue.toFixed(1)}</div>
                                <button
                                    type="button"
                                    className={styles.plus}
                                    disabled={atMax}
                                    aria-label="Increase pH"
                                    onClick={() => bumpPh(PH_STEP)}
                                >
                                    <Plus />
                                </button>
                            </div>
                            <div className={styles.date}>{timestamp}</div>
                            <div
                                ref={scaleRef}
                                className={styles.scale}
                                onPointerDown={onScalePointerDown}
                            >
                                <div className={styles.scalePart1}></div>
                                <div className={styles.scalePart2}></div>
                                <div className={styles.scalePart3}></div>
                                <div className={styles.scalePart4}></div>
                                <div className={styles.scalePart5}></div>
                                <div
                                    data-scale-marker
                                    className={`${styles.scaleMarkerHit} ${isDragging ? styles.scaleMarkerDragging : ""}`}
                                    style={{ left: `${markerPos}%` }}
                                    onPointerDown={onMarkerPointerDown}
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
                            id="result-ph-info"
                            className={`${styles.infoBlockWrap} ${infoOpen ? styles.infoBlockWrapOpen : ""}`}
                            aria-hidden={!infoOpen}
                        >
                            <div className={styles.infoBlockInner}>
                                <div className={styles.infoBlock}>
                                    <div className={styles.infoTilte}>
                                        <div className={styles.infoIcon}><InfoCircleBlack /></div>
                                        <h3>What does vaginal pH mean?</h3>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <div className={`${styles.infoPoint} ${styles.normal}`}></div>
                                        <div className={styles.infoInner}>
                                            <h4>pH 3.5 to 4.4</h4>
                                            <div className={styles.valueNorm}>Normal</div>
                                            <p>Considered normal - protective acidity that keeps the microbiome balanced.</p>
                                        </div>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <div className={`${styles.infoPoint} ${styles.slightlyElevated}`}></div>
                                        <div className={styles.infoInner}>
                                            <h4>pH 4.5 to 4.9</h4>
                                            <div className={styles.valueSlElev}>Slightly elevated</div>
                                            <p>Considered mildly elevated - can be normal around your period or hormonal shifts.</p>
                                        </div>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <div className={`${styles.infoPoint} ${styles.elevated}`}></div>
                                        <div className={styles.infoInner}>
                                            <h4>pH 5.0 to 7.0</h4>
                                            <div className={styles.valueElev}>Elevated</div>
                                            <p>Considered elevated - outside the typical range. May reflect a microbiome change.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.textBlock}>
                            <div className={styles.advice}>
                                <p className={styles.text}>
                                    <span className={styles.bold}>{interpretationLead}</span>
                                    {interpretationSuffix}
                                </p>
                                <div className={styles.btnTop}>
                                </div>
                            </div>
                        </div>
                        <div className={styles.unlockBlock}>
                            <div className={styles.unlockTilte}>
                                <div className={styles.unlockIcon}><Lock /></div>
                                <h3>Unlock tailored insights</h3>
                            </div>
                            <div className={styles.unlockText}>
                                <p>Want to understand why your pH looks like this?</p>
                                <p>Add a few details about you to get a fully tailored health report. It takes ~2 mins.</p>
                            </div>
                        </div>
                    </div>
                </Container>
                <BottomBlock>
                    <Button
                        onClick={() =>
                            navigate("/add-details/basic", {
                                state: {
                                    phValue,
                                    phLevel,
                                    timestamp,
                                    recommendations,
                                },
                            })
                        }
                    >
                        Add my details
                    </Button>
                    <div className={styles.notifWrap}>
                        <p className={styles.notif}>Your data stays private and is never shared without your consent</p>
                    </div>
                </BottomBlock>
            </div>
        </>
    )
};

export default ResultPageTest;
