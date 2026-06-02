import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Container from "../../components/Container/Container";
import BottomBlock from "../../components/BottomBlock/BottomBlock";
import Button from "../../components/Button/Button";
import ButtonReverse from "../../components/ButtonReverse/ButtonReverse";

import Discharge from "../../components/PersonalData/Discharge/Discharge";
import VulvaCondition from "../../components/PersonalData/VulvaCondition/VulvaCondition";
import Smell from "../../components/PersonalData/Smell/Smell";
import Urination from "../../components/PersonalData/Urination/Urination";
import Notes from "../../components/PersonalData/Notes/Notes";

import {
    readAddDetailsDraft,
    writeAddDetailsDraft,
} from "../../shared/utils/addDetailsDraftSessionStorage";
import { writeActiveResultMeta } from "../../shared/utils/activeResultSessionStorage";
import {
    getEmptyStepFormPatch,
    isStepSkipped,
    persistStepSkip,
    readPreSkipSnapshot,
} from "../../shared/utils/addDetailsSkipStorage";
import { stripDetailOptions } from "../../shared/utils/detailChipSelection";
import AddDetailsSkipButton from "../../components/AddDetailsSkipButton/AddDetailsSkipButton";
import basicStyles from "../AddDetailsBasicPage/AddDetailsBasicPage.module.css";

const computeSymptomsSectionIssues = (
    discharge,
    vulvaCondition,
    smell,
    urination
) => {
    const dischargeMissing =
        !Array.isArray(discharge) || discharge.length === 0;
    const vulvaMissing =
        !Array.isArray(vulvaCondition) || vulvaCondition.length === 0;
    const smellMissing = !Array.isArray(smell) || smell.length === 0;
    const urinationMissing =
        !Array.isArray(urination) || urination.length === 0;
    const count =
        (dischargeMissing ? 1 : 0) +
        (vulvaMissing ? 1 : 0) +
        (smellMissing ? 1 : 0) +
        (urinationMissing ? 1 : 0);
    return {
        dischargeMissing,
        vulvaMissing,
        smellMissing,
        urinationMissing,
        count,
    };
};

const SymptomsPage = () => {
    const navigate = useNavigate();
    const { state } = useLocation();

    const phValue = state?.phValue;
    const timestamp = state?.timestamp;

    const draft = useMemo(
        () => readAddDetailsDraft(phValue, timestamp),
        [phValue, timestamp]
    );

    const initialSkipped = isStepSkipped(draft, "symptoms");
    const initialPreSkipSnapshot = readPreSkipSnapshot(draft, "symptoms");

    const [discharge, setDischarge] = useState(() => {
        if (initialSkipped && initialPreSkipSnapshot) {
            return initialPreSkipSnapshot.discharge || [];
        }
        return draft?.discharge || [];
    });
    const [vulvaCondition, setVulvaCondition] = useState(() => {
        if (initialSkipped && initialPreSkipSnapshot) {
            return initialPreSkipSnapshot.vulvaCondition || [];
        }
        return draft?.vulvaCondition || [];
    });
    const [smell, setSmell] = useState(() => {
        if (initialSkipped && initialPreSkipSnapshot) {
            return initialPreSkipSnapshot.smell || [];
        }
        return draft?.smell || [];
    });
    const [urination, setUrination] = useState(() => {
        if (initialSkipped && initialPreSkipSnapshot) {
            return initialPreSkipSnapshot.urination || [];
        }
        return draft?.urination || [];
    });
    const [notes, setNotes] = useState(() => {
        if (initialSkipped && initialPreSkipSnapshot) {
            return initialPreSkipSnapshot.notes ?? "";
        }
        return draft?.notes ?? "";
    });

    useEffect(() => {
        const skipped = isStepSkipped(draft, "symptoms");
        const snap = readPreSkipSnapshot(draft, "symptoms");

        setIsSkipped(skipped);
        setPreSkipSnapshot(snap);

        if (skipped && snap) {
            setDischarge(snap.discharge || []);
            setVulvaCondition(snap.vulvaCondition || []);
            setSmell(snap.smell || []);
            setUrination(snap.urination || []);
            setNotes(snap.notes ?? "");
        } else {
            setDischarge(draft?.discharge || []);
            setVulvaCondition(draft?.vulvaCondition || []);
            setSmell(draft?.smell || []);
            setUrination(draft?.urination || []);
            setNotes(draft?.notes ?? "");
        }
    }, [
        draft?.discharge,
        draft?.vulvaCondition,
        draft?.smell,
        draft?.urination,
        draft?.notes,
        draft?.symptomsSkipped,
        draft?.symptomsPreSkipSnapshot,
    ]);

    const [validationVisible, setValidationVisible] = useState(false);
    const [isSkipped, setIsSkipped] = useState(() =>
        isStepSkipped(draft, "symptoms")
    );
    const [preSkipSnapshot, setPreSkipSnapshot] = useState(
        () => readPreSkipSnapshot(draft, "symptoms")
    );
    const [errorBannerScrollToken, setErrorBannerScrollToken] = useState(0);
    const personalizeHintRef = useRef(null);

    const sectionIssues = useMemo(
        () =>
            computeSymptomsSectionIssues(
                discharge,
                vulvaCondition,
                smell,
                urination
            ),
        [discharge, vulvaCondition, smell, urination]
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

    const toggleInList = (setter) => (value) => {
        setter((prev) => {
            const arr = Array.isArray(prev) ? prev : [];
            const cleaned = arr.filter((x) => x !== "None");
            return cleaned.includes(value)
                ? cleaned.filter((x) => x !== value)
                : [...cleaned, value];
        });
    };

    const handleDischargeChange = (value) => {
        setDischarge((prev) => {
            const NONE = "No discharge";
            const arr = Array.isArray(prev) ? prev : [];

            if (value === NONE) {
                return arr.includes(NONE) ? [] : [NONE];
            }

            const withoutNone = arr.filter((x) => x !== NONE);
            return withoutNone.includes(value)
                ? withoutNone.filter((x) => x !== value)
                : [...withoutNone, value];
        });
    };

    const handleSkipForNow = () => {
        if (isSkipped) {
            const restored = preSkipSnapshot;
            if (restored) {
                setDischarge(
                    Array.isArray(restored.discharge) ? restored.discharge : []
                );
                setVulvaCondition(
                    Array.isArray(restored.vulvaCondition)
                        ? restored.vulvaCondition
                        : []
                );
                setSmell(Array.isArray(restored.smell) ? restored.smell : []);
                setUrination(
                    Array.isArray(restored.urination) ? restored.urination : []
                );
                setNotes(restored.notes ?? "");
            }
            setPreSkipSnapshot(null);
            setIsSkipped(false);
            if (phValue !== undefined && phValue !== null) {
                persistStepSkip(phValue, timestamp, "symptoms", {
                    skipped: false,
                    preSkipSnapshot: null,
                    formPatch: restored
                        ? {
                              discharge: Array.isArray(restored.discharge)
                                  ? restored.discharge
                                  : [],
                              vulvaCondition: Array.isArray(
                                  restored.vulvaCondition
                              )
                                  ? restored.vulvaCondition
                                  : [],
                              smell: Array.isArray(restored.smell)
                                  ? restored.smell
                                  : [],
                              urination: Array.isArray(restored.urination)
                                  ? restored.urination
                                  : [],
                              notes: restored.notes ?? "",
                          }
                        : {},
                });
            }
            return;
        }

        const snapshot = {
            discharge: Array.isArray(discharge) ? [...discharge] : [],
            vulvaCondition: Array.isArray(vulvaCondition)
                ? [...vulvaCondition]
                : [],
            smell: Array.isArray(smell) ? [...smell] : [],
            urination: Array.isArray(urination) ? [...urination] : [],
            notes,
        };
        setPreSkipSnapshot(snapshot);
        setValidationVisible(false);
        setIsSkipped(true);
        if (phValue !== undefined && phValue !== null) {
            persistStepSkip(phValue, timestamp, "symptoms", {
                skipped: true,
                preSkipSnapshot: snapshot,
                formPatch: getEmptyStepFormPatch("symptoms"),
            });
        }
    };

    const handleNext = () => {
        if (phValue === undefined || phValue === null) {
            alert("Missing pH result. Please go back and complete the test.");
            return;
        }

        if (isSkipped) {
            persistStepSkip(phValue, timestamp, "symptoms", {
                skipped: true,
                preSkipSnapshot,
                formPatch: getEmptyStepFormPatch("symptoms"),
            });
            writeActiveResultMeta({ phValue, timestamp });

            const stripUiTokens = (v) =>
                stripDetailOptions(
                    Array.isArray(v) ? v.filter((x) => x !== "None") : []
                );
            const lifeStage = stripUiTokens(state?.lifeStage);
            const currentMedications = stripUiTokens(state?.currentMedications);

            const has = (arr, v) => Array.isArray(arr) && arr.includes(v);
            const hasBirthControl = has(currentMedications, "Birth control");
            const hasFertilityTreatment = has(
                currentMedications,
                "Fertility treatment"
            );

            const nextPath = (() => {
                if (hasFertilityTreatment) {
                    return "/add-details/next-steps/fertility-treatment";
                }
                if (hasBirthControl) {
                    return "/add-details/next-steps/birth-control";
                }
                return "/analyzing-data";
            })();

            navigate(nextPath, {
                state: {
                    ...state,
                    discharge: [],
                    vulvaCondition: [],
                    smell: [],
                    urination: [],
                    notes: "",
                    lifeStage,
                    hormoneDiagnoses: stripUiTokens(state?.hormoneDiagnoses),
                    currentMedications,
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

        persistStepSkip(phValue, timestamp, "symptoms", {
            skipped: false,
            preSkipSnapshot: null,
            formPatch: {
                discharge,
                vulvaCondition,
                smell,
                urination,
                notes,
            },
        });
        writeActiveResultMeta({ phValue, timestamp });

        const stripUiTokens = (v) =>
            stripDetailOptions(
                Array.isArray(v) ? v.filter((x) => x !== "None") : []
            );

        const lifeStage = stripUiTokens(state?.lifeStage);
        const currentMedications = stripUiTokens(state?.currentMedications);

        const has = (arr, v) => Array.isArray(arr) && arr.includes(v);
        const hasBirthControl = has(currentMedications, "Birth control");
        const hasFertilityTreatment = has(
            currentMedications,
            "Fertility treatment"
        );

        // After `/add-details/symptoms` there are only 3 valid branches:
        // - Fertility treatment next steps
        // - Birth control next steps
        // - Direct submit to analysis
        const nextPath = (() => {
            if (hasFertilityTreatment) {
                return "/add-details/next-steps/fertility-treatment";
            }
            if (hasBirthControl) {
                return "/add-details/next-steps/birth-control";
            }
            return "/analyzing-data";
        })();

        navigate(nextPath, {
            state: {
                ...state,
                discharge: stripUiTokens(discharge),
                vulvaCondition: stripUiTokens(vulvaCondition),
                smell: stripUiTokens(smell),
                urination: stripUiTokens(urination),
                notes,
                lifeStage,
                hormoneDiagnoses: stripUiTokens(state?.hormoneDiagnoses),
                currentMedications,
            },
        });
    };

    const handleGoBack = () => {
        if (phValue !== undefined && phValue !== null) {
            persistStepSkip(phValue, timestamp, "symptoms", {
                skipped: isSkipped,
                preSkipSnapshot: isSkipped ? preSkipSnapshot : null,
                formPatch: isSkipped
                    ? getEmptyStepFormPatch("symptoms")
                    : {
                          discharge,
                          vulvaCondition,
                          smell,
                          urination,
                          notes,
                      },
            });
        }
        navigate(-1);
    };

    const submitFromSymptoms = (() => {
        const meds = Array.isArray(state?.currentMedications) ? state.currentMedications : [];
        const hasBirthControl = meds.includes("Birth control");
        const hasFertilityTreatment = meds.includes("Fertility treatment");
        return !hasBirthControl && !hasFertilityTreatment;
    })();

    return (
        <>
            <div className={basicStyles.content} data-scroll-container>
                <Container>
                    <div className={basicStyles.containerInner}>
                        <div className={basicStyles.crumbs}>
                            <div className={basicStyles.itemColored}></div>
                            <div className={basicStyles.itemColored}></div>
                            <div className={basicStyles.itemColored}></div>
                        </div>
                        <div className={basicStyles.step}>
                            Step 3 of 3 - Symptoms
                        </div>
                        <div className={basicStyles.heading}>
                            <h1 className={basicStyles.title}>Last step - your symptoms</h1>
                        </div>
                        <p className={basicStyles.subtitle}>
                            Select what you're experiencing right now.
                        </p>

                        <div className={basicStyles.personalData}>
                            <Discharge
                                discharge={discharge}
                                onChange={handleDischargeChange}
                                skipped={isSkipped}
                                showHeadingError={
                                    !isSkipped &&
                                    validationVisible &&
                                    sectionIssues.dischargeMissing
                                }
                            />
                            <VulvaCondition
                                vulvaCondition={vulvaCondition}
                                onChange={toggleInList(setVulvaCondition)}
                                skipped={isSkipped}
                                showHeadingError={
                                    !isSkipped &&
                                    validationVisible &&
                                    sectionIssues.vulvaMissing
                                }
                            />
                            <Smell
                                smell={smell}
                                onChange={toggleInList(setSmell)}
                                skipped={isSkipped}
                                showHeadingError={
                                    !isSkipped &&
                                    validationVisible &&
                                    sectionIssues.smellMissing
                                }
                            />
                            <Urination
                                urination={urination}
                                onChange={toggleInList(setUrination)}
                                skipped={isSkipped}
                                showHeadingError={
                                    !isSkipped &&
                                    validationVisible &&
                                    sectionIssues.urinationMissing
                                }
                            />
                            <Notes
                                notes={notes}
                                setNotes={setNotes}
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
                        {submitFromSymptoms ? "Submit" : "Next"}
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

export default SymptomsPage;
