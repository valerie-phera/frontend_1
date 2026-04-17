import { useLocation, useNavigate } from "react-router-dom";
import NextStepsPage from "../NextStepsPage";

import BottomBlock from "../../../components/BottomBlock/BottomBlock";
import Button from "../../../components/Button/Button";
import ButtonReverse from "../../../components/ButtonReverse/ButtonReverse";

import basicStyles from "../NextStepsPage.module.css";

const NextStepsFertilityTreatmentHormoneTherapyPage = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    return (
        <>
            <NextStepsPage
                lockedItems={["Fertility treatment", "Hormone therapy"]}
                totalSteps={5}
            />
            <BottomBlock>
                <Button
                    onClick={() =>
                        navigate("/add-details/paths/fertility-journey", {
                            state: { ...state, fertilityJourneyFlow: "toHormoneTherapy" },
                        })
                    }
                >
                    Add more details
                </Button>
                <ButtonReverse
                    onClick={() => navigate("/analyzing-data", { state })}
                >
                    View report now
                </ButtonReverse>
                <div className={basicStyles.bottomText}>
                    <p>
                        We respect your privacy. Only you can save and see
                        your results.
                    </p>
                </div>
            </BottomBlock>
        </>
    );
};

export default NextStepsFertilityTreatmentHormoneTherapyPage;

