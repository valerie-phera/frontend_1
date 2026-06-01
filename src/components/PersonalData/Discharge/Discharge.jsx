import { memo } from "react";

import InfoTooltip from "../../InfoTooltip/InfoTooltip";
import GroupIcon from "../../../assets/AddDetailsIcons/GroupIcon";
import skippedStyles from "../../../shared/styles/skippedChipSection.module.css";
import styles from "./Discharge.module.css";
import titleStyles from "../../../shared/styles/titleWithIcon.module.css";

const options = [
    "No discharge",
    "Creamy",
    "Sticky",
    "Egg white",
    "Clumpy white",
    "Grey and watery",
    "Yellow / Green",
    "Red / Brown",
];

const Discharge = ({
    discharge,
    onChange,
    showHeadingError = false,
    skipped = false,
}) => {
    const selected = Array.isArray(discharge) ? discharge : [];

    const list = options.map((item) => {
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

        return (
            <div
                key={item}
                className={isActive ? styles.itemSelected : styles.item}
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
                        <GroupIcon aria-hidden />
                        <span>Discharge</span>
                    </span>
                }
                showArrow={false}
                showErrorCircle={showHeadingError && !skipped}
            >
                Discharge varies from person to person. It is influenced by your cycle, hygiene products, medications, stress, and a lot of other factors. Look out for discharge of unusual colour and texture.
            </InfoTooltip>
            <div className={styles.list}>{list}</div>
        </div>
    );
};

export default memo(Discharge);
