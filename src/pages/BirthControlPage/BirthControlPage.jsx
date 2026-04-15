import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import BottomBlock from "../../components/BottomBlock/BottomBlock";
import Button from "../../components/Button/Button";
import ButtonReverse from "../../components/ButtonReverse/ButtonReverse";
import Container from "../../components/Container/Container";
import BirthControl from "../../components/PersonalData/BirthControl/BirthControl";

import basicStyles from "../AddDetailsBasicPage/AddDetailsBasicPage.module.css";
import { writeAddDetailsDraft } from "../../shared/utils/addDetailsDraftSessionStorage";
import { readActiveResultMeta, writeActiveResultMeta } from "../../shared/utils/activeResultSessionStorage";
import { writePendingAnalysis } from "../../shared/utils/pendingAnalysisSessionStorage";

const BirthControlPage = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const activeMeta = readActiveResultMeta();
    const phValue = state?.phValue ?? activeMeta?.phValue;
    const timestamp = state?.timestamp ?? activeMeta?.timestamp;

    const [birthControl, setBirthControl] = useState(() => ({
        general: state?.birthControl?.general ?? null,
        pill: state?.birthControl?.pill ?? null,
        iud: state?.birthControl?.iud ?? null,
        otherHormonalMethods: state?.birthControl?.otherHormonalMethods ?? null,
        permanentMethods: state?.birthControl?.permanentMethods ?? null,
    }));

    const flow = state?.birthControlFlow ?? "submit";
    const primaryButtonLabel =
        flow === "toHormoneTherapy" || flow === "toFertilityJourney"
            ? "Next"
            : "Submit";

    const handlePrimary = async () => {
        const nextState = { ...state, birthControl };
        writeAddDetailsDraft(phValue, timestamp, { birthControl });
        writeActiveResultMeta({ phValue, timestamp });
        writePendingAnalysis({ phValue, timestamp, startedAt: Date.now() });

        if (flow === "toHormoneTherapy") {
            navigate("/add-details/paths/hormone-therapy", { state: nextState });
            return;
        }

        if (flow === "toFertilityJourney") {
            navigate("/add-details/paths/fertility-journey", { state: nextState });
            return;
        }

        // default: submit everything and go to analyzing
        if (phValue === undefined || phValue === null) {
            alert("Missing pH result. Please go back and complete the test.");
            return;
        }
        navigate("/analyzing-data", { state: nextState });
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
                            Step 4 of 4 - Birth control (optional)
                        </div>
                        <div className={basicStyles.heading}>
                            <h1 className={basicStyles.title}>Birth control</h1>
                        </div>
                        <p className={basicStyles.subtitle}>
                            Select your current method
                        </p>

                        <div className={basicStyles.personalData}>
                            <BirthControl
                                birthControl={birthControl}
                                setBirthControl={setBirthControl}
                            />
                        </div>
                       
                    </div>
                </Container>

                <BottomBlock>
                    <Button
                        onClick={handlePrimary}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Submitting…" : primaryButtonLabel}
                    </Button>
                    <ButtonReverse
                        onClick={() =>
                            navigate("/add-details/symptoms", {
                                state: { ...state, birthControl },
                            })
                        }
                    >
                        Go back
                    </ButtonReverse>
                    <div className={basicStyles.privacyPolicyWrap}>
                        <p className={basicStyles.privacyPolicy}>
                            This is optional - no pressure.
                        </p>
                    </div>
                </BottomBlock>
            </div>
        </>
    );
};

export default BirthControlPage;
