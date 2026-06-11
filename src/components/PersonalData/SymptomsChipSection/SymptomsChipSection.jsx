import { memo } from "react";

import { FORM_DETAIL_OPTIONS } from "../../../shared/constants/formDetailOptions";
import { buildSelectionChipClassName, buildSkippedChipClassName } from "../../../shared/utils/selectionChipClassName";
import styles from "./SymptomsChipSection.module.css";

const SymptomsChipSection = ({
    options,
    selected = [],
    onChange,
    skipped = false,
    disabledItems = [],
    showDetailOptions = true,
    infoSlot = null,
}) => {
    const values = Array.isArray(selected) ? selected : [];
    const disabledSet = new Set(
        Array.isArray(disabledItems) ? disabledItems : []
    );

    const renderChip = (item, isDetail = false) => {
        if (skipped) {
            const isSelected = values.includes(item);
            return (
                <div
                    key={item}
                    className={buildSkippedChipClassName(isSelected, {
                        variant: isDetail ? "detail" : "main",
                    })}
                    role="presentation"
                    aria-hidden={!isSelected}
                >
                    <span>{item}</span>
                </div>
            );
        }

        const isActive = values.includes(item);
        const isDisabled = disabledSet.has(item);
        const className = buildSelectionChipClassName(isActive, {
            variant: isDetail ? "detail" : "main",
            disabled: isDisabled,
        });

        return (
            <div
                key={item}
                className={className}
                onClick={() => {
                    if (isDisabled) return;
                    onChange(item);
                }}
                role="button"
                tabIndex={isDisabled ? -1 : 0}
                aria-disabled={isDisabled}
                onKeyDown={(e) => {
                    if (isDisabled) return;
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onChange(item);
                    }
                }}
            >
                <span>{item}</span>
            </div>
        );
    };

    return (
        <>
            <div className={styles.list}>
                {options.map((item) => renderChip(item))}
            </div>
            {showDetailOptions ? (
                <>
                    <hr className={styles.divider} />
                    <div className={styles.detailRow}>
                        <div className={styles.detailList}>
                            {FORM_DETAIL_OPTIONS.map((item) =>
                                renderChip(item, true)
                            )}
                        </div>
                        {infoSlot}
                    </div>
                </>
            ) : null}
        </>
    );
};

export default memo(SymptomsChipSection);
