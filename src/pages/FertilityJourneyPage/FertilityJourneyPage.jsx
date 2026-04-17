import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import BottomBlock from "../../components/BottomBlock/BottomBlock";
import Button from "../../components/Button/Button";
import ButtonReverse from "../../components/ButtonReverse/ButtonReverse";
import Container from "../../components/Container/Container";
import FertilityJourney from "../../components/PersonalData/FertilityJourney/FertilityJourney";

import basicStyles from "../AddDetailsBasicPage/AddDetailsBasicPage.module.css";
import {
    readAddDetailsDraft,
    writeAddDetailsDraft,
} from "../../shared/utils/addDetailsDraftSessionStorage";
import {
    readActiveResultMeta,
    writeActiveResultMeta,
} from "../../shared/utils/activeResultSessionStorage";
import { writePendingAnalysis } from "../../shared/utils/pendingAnalysisSessionStorage";

const FertilityJourneyPage = () => {
    const navigate = useNavigate();
    const { state } = useLocation();

    const activeMeta = readActiveResultMeta();
    const phValue = state?.phValue ?? activeMeta?.phValue;
    const timestamp = state?.timestamp ?? activeMeta?.timestamp;
    const [isSubmitting, setIsSubmitting] = useState(false);

    const draft = useMemo(
        () => readAddDetailsDraft(phValue, timestamp),
        [phValue, timestamp]
    );

    const [fertilityJourney, setFertilityJourney] = useState(() => ({
        currentStatus:
            state?.fertilityJourney?.currentStatus ??
            draft?.fertilityJourney?.currentStatus ??
            null,
        fertilityTreatments: Array.isArray(state?.fertilityJourney?.fertilityTreatments)
            ? state.fertilityJourney.fertilityTreatments
            : Array.isArray(draft?.fertilityJourney?.fertilityTreatments)
                ? draft.fertilityJourney.fertilityTreatments
            : [],
    }));

    const handleSubmit = async () => {
        const nextState = { ...state, fertilityJourney };
        writeAddDetailsDraft(phValue, timestamp, { fertilityJourney });
        writeActiveResultMeta({ phValue, timestamp });
        writePendingAnalysis({ phValue, timestamp, startedAt: Date.now() });

        if (phValue === undefined || phValue === null) {
            alert("Missing pH result. Please go back and complete the test.");
            return;
        }
        navigate("/analyzing-data", { state: nextState });
    };

    const handleGoBack = () => {
        if (phValue !== undefined && phValue !== null) {
            writeAddDetailsDraft(phValue, timestamp, { fertilityJourney });
            writeActiveResultMeta({ phValue, timestamp });
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
                            <div className={basicStyles.itemColored}></div>
                            <div className={basicStyles.itemColoredYellow}></div>
                        </div>
                        <div className={basicStyles.step}>
                            Step 4 of 4 - Fertility (optional)
                        </div>
                        <div className={basicStyles.heading}>
                            <h1 className={basicStyles.title}>Your fertility journey</h1>
                        </div>
                        <p className={basicStyles.subtitle}>
                            This helps us interpret your pH result more accurately.
                        </p>

                        <div className={basicStyles.personalData}>
                            <FertilityJourney
                                fertilityJourney={fertilityJourney}
                                setFertilityJourney={setFertilityJourney}
                                variant="treatmentsOnly"
                            />
                        </div>
                    </div>
                </Container>

                <BottomBlock>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Submitting…" : "Submit"}
                    </Button>
                    <ButtonReverse
                        onClick={handleGoBack}
                    >
                        Go back
                    </ButtonReverse>
                    <div className={basicStyles.privacyPolicyWrap}>
                        <p className={basicStyles.privacyPolicy}>
                            Your answers are private and never shared without your consent.
                        </p>
                    </div>
                </BottomBlock>
            </div>
        </>
    );
};

export default FertilityJourneyPage;
