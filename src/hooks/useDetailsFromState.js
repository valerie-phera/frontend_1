import { formatNotesForDisplay } from "../shared/utils/notesDisplay";
import { stripDetailOptions } from "../shared/utils/detailChipSelection";

const useDetailsFromState = (state) => {
  const strip = (arr, tokens) => {
    const list = Array.isArray(arr) ? arr : [];
    const set = new Set(Array.isArray(tokens) ? tokens : []);
    return list.filter((x) => x && !set.has(x));
  };

  const stripUi = (arr, tokens = []) =>
    strip(stripDetailOptions(arr), tokens);

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
    ...(state?.lifeStage?.length ? stripUi(state.lifeStage, ["None"]) : []),
    ...(state?.ethnicBackground?.length ? stripUi(state.ethnicBackground) : []),
    ...(state?.menstrualCycle?.length ? stripUi(state.menstrualCycle) : []),
    ...(state?.hormoneDiagnoses?.length
      ? stripUi(state.hormoneDiagnoses, ["None"])
      : []),
    ...(state?.currentMedications?.length
      ? stripUi(state.currentMedications, ["None"])
      : []),
    ...birthControlValues,
    ...hormoneTherapyValues,
    ...fertilityJourneyValues,
    ...(state?.discharge?.length
      ? stripUi(state.discharge, ["None", "No discharge"])
      : []),
    ...(state?.vulvaCondition?.length ? stripUi(state.vulvaCondition, ["None"]) : []),
    ...(state?.smell?.length ? stripUi(state.smell, ["None"]) : []),
    ...(state?.urination?.length ? stripUi(state.urination, ["None"]) : []),
    ...(notesDisplay ? [notesDisplay] : []),
  ].filter(Boolean);

  return detailOptions;
};

export default useDetailsFromState;