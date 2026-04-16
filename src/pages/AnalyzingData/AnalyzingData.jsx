import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import analyzingDataImg from "../../assets/images/analyzingDataImg.png"

import Container from "../../components/Container/Container";
import ImageWrapper from "../../components/ImageWrapper/ImageWrapper";

import CheckIcon_16 from "../../assets/icons/CheckIcon_16";
import CheckCircle from "../../assets/icons/CheckCircle";

import styles from "./AnalyzingData.module.css";
import { analyzePh } from "../../shared/api/images-api";
import { readAddDetailsDraft } from "../../shared/utils/addDetailsDraftSessionStorage";
import { readActiveResultMeta } from "../../shared/utils/activeResultSessionStorage";
import { clearPendingAnalysis, readPendingAnalysis } from "../../shared/utils/pendingAnalysisSessionStorage";
import { getInterpretation } from "../../shared/utils/getInterpretation";

const MIN_WAIT_MS = 6_000;

const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

const getPhLevel = (ph) => {
    const n = Number(ph);
    if (Number.isNaN(n)) return "Elevated";
    if (n < 4.5) return "Normal";
    if (n >= 4.5 && n <= 4.9) return "Slightly Elevated";
    return "Elevated";
};

const firstOrNull = (value) => {
    if (Array.isArray(value)) return value[0] ?? null;
    if (value === undefined || value === "") return null;
    return value ?? null;
};

const toArray = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (value === undefined || value === null || value === "") return [];
    return [value].filter(Boolean);
};

const stripTokens = (value, tokens) => {
    const arr = toArray(value);
    if (!Array.isArray(tokens) || tokens.length === 0) return arr;
    const set = new Set(tokens);
    return arr.filter((x) => !set.has(x));
};

const toArrayForApi = (value, extraTokens = []) =>
    stripTokens(value, ["None", ...extraTokens]);

const AnalyzingData = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const [status, setStatus] = useState("idle"); // idle | loading | error
    const [errorText, setErrorText] = useState("");
    const [retryToken, setRetryToken] = useState(0);

    const activeMeta = readActiveResultMeta();
    const pending = readPendingAnalysis();

    const phValue = state?.phValue ?? pending?.phValue ?? activeMeta?.phValue;
    const timestamp = state?.timestamp ?? pending?.timestamp ?? activeMeta?.timestamp;

    const startedAt = pending?.startedAt ?? Date.now();

    const draft = useMemo(
        () => readAddDetailsDraft(phValue, timestamp),
        [phValue, timestamp]
    );

    useEffect(() => {
        if (phValue === undefined || phValue === null) {
            setStatus("error");
            setErrorText("Missing pH result. Please go back and complete the test.");
            return;
        }

        const buildPayload = () => {
            const ageTrimmed = String((draft?.age ?? state?.age) ?? "").trim();
            let ageForApi = undefined;
            if (ageTrimmed !== "") {
                const ageNum = parseInt(ageTrimmed, 10);
                if (!Number.isNaN(ageNum) && ageNum >= 1) {
                    ageForApi = ageNum;
                }
            }

            const birthControl = draft?.birthControl ?? state?.birthControl;
            const hormoneTherapy = draft?.hormoneTherapy ?? state?.hormoneTherapy;
            const fertilityJourney = draft?.fertilityJourney ?? state?.fertilityJourney;

            return {
                ph_value: Number(phValue),
                age: ageForApi ?? null,
                life_stage: toArrayForApi(draft?.lifeStage ?? state?.lifeStage),
                diagnoses: toArrayForApi(
                    draft?.hormoneDiagnoses ?? state?.hormoneDiagnoses
                ),
                ethnic_backgrounds: toArrayForApi(
                    draft?.ethnicBackground ?? state?.ethnicBackground
                ),
                menstrual_cycle: firstOrNull(draft?.menstrualCycle ?? state?.menstrualCycle),
                birth_control: {
                    general: birthControl?.general ?? null,
                    pill: birthControl?.pill ?? null,
                    iud: birthControl?.iud ?? null,
                    other_methods: toArrayForApi(birthControl?.otherHormonalMethods),
                    permanent: toArrayForApi(birthControl?.permanentMethods),
                },
                hormone_therapy: toArrayForApi(hormoneTherapy?.general),
                hrt: toArrayForApi(hormoneTherapy?.hormoneReplacement),
                fertility_journey: {
                    current_status: fertilityJourney?.currentStatus ?? null,
                    fertility_treatments: toArrayForApi(
                        fertilityJourney?.fertilityTreatments
                    ),
                },
                symptoms: {
                    discharge: toArrayForApi(draft?.discharge ?? state?.discharge, [
                        "No discharge",
                    ]),
                    vulva_vagina: toArrayForApi(
                        draft?.vulvaCondition ?? state?.vulvaCondition
                    ),
                    smell: toArrayForApi(draft?.smell ?? state?.smell),
                    urine: toArrayForApi(draft?.urination ?? state?.urination),
                    notes: String((draft?.notes ?? state?.notes) ?? ""),
                },
            };
        };

        let cancelled = false;
        setStatus("loading");
        setErrorText("");

        (async () => {
            try {
                const payload = buildPayload();
                const minWaitMs = Math.max(0, MIN_WAIT_MS - (Date.now() - startedAt));

                const [backendResponse] = await Promise.all([
                    analyzePh(payload),
                    sleep(minWaitMs),
                ]);
                if (cancelled) return;

                const nextPhValue = Number(
                    backendResponse?.phValue ?? backendResponse?.ph_value ?? phValue
                );
                const nextPhLevel = getPhLevel(nextPhValue);
                const nextInterpretation = getInterpretation(
                    nextPhLevel,
                    nextPhValue.toFixed(2)
                );

                clearPendingAnalysis();
                navigate("/result-with-details", {
                    state: {
                        ...state,
                        phValue: nextPhValue,
                        phLevel: nextPhLevel,
                        timestamp,
                        interpretation: nextInterpretation,
                        recommendations: backendResponse?.agent_reply ?? state?.recommendations,
                        citations: backendResponse?.citations ?? state?.citations ?? [],
                        age: draft?.age ?? state?.age,
                        lifeStage: stripTokens(draft?.lifeStage ?? state?.lifeStage, [
                            "None",
                        ]),
                        ethnicBackground: draft?.ethnicBackground ?? state?.ethnicBackground,
                        menstrualCycle: draft?.menstrualCycle ?? state?.menstrualCycle,
                        hormoneDiagnoses: stripTokens(
                            draft?.hormoneDiagnoses ?? state?.hormoneDiagnoses,
                            ["None"]
                        ),
                        currentMedications: stripTokens(
                            draft?.currentMedications ?? state?.currentMedications,
                            ["None"]
                        ),
                        birthControl: draft?.birthControl ?? state?.birthControl,
                        hormoneTherapy: draft?.hormoneTherapy ?? state?.hormoneTherapy,
                        fertilityJourney: draft?.fertilityJourney ?? state?.fertilityJourney,
                        discharge: stripTokens(draft?.discharge ?? state?.discharge, [
                            "None",
                            "No discharge",
                        ]),
                        vulvaCondition: stripTokens(
                            draft?.vulvaCondition ?? state?.vulvaCondition,
                            ["None"]
                        ),
                        smell: stripTokens(draft?.smell ?? state?.smell, ["None"]),
                        urination: stripTokens(draft?.urination ?? state?.urination, [
                            "None",
                        ]),
                        notes: draft?.notes ?? state?.notes,
                    },
                });
            } catch (err) {
                if (cancelled) return;
                setStatus("error");
                setErrorText(err?.message ? String(err.message) : String(err));
            }
        })();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phValue, timestamp, startedAt, retryToken, navigate]);

    return (
        <>
            <div className={styles.content}>
                <Container>
                    <div className={styles.imgWrap}>
                        <div className={styles.img}>
                            <ImageWrapper src={analyzingDataImg} alt="Analyzing Data Img" width={243} height={235} />
                        </div>
                    </div>
                    <div className={styles.textBlock}>
                        <div className={styles.greeting}>ANALYZING DATA</div>
                        <h1 className={styles.heading}>Thank you for sharing!</h1>
                        <p className={styles.text}>
                            We're now personalising your result based on your details. This usually takes some time - please stay on this screen while we work.
                        </p>
                    </div>
                    <div className={styles.reviewingBlock}>
                        <div className={styles.reviewingHeadingWrap}>
                            <div className={styles.reviewingHeading}>Reviewing your details...</div>
                            <div className={styles.reviewingValue}>30%</div>
                        </div>
                        <div className={styles.scale}>
                            <div className={styles.greyArea}></div>
                            <div className={styles.greenArea}></div>
                        </div>
                        <ul className={styles.elements}>
                            <li className={styles.item}>
                                <div className={styles.itemIcon}><CheckIcon_16 /></div>
                                <div className={styles.itemTxt}>pH value recorded</div>
                            </li>
                            <li className={styles.item}>
                                <div className={styles.itemIcon}><CheckCircle /></div>
                                <div className={styles.itemTxtProcessing}>Reviewing your details</div>
                            </li>
                            <li className={styles.item}>
                                <div className={styles.itemIconGray}></div>
                                <div className={styles.itemTxtGray}>Matching to research data</div>
                            </li>
                            <li className={styles.item}>
                                <div className={styles.itemIconGray}></div>
                                <div className={styles.itemTxtGray}>Building your tailored report</div>
                            </li>
                        </ul>
                    </div>
                    {status === "error" && (
                        <div className={styles.bottomText}>
                            <p>Failed: {errorText}</p>
                            <button
                                type="button"
                                onClick={() => {
                                    setStatus("idle");
                                    setRetryToken((t) => t + 1);
                                }}
                                style={{
                                    marginTop: 12,
                                    padding: "10px 14px",
                                    borderRadius: 10,
                                    border: "1px solid #C9D3D6",
                                    background: "#fff",
                                    cursor: "pointer",
                                }}
                            >
                                Retry
                            </button>
                        </div>
                    )}
                    <div className={styles.bottomText}><p>We respect your privacy. Only you can save and see your results.</p> </div>
                </Container>
            </div>
        </>
    )
};

export default AnalyzingData