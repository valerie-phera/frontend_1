import { FORM_DETAIL_SET } from "../constants/formDetailOptions";

export const stripDetailOptions = (arr) => {
    const list = Array.isArray(arr) ? arr : [];
    return list.filter((x) => !FORM_DETAIL_SET.has(x));
};

/** @returns {string[]|null} next state if value is a detail chip; null otherwise */
export const applyDetailChipSelection = (prev, value) => {
    if (!FORM_DETAIL_SET.has(value)) return null;

    const prevArr = Array.isArray(prev) ? prev : [];
    if (prevArr.includes(value)) {
        return prevArr.filter((x) => x !== value);
    }
    return [value];
};
