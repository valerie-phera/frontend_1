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
import {
    writeBasicFormSnapshot,
    resolveBasicFormState,
} from "../../shared/utils/basicFormSessionStorage";
import { writeAddDetailsDraft } from "../../shared/utils/addDetailsDraftSessionStorage";
import { writeActiveResultMeta } from "../../shared/utils/activeResultSessionStorage";

import InfoCircle from "../../assets/icons/InfoCircle";

import styles from "./AddDetailsBasicPage.module.css";

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

        // Persist locally for the next steps (no backend yet)
        writeBasicFormSnapshot(phValue, timestamp, {
            age,
            lifeStage,
            ethnicBackground: ethnicForApi,
            ethnicOtherText: hasOtherChip ? trimmedOtherForState : "",
        });
        writeAddDetailsDraft(phValue, timestamp, {
            age,
            lifeStage,
            ethnicBackground: ethnicForApi,
            ethnicOtherText: hasOtherChip ? trimmedOtherForState : "",
        });
        writeActiveResultMeta({ phValue, timestamp });

        navigate("/add-details/hormonal-health", {
            state: {
                phValue,
                timestamp,
                recommendations,
                age,
                lifeStage,
                ethnicBackground: ethnicForApi,
                ethnicOtherText: hasOtherChip ? trimmedOtherForState : "",
            },
        });
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
                    >
                        Next
                    </Button>
                    <ButtonReverse onClick={() => navigate("/result")}>Go back</ButtonReverse>
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
