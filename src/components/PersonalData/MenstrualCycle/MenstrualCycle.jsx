import { memo } from "react";

import InfoTooltip from "../../InfoTooltip/InfoTooltip";
import DropIcon from "../../../assets/AddDetailsIcons/DropIcon";
import styles from "./MenstrualCycle.module.css";
import titleStyles from "../../../shared/styles/titleWithIcon.module.css";

const options = [
    "No period for 12+ months",
    "Regular",
    "Irregular",
    "Postpartum",
    "Never had a period",
    "Polycystic ovary syndrome (PCOS)",
];

const MenstrualCycle = ({
    menstrualCycle,
    onChange,
    showHeadingError = false,
}) => {
    const list = options.map((item) => {
        const isActive = menstrualCycle.includes(item);

        return (
            <div
                key={item}
                className={isActive ? styles.itemSelected : styles.item}
                onClick={() => onChange(item)}
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
                        <DropIcon aria-hidden />
                        <span>Menstrual cycle</span>
                    </span>
                }
                showArrow={false}
                showErrorCircle={showHeadingError}
            />
            <div className={styles.list}>{list}</div>
        </div>
    );
};

export default memo(MenstrualCycle);
