import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import BottomBlock from "../../components/BottomBlock/BottomBlock";
import Button from "../../components/Button/Button";
import ButtonReverse from "../../components/ButtonReverse/ButtonReverse";
import Container from "../../components/Container/Container";
import HormoneTherapy from "../../components/PersonalData/HormoneTherapy/HormoneTherapy";

import basicStyles from "../AddDetailsBasicPage/AddDetailsBasicPage.module.css";
import {
    writeAddDetailsDraft,
} from "../../shared/utils/addDetailsDraftSessionStorage";
import {
    readActiveResultMeta,
    writeActiveResultMeta,
} from "../../shared/utils/activeResultSessionStorage";
import { writePendingAnalysis } from "../../shared/utils/pendingAnalysisSessionStorage";

const HormoneTherapyPage = () => {
    const navigate = useNavigate();
    const { state } = useLocation();

    const activeMeta = readActiveResultMeta();
    const phValue = state?.phValue ?? activeMeta?.phValue;
    const timestamp = state?.timestamp ?? activeMeta?.timestamp;
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [hormoneTherapy, setHormoneTherapy] = useState(() => ({
        general: state?.hormoneTherapy?.general ?? null,
        hormoneReplacement: Array.isArray(state?.hormoneTherapy?.hormoneReplacement)
            ? state.hormoneTherapy.hormoneReplacement
            : [],
    }));

    const handleSubmit = async () => {
        const nextState = { ...state, hormoneTherapy };
        writeAddDetailsDraft(phValue, timestamp, { hormoneTherapy });
        writeActiveResultMeta({ phValue, timestamp });
        writePendingAnalysis({ phValue, timestamp, startedAt: Date.now() });

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
                            Step 4 of 4 - Hormones therapy (optional)
                        </div>
                        <div className={basicStyles.heading}>
                            <h1 className={basicStyles.title}>Hormone therapy</h1>
                        </div>
                        <p className={basicStyles.subtitle}>
                            Select your current method.
                        </p>

                        <div className={basicStyles.personalData}>
                            <HormoneTherapy
                                hormoneTherapy={hormoneTherapy}
                                setHormoneTherapy={setHormoneTherapy}
                                variant="radiosOnly"
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
                        onClick={() =>
                            navigate("/add-details/symptoms", {
                                state: { ...state, hormoneTherapy },
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

export default HormoneTherapyPage;
