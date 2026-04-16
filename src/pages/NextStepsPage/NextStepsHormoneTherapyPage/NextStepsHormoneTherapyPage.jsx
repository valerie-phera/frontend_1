import { useLocation, useNavigate } from "react-router-dom";
import NextStepsPage from "../NextStepsPage";

import BottomBlock from "../../../components/BottomBlock/BottomBlock";
import Button from "../../../components/Button/Button";
import ButtonReverse from "../../../components/ButtonReverse/ButtonReverse";

import basicStyles from "../NextStepsPage.module.css";

const NextStepsHormoneTherapyPage = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    return (
        <>
            <NextStepsPage lockedItems={["Hormone therapy"]} totalSteps={4} />
            <BottomBlock>
                <Button onClick={() => navigate("/add-details/paths/hormone-therapy")}>
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
    )
};

export default NextStepsHormoneTherapyPage