import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import BottomBlock from "../../components/BottomBlock/BottomBlock";
import Button from "../../components/Button/Button";
import ButtonReverse from "../../components/ButtonReverse/ButtonReverse";
import Container from "../../components/Container/Container";
import BirthControl from "../../components/PersonalData/BirthControl/BirthControl";

import basicStyles from "../AddDetailsBasicPage/AddDetailsBasicPage.module.css";

const BirthControlPage = () => {
    const navigate = useNavigate();
    const { state } = useLocation();

    const [birthControl, setBirthControl] = useState(() => ({
        general: state?.birthControl?.general ?? null,
        pill: state?.birthControl?.pill ?? null,
        iud: state?.birthControl?.iud ?? null,
        otherHormonalMethods: state?.birthControl?.otherHormonalMethods ?? null,
        permanentMethods: state?.birthControl?.permanentMethods ?? null,
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
                        onClick={() =>
                            navigate("/result", {
                                state: { ...state, birthControl },
                            })
                        }
                    >
                        Submit
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
