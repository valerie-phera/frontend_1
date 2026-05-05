const strip = (arr, tokens) => {
  const list = Array.isArray(arr) ? arr : [];
  const set = new Set(Array.isArray(tokens) ? tokens : []);
  return list.filter((x) => x && !set.has(x));
};

const joinList = (v) => {
  if (v == null || v === "") return "";
  if (Array.isArray(v)) return v.filter(Boolean).join(", ");
  return String(v);
};

/**
 * Rows for PDF layout matching Figma "Your details" / "Reported symptoms".
 * @param {object|null|undefined} state – same shape as route state after AnalyzingData
 */
export function getPdfDetailSections(state) {
  if (!state || typeof state !== "object") {
    return { yourDetails: [], reportedSymptoms: [] };
  }

  const birthControlValues = state.birthControl
    ? Object.values(state.birthControl).filter(Boolean)
    : [];

  const hormoneTherapyValues = state.hormoneTherapy
    ? [state.hormoneTherapy.general, ...(state.hormoneTherapy.hormoneReplacement || [])].filter(
        Boolean
      )
    : [];

  const fertilityJourneyValues = state.fertilityJourney
    ? [state.fertilityJourney.currentStatus, ...(state.fertilityJourney.fertilityTreatments || [])].filter(
        Boolean
      )
    : [];

  const yourDetails = [];

  if (state.age != null && state.age !== "") {
    yourDetails.push({ label: "Age", value: String(state.age) });
  }

  const lifeStage = joinList(strip(state.lifeStage, ["None"]));
  if (lifeStage) yourDetails.push({ label: "Life stage", value: lifeStage });

  const ethnic = joinList(state.ethnicBackground);
  if (ethnic) yourDetails.push({ label: "Ethnic background", value: ethnic });

  const cycle = joinList(state.menstrualCycle);
  if (cycle) yourDetails.push({ label: "Cycle status", value: cycle });

  const diagnoses = joinList(strip(state.hormoneDiagnoses, ["None"]));
  if (diagnoses) yourDetails.push({ label: "Diagnoses", value: diagnoses });

  const meds = joinList(strip(state.currentMedications, ["None"]));
  if (meds) yourDetails.push({ label: "Medications", value: meds });

  const bc = joinList(birthControlValues);
  if (bc) yourDetails.push({ label: "Birth control", value: bc });

  const ht = joinList(hormoneTherapyValues);
  if (ht) yourDetails.push({ label: "Hormone therapy", value: ht });

  const fj = joinList(fertilityJourneyValues);
  if (fj) yourDetails.push({ label: "Fertility journey", value: fj });

  const reportedSymptoms = [];

  const discharge = joinList(strip(state.discharge, ["None", "No discharge"]));
  if (discharge) reportedSymptoms.push({ label: "Discharge", value: discharge });

  const vulva = joinList(strip(state.vulvaCondition, ["None"]));
  if (vulva) reportedSymptoms.push({ label: "Vulva & vagina", value: vulva });

  const smell = joinList(strip(state.smell, ["None"]));
  if (smell) reportedSymptoms.push({ label: "Smell", value: smell });

  const urine = joinList(strip(state.urination, ["None"]));
  if (urine) reportedSymptoms.push({ label: "Urine", value: urine });

  return { yourDetails, reportedSymptoms };
}
