import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import BottomBlock from "../../components/BottomBlock/BottomBlock";
import Button from "../../components/Button/Button";
import ButtonReverse from "../../components/ButtonReverse/ButtonReverse";
import Container from "../../components/Container/Container";
import FertilityJourney from "../../components/PersonalData/FertilityJourney/FertilityJourney";

import basicStyles from "../AddDetailsBasicPage/AddDetailsBasicPage.module.css";

const FertilityJourneyPage = () => {
    const navigate = useNavigate();
    const { state } = useLocation();

    const [fertilityJourney, setFertilityJourney] = useState(() => ({
        currentStatus: state?.fertilityJourney?.currentStatus ?? null,
        fertilityTreatments: Array.isArray(state?.fertilityJourney?.fertilityTreatments)
            ? state.fertilityJourney.fertilityTreatments
            : [],
    }));

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
                        onClick={() =>
                            navigate("/result", {
                                state: { ...state, fertilityJourney },
                            })
                        }
                    >
                        Submit
                    </Button>
                    <ButtonReverse
                        onClick={() =>
                            navigate("/add-details/symptoms", {
                                state: { ...state, fertilityJourney },
                            })
                        }
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
