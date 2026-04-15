import { memo } from "react";

import InfoTooltip from "../../InfoTooltip/InfoTooltip";
import styles from "./CurrentMedications.module.css";

const options = [
    "None",
    "Birth control",
    "Testosterone",
    "Estrogen blocker",
    "Puberty blocker",
    "Antibiotics",
    "Antifungals",
];

const CurrentMedications = ({
    currentMedications,
    onChange,
    showHeadingError = false,
    disabledItems = [],
}) => {
    const disabledSet = new Set(Array.isArray(disabledItems) ? disabledItems : []);
    const list = options.map((item) => {
        const isActive = currentMedications.includes(item);
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
                aria-disabled={isDisabled}
            >
                <span>{item}</span>
            </div>
        );
    });

    return (
        <div className={styles.wrap}>
            <InfoTooltip
                title="Current medications or hormone replacement therapy"
                showArrow={false}
                showErrorCircle={showHeadingError}
            />
            <div className={styles.list}>{list}</div>
        </div>
    );
};

export default memo(CurrentMedications);

