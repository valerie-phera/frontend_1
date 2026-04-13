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
import basicStyles from "../AddDetailsBasicPage/AddDetailsBasicPage.module.css";
import InfoCircle from "../../assets/icons/InfoCircle";

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

    const draft = useMemo(
        () => readAddDetailsDraft(phValue, timestamp),
        [phValue, timestamp]
    );

    const [menstrualCycle, setMenstrualCycle] = useState(
        draft?.menstrualCycle || []
    );
    const [hormoneDiagnoses, setHormoneDiagnoses] = useState(
        draft?.hormoneDiagnoses || []
    );
    const [currentMedications, setCurrentMedications] = useState(
        draft?.currentMedications || []
    );
    useEffect(() => {
        setMenstrualCycle(draft?.menstrualCycle || []);
        setHormoneDiagnoses(draft?.hormoneDiagnoses || []);
        setCurrentMedications(draft?.currentMedications || []);
    }, [draft?.menstrualCycle, draft?.hormoneDiagnoses, draft?.currentMedications]);

    const [validationVisible, setValidationVisible] = useState(false);
    const [errorBannerScrollToken, setErrorBannerScrollToken] = useState(0);
    const errorTextWrapRef = useRef(null);

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

    const handleMenstrualChange = (value) => {
        setMenstrualCycle((prev) =>
            prev.includes(value)
                ? prev.filter((x) => x !== value)
                : [...prev, value]
        );
    };

    const handleDiagnosesChange = (value) => {
        setHormoneDiagnoses((prev) => {
            const NONE = "None";

            if (value === NONE) {
                return prev.includes(NONE) ? [] : [NONE];
            }

            const withoutNone = prev.filter((x) => x !== NONE);
            return withoutNone.includes(value)
                ? withoutNone.filter((x) => x !== value)
                : [...withoutNone, value];
        });
    };

    const handleMedicationsChange = (value) => {
        setCurrentMedications((prev) => {
            const NONE = "None";

            if (value === NONE) {
                return prev.includes(NONE) ? [] : [NONE];
            }

            const withoutNone = prev.filter((x) => x !== NONE);
            return withoutNone.includes(value)
                ? withoutNone.filter((x) => x !== value)
                : [...withoutNone, value];
        });
    };

    const handleNext = () => {
        if (phValue === undefined || phValue === null) {
            alert("Missing pH result. Please go back and complete the test.");
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

        writeAddDetailsDraft(phValue, timestamp, {
            menstrualCycle,
            hormoneDiagnoses,
            currentMedications,
        });

        navigate("/add-details/symptoms", {
            state: {
                ...state,
                menstrualCycle,
                hormoneDiagnoses: diagnosesForNext,
                currentMedications: medicationsForNext,
            },
        });
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
                            Knowing your hormone status helps us understand the main factors that influence your pH level.
                        </p>

                        <div className={basicStyles.personalData}>
                            <MenstrualCycle
                                menstrualCycle={menstrualCycle}
                                onChange={handleMenstrualChange}
                                showHeadingError={
                                    validationVisible &&
                                    sectionIssues.menstrualMissing
                                }
                            />
                            <HormoneDiagnoses
                                hormoneDiagnoses={hormoneDiagnoses}
                                onChange={handleDiagnosesChange}
                                showHeadingError={
                                    validationVisible &&
                                    sectionIssues.diagnosesMissing
                                }
                            />
                            <CurrentMedications
                                currentMedications={currentMedications}
                                onChange={handleMedicationsChange}
                                showHeadingError={
                                    validationVisible &&
                                    sectionIssues.medicationsMissing
                                }
                            />
                        </div>
                        {validationVisible && sectionIssues.count > 0 && (
                            <div
                                ref={errorTextWrapRef}
                                className={basicStyles.errorTextWrap}
                                role="alert"
                            >
                                <div
                                    className={basicStyles.errorIcon}
                                    aria-hidden
                                >
                                    <InfoCircle />
                                </div>
                                <p className={basicStyles.errorText}>
                                    {sectionIssues.count === 1
                                        ? "1 section still needs a selection"
                                        : sectionIssues.count === 2
                                            ? "2 sections still need a selection"
                                            : "3 sections still need a selection"}
                                </p>
                            </div>
                        )}
                    </div>
                </Container>

                <BottomBlock>
                    <Button onClick={handleNext}>Next</Button>
                    <ButtonReverse onClick={() => navigate("/add-details/basic")}>
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