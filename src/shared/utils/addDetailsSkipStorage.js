import { writeAddDetailsDraft } from "./addDetailsDraftSessionStorage";
import { writeBasicFormSnapshot } from "./basicFormSessionStorage";

export const SKIP_STEP = {
    basic: "basicSkipped",
    hormonal: "hormonalSkipped",
    symptoms: "symptomsSkipped",
};

export const PRE_SKIP_STEP = {
    basic: "basicPreSkipSnapshot",
    hormonal: "hormonalPreSkipSnapshot",
    symptoms: "symptomsPreSkipSnapshot",
};

export const isStepSkipped = (draft, step) => Boolean(draft?.[SKIP_STEP[step]]);

export const readPreSkipSnapshot = (draft, step) => {
    const snap = draft?.[PRE_SKIP_STEP[step]];
    return snap && typeof snap === "object" ? snap : null;
};

export const EMPTY_STEP_FORM_PATCH = {
    basic: {
        age: "",
        lifeStage: [],
        ethnicBackground: [],
        ethnicOtherText: "",
    },
    hormonal: {
        menstrualCycle: [],
        hormoneDiagnoses: [],
        currentMedications: [],
    },
    symptoms: {
        discharge: [],
        vulvaCondition: [],
        smell: [],
        urination: [],
        notes: "",
    },
};

export const getEmptyStepFormPatch = (step) => ({
    ...(EMPTY_STEP_FORM_PATCH[step] ?? {}),
});

export const persistStepSkip = (
    phValue,
    timestamp,
    step,
    { skipped, preSkipSnapshot = null, formPatch = {} }
) => {
    writeAddDetailsDraft(phValue, timestamp, {
        [SKIP_STEP[step]]: Boolean(skipped),
        [PRE_SKIP_STEP[step]]: skipped ? preSkipSnapshot : null,
        ...formPatch,
    });
};

export const persistBasicSkip = (
    phValue,
    timestamp,
    { skipped, preSkipSnapshot = null, formPatch = {} }
) => {
    const skipPatch = {
        basicSkipped: Boolean(skipped),
        basicPreSkipSnapshot: skipped ? preSkipSnapshot : null,
    };
    writeBasicFormSnapshot(phValue, timestamp, { ...skipPatch, ...formPatch });
    persistStepSkip(phValue, timestamp, "basic", {
        skipped,
        preSkipSnapshot,
        formPatch,
    });
};
