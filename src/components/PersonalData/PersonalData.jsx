import AgeInput from "./AgeInput/AgeInput";
import LifeStage from "./LifeStage/LifeStage";
import {
    applyDetailChipSelection,
    stripDetailOptions,
} from "../../shared/utils/detailChipSelection";
import { toggleListItem } from "../../shared/utils/toggleListItem";
import EthnicBackground from "./EthnicBackground/EthnicBackground";
import MenstrualCycle from "./MenstrualCycle/MenstrualCycle";
import HormoneDiagnoses from "./HormoneDiagnoses/HormoneDiagnoses";
import BirthControl from "./BirthControl/BirthControl";
import HormoneTherapy from "./HormoneTherapy/HormoneTherapy";
import FertilityJourney from "./FertilityJourney/FertilityJourney";
import Discharge from "./Discharge/Discharge";
import VulvaCondition from "./VulvaCondition/VulvaCondition";
import Smell from "./Smell/Smell";
import Urination from "./Urination/Urination";
import Notes from "./Notes/Notes";
import InfoTooltip from "../InfoTooltip/InfoTooltip";

import styles from "./PersonalData.module.css";

const noop = () => {};

const PersonalData = ({
    variant = "full",
    age,
    setAge,
    lifeStage,
    setLifeStage,
    ethnicBackground,
    setEthnicBackground,
    ethnicOtherText = "",
    setEthnicOtherText = noop,
    menstrualCycle = [],
    setMenstrualCycle = noop,
    hormoneDiagnoses = [],
    setHormoneDiagnoses = noop,
    birthControl = {
        general: null,
        pill: null,
        iud: null,
        otherHormonalMethods: null,
        permanentMethods: null,
    },
    setBirthControl = noop,
    hormoneTherapy = { general: null, hormoneReplacement: [] },
    setHormoneTherapy = noop,
    fertilityJourney = { currentStatus: null, fertilityTreatments: [] },
    setFertilityJourney = noop,
    discharge = [],
    setDischarge = noop,
    vulvaCondition = [],
    setVulvaCondition = noop,
    smell = [],
    setSmell = noop,
    urination = [],
    setUrination = noop,
    notes = "",
    setNotes = noop,
    basicValidationVisible = false,
    basicSectionIssues = {
        ageMissing: false,
        ageInvalid: false,
        lifeMissing: false,
        ethnicMissing: false,
        ethnicOtherMissing: false,
        count: 0,
    },
    skipped = false,
}) => {
    const showFullForm = variant !== "basic";

    const showAgeHeadingError =
        showFullForm &&
        basicValidationVisible &&
        (basicSectionIssues.ageMissing || basicSectionIssues.ageInvalid);
    const showLifeHeadingError =
        showFullForm && basicValidationVisible && basicSectionIssues.lifeMissing;
    const showEthnicHeadingError =
        showFullForm && basicValidationVisible && basicSectionIssues.ethnicMissing;

    const isTryingToConceive = Array.isArray(lifeStage)
        ? lifeStage.includes("Trying to conceive")
        : false;

    const isPregnant = Array.isArray(lifeStage)
        ? lifeStage.includes("Pregnant")
        : false;

    const handleLifeStageChange = (value) => {
        setLifeStage((prev) => {
            const disabledWhenTrying = new Set(["Menopause", "Postmenopause"]);
            const disabledWhenPregnant = new Set([
                "Trying to conceive",
                "Menopause",
                "Postmenopause",
            ]);
            const prevArr = Array.isArray(prev) ? prev : [];

            const detailNext = applyDetailChipSelection(prevArr, value);
            if (detailNext !== null) return detailNext;

            const tryingSelected = prevArr.includes("Trying to conceive");
            const pregnantSelected = prevArr.includes("Pregnant");

            if (tryingSelected && disabledWhenTrying.has(value)) {
                return prevArr;
            }

            let next = toggleListItem(stripDetailOptions(prevArr), value);

            // If user selects "Trying to conceive", force-remove Menopause/Postmenopause
            if (next.includes("Trying to conceive")) {
                next = next.filter((x) => !disabledWhenTrying.has(x));
            }

            // If "Pregnant" is selected, block conflicting life stages and remove them if present.
            if (pregnantSelected && disabledWhenPregnant.has(value)) {
                return prevArr;
            }
            if (next.includes("Pregnant")) {
                next = next.filter((x) => !disabledWhenPregnant.has(x));
            }

            return next;
        });
    };

    const handleEthnicBackgroundChange = (value) => {
        setEthnicBackground((prev) =>
            prev.includes(value)
                ? prev.filter((h) => h !== value)
                : [...prev, value]
        );
    };

    const handleMenstrualCycleChange = (value) => {
        setMenstrualCycle((prev) => toggleListItem(prev, value));
    };

    const handleHormoneDiagnosesChange = (value) => {
        setHormoneDiagnoses((prev) => toggleListItem(prev, value));
    };

    const handleDischargeChange = (value) => {
        setDischarge((prev) =>
            prev.includes(value)
                ? prev.filter((h) => h !== value)
                : [...prev, value]
        );
    };

    const handleVulvaConditionChange = (value) => {
        setVulvaCondition((prev) => toggleListItem(prev, value));
    };

    const handleSmellChange = (value) => {
        setSmell((prev) => toggleListItem(prev, value));
    };

    const handleUrinationChange = (value) => {
        setUrination((prev) => toggleListItem(prev, value));
    };

    return (
        <>
            <div className={styles.wrapper}>
                <form className={styles.form}>
                    <AgeInput
                        age={age}
                        onChange={setAge}
                        showHeadingError={showAgeHeadingError}
                        showError={
                            showFullForm &&
                            basicValidationVisible &&
                            basicSectionIssues.ageInvalid
                        }
                        skipped={skipped}
                    />
                    <LifeStage
                        lifeStage={lifeStage}
                        onChange={handleLifeStageChange}
                        showHeadingError={showLifeHeadingError}
                        showDetailOptions={!showFullForm}
                        skipped={skipped}
                        disabledItems={
                            isPregnant
                                ? ["Trying to conceive", "Menopause", "Postmenopause"]
                                : isTryingToConceive
                                    ? ["Menopause", "Postmenopause"]
                                    : []
                        }
                    />
                    <EthnicBackground
                        ethnicBackground={ethnicBackground}
                        onChange={handleEthnicBackgroundChange}
                        setEthnicBackground={
                            showFullForm ? undefined : setEthnicBackground
                        }
                        otherText={ethnicOtherText}
                        onOtherTextChange={setEthnicOtherText}
                        otherInputMode={showFullForm ? "always" : "when_other"}
                        showPreferNotToSay={!showFullForm}
                        skipped={skipped}
                        showHeadingError={showEthnicHeadingError}
                        showOtherError={
                            showFullForm &&
                            basicValidationVisible &&
                            basicSectionIssues.ethnicOtherMissing
                        }
                    />

                    {showFullForm && (
                        <>
                            <div className={styles.wrapHeading}>
                                <div className={styles.heading}>Hormone status</div>
                                <div className={styles.icon}>
                                    <InfoTooltip iconOnly>
                                        Knowing your hormone status helps us understand the main factors that influence your pH level.
                                    </InfoTooltip>
                                </div>
                            </div>

                            <MenstrualCycle menstrualCycle={menstrualCycle} onChange={handleMenstrualCycleChange} />
                            <HormoneDiagnoses hormoneDiagnoses={hormoneDiagnoses} onChange={handleHormoneDiagnosesChange} />
                            <BirthControl birthControl={birthControl} setBirthControl={setBirthControl} />
                            <HormoneTherapy hormoneTherapy={hormoneTherapy} setHormoneTherapy={setHormoneTherapy} />
                            <FertilityJourney fertilityJourney={fertilityJourney} setFertilityJourney={setFertilityJourney} />

                            <div className={styles.heading}>Symptoms</div>
                            <Discharge discharge={discharge} onChange={handleDischargeChange} />
                            <VulvaCondition vulvaCondition={vulvaCondition} onChange={handleVulvaConditionChange} />
                            <Smell smell={smell} onChange={handleSmellChange} />
                            <Urination urination={urination} onChange={handleUrinationChange} />
                            <Notes notes={notes} setNotes={setNotes} />
                        </>
                    )}
                </form>
            </div>
        </>
    );
};

export default PersonalData;