import { memo } from "react";

import InfoTooltip from "../../InfoTooltip/InfoTooltip";
import PillIcon from "../../../assets/AddDetailsIcons/PillIcon";
import styles from "./CurrentMedications.module.css";
import titleStyles from "../../../shared/styles/titleWithIcon.module.css";

const options = [
    "None",
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
}) => {
    const disabledSet = new Set(Array.isArray(disabledItems) ? disabledItems : []);
    const hiddenSet = new Set(Array.isArray(hiddenItems) ? hiddenItems : []);

    const list = options
        .filter((item) => !hiddenSet.has(item))
        .map((item) => {
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
                title={
                    <span className={titleStyles.titleWithIcon}>
                        <PillIcon aria-hidden />
                        <span>Medications or hormone treatment</span>
                    </span>
                }
                showArrow={false}
                showErrorCircle={showHeadingError}
            />
            <div className={styles.list}>{list}</div>
        </div>
    );
};

export default memo(CurrentMedications);

