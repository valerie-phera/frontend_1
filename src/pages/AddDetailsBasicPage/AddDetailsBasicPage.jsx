import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useMemo, useRef } from "react";

import PersonalData from "../../components/PersonalData/PersonalData";
import {
    ETHNIC_OTHER_OPTION,
    ETHNIC_OPTIONS,
} from "../../components/PersonalData/EthnicBackground/EthnicBackground";
import BottomBlock from "../../components/BottomBlock/BottomBlock";
import Button from "../../components/Button/Button";
import ButtonReverse from "../../components/ButtonReverse/ButtonReverse";
import Container from "../../components/Container/Container";
import { analyzePh } from "../../shared/api/images-api";
import { getInterpretation } from "../../shared/utils/getInterpretation";
import {
    writeBasicFormSnapshot,
    resolveBasicFormState,
    markPendingInterceptResultToBasic,
} from "../../shared/utils/basicFormSessionStorage";

import InfoCircle from "../../assets/icons/InfoCircle";

import styles from "./AddDetailsBasicPage.module.css";

const getPhLevel = (ph) => {
    if (ph < 4.5) return "Normal";
    if (ph >= 4.5 && ph <= 4.9) return "Slightly Elevated";
    return "Elevated";
};

const toArray = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (value === undefined || value === null || value === "") return [];
    return [value].filter(Boolean);
};

const buildEthnicBackgroundsForSubmit = (backgrounds, otherText) => {
    const trimmed = String(otherText ?? "").trim().slice(0, 50);
    const bgSet = new Set(backgrounds);
    const hasOther = bgSet.has(ETHNIC_OTHER_OPTION);
    const mainOrdered = ETHNIC_OPTIONS.filter(
        (o) => o !== ETHNIC_OTHER_OPTION && bgSet.has(o)
    );
    if (!hasOther || !trimmed) {
        return mainOrdered;
    }
    return [...mainOrdered, trimmed];
};

const computeBasicSectionIssues = (
    age,
    lifeStage,
    ethnicBackground,
    ethnicOtherText
) => {
    const ageMissing =
        age === "" ||
        age === undefined ||
        age === null ||
        (typeof age === "number" && Number.isNaN(age));

    const lifeMissing = !Array.isArray(lifeStage) || lifeStage.length === 0;

    const ethnicEmpty =
        !Array.isArray(ethnicBackground) || ethnicBackground.length === 0;
    const otherIncomplete =
        Array.isArray(ethnicBackground) &&
        ethnicBackground.includes(ETHNIC_OTHER_OPTION) &&
        String(ethnicOtherText ?? "").trim() === "";
    const ethnicMissing = ethnicEmpty || otherIncomplete;

    const count =
        (ageMissing ? 1 : 0) +
        (lifeMissing ? 1 : 0) +
        (ethnicMissing ? 1 : 0);

    return { ageMissing, lifeMissing, ethnicMissing, count };
};

const AddDetailsBasicPage = () => {
    const navigate = useNavigate();
    const { state, key: locationKey } = useLocation();
    const phValue = state?.phValue;
    const timestamp = state?.timestamp;
    const recommendations = state?.recommendations;

    const [age, setAge] = useState(() => resolveBasicFormState(state).age);
    const [lifeStage, setLifeStage] = useState(
        () => resolveBasicFormState(state).lifeStage
    );
    const [ethnicBackground, setEthnicBackground] = useState(
        () => resolveBasicFormState(state).ethnicChips
    );
    const [ethnicOtherText, setEthnicOtherText] = useState(
        () => resolveBasicFormState(state).ethnicOtherText
    );
    const [isSaving, setIsSaving] = useState(false);
    const [basicValidationVisible, setBasicValidationVisible] = useState(false);
    const [errorBannerScrollToken, setErrorBannerScrollToken] = useState(0);
    const errorTextWrapRef = useRef(null);

    const basicSectionIssues = useMemo(
        () =>
            computeBasicSectionIssues(
                age,
                lifeStage,
                ethnicBackground,
                ethnicOtherText
            ),
        [age, lifeStage, ethnicBackground, ethnicOtherText]
    );

    useEffect(() => {
        const next = resolveBasicFormState(state);
        setAge(next.age ?? "");
        setLifeStage(Array.isArray(next.lifeStage) ? next.lifeStage : []);
        setEthnicBackground(next.ethnicChips);
        setEthnicOtherText(next.ethnicOtherText);
    }, [locationKey]);

    useEffect(() => {
        if (basicValidationVisible && basicSectionIssues.count === 0) {
            setBasicValidationVisible(false);
        }
    }, [basicValidationVisible, basicSectionIssues.count]);

    useEffect(() => {
        if (errorBannerScrollToken === 0) return;
        let cancelled = false;
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (cancelled) return;
                errorTextWrapRef.current?.scrollIntoView({
                    block: "end",
                    behavior: "smooth",
                    inline: "nearest",
                });
            });
        });
        return () => {
            cancelled = true;
        };
    }, [errorBannerScrollToken]);

    const handleSaveDetails = async () => {
        if (phValue === undefined || phValue === null) {
            alert("Missing pH result. Please go back and complete the test.");
            return;
        }

        if (basicSectionIssues.count > 0) {
            setBasicValidationVisible(true);
            setErrorBannerScrollToken((t) => t + 1);
            return;
        }
        setBasicValidationVisible(false);

        const ageTrimmed = String(age ?? "").trim();
        let ageForApi = undefined;
        if (ageTrimmed !== "") {
            const ageNum = parseInt(ageTrimmed, 10);
            if (Number.isNaN(ageNum) || ageNum < 1) {
                alert("Please enter a valid age, or leave the field empty.");
                return;
            }
            ageForApi = ageNum;
        }

        if (ethnicBackground.includes(ETHNIC_OTHER_OPTION)) {
            const t = String(ethnicOtherText ?? "").trim();
            if (!t) {
                alert("Please specify your background for “+ Other”, or deselect it.");
                return;
            }
        }

        const ethnicForApi = buildEthnicBackgroundsForSubmit(
            ethnicBackground,
            ethnicOtherText
        );

        const trimmedOtherForState = String(ethnicOtherText ?? "")
            .trim()
            .slice(0, 50);
        const hasOtherChip = ethnicBackground.includes(ETHNIC_OTHER_OPTION);

        const payload = {
            ph_value: Number(phValue),
            age: ageForApi ?? null,
            life_stage: toArray(lifeStage),
            diagnoses: [],
            ethnic_backgrounds: ethnicForApi,
            menstrual_cycle: null,
            birth_control: {
                general: null,
                pill: null,
                iud: null,
                other_methods: [],
                permanent: [],
            },
            hormone_therapy: [],
            hrt: [],
            fertility_journey: {
                current_status: null,
                fertility_treatments: [],
            },
            symptoms: {
                discharge: [],
                vulva_vagina: [],
                smell: [],
                urine: [],
                notes: "",
            },
        };
        console.log("Request:", payload);

        setIsSaving(true);
        try {
            const backendResponse = await analyzePh(payload);
            console.log("Analyze API raw response:", backendResponse);
            const nextPhValue = Number(
                backendResponse?.phValue ?? backendResponse?.ph_value ?? phValue
            );
            const nextPhLevel = getPhLevel(nextPhValue);
            const nextInterpretation = getInterpretation(
                nextPhLevel,
                nextPhValue.toFixed(2)
            );

            writeBasicFormSnapshot(phValue, timestamp, {
                age,
                lifeStage,
                ethnicBackground: ethnicForApi,
                ethnicOtherText: hasOtherChip ? trimmedOtherForState : "",
            });

            markPendingInterceptResultToBasic({
                phValue,
                timestamp,
                recommendations:
                    backendResponse?.agent_reply ?? recommendations,
            });

            navigate("/result-with-details", {
                state: {
                    phValue: nextPhValue,
                    phLevel: nextPhLevel,
                    timestamp,
                    interpretation: nextInterpretation,
                    recommendations:
                        backendResponse?.agent_reply ?? recommendations,
                    citations: backendResponse?.citations ?? [],
                    age,
                    lifeStage,
                    ethnicBackground: ethnicForApi,
                    ethnicOtherText: hasOtherChip ? trimmedOtherForState : "",
                },
            });
        } catch (err) {
            alert(`Failed: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <div className={styles.content} data-scroll-container>
                <Container>
                    <div className={styles.containerInner}>
                        <div className={styles.crumbs}>
                            <div className={styles.itemColored}></div>
                            <div className={styles.item}></div>
                            <div className={styles.item}></div>
                        </div>
                        <div className={styles.step}>Step 1 of 3 - About You</div>
                        <div className={styles.heading}>
                            <h1 className={styles.title}>Let’s start with the basics</h1>
                        </div>
                        <p className={styles.subtitle}>This helps us personalise your insights.</p>
                        <div className={styles.personalData}>
                            <PersonalData
                                variant="basic"
                                age={age}
                                setAge={setAge}
                                lifeStage={lifeStage}
                                setLifeStage={setLifeStage}
                                ethnicBackground={ethnicBackground}
                                setEthnicBackground={setEthnicBackground}
                                ethnicOtherText={ethnicOtherText}
                                setEthnicOtherText={setEthnicOtherText}
                                basicValidationVisible={basicValidationVisible}
                                basicSectionIssues={basicSectionIssues}
                            />
                        </div>
                        {basicValidationVisible &&
                            basicSectionIssues.count > 0 && (
                                <div
                                    ref={errorTextWrapRef}
                                    className={styles.errorTextWrap}
                                    role="alert"
                                >
                                    <div
                                        className={styles.errorIcon}
                                        aria-hidden
                                    >
                                        <InfoCircle />
                                    </div>
                                    <p className={styles.errorText}>
                                        {basicSectionIssues.count === 1
                                            ? "1 section still needs a selection"
                                            : basicSectionIssues.count === 2
                                                ? "2 sections still need a selection"
                                                : "3 sections still need a selection"}
                                    </p>
                                </div>
                            )}
                    </div>
                </Container>
                <BottomBlock>
                    <Button
                        onClick={handleSaveDetails}
                        disabled={isSaving}
                    >
                        {isSaving ? "Saving…" : "Save details"}
                    </Button>
                    <ButtonReverse onClick={() => navigate("/result-without-details")}>Go back</ButtonReverse>
                    <div className={styles.privacyPolicyWrap}>
                        <p className={styles.privacyPolicy}>
                            We respect your privacy. Only you can save and see your results.
                        </p>
                    </div>
                </BottomBlock>
            </div>
        </>
    )
};

export default AddDetailsBasicPage;
