import { memo } from "react";

import InfoTooltip from "../../InfoTooltip/InfoTooltip";
import PillIcon from "../../../assets/AddDetailsIcons/PillIcon";
import DetailChipRow from "../DetailChipRow/DetailChipRow";
import skippedStyles from "../../../shared/styles/skippedChipSection.module.css";
import styles from "./CurrentMedications.module.css";
import titleStyles from "../../../shared/styles/titleWithIcon.module.css";

const options = [
    "Antibiotics",
    "Antifungals",
    "Birth control",
    "Fertility treatment",
    "Estrogen only",
    "Estrogen + progestin",
    "Estrogen blocker",
    "Puberty blocker",
    "Testosterone",
];

const CurrentMedications = ({
    currentMedications,
    onChange,
    showHeadingError = false,
    disabledItems = [],
    hiddenItems = [],
    showDetailOptions = false,
    skipped = false,
}) => {
    const selected = Array.isArray(currentMedications) ? currentMedications : [];
    const disabledSet = new Set(Array.isArray(disabledItems) ? disabledItems : []);
    const hiddenSet = new Set(Array.isArray(hiddenItems) ? hiddenItems : []);

    const list = options
        .filter((item) => !hiddenSet.has(item))
        .map((item) => {
            if (skipped) {
                const isSelected = selected.includes(item);
                return (
                    <div
                        key={item}
                        className={
                            isSelected
                                ? skippedStyles.itemSkippedSelected
                                : skippedStyles.itemSkippedInactive
                        }
                        role="presentation"
                        aria-hidden={!isSelected}
                    >
                        <span>{item}</span>
                    </div>
                );
            }

            const isActive = selected.includes(item);
            const isDisabled = disabledSet.has(item);

            return (
                <div
                    key={item}
                    className={
                        isDisabled
                            ? styles.itemDisabled
                            : isActive
                                ? styles.itemSelected
                                : styles.item
                    }
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
        });

    return (
        <div
            className={`${styles.wrap} ${
                skipped ? skippedStyles.wrapSkipped : ""
            }`.trim()}
        >
            <InfoTooltip
                title={
                    <span className={titleStyles.titleWithIcon}>
                        <PillIcon aria-hidden />
                        <span>Medications or hormone treatment</span>
                    </span>
                }
                showArrow={false}
                showErrorCircle={showHeadingError && !skipped}
            />
            <div className={styles.list}>{list}</div>
            {showDetailOptions && (
                <DetailChipRow
                    selected={currentMedications}
                    onChange={onChange}
                    skipped={skipped}
                />
            )}
        </div>
    );
};

export default memo(CurrentMedications);
