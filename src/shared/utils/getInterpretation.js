function buildInterpretationParts(phLevel, phValue) {
    const lead = `A vaginal pH of ${phValue}`;
    if (phLevel === "Normal") {
        return {
            lead,
            suffix: " is within the expected range. Personalized your result and track changes over time.",
        };
    }
    if (phLevel === "Slightly Elevated") {
        return {
            lead,
            suffix: " is slightly elevated and may indicate changes in the vaginal microbiome, especially if you also have symptoms. We recommend adding more details to personalize your result and sharing your results with a doctor.",
        };
    }
    return {
        lead,
        suffix: " is elevated and not considered within the usual range. We recommend adding more details to personalize your result and speaking to a doctor for further assessment.",
    };
}

/** Plain string (e.g. for router state, export). */
export function getInterpretation(phLevel, phValue) {
    const { lead, suffix } = buildInterpretationParts(phLevel, phValue);
    return `${lead}${suffix}`;
}

/** `{ lead, suffix }` — выводите `<strong>{lead}</strong>{suffix}` в JSX. */
export function getInterpretationParts(phLevel, phValue) {
    return buildInterpretationParts(phLevel, phValue);
}
