import chipStyles from "../styles/selectionChip.module.css";
import skippedStyles from "../styles/skippedChipSection.module.css";

/** @param {"main" | "detail"} variant */
export const buildSelectionChipClassName = (
  active,
  { variant = "main", disabled = false } = {}
) => {
  if (variant === "detail") {
    return `${chipStyles.chipDetail} ${
      active ? chipStyles.chipDetailSelected : ""
    }`.trim();
  }
  if (disabled) return chipStyles.chipDisabled;
  return `${chipStyles.chip} ${active ? chipStyles.chipSelected : ""}`.trim();
};

/** @param {"main" | "detail"} variant */
export const buildSkippedChipClassName = (
  isSelected,
  { variant = "main" } = {}
) => {
  if (isSelected) {
    return `${buildSelectionChipClassName(true, { variant })} ${chipStyles.chipReadonly}`.trim();
  }
  return skippedStyles.itemSkippedInactive;
};

export { chipStyles as selectionChipStyles };
