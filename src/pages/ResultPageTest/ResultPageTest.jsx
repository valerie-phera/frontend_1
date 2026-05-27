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
import PersonIcon from "../../assets/icons/PersonIcon";
import ClockFill from "../../assets/icons/ClockFill";

import {
    consumePendingInterceptResultToBasic,
    resolveBasicFormState,
} from "../../shared/utils/basicFormSessionStorage";
import useExportResults from "../../hooks/useExportResults";
import {
    PH_SCALE_MAX,
    PH_SCALE_MIN,
    SCALE_GRADIENT,
    clientXToPhScale,
    getMarkerLayout,
} from "../../shared/utils/phScaleMarker";

import styles from "./ResultPageTest.module.css";

const MIN_PH = PH_SCALE_MIN;
const MAX_PH = PH_SCALE_MAX;
const DEFAULT_PH = 4.3;
const PH_STEP = 0.1;

const DETAIL_TAGS = ["Age", "Ethnicity", "Hormones", "Symptoms"];

const LEVEL_CONFIG = {
    Normal: {
        unlockBg: "rgba(198, 201, 85, 0.12)",
        bullets: [
            "Ethnic background shifts what a healthy pH looks like.",
            "Intimate washes or cosmetics can temporarily affect pH.",
        ],
    },
    "Slightly Elevated": {
        unlockBg: "rgba(82, 99, 56, 0.12)",
        bullets: [
            "Intimate wash, soap, or lubricant can raise pH temporarily.",
            "Antibiotics raise pH by 1–2 points.",
        ],
    },
    Elevated: {
        unlockBg: "rgba(12, 20, 70, 0.12)",
        bullets: [
            "Ethnic background changes what elevated means.",
            "Life stage - postpartum & perimenopause have higher baselines.",
        ],
    },
};

const clampPh = (n) => {
    const r = Math.round(n * 10) / 10;
    return Math.min(MAX_PH, Math.max(MIN_PH, r));
};

const getPhLevel = (ph) => {
    if (ph < 4.5) return "Normal";
    if (ph >= 4.5 && ph <= 4.9) return "Slightly Elevated";
    return "Elevated";
};

const getCardCopy = (level, phValueFixed) => {
    if (level === "Normal") {
        return {
            bold: `A vaginal pH of ${phValueFixed} is within the healthy range. `,
            regular: "Personalize your result to confirm this is normal for your body.",
        };
    }
    if (level === "Slightly Elevated") {
        return {
            bold: `A vaginal pH of ${phValueFixed} is slightly elevated. `,
            regular:
                "For many women this is completely normal - depending on your cycle, background, and hormones. Add your details to find out.",
        };
    }
    return {
        bold: `A vaginal pH of ${phValueFixed} is elevated and not considered within the usual range. `,
        regular: "Add your details - the picture may be different than it looks.",
    };
};

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

    const formatDate = () => {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, "0");
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const year = String(now.getFullYear()).slice(-2);
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        return `${day}.${month}.${year} | ${hours}:${minutes} ${ampm}`;
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

    const clientXToPh = useCallback(
        (clientX) => clampPh(clientXToPhScale(clientX, scaleRef.current, MIN_PH, MAX_PH)),
        [],
    );

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
    const levelConfig = LEVEL_CONFIG[phLevel];
    const timestamp = formatDate();
    const { leftPercent: markerLeftPercent, bgPosX: markerBgPosX } = getMarkerLayout(
        phValue,
        scaleWidthPx,
    );
    const atMin = phValue <= MIN_PH;
    const atMax = phValue >= MAX_PH;

    const recommendations = [];
    const phValueFixed = phValue.toFixed(1);
    const cardCopy = getCardCopy(phLevel, phValueFixed);
    const interpretation = `${cardCopy.bold}${cardCopy.regular}`;

    const onExportClick = () => {
        handleExport({
            phValue,
            phLevel,
            timestamp,
            interpretation,
            detailOptions: [],
            recommendations,
            overviewInsights: [],
        });
    };

    return (
        <>
            <div className={styles.content}>
                <Container>
                    <div className={styles.section}>
                        <h1 className={styles.title}>Enter your pH</h1>

                        <div className={styles.container}>
                            <div className={styles.resultCard}>
                                <div className={styles.resultInner}>
                                    <div className={styles.cardTop}>
                                        <PhBadge level={phLevel} variant="result" />
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
                                        <div className={styles.numberDate}>
                                            <div className={styles.num}>{phValue.toFixed(1)}</div>
                                            <div className={styles.date}>{timestamp}</div>
                                        </div>
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

                                    <div className={styles.scaleBlock}>
                                        <div
                                            ref={scaleRef}
                                            className={styles.scale}
                                            style={{ background: SCALE_GRADIENT }}
                                            onPointerDown={onScalePointerDown}
                                        >
                                            <div
                                                data-scale-marker
                                                className={`${styles.scaleMarkerHit} ${isDragging ? styles.scaleMarkerDragging : ""}`}
                                                style={{ left: `${markerLeftPercent}%` }}
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
                                        <div className={styles.scaleLabels}>
                                            <span>{MIN_PH.toFixed(1)}</span>
                                            <span>{MAX_PH.toFixed(1)}</span>
                                        </div>
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
                                                <div className={styles.infoIcon}>
                                                    <InfoCircleBlack />
                                                </div>
                                                <h3>What does vaginal pH mean?</h3>
                                            </div>
                                            <div className={styles.infoItem}>
                                                <div className={`${styles.infoPoint} ${styles.normal}`} />
                                                <div className={styles.infoInner}>
                                                    <h4>pH 3.5 to 4.4</h4>
                                                    <div className={styles.valueNorm}>Normal</div>
                                                    <p>
                                                        Considered normal - protective acidity that keeps the microbiome balanced.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={styles.infoItem}>
                                                <div className={`${styles.infoPoint} ${styles.slightlyElevated}`} />
                                                <div className={styles.infoInner}>
                                                    <h4>pH 4.5 to 4.9</h4>
                                                    <div className={styles.valueSlElev}>Slightly elevated</div>
                                                    <p>
                                                        Considered mildly elevated - can be normal around your period or hormonal shifts.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={styles.infoItem}>
                                                <div className={`${styles.infoPoint} ${styles.elevated}`} />
                                                <div className={styles.infoInner}>
                                                    <h4>pH 5.0 to 7.0</h4>
                                                    <div className={styles.valueElev}>Elevated</div>
                                                    <p>
                                                        Considered elevated - outside the typical range. May reflect a microbiome change.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.cardText}>
                                    <div className={styles.divider} />
                                    <p
                                        key={phLevel}
                                        className={`${styles.interpretation} ${styles.phLevelContent}`}
                                    >
                                        <span className={styles.bold}>{cardCopy.bold}</span>
                                        <br />
                                        {cardCopy.regular}
                                    </p>
                                </div>
                            </div>

                            <div
                                className={styles.unlockCard}
                                style={{ backgroundColor: levelConfig.unlockBg }}
                            >
                                <div className={styles.unlockHeader}>
                                    <span className={styles.unlockHeaderIcon}>
                                        <PersonIcon />
                                    </span>
                                    <h3>Get personalized insights</h3>
                                </div>

                                <div className={styles.unlockBody}>
                                    <ul key={phLevel} className={`${styles.bullets} ${styles.phLevelContent}`}>
                                        {levelConfig.bullets.map((text) => (
                                            <li key={text} className={styles.bulletItem}>
                                                <span className={styles.bulletDot} aria-hidden="true" />
                                                <span>{text}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className={styles.detailsRow}>
                                        <p className={styles.timeRow}>
                                            <ClockFill className={styles.timeIcon} />
                                            Takes about 2 minutes.
                                        </p>
                                        <div className={styles.tags}>
                                            {DETAIL_TAGS.map((tag) => (
                                                <span key={tag} className={styles.tag}>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
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
                        <p className={styles.notif}>
                            Your data stays private and is never shared without your consent
                        </p>
                    </div>
                </BottomBlock>
            </div>
        </>
    );
};

export default ResultPageTest;
