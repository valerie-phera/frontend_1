import { memo } from "react";

import InfoTooltip from "../../InfoTooltip/InfoTooltip";
import styles from "./LifeStage.module.css";

const options = [
    "None",
    "Pregnant",
    "Trying to conceive",
    "Perimenopause",
    "Menopause",
    "Postmenopause",
];

const LifeStage = ({ lifeStage, onChange }) => {
    const selected = Array.isArray(lifeStage) ? lifeStage : [];
    const list = options.map((item) => {
        const isActive = selected.includes(item);

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
            <InfoTooltip title="Life stage" showArrow={false} />
            <div className={styles.list}>{list}</div>
        </div>
    );
};

export default memo(LifeStage);
