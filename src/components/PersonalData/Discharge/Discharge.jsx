import { memo } from "react";

import InfoTooltip from "../../InfoTooltip/InfoTooltip";
import GroupIcon from "../../../assets/AddDetailsIcons/GroupIcon";
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

const Discharge = ({ discharge, onChange, showHeadingError = false }) => {
    const list = options.map((item) => {
        const isActive = discharge.includes(item);

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
                        <GroupIcon aria-hidden />
                        <span>Discharge</span>
                    </span>
                }
                showArrow={false}
                showErrorCircle={showHeadingError}
            >
                Discharge varies from person to person. It is influenced by your cycle, hygiene products, medications, stress, and a lot of other factors. Look out for discharge of unusual colour and texture.
            </InfoTooltip>
            <div className={styles.list}>{list}</div>
        </div>
    );
};

export default memo(Discharge);
