import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Container from "../../components/Container/Container";
import BottomBlock from "../../components/BottomBlock/BottomBlock";
import Button from "../../components/Button/Button";
import ButtonReverse from "../../components/ButtonReverse/ButtonReverse";

import MenstrualCycle from "../../components/PersonalData/MenstrualCycle/MenstrualCycle";
import HormoneDiagnoses from "../../components/PersonalData/HormoneDiagnoses/HormoneDiagnoses";
import CurrentMedications from "../../components/PersonalData/CurrentMedications/CurrentMedications";

import {
    readAddDetailsDraft,
    writeAddDetailsDraft,
} from "../../shared/utils/addDetailsDraftSessionStorage";
import {
    applyDetailChipSelection,
    stripDetailOptions,
} from "../../shared/utils/detailChipSelection";
import { stripNoneToken, toggleListItem } from "../../shared/utils/toggleListItem";
import {
    getEmptyStepFormPatch,
    isStepSkipped,
    persistStepSkip,
    readPreSkipSnapshot,
} from "../../shared/utils/addDetailsSkipStorage";
import AddDetailsSkipButton from "../../components/AddDetailsSkipButton/AddDetailsSkipButton";
import basicStyles from "../AddDetailsBasicPage/AddDetailsBasicPage.module.css";

const computeHormonalSectionIssues = (
    menstrualCycle,
    hormoneDiagnoses,
    currentMedications
) => {
    const menstrualMissing =
        !Array.isArray(menstrualCycle) || menstrualCycle.length === 0;
    const diagnosesMissing =
        !Array.isArray(hormoneDiagnoses) || hormoneDiagnoses.length === 0;
    const medicationsMissing =
        !Array.isArray(currentMedications) || currentMedications.length === 0;
    const count =
        (menstrualMissing ? 1 : 0) +
        (diagnosesMissing ? 1 : 0) +
        (medicationsMissing ? 1 : 0);
    return { menstrualMissing, diagnosesMissing, medicationsMissing, count };
};

const HormonalHealthPage = () => {
    const navigate = useNavigate();
    const { state } = useLocation();

    const phValue = state?.phValue;
    const timestamp = state?.timestamp;
    const lifeStage = stripDetailOptions(
        Array.isArray(state?.lifeStage) ? state.lifeStage : []
    );

    const draft = useMemo(
        () => readAddDetailsDraft(phValue, timestamp),
        [phValue, timestamp]
    );

    const initialSkipped = isStepSkipped(draft, "hormonal");
    const initialPreSkipSnapshot = readPreSkipSnapshot(draft, "hormonal");

    const [menstrualCycle, setMenstrualCycle] = useState(() => {
        if (initialSkipped && initialPreSkipSnapshot) {
            return stripNoneToken(initialPreSkipSnapshot.menstrualCycle);
        }
        return draft?.menstrualCycle || [];
    });
    const [hormoneDiagnoses, setHormoneDiagnoses] = useState(() => {
        if (initialSkipped && initialPreSkipSnapshot) {
            return stripNoneToken(initialPreSkipSnapshot.hormoneDiagnoses);
        }
        return draft?.hormoneDiagnoses || [];
    });
    const [currentMedications, setCurrentMedications] = useState(() => {
        if (initialSkipped && initialPreSkipSnapshot) {
            return stripNoneToken(initialPreSkipSnapshot.currentMedications);
        }
        return draft?.currentMedications || [];
    });
    useEffect(() => {
        const skipped = isStepSkipped(draft, "hormonal");
        const snap = readPreSkipSnapshot(draft, "hormonal");

        setIsSkipped(skipped);
        setPreSkipSnapshot(snap);

        if (skipped && snap) {
            setMenstrualCycle(stripNoneToken(snap.menstrualCycle));
            setHormoneDiagnoses(stripNoneToken(snap.hormoneDiagnoses));
            setCurrentMedications(stripNoneToken(snap.currentMedications));
        } else {
            setMenstrualCycle(stripNoneToken(draft?.menstrualCycle));
            setHormoneDiagnoses(stripNoneToken(draft?.hormoneDiagnoses));
            setCurrentMedications(stripNoneToken(draft?.currentMedications));
        }
    }, [
        draft?.menstrualCycle,
        draft?.hormoneDiagnoses,
        draft?.currentMedications,
        draft?.hormonalSkipped,
        draft?.hormonalPreSkipSnapshot,
    ]);

    const isBirthControlDisabled = useMemo(() => {
        const block = new Set([
            "Menopause",
            "Postmenopause",
            "Trying to conceive",
            "Pregnant",
        ]);
        return lifeStage.some((x) => block.has(x));
    }, [lifeStage]);

    const medicationHiddenItems = useMemo(
        () => (isBirthControlDisabled ? ["Birth control"] : []),
        [isBirthControlDisabled]
    );

    const medicationDisabledItems = useMemo(() => {
        const selected = Array.isArray(currentMedications) ? currentMedications : [];
        const hasBirthControl = selected.includes("Birth control");
        const hasFertilityTreatment = selected.includes("Fertility treatment");

        const disabled = new Set();
        if (hasBirthControl) disabled.add("Fertility treatment");
        if (hasFertilityTreatment) disabled.add("Birth control");

        return Array.from(disabled);
    }, [currentMedications, isBirthControlDisabled]);

    useEffect(() => {
        if (!isBirthControlDisabled) return;
        setCurrentMedications((prev) =>
            Array.isArray(prev) ? prev.filter((x) => x !== "Birth control") : []
        );
    }, [isBirthControlDisabled]);

    const [validationVisible, setValidationVisible] = useState(false);
    const [isSkipped, setIsSkipped] = useState(() =>
        isStepSkipped(draft, "hormonal")
    );
    const [preSkipSnapshot, setPreSkipSnapshot] = useState(
        () => readPreSkipSnapshot(draft, "hormonal")
    );
    const [errorBannerScrollToken, setErrorBannerScrollToken] = useState(0);
    const personalizeHintRef = useRef(null);

    const sectionIssues = useMemo(
        () =>
            computeHormonalSectionIssues(
                menstrualCycle,
                hormoneDiagnoses,
                currentMedications
            ),
        [menstrualCycle, hormoneDiagnoses, currentMedications]
    );

    useEffect(() => {
        if (validationVisible && sectionIssues.count === 0) {
            setValidationVisible(false);
        }
    }, [validationVisible, sectionIssues.count]);

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

    const handleMenstrualChange = (value) => {
        setMenstrualCycle((prev) => {
            const detailNext = applyDetailChipSelection(prev, value);
            if (detailNext !== null) return detailNext;

            const withoutDetail = stripDetailOptions(prev);
            return withoutDetail.includes(value)
                ? withoutDetail.filter((x) => x !== value)
                : [...withoutDetail, value];
        });
    };

    const handleDiagnosesChange = (value) => {
        setHormoneDiagnoses((prev) => {
            const detailNext = applyDetailChipSelection(prev, value);
            if (detailNext !== null) return detailNext;

            return toggleListItem(stripDetailOptions(prev), value);
        });
    };

    const handleMedicationsChange = (value) => {
        setCurrentMedications((prev) => {
            const detailNext = applyDetailChipSelection(prev, value);
            if (detailNext !== null) return detailNext;

            const BIRTH_CONTROL = "Birth control";
            const FERTILITY_TREATMENT = "Fertility treatment";
            const prevArr = stripNoneToken(stripDetailOptions(prev));

            if (value === BIRTH_CONTROL) {
                if (prevArr.includes(BIRTH_CONTROL)) {
                    return prevArr.filter((x) => x !== BIRTH_CONTROL);
                }
                return [
                    ...prevArr.filter((x) => x !== FERTILITY_TREATMENT),
                    BIRTH_CONTROL,
                ];
            }

            if (value === FERTILITY_TREATMENT) {
                if (prevArr.includes(FERTILITY_TREATMENT)) {
                    return prevArr.filter((x) => x !== FERTILITY_TREATMENT);
                }
                return [
                    ...prevArr.filter((x) => x !== BIRTH_CONTROL),
                    FERTILITY_TREATMENT,
                ];
            }

            return toggleListItem(prevArr, value);
        });
    };

    const handleSkipForNow = () => {
        if (isSkipped) {
            const restored = preSkipSnapshot;
            if (restored) {
                setMenstrualCycle(
                    Array.isArray(restored.menstrualCycle)
                        ? restored.menstrualCycle
                        : []
                );
                setHormoneDiagnoses(
                    Array.isArray(restored.hormoneDiagnoses)
                        ? restored.hormoneDiagnoses
                        : []
                );
                setCurrentMedications(
                    Array.isArray(restored.currentMedications)
                        ? restored.currentMedications
                        : []
                );
            }
            setPreSkipSnapshot(null);
            setIsSkipped(false);
            if (phValue !== undefined && phValue !== null) {
                persistStepSkip(phValue, timestamp, "hormonal", {
                    skipped: false,
                    preSkipSnapshot: null,
                    formPatch: {
                        menstrualCycle: Array.isArray(restored.menstrualCycle)
                            ? restored.menstrualCycle
                            : [],
                        hormoneDiagnoses: Array.isArray(
                            restored.hormoneDiagnoses
                        )
                            ? restored.hormoneDiagnoses
                            : [],
                        currentMedications: Array.isArray(
                            restored.currentMedications
                        )
                            ? restored.currentMedications
                            : [],
                    },
                });
            }
            return;
        }

        const snapshot = {
            menstrualCycle: Array.isArray(menstrualCycle)
                ? [...menstrualCycle]
                : [],
            hormoneDiagnoses: Array.isArray(hormoneDiagnoses)
                ? [...hormoneDiagnoses]
                : [],
            currentMedications: Array.isArray(currentMedications)
                ? [...currentMedications]
                : [],
        };
        setPreSkipSnapshot(snapshot);
        setValidationVisible(false);
        setIsSkipped(true);
        if (phValue !== undefined && phValue !== null) {
            persistStepSkip(phValue, timestamp, "hormonal", {
                skipped: true,
                preSkipSnapshot: snapshot,
                formPatch: getEmptyStepFormPatch("hormonal"),
            });
        }
    };

    const handleNext = () => {
        if (phValue === undefined || phValue === null) {
            alert("Missing pH result. Please go back and complete the test.");
            return;
        }

        if (isSkipped) {
            persistStepSkip(phValue, timestamp, "hormonal", {
                skipped: true,
                preSkipSnapshot,
                formPatch: getEmptyStepFormPatch("hormonal"),
            });

            navigate("/add-details/symptoms", {
                state: {
                    ...state,
                    menstrualCycle: [],
                    hormoneDiagnoses: [],
                    currentMedications: [],
                },
            });
            return;
        }

        if (sectionIssues.count > 0) {
            setValidationVisible(true);
            setErrorBannerScrollToken((t) => t + 1);
            return;
        }
        setValidationVisible(false);

        const medicationsForNext = Array.isArray(currentMedications)
            ? currentMedications.filter((x) => x !== "None")
            : [];
        const diagnosesForNext = Array.isArray(hormoneDiagnoses)
            ? hormoneDiagnoses.filter((x) => x !== "None")
            : [];

        persistStepSkip(phValue, timestamp, "hormonal", {
            skipped: false,
            preSkipSnapshot: null,
            formPatch: {
                menstrualCycle,
                hormoneDiagnoses,
                currentMedications,
            },
        });

        navigate("/add-details/symptoms", {
            state: {
                ...state,
                menstrualCycle,
                hormoneDiagnoses: stripDetailOptions(diagnosesForNext),
                currentMedications: stripDetailOptions(medicationsForNext),
            },
        });
    };

    const handleGoBack = () => {
        if (phValue !== undefined && phValue !== null) {
            persistStepSkip(phValue, timestamp, "hormonal", {
                skipped: isSkipped,
                preSkipSnapshot: isSkipped ? preSkipSnapshot : null,
                formPatch: isSkipped
                    ? getEmptyStepFormPatch("hormonal")
                    : {
                          menstrualCycle,
                          hormoneDiagnoses,
                          currentMedications,
                      },
            });
        }
        navigate(-1);
    };

    return (
        <>
            <div className={basicStyles.content} data-scroll-container>
                <Container>
                    <div className={basicStyles.containerInner}>
                        <div className={basicStyles.crumbs}>
                            <div className={basicStyles.itemColored}></div>
                            <div className={basicStyles.itemColored}></div>
                            <div className={basicStyles.item}></div>
                        </div>
                        <div className={basicStyles.step}>
                            Step 2 of 3 - Cycle, hormones & medications
                        </div>
                        <div className={basicStyles.heading}>
                            <h1 className={basicStyles.title}>
                                Your hormonal health
                            </h1>
                        </div>
                        <p className={basicStyles.subtitle}>
                            Cycle, meds & diagnoses also shape your pH.
                        </p>

                        <div className={basicStyles.personalData}>
                            <MenstrualCycle
                                menstrualCycle={menstrualCycle}
                                onChange={handleMenstrualChange}
                                showDetailOptions
                                skipped={isSkipped}
                            />
                            <CurrentMedications
                                currentMedications={currentMedications}
                                onChange={handleMedicationsChange}
                                showDetailOptions
                                skipped={isSkipped}
                                disabledItems={medicationDisabledItems}
                                hiddenItems={medicationHiddenItems}
                            />
                            <HormoneDiagnoses
                                hormoneDiagnoses={hormoneDiagnoses}
                                onChange={handleDiagnosesChange}
                                showDetailOptions
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
                        validationVisible &&
                        sectionIssues.count > 0 && (
                            <p
                                ref={personalizeHintRef}
                                className={basicStyles.personalizeHint}
                                role="alert"
                            >
                                Answering these questions helps personalize your
                                result. You can also skip for now.
                            </p>
                        )}
                    <Button
                        className={basicStyles.nextButton}
                        onClick={handleNext}
                    >
                        Next
                    </Button>
                    <ButtonReverse onClick={handleGoBack}>
                        Go back
                    </ButtonReverse>
                    <div className={basicStyles.privacyPolicyWrap}>
                        <p className={basicStyles.privacyPolicy}>
                            We respect your privacy. Only you can save and see your results.
                        </p>
                    </div>
                </BottomBlock>
            </div>
        </>
    );
};

export default HormonalHealthPage;