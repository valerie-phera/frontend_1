import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useMemo, useRef } from "react";

import PersonalData from "../../components/PersonalData/PersonalData";
import {
    ETHNIC_OTHER_OPTION,
    ETHNIC_OPTIONS,
} from "../../components/PersonalData/EthnicBackground/ethnicOptions";
import { FORM_PREFER_NOT_TO_SAY } from "../../shared/constants/formDetailOptions";
import { stripNoneToken } from "../../shared/utils/toggleListItem";
import { stripDetailOptions } from "../../shared/utils/detailChipSelection";
import BottomBlock from "../../components/BottomBlock/BottomBlock";
import Button from "../../components/Button/Button";
import ButtonReverse from "../../components/ButtonReverse/ButtonReverse";
import Container from "../../components/Container/Container";
import {
    writeBasicFormSnapshot,
    resolveBasicFormState,
} from "../../shared/utils/basicFormSessionStorage";
import { readAddDetailsDraft } from "../../shared/utils/addDetailsDraftSessionStorage";
import { writeAddDetailsDraft } from "../../shared/utils/addDetailsDraftSessionStorage";
import {
    isStepSkipped,
    persistBasicSkip,
    readPreSkipSnapshot,
} from "../../shared/utils/addDetailsSkipStorage";
import { writeActiveResultMeta } from "../../shared/utils/activeResultSessionStorage";

import AddDetailsSkipButton from "../../components/AddDetailsSkipButton/AddDetailsSkipButton";

import styles from "./AddDetailsBasicPage.module.css";

const buildEthnicBackgroundsForSubmit = (backgrounds, otherText) => {
    const bgSet = new Set(Array.isArray(backgrounds) ? backgrounds : []);
    if (bgSet.has(FORM_PREFER_NOT_TO_SAY)) {
        return [FORM_PREFER_NOT_TO_SAY];
    }

    const trimmed = String(otherText ?? "").trim().slice(0, 50);
    const hasOther = bgSet.has(ETHNIC_OTHER_OPTION);
    const mainOrdered = ETHNIC_OPTIONS.filter(
        (o) => o !== ETHNIC_OTHER_OPTION && bgSet.has(o)
    );
    if (!hasOther || !trimmed) {
        return mainOrdered;
    }
    return [...mainOrdered, trimmed];
};

const buildBasicFormPatch = (
    age,
    lifeStage,
    ethnicBackground,
    ethnicOtherText
) => {
    const trimmedOtherForState = String(ethnicOtherText ?? "")
        .trim()
        .slice(0, 50);
    const hasOtherChip = Array.isArray(ethnicBackground)
        ? ethnicBackground.includes(ETHNIC_OTHER_OPTION)
        : false;
    const ethnicForApi = Array.isArray(ethnicBackground)
        ? buildEthnicBackgroundsForSubmit(ethnicBackground, ethnicOtherText)
        : [];

    return {
        age: age ?? "",
        lifeStage: stripNoneToken(lifeStage),
        ethnicBackground: ethnicForApi,
        ethnicOtherText: hasOtherChip ? trimmedOtherForState : "",
        /** Exact chip selection for modal + main screen restore after reload. */
        ethnicChips: Array.isArray(ethnicBackground) ? [...ethnicBackground] : [],
    };
};

const buildBasicRouteState = (
    phValue,
    timestamp,
    recommendations,
    age,
    lifeStage,
    ethnicBackground,
    ethnicOtherText
) => {
    const trimmedOtherForState = String(ethnicOtherText ?? "")
        .trim()
        .slice(0, 50);
    const hasOtherChip = Array.isArray(ethnicBackground)
        ? ethnicBackground.includes(ETHNIC_OTHER_OPTION)
        : false;
    const ethnicForApi = Array.isArray(ethnicBackground)
        ? buildEthnicBackgroundsForSubmit(ethnicBackground, ethnicOtherText)
        : [];

    return {
        phValue,
        timestamp,
        recommendations,
        age: age ?? "",
        lifeStage: stripDetailOptions(stripNoneToken(lifeStage)),
        ethnicBackground: stripDetailOptions(ethnicForApi),
        ethnicOtherText: hasOtherChip ? trimmedOtherForState : "",
    };
};

const computeBasicSectionIssues = (
    age,
    lifeStage,
    ethnicBackground,
    ethnicOtherText
) => {
    const AGE_MIN = 18;
    const AGE_MAX = 120;

    const ageMissing =
        age === "" ||
        age === undefined ||
        age === null ||
        (typeof age === "number" && Number.isNaN(age));

    const parsedAge =
        ageMissing
            ? null
            : typeof age === "number"
                ? age
                : Number(String(age).trim());
    const ageInvalid =
        !ageMissing &&
        (parsedAge === null ||
            Number.isNaN(parsedAge) ||
            parsedAge < AGE_MIN ||
            parsedAge > AGE_MAX);

    const lifeMissing = !Array.isArray(lifeStage) || lifeStage.length === 0;

    const ethnicEmpty =
        !Array.isArray(ethnicBackground) || ethnicBackground.length === 0;
    const ethnicOtherMissing =
        Array.isArray(ethnicBackground) &&
        ethnicBackground.includes(ETHNIC_OTHER_OPTION) &&
        String(ethnicOtherText ?? "").trim() === "";
    const ethnicMissing = ethnicEmpty || ethnicOtherMissing;

    const count =
        ((ageMissing || ageInvalid) ? 1 : 0) +
        (lifeMissing ? 1 : 0) +
        (ethnicMissing ? 1 : 0);

    const bannerCount = count - (ethnicOtherMissing ? 1 : 0);

    return {
        ageMissing,
        ageInvalid,
        lifeMissing,
        ethnicMissing,
        ethnicOtherMissing,
        count,
        bannerCount,
    };
};

const AddDetailsBasicPage = () => {
    const navigate = useNavigate();
    const { state, key: locationKey } = useLocation();
    const phValue = state?.phValue;
    const timestamp = state?.timestamp;
    const recommendations = state?.recommendations;

    const initialBasic = useMemo(() => resolveBasicFormState(state), [state]);
    const initialDraft = useMemo(
        () => readAddDetailsDraft(phValue, timestamp),
        [phValue, timestamp]
    );
    const initialSkipped = useMemo(
        () =>
            initialBasic.basicSkipped || isStepSkipped(initialDraft, "basic"),
        [initialBasic.basicSkipped, initialDraft]
    );
    const initialPreSkipSnapshot = useMemo(
        () =>
            initialBasic.basicPreSkipSnapshot ??
            readPreSkipSnapshot(initialDraft, "basic"),
        [initialBasic.basicPreSkipSnapshot, initialDraft]
    );
    const initialDisplayFields = useMemo(() => {
        if (initialSkipped && initialPreSkipSnapshot) {
            return {
                age: initialPreSkipSnapshot.age ?? "",
                lifeStage: stripNoneToken(initialPreSkipSnapshot.lifeStage),
                ethnicBackground: Array.isArray(
                    initialPreSkipSnapshot.ethnicBackground
                )
                    ? initialPreSkipSnapshot.ethnicBackground
                    : [],
                ethnicOtherText: initialPreSkipSnapshot.ethnicOtherText ?? "",
            };
        }
        return {
            age: initialBasic.age,
            lifeStage: initialBasic.lifeStage,
            ethnicBackground: initialBasic.ethnicChips,
            ethnicOtherText: initialBasic.ethnicOtherText,
        };
    }, [initialSkipped, initialPreSkipSnapshot, initialBasic]);

    const [age, setAge] = useState(() => initialDisplayFields.age);
    const [lifeStage, setLifeStage] = useState(
        () => initialDisplayFields.lifeStage
    );
    const [ethnicBackground, setEthnicBackground] = useState(
        () => initialDisplayFields.ethnicBackground
    );
    const [ethnicOtherText, setEthnicOtherText] = useState(
        () => initialDisplayFields.ethnicOtherText
    );
    const [basicValidationVisible, setBasicValidationVisible] = useState(false);
    const [isSkipped, setIsSkipped] = useState(() => initialSkipped);
    const [preSkipSnapshot, setPreSkipSnapshot] = useState(
        () => initialPreSkipSnapshot
    );
    const [errorBannerScrollToken, setErrorBannerScrollToken] = useState(0);
    const personalizeHintRef = useRef(null);

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
        const draft = readAddDetailsDraft(phValue, timestamp);
        const skipped = next.basicSkipped || isStepSkipped(draft, "basic");
        const snap =
            next.basicPreSkipSnapshot ?? readPreSkipSnapshot(draft, "basic");

        setIsSkipped(skipped);
        setPreSkipSnapshot(snap);

        if (skipped && snap) {
            setAge(snap.age ?? "");
            setLifeStage(stripNoneToken(snap.lifeStage));
            setEthnicBackground(
                Array.isArray(snap.ethnicBackground)
                    ? snap.ethnicBackground
                    : []
            );
            setEthnicOtherText(snap.ethnicOtherText ?? "");
        } else {
            setAge(next.age ?? "");
            setLifeStage(stripNoneToken(next.lifeStage));
            setEthnicBackground(next.ethnicChips);
            setEthnicOtherText(next.ethnicOtherText);
        }
    }, [locationKey, state, phValue, timestamp]);

    useEffect(() => {
        if (basicValidationVisible && basicSectionIssues.count === 0) {
            setBasicValidationVisible(false);
        }
    }, [basicValidationVisible, basicSectionIssues.count]);

    useEffect(() => {
        if (phValue === undefined || phValue === null || isSkipped) return;

        const formPatch = buildBasicFormPatch(
            age,
            lifeStage,
            ethnicBackground,
            ethnicOtherText
        );
        writeBasicFormSnapshot(phValue, timestamp, formPatch);
        writeAddDetailsDraft(phValue, timestamp, formPatch);
    }, [
        phValue,
        timestamp,
        age,
        lifeStage,
        ethnicBackground,
        ethnicOtherText,
        isSkipped,
    ]);

    useEffect(() => {
        if (errorBannerScrollToken === 0) return;
        let cancelled = false;
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (cancelled) return;
                personalizeHintRef.current?.scrollIntoView({
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

    const handleSkipForNow = () => {
        if (isSkipped) {
            const restored = preSkipSnapshot;
            if (restored) {
                setAge(restored.age ?? "");
                setLifeStage(
                    Array.isArray(restored.lifeStage) ? restored.lifeStage : []
                );
                setEthnicBackground(
                    Array.isArray(restored.ethnicBackground)
                        ? restored.ethnicBackground
                        : []
                );
                setEthnicOtherText(restored.ethnicOtherText ?? "");
            }
            setPreSkipSnapshot(null);
            setIsSkipped(false);
            if (phValue !== undefined && phValue !== null) {
                const ethnicForApi = restored
                    ? buildEthnicBackgroundsForSubmit(
                          restored.ethnicBackground ?? [],
                          restored.ethnicOtherText ?? ""
                      )
                    : [];
                persistBasicSkip(phValue, timestamp, {
                    skipped: false,
                    preSkipSnapshot: null,
                    formPatch: restored
                        ? {
                              age: restored.age ?? "",
                              lifeStage: stripNoneToken(restored.lifeStage),
                              ethnicBackground: ethnicForApi,
                              ethnicOtherText: restored.ethnicOtherText ?? "",
                          }
                        : {},
                });
            }
            return;
        }

        const snapshot = {
            age,
            lifeStage: Array.isArray(lifeStage) ? [...lifeStage] : [],
            ethnicBackground: Array.isArray(ethnicBackground)
                ? [...ethnicBackground]
                : [],
            ethnicOtherText,
        };
        setPreSkipSnapshot(snapshot);
        setBasicValidationVisible(false);
        setIsSkipped(true);
        if (phValue !== undefined && phValue !== null) {
            persistBasicSkip(phValue, timestamp, {
                skipped: true,
                preSkipSnapshot: snapshot,
                formPatch: buildBasicFormPatch(
                    age,
                    lifeStage,
                    ethnicBackground,
                    ethnicOtherText
                ),
            });
        }
    };

    const handleSaveDetails = async () => {
        if (phValue === undefined || phValue === null) {
            alert("Missing pH result. Please go back and complete the test.");
            return;
        }

        if (isSkipped) {
            persistBasicSkip(phValue, timestamp, {
                skipped: true,
                preSkipSnapshot,
                formPatch: buildBasicFormPatch(
                    age,
                    lifeStage,
                    ethnicBackground,
                    ethnicOtherText
                ),
            });
            writeActiveResultMeta({ phValue, timestamp });

            navigate("/add-details/hormonal-health", {
                state: buildBasicRouteState(
                    phValue,
                    timestamp,
                    recommendations,
                    age,
                    lifeStage,
                    ethnicBackground,
                    ethnicOtherText
                ),
            });
            return;
        }

        if (basicSectionIssues.count > 0) {
            setBasicValidationVisible(true);
            setErrorBannerScrollToken((t) => t + 1);
            return;
        }
        setBasicValidationVisible(false);

        const ageTrimmed = String(age ?? "").trim();
        if (ageTrimmed !== "") {
            const ageNum = parseInt(ageTrimmed, 10);
            if (Number.isNaN(ageNum) || ageNum < 1) {
                alert("Please enter a valid age, or leave the field empty.");
                return;
            }
        }

        if (ethnicBackground.includes(ETHNIC_OTHER_OPTION)) {
            const t = String(ethnicOtherText ?? "").trim();
            if (!t) {
                alert("Please specify your background for “+ Other”, or deselect it.");
                return;
            }
        }

        persistBasicSkip(phValue, timestamp, {
            skipped: false,
            preSkipSnapshot: null,
            formPatch: buildBasicFormPatch(
                age,
                lifeStage,
                ethnicBackground,
                ethnicOtherText
            ),
        });
        writeActiveResultMeta({ phValue, timestamp });

        navigate("/add-details/hormonal-health", {
            state: buildBasicRouteState(
                phValue,
                timestamp,
                recommendations,
                age,
                lifeStage,
                ethnicBackground,
                ethnicOtherText
            ),
        });
    };

    const handleGoBack = () => {
        if (phValue !== undefined && phValue !== null) {
            persistBasicSkip(phValue, timestamp, {
                skipped: isSkipped,
                preSkipSnapshot: isSkipped ? preSkipSnapshot : null,
                formPatch: buildBasicFormPatch(
                    age,
                    lifeStage,
                    ethnicBackground,
                    ethnicOtherText
                ),
            });
            writeActiveResultMeta({ phValue, timestamp });
        }
        navigate(-1);
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
                                skipped={isSkipped}
                            />
                        </div>
                    </div>
                </Container>
                <BottomBlock>
                    <AddDetailsSkipButton
                        isSkipped={isSkipped}
                        onClick={handleSkipForNow}
                    />
                    {!isSkipped &&
                        basicValidationVisible &&
                        basicSectionIssues.count > 0 && (
                            <p
                                ref={personalizeHintRef}
                                className={styles.personalizeHint}
                                role="alert"
                            >
                                Answering these questions helps personalize your
                                result. You can also skip for now.
                            </p>
                        )}
                    <Button
                        className={styles.nextButton}
                        onClick={handleSaveDetails}
                    >
                        Next
                    </Button>
                    <ButtonReverse onClick={handleGoBack}>Go back</ButtonReverse>
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
