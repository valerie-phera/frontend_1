export function getInterpretation(phLevel, phValue ) {
    if (phLevel === "Normal") {
        return `A vaginal pH of ${phValue} is within the expected range. Personalized your result and track changes over time.`;
    }
    if (phLevel === "Slightly Elevated") {
        return `A vaginal pH of ${phValue} is slightly elevated and may indicate changes in the vaginal microbiome, especially if you also have symptoms. We recommend adding more details to personalize your result and sharing your results with a doctor.`;
    }
    return `A vaginal pH of ${phValue} is elevated and not considered within the usual range. We recommend adding more details to personalize your result and speaking to a doctor for further assessment.`;
}