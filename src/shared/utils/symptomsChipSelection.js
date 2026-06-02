import { FORM_DETAIL_SET } from "../constants/formDetailOptions";

/** Header label for accordion when chips are selected. */
export const getSymptomsHeaderSelection = (selected) => {
    const arr = Array.isArray(selected) ? selected : [];
    if (arr.length === 0) return null;
    if (arr.some((x) => FORM_DETAIL_SET.has(x))) return "—";
    return `${arr.length} selected`;
};

/** Toggle handler for symptom chip sections with optional exclusive primary option. */
export const createSymptomsChipChangeHandler =
    (setter, { exclusiveOption } = {}) =>
    (value) => {
        setter((prev) => {
            const arr = Array.isArray(prev) ? prev : [];

            if (FORM_DETAIL_SET.has(value)) {
                return arr.includes(value) ? [] : [value];
            }

            let next = arr.filter((x) => !FORM_DETAIL_SET.has(x));

            if (exclusiveOption && value === exclusiveOption) {
                return next.includes(value) ? [] : [value];
            }

            if (exclusiveOption) {
                next = next.filter((x) => x !== exclusiveOption);
            }

            return next.includes(value)
                ? next.filter((x) => x !== value)
                : [...next, value];
        });
    };
