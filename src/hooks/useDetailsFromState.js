import { formatNotesForDisplay } from "../shared/utils/notesDisplay";

const useDetailsFromState = (state) => {
  const strip = (arr, tokens) => {
    const list = Array.isArray(arr) ? arr : [];
    const set = new Set(Array.isArray(tokens) ? tokens : []);
    return list.filter((x) => x && !set.has(x));
  };

  const birthControlValues = state?.birthControl
    ? Object.values(state.birthControl).filter(Boolean)
    : [];

  const hormoneTherapyValues = state?.hormoneTherapy
    ? [
        state.hormoneTherapy.general,
        ...(state.hormoneTherapy.hormoneReplacement || []),
      ].filter(Boolean)
    : [];

  const fertilityJourneyValues = state?.fertilityJourney
    ? [
        state.fertilityJourney.currentStatus,
        ...(state.fertilityJourney.fertilityTreatments || []),
      ].filter(Boolean)
    : [];

  const notesDisplay = formatNotesForDisplay(state?.notes);

  const detailOptions = [
    state?.age,
    ...(state?.lifeStage?.length ? strip(state.lifeStage, ["None"]) : []),
    ...(state?.ethnicBackground?.length ? state.ethnicBackground : []),
    ...(state?.menstrualCycle?.length ? state.menstrualCycle : []),
    ...(state?.hormoneDiagnoses?.length ? strip(state.hormoneDiagnoses, ["None"]) : []),
    ...(state?.currentMedications?.length
      ? strip(state.currentMedications, ["None"])
      : []),
    ...birthControlValues,
    ...hormoneTherapyValues,
    ...fertilityJourneyValues,
    ...(state?.discharge?.length
      ? strip(state.discharge, ["None", "No discharge"])
      : []),
    ...(state?.vulvaCondition?.length ? state.vulvaCondition : []),
    ...(state?.smell?.length ? state.smell : []),
    ...(state?.urination?.length ? state.urination : []),
    ...(notesDisplay ? [notesDisplay] : []),
  ].filter(Boolean);

  return detailOptions;
};

export default useDetailsFromState;