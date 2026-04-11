import { memo } from "react";

import InfoTooltip from "../../InfoTooltip/InfoTooltip";
import styles from "./MenstrualCycle.module.css";

const options = [
    "Regular",
    "Irregular",
    "No period for 12+ months",
    "Never had a period",
    "Perimenopause",
    "Postmenopause",
];

const MenstrualCycle = ({ menstrualCycle, onChange }) => {
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
            <InfoTooltip title="Menstrual cycle" showArrow={false} />
            <div className={styles.list}>{list}</div>
        </div>
    );
};

export default memo(MenstrualCycle);
