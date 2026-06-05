import { memo } from "react";

import InfoTooltip from "../../InfoTooltip/InfoTooltip";
import DropIcon from "../../../assets/AddDetailsIcons/DropIcon";
import DetailChipRow from "../DetailChipRow/DetailChipRow";
import skippedStyles from "../../../shared/styles/skippedChipSection.module.css";
import { buildSelectionChipClassName, buildSkippedChipClassName } from "../../../shared/utils/selectionChipClassName";
import styles from "./MenstrualCycle.module.css";
import titleStyles from "../../../shared/styles/titleWithIcon.module.css";

const options = [
    "No period for 12+ months",
    "Regular",
    "Irregular",
    "Currently pregnant",
    "Postpartum",
    "Never had a period",
    "Polycystic ovary syndrome (PCOS)",
];

const MenstrualCycle = ({
    menstrualCycle,
    onChange,
    showHeadingError = false,
    showDetailOptions = false,
    skipped = false,
}) => {
    const selected = Array.isArray(menstrualCycle) ? menstrualCycle : [];

    const list = options.map((item) => {
        if (skipped) {
            const isSelected = selected.includes(item);
            return (
                <div
                    key={item}
                    className={buildSkippedChipClassName(isSelected)}
                    role="presentation"
                    aria-hidden={!isSelected}
                >
                    <span>{item}</span>
                </div>
            );
        }

        const isActive = selected.includes(item);

        return (
            <div
                key={item}
                className={buildSelectionChipClassName(isActive)}
                onClick={() => onChange(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
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
                        <DropIcon aria-hidden />
                        <span>Menstrual cycle</span>
                    </span>
                }
                showArrow={false}
                showErrorCircle={showHeadingError && !skipped}
            >
                pH naturally fluctuates throughout your cycle - knowing where you are helps us give you a more personalized reading.
            </InfoTooltip>
            <div className={styles.list}>{list}</div>
            {showDetailOptions && (
                <DetailChipRow
                    selected={menstrualCycle}
                    onChange={onChange}
                    skipped={skipped}
                />
            )}
        </div>
    );
};

export default memo(MenstrualCycle);
