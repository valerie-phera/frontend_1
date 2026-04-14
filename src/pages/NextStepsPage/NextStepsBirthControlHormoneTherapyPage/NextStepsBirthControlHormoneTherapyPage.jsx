import NextStepsPage from "../NextStepsPage";

const NextStepsBirthControlHormoneTherapyPage = () => {
    return (
        <NextStepsPage
            lockedItems={["Birth control", "Hormone therapy"]}
            totalSteps={5}
        />
    );
};

export default NextStepsBirthControlHormoneTherapyPage;

