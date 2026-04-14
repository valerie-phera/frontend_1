import NextStepsPage from "../NextStepsPage";

const NextStepsBirthControlFertilityTreatmentPage = () => {
    return (
        <NextStepsPage
            lockedItems={["Birth control", "Fertility treatment"]}
            totalSteps={5}
        />
    );
};

export default NextStepsBirthControlFertilityTreatmentPage;

