import { memo } from "react";

import InfoTooltip from "../../InfoTooltip/InfoTooltip";
import styles from "./VulvaCondition.module.css";

const options = [
    "Dry",
    "Itchy",
];

const VulvaCondition = ({ vulvaCondition, onChange }) => {
    const list = options.map((item) => {
        const isActive = vulvaCondition.includes(item);

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
            <InfoTooltip title="Vulva & Vagina" showArrow={false}>
                It is normal to experience occasional dryness or itchiness - after shaving, using a new hygiene product, or wearing tight clothes. If such sensations become uncomfortable and appear along with other symptoms, they may signal an infection.
            </InfoTooltip>
            <div className={styles.list}>{list}</div>
        </div>
    );
};

export default memo(VulvaCondition);
