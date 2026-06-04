import chipStyles from "../styles/selectionChip.module.css";

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

export { chipStyles as selectionChipStyles };
