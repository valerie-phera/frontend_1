import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import BottomBlock from "../../components/BottomBlock/BottomBlock";
import Button from "../../components/Button/Button";
import ButtonReverse from "../../components/ButtonReverse/ButtonReverse";
import Container from "../../components/Container/Container";
import HormoneTherapy from "../../components/PersonalData/HormoneTherapy/HormoneTherapy";

import basicStyles from "../AddDetailsBasicPage/AddDetailsBasicPage.module.css";

const HormoneTherapyPage = () => {
    const navigate = useNavigate();
    const { state } = useLocation();

    const [hormoneTherapy, setHormoneTherapy] = useState(() => ({
        general: state?.hormoneTherapy?.general ?? null,
        hormoneReplacement: Array.isArray(state?.hormoneTherapy?.hormoneReplacement)
            ? state.hormoneTherapy.hormoneReplacement
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
                        onClick={() =>
                            navigate("/result", {
                                state: { ...state, hormoneTherapy },
                            })
                        }
                    >
                        Submit
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
