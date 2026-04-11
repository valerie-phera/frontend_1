const useDetailsFromState = (state) => {
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

  const detailOptions = [
    state?.age,
    ...(state?.lifeStage?.length ? state.lifeStage : []),
    ...(state?.ethnicBackground?.length ? state.ethnicBackground : []),
    ...(state?.menstrualCycle?.length ? state.menstrualCycle : []),
    ...(state?.hormoneDiagnoses?.length ? state.hormoneDiagnoses : []),
    ...birthControlValues,
    ...hormoneTherapyValues,
    ...fertilityJourneyValues,
    ...(state?.discharge?.length ? state.discharge : []),
    ...(state?.vulvaCondition?.length ? state.vulvaCondition : []),
    ...(state?.smell?.length ? state.smell : []),
    ...(state?.urination?.length ? state.urination : []),
  ].filter(Boolean);

  return detailOptions;
};

export default useDetailsFromState;