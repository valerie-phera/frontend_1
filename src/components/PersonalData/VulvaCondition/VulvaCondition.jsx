import { memo } from "react";

import InfoTooltip from "../../InfoTooltip/InfoTooltip";
import FlowerIcom from "../../../assets/AddDetailsIcons/FlowerIcom";
import styles from "./VulvaCondition.module.css";
import titleStyles from "../../../shared/styles/titleWithIcon.module.css";

const options = [
    "None",
    "Dry",
    "Itchy",
];

const VulvaCondition = ({
    vulvaCondition,
    onChange,
    showHeadingError = false,
}) => {
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
            <InfoTooltip
                title={
                    <span className={titleStyles.titleWithIcon}>
                        <FlowerIcom aria-hidden />
                        <span>Vulva &amp; Vagina</span>
                    </span>
                }
                showArrow={false}
                showErrorCircle={showHeadingError}
            >
                It is normal to experience occasional dryness or itchiness - after shaving, using a new hygiene product, or wearing tight clothes. If such sensations become uncomfortable and appear along with other symptoms, they may signal an infection.
            </InfoTooltip>
            <div className={styles.list}>{list}</div>
        </div>
    );
};

export default memo(VulvaCondition);
