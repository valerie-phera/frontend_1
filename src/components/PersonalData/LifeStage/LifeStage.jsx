import { memo } from "react";

import InfoTooltip from "../../InfoTooltip/InfoTooltip";
import LifeStageIcon from "../../../assets/AddDetailsIcons/LifeStageIcon";
import styles from "./LifeStage.module.css";

const options = [
    "None",
    "Pregnant",
    "Trying to conceive",
    "Perimenopause",
    "Menopause",
    "Postmenopause",
];

const LifeStage = ({
    lifeStage,
    onChange,
    showHeadingError = false,
    disabledItems = [],
}) => {
    const selected = Array.isArray(lifeStage) ? lifeStage : [];
    const disabledSet = new Set(Array.isArray(disabledItems) ? disabledItems : []);
    const list = options.map((item) => {
        const isActive = selected.includes(item);
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
                    <span className={styles.titleWithIcon}>
                        <LifeStageIcon aria-hidden />
                        <span>Life stage</span>
                    </span>
                }
                showArrow={false}
                showErrorCircle={showHeadingError}
            />
            <div className={styles.list}>{list}</div>
        </div>
    );
};

export default memo(LifeStage);
