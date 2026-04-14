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
import { getInterpretation } from "../../shared/utils/getInterpretation";
import basicStyles from "../AddDetailsBasicPage/AddDetailsBasicPage.module.css";
import InfoCircle from "../../assets/icons/InfoCircle";

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

const getPhLevel = (ph) => {
    const n = Number(ph);
    if (Number.isNaN(n)) return "Elevated";
    if (n < 4.5) return "Normal";
    if (n >= 4.5 && n <= 4.9) return "Slightly Elevated";
    return "Elevated";
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

    const [discharge, setDischarge] = useState(draft?.discharge || []);
    const [vulvaCondition, setVulvaCondition] = useState(
        draft?.vulvaCondition || []
    );
    const [smell, setSmell] = useState(draft?.smell || []);
    const [urination, setUrination] = useState(draft?.urination || []);
    const [notes, setNotes] = useState(draft?.notes ?? "");

    useEffect(() => {
        setDischarge(draft?.discharge || []);
        setVulvaCondition(draft?.vulvaCondition || []);
        setSmell(draft?.smell || []);
        setUrination(draft?.urination || []);
        setNotes(draft?.notes ?? "");
    }, [draft?.discharge, draft?.vulvaCondition, draft?.smell, draft?.urination, draft?.notes]);

    const [validationVisible, setValidationVisible] = useState(false);
    const [errorBannerScrollToken, setErrorBannerScrollToken] = useState(0);
    const errorTextWrapRef = useRef(null);

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

    const toggleInList = (setter) => (value) => {
        setter((prev) => {
            const NONE = "None";
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

        writeAddDetailsDraft(phValue, timestamp, {
            discharge,
            vulvaCondition,
            smell,
            urination,
            notes,
        });

        const stripNone = (v) =>
            Array.isArray(v) ? v.filter((x) => x !== "None") : [];

        const phLevel = state?.phLevel ?? getPhLevel(phValue);
        const interpretation =
            state?.interpretation ??
            getInterpretation(phLevel, Number(phValue).toFixed(2));

        navigate("/result-with-details", {
            state: {
                ...state,
                discharge: stripNone(discharge),
                vulvaCondition: stripNone(vulvaCondition),
                smell: stripNone(smell),
                urination: stripNone(urination),
                notes,
                phLevel,
                interpretation,
                citations: state?.citations ?? [],
                lifeStage: stripNone(state?.lifeStage),
                hormoneDiagnoses: stripNone(state?.hormoneDiagnoses),
                currentMedications: stripNone(state?.currentMedications),
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
                            <div className={basicStyles.itemColored}></div>
                        </div>
                        <div className={basicStyles.step}>
                            Step 3 of 3 - Symptoms
                        </div>
                        <div className={basicStyles.heading}>
                            <h1 className={basicStyles.title}>Last step - your symptoms</h1>
                        </div>
                        <p className={basicStyles.subtitle}>
                            Select all that you've noticed recently.
                        </p>

                        <div className={basicStyles.personalData}>
                            <Discharge
                                discharge={discharge}
                                onChange={toggleInList(setDischarge)}
                                showHeadingError={
                                    validationVisible &&
                                    sectionIssues.dischargeMissing
                                }
                            />
                            <VulvaCondition
                                vulvaCondition={vulvaCondition}
                                onChange={toggleInList(setVulvaCondition)}
                                showHeadingError={
                                    validationVisible &&
                                    sectionIssues.vulvaMissing
                                }
                            />
                            <Smell
                                smell={smell}
                                onChange={toggleInList(setSmell)}
                                showHeadingError={
                                    validationVisible &&
                                    sectionIssues.smellMissing
                                }
                            />
                            <Urination
                                urination={urination}
                                onChange={toggleInList(setUrination)}
                                showHeadingError={
                                    validationVisible &&
                                    sectionIssues.urinationMissing
                                }
                            />
                            <Notes notes={notes} setNotes={setNotes} />
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
                                        : `${sectionIssues.count} sections still need a selection`}
                                </p>
                            </div>
                        )}
                    </div>
                </Container>

                <BottomBlock>
                    <Button onClick={handleNext}>Next</Button>
                    <ButtonReverse
                        onClick={() => navigate("/add-details/hormonal-health", { state })}
                    >
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
