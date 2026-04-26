import { memo } from "react";

import InfoTooltip from "../../InfoTooltip/InfoTooltip";
import ToiletIcon from "../../../assets/AddDetailsIcons/ToiletIcon";
import styles from "./Urination.module.css";
import titleStyles from "../../../shared/styles/titleWithIcon.module.css";

const options = [
    "None",
    "Frequent urination",
    "Burning sensation",
];

const Urination = ({
    urination,
    onChange,
    showHeadingError = false,
}) => {
    const list = options.map((item) => {
        const isActive = urination.includes(item);

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
                        <ToiletIcon aria-hidden />
                        <span>Urine</span>
                    </span>
                }
                showArrow={false}
                showErrorCircle={showHeadingError}
            >
                It is normal to urinate more often after drinking more fluids, coffee, or during periods of stress. A brief burning sensation can happen after using a new product or after sex. If such sensations last a long time or appear with other symptoms, they may signal an infection.
            </InfoTooltip>
            <div className={styles.list}>{list}</div>
        </div>
    );
};

export default memo(Urination);
