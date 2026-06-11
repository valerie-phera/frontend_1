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
import VaginalProducts from "../../components/PersonalData/VaginalProducts/VaginalProducts";
import SexFluids from "../../components/PersonalData/SexFluids/SexFluids";
import { MENSTRUAL_NO_PERIOD_12_MONTHS } from "../../components/PersonalData/MenstrualCycle/MenstrualCycle";
import Spotting, {
    SPOTTING_PERIOD_OPTIONS,
} from "../../components/PersonalData/Spotting/Spotting";
import SymptomsAccordion from "../../components/SymptomsAccordion/SymptomsAccordion";

import GroupIcon from "../../assets/AddDetailsIcons/GroupIcon";
import FlowerIcom from "../../assets/AddDetailsIcons/FlowerIcom";
import WavesIcon from "../../assets/AddDetailsIcons/WavesIcon";
import ToiletIcon from "../../assets/AddDetailsIcons/ToiletIcon";
import ShowerIcon from "../../assets/AddDetailsIcons/ShowerIcon";
import HeartIcon from "../../assets/AddDetailsIcons/HeartIcon";
import DropHalfIcon from "../../assets/AddDetailsIcons/DropHalfIcon";
import Edit2Icon from "../../assets/AddDetailsIcons/Edit2Icon";

import {
    readAddDetailsDraft,
    writeAddDetailsDraft,
} from "../../shared/utils/addDetailsDraftSessionStorage";
import { writeActiveResultMeta } from "../../shared/utils/activeResultSessionStorage";
import {
    isStepSkipped,
    persistStepSkip,
    readPreSkipSnapshot,
    snapshotToStepFormPatch,
} from "../../shared/utils/addDetailsSkipStorage";
import { stripDetailOptions } from "../../shared/utils/detailChipSelection";
import { createSymptomsChipChangeHandler, getSymptomsHeaderSelection } from "../../shared/utils/symptomsChipSelection";
import AddDetailsSkipButton from "../../components/AddDetailsSkipButton/AddDetailsSkipButton";
import { analyzingDataPageImg, goToAnalyzingData } from "../../shared/utils/flowImages";
import { preloadImage } from "../../shared/utils/preloadImage";
import basicStyles from "../AddDetailsBasicPage/AddDetailsBasicPage.module.css";
import styles from "./SymptomsPage.module.css";

const SECTION_KEYS = {
    discharge: "discharge",
    vulva: "vulva",
    smell: "smell",
    urine: "urine",
    vaginalProducts: "vaginalProducts",
    sexFluids: "sexFluids",
    spotting: "spotting",
    notes: "notes",
};

const DEFAULT_OPEN_SECTIONS = {
    [SECTION_KEYS.discharge]: false,
    [SECTION_KEYS.vulva]: false,
    [SECTION_KEYS.smell]: false,
    [SECTION_KEYS.urine]: false,
    [SECTION_KEYS.vaginalProducts]: false,
    [SECTION_KEYS.sexFluids]: false,
    [SECTION_KEYS.spotting]: false,
    [SECTION_KEYS.notes]: false,
};

const computeSymptomsSectionIssues = (
    discharge,
    vulvaCondition,
    smell,
    urination,
    vaginalProducts,
    sexFluids,
    spotting
) => {
    const missing = [
        discharge,
        vulvaCondition,
        smell,
        urination,
        vaginalProducts,
        sexFluids,
        spotting,
    ].filter((value) => !Array.isArray(value) || value.length === 0).length;

    return { count: missing };
};

const buildSymptomsFormPatch = (
    discharge,
    vulvaCondition,
    smell,
    urination,
    notes,
    vaginalProducts,
    sexFluids,
    spotting
) => ({
    discharge: Array.isArray(discharge) ? discharge : [],
    vulvaCondition: Array.isArray(vulvaCondition) ? vulvaCondition : [],
    smell: Array.isArray(smell) ? smell : [],
    urination: Array.isArray(urination) ? urination : [],
    notes: notes ?? "",
    vaginalProducts: Array.isArray(vaginalProducts) ? vaginalProducts : [],
    sexFluids: Array.isArray(sexFluids) ? sexFluids : [],
    spotting: Array.isArray(spotting) ? spotting : [],
});

const stripSymptomsForRoute = (values) =>
    stripDetailOptions(
        Array.isArray(values) ? values.filter((x) => x !== "None") : []
    );

const buildSymptomsRoutePatch = (
    discharge,
    vulvaCondition,
    smell,
    urination,
    notes,
    vaginalProducts,
    sexFluids,
    spotting
) => ({
    discharge: stripSymptomsForRoute(discharge),
    vulvaCondition: stripSymptomsForRoute(vulvaCondition),
    smell: stripSymptomsForRoute(smell),
    urination: stripSymptomsForRoute(urination),
    notes: notes ?? "",
    vaginalProducts: stripSymptomsForRoute(vaginalProducts),
    sexFluids: stripSymptomsForRoute(sexFluids),
    spotting: stripSymptomsForRoute(spotting),
});

const SymptomsPage = () => {
    const navigate = useNavigate();
    const { state } = useLocation();

    const phValue = state?.phValue;
    const timestamp = state?.timestamp;

    const draft = useMemo(
        () => readAddDetailsDraft(phValue, timestamp),
        [phValue, timestamp]
    );

    const lifeStage = useMemo(() => {
        const raw = Array.isArray(state?.lifeStage)
            ? state.lifeStage
            : draft?.lifeStage ?? [];
        return stripDetailOptions(raw);
    }, [state?.lifeStage, draft?.lifeStage]);

    const menstrualCycle = useMemo(() => {
        const raw = Array.isArray(state?.menstrualCycle)
            ? state.menstrualCycle
            : draft?.menstrualCycle ?? [];
        return stripDetailOptions(raw);
    }, [state?.menstrualCycle, draft?.menstrualCycle]);

    const spottingDisabledItems = useMemo(() => {
        const isMenopausalStage =
            lifeStage.includes("Menopause") ||
            lifeStage.includes("Postmenopause");
        const hasNoPeriod12Months = menstrualCycle.includes(
            MENSTRUAL_NO_PERIOD_12_MONTHS
        );
        return isMenopausalStage || hasNoPeriod12Months
            ? [...SPOTTING_PERIOD_OPTIONS]
            : [];
    }, [lifeStage, menstrualCycle]);

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
    const [vaginalProducts, setVaginalProducts] = useState(() => {
        if (initialSkipped && initialPreSkipSnapshot) {
            return initialPreSkipSnapshot.vaginalProducts || [];
        }
        return draft?.vaginalProducts || [];
    });
    const [sexFluids, setSexFluids] = useState(() => {
        if (initialSkipped && initialPreSkipSnapshot) {
            return initialPreSkipSnapshot.sexFluids || [];
        }
        return draft?.sexFluids || [];
    });
    const [spotting, setSpotting] = useState(() => {
        if (initialSkipped && initialPreSkipSnapshot) {
            return initialPreSkipSnapshot.spotting || [];
        }
        return draft?.spotting || [];
    });
    const [openSections, setOpenSections] = useState(DEFAULT_OPEN_SECTIONS);

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
            setVaginalProducts(snap.vaginalProducts || []);
            setSexFluids(snap.sexFluids || []);
            setSpotting(snap.spotting || []);
        } else {
            setDischarge(draft?.discharge || []);
            setVulvaCondition(draft?.vulvaCondition || []);
            setSmell(draft?.smell || []);
            setUrination(draft?.urination || []);
            setNotes(draft?.notes ?? "");
            setVaginalProducts(draft?.vaginalProducts || []);
            setSexFluids(draft?.sexFluids || []);
            setSpotting(draft?.spotting || []);
        }
    }, [
        draft?.discharge,
        draft?.vulvaCondition,
        draft?.smell,
        draft?.urination,
        draft?.notes,
        draft?.vaginalProducts,
        draft?.sexFluids,
        draft?.spotting,
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
                urination,
                vaginalProducts,
                sexFluids,
                spotting
            ),
        [
            discharge,
            vulvaCondition,
            smell,
            urination,
            vaginalProducts,
            sexFluids,
            spotting,
        ]
    );

    useEffect(() => {
        if (validationVisible && sectionIssues.count === 0) {
            setValidationVisible(false);
        }
    }, [validationVisible, sectionIssues.count]);

    useEffect(() => {
        if (spottingDisabledItems.length === 0) return;
        const blocked = new Set(spottingDisabledItems);
        setSpotting((prev) =>
            Array.isArray(prev) ? prev.filter((x) => !blocked.has(x)) : []
        );
    }, [spottingDisabledItems]);

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

    const handleDischargeChange = createSymptomsChipChangeHandler(setDischarge, {
        exclusiveOption: "No discharge",
    });
    const handleVulvaConditionChange =
        createSymptomsChipChangeHandler(setVulvaCondition);
    const handleSmellChange = createSymptomsChipChangeHandler(setSmell);
    const handleUrinationChange = createSymptomsChipChangeHandler(setUrination);
    const handleVaginalProductsChange =
        createSymptomsChipChangeHandler(setVaginalProducts);
    const handleSexFluidsChange = createSymptomsChipChangeHandler(setSexFluids);
    const handleSpottingChange = createSymptomsChipChangeHandler(setSpotting);

    const toggleSection = (key) => {
        setOpenSections((prev) => {
            const willOpen = !prev[key];
            if (!willOpen) {
                return { ...DEFAULT_OPEN_SECTIONS };
            }
            return {
                ...DEFAULT_OPEN_SECTIONS,
                [key]: true,
            };
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
                setVaginalProducts(
                    Array.isArray(restored.vaginalProducts)
                        ? restored.vaginalProducts
                        : []
                );
                setSexFluids(
                    Array.isArray(restored.sexFluids) ? restored.sexFluids : []
                );
                setSpotting(
                    Array.isArray(restored.spotting) ? restored.spotting : []
                );
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
                              vaginalProducts: Array.isArray(
                                  restored.vaginalProducts
                              )
                                  ? restored.vaginalProducts
                                  : [],
                              sexFluids: Array.isArray(restored.sexFluids)
                                  ? restored.sexFluids
                                  : [],
                              spotting: Array.isArray(restored.spotting)
                                  ? restored.spotting
                                  : [],
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
            vaginalProducts: Array.isArray(vaginalProducts)
                ? [...vaginalProducts]
                : [],
            sexFluids: Array.isArray(sexFluids) ? [...sexFluids] : [],
            spotting: Array.isArray(spotting) ? [...spotting] : [],
        };
        setPreSkipSnapshot(snapshot);
        setValidationVisible(false);
        setIsSkipped(true);
        if (phValue !== undefined && phValue !== null) {
            persistStepSkip(phValue, timestamp, "symptoms", {
                skipped: true,
                preSkipSnapshot: snapshot,
                formPatch: snapshotToStepFormPatch("symptoms", snapshot),
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
                formPatch: buildSymptomsFormPatch(
                    discharge,
                    vulvaCondition,
                    smell,
                    urination,
                    notes,
                    vaginalProducts,
                    sexFluids,
                    spotting
                ),
            });
            writeActiveResultMeta({ phValue, timestamp });

            const stripUiTokens = stripSymptomsForRoute;
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

            const nextState = {
                ...state,
                ...buildSymptomsRoutePatch(
                    discharge,
                    vulvaCondition,
                    smell,
                    urination,
                    notes,
                    vaginalProducts,
                    sexFluids,
                    spotting
                ),
                lifeStage,
                hormoneDiagnoses: stripUiTokens(state?.hormoneDiagnoses),
                currentMedications,
            };

            if (nextPath === "/analyzing-data") {
                goToAnalyzingData(navigate, nextState);
                return;
            }

            navigate(nextPath, { state: nextState });
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
            formPatch: buildSymptomsFormPatch(
                discharge,
                vulvaCondition,
                smell,
                urination,
                notes,
                vaginalProducts,
                sexFluids,
                spotting
            ),
        });
        writeActiveResultMeta({ phValue, timestamp });

        const stripUiTokens = stripSymptomsForRoute;

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

        const nextState = {
            ...state,
            ...buildSymptomsRoutePatch(
                discharge,
                vulvaCondition,
                smell,
                urination,
                notes,
                vaginalProducts,
                sexFluids,
                spotting
            ),
            lifeStage,
            hormoneDiagnoses: stripUiTokens(state?.hormoneDiagnoses),
            currentMedications,
        };

        if (nextPath === "/analyzing-data") {
            goToAnalyzingData(navigate, nextState);
            return;
        }

        navigate(nextPath, { state: nextState });
    };

    const handleGoBack = () => {
        if (phValue !== undefined && phValue !== null) {
            persistStepSkip(phValue, timestamp, "symptoms", {
                skipped: isSkipped,
                preSkipSnapshot: isSkipped ? preSkipSnapshot : null,
                formPatch: buildSymptomsFormPatch(
                    discharge,
                    vulvaCondition,
                    smell,
                    urination,
                    notes,
                    vaginalProducts,
                    sexFluids,
                    spotting
                ),
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

    useEffect(() => {
        preloadImage(analyzingDataPageImg);
    }, []);

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
                            Step 3 of 3 - Symptoms & context
                        </div>
                        <div className={styles.mainIntro}>
                            <div className={`${basicStyles.heading} ${styles.heading}`}>
                                <h1 className={`${basicStyles.title} ${styles.title}`}>
                                    Last step - symptoms & recent context
                                </h1>
                            </div>
                            <p className={`${basicStyles.subtitle} ${styles.subtitle}`}>
                                Select what applies in the last 48 hours.
                            </p>
                        </div>

                        <div className={styles.personalData}>
                            <SymptomsAccordion
                                skipped={isSkipped}
                                title="Discharge"
                                icon={<GroupIcon aria-hidden />}
                                isOpen={openSections[SECTION_KEYS.discharge]}
                                onToggle={() =>
                                    toggleSection(SECTION_KEYS.discharge)
                                }
                                selectionLabel={getSymptomsHeaderSelection(discharge)}
                                infoText="Discharge varies from person to person. It is influenced by your cycle, hygiene products, medications, stress, and a lot of other factors. Look out for discharge of unusual colour and texture."
                            >
                                <Discharge
                                    discharge={discharge}
                                    onChange={handleDischargeChange}
                                    skipped={isSkipped}
                                    embedded
                                />
                            </SymptomsAccordion>

                            <SymptomsAccordion
                                skipped={isSkipped}
                                title="Vulva & Vagina"
                                icon={<FlowerIcom aria-hidden />}
                                isOpen={openSections[SECTION_KEYS.vulva]}
                                onToggle={() =>
                                    toggleSection(SECTION_KEYS.vulva)
                                }
                                selectionLabel={getSymptomsHeaderSelection(vulvaCondition)}
                                infoText="It is normal to experience occasional dryness or itchiness - after shaving, using a new hygiene product, or wearing tight clothes. If such sensations become uncomfortable and appear along with other symptoms, they may signal an infection."
                            >
                                <VulvaCondition
                                    vulvaCondition={vulvaCondition}
                                    onChange={handleVulvaConditionChange}
                                    skipped={isSkipped}
                                    embedded
                                />
                            </SymptomsAccordion>

                            <SymptomsAccordion
                                skipped={isSkipped}
                                title="Smell"
                                icon={<WavesIcon aria-hidden />}
                                isOpen={openSections[SECTION_KEYS.smell]}
                                onToggle={() =>
                                    toggleSection(SECTION_KEYS.smell)
                                }
                                selectionLabel={getSymptomsHeaderSelection(smell)}
                                infoText="A healthy vagina can have a natural scent that is metallic, musky, earthy, or tangy - all of these are normal! If you notice any of the unusual odors, such as those listed below, it might be helpful to mention them to your clinician."
                            >
                                <Smell
                                    smell={smell}
                                    onChange={handleSmellChange}
                                    skipped={isSkipped}
                                    embedded
                                />
                            </SymptomsAccordion>

                            <SymptomsAccordion
                                skipped={isSkipped}
                                title="Urine"
                                icon={<ToiletIcon aria-hidden />}
                                isOpen={openSections[SECTION_KEYS.urine]}
                                onToggle={() =>
                                    toggleSection(SECTION_KEYS.urine)
                                }
                                selectionLabel={getSymptomsHeaderSelection(urination)}
                                infoText="It is normal to urinate more often after drinking more fluids, coffee, or during periods of stress. More trips to the bathroom than is normal for you. A brief burning sensation can happen after using a new product or after sex. If such sensations last a long time or appear with other symptoms, they may signal an infection."
                            >
                                <Urination
                                    urination={urination}
                                    onChange={handleUrinationChange}
                                    skipped={isSkipped}
                                    embedded
                                />
                            </SymptomsAccordion>

                            <SymptomsAccordion
                                skipped={isSkipped}
                                title="Vaginal products"
                                icon={<ShowerIcon aria-hidden />}
                                isOpen={
                                    openSections[SECTION_KEYS.vaginalProducts]
                                }
                                onToggle={() =>
                                    toggleSection(SECTION_KEYS.vaginalProducts)
                                }
                                selectionLabel={getSymptomsHeaderSelection(vaginalProducts)}
                                infoText="Soaps, washes, and lubricants can raise or lower pH - we factor them in so they don't skew your result."
                            >
                                <VaginalProducts
                                    selected={vaginalProducts}
                                    onChange={handleVaginalProductsChange}
                                    skipped={isSkipped}
                                />
                            </SymptomsAccordion>

                            <SymptomsAccordion
                                skipped={isSkipped}
                                title="Sex & fluids"
                                icon={<HeartIcon aria-hidden />}
                                isOpen={openSections[SECTION_KEYS.sexFluids]}
                                onToggle={() =>
                                    toggleSection(SECTION_KEYS.sexFluids)
                                }
                                selectionLabel={getSymptomsHeaderSelection(sexFluids)}
                                infoText="Semen and saliva temporarily affect pH - knowing this makes your result more accurate."
                            >
                                <SexFluids
                                    selected={sexFluids}
                                    onChange={handleSexFluidsChange}
                                    skipped={isSkipped}
                                />
                            </SymptomsAccordion>

                            <SymptomsAccordion
                                skipped={isSkipped}
                                title="Spotting"
                                icon={<DropHalfIcon aria-hidden />}
                                isOpen={openSections[SECTION_KEYS.spotting]}
                                onToggle={() =>
                                    toggleSection(SECTION_KEYS.spotting)
                                }
                                selectionLabel={getSymptomsHeaderSelection(spotting)}
                                infoText="This temporarily changes vaginal pH - telling us about it helps us interpret your result correctly."
                            >
                                <Spotting
                                    selected={spotting}
                                    onChange={handleSpottingChange}
                                    skipped={isSkipped}
                                    disabledItems={spottingDisabledItems}
                                />
                            </SymptomsAccordion>

                            <SymptomsAccordion
                                skipped={isSkipped}
                                title="Notes"
                                icon={<Edit2Icon aria-hidden />}
                                isOpen={openSections[SECTION_KEYS.notes]}
                                onToggle={() =>
                                    toggleSection(SECTION_KEYS.notes)
                                }
                                hasSelection={String(notes ?? "").trim().length > 0}
                            >
                                <Notes
                                    notes={notes}
                                    setNotes={setNotes}
                                    skipped={isSkipped}
                                    embedded
                                />
                            </SymptomsAccordion>
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
