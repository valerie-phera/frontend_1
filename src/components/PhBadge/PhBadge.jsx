import CheckIcon from "../../assets/icons/CheckIcon";
import TrendUp from "../../assets/icons/TrendUp";
import ArrowUp from "../../assets/icons/ArrowUp";
import TrendDown from "../../assets/icons/TrendDown";

import styles from "./PhBadge.module.css";

const iconByPhLevel = {
    "Normal": CheckIcon,
    "Slightly Elevated": TrendUp,
    "Elevated": ArrowUp,
    "Slightly Low": TrendDown
};

const bgByPhLevel = {
    "Normal": "#F1F6F4",
    "Slightly Elevated": "#E6F2F4",
    "Elevated": "#EFF1FA",
    "Slightly Low": "#E9EAEB"
};

const PhBadge = ({ level }) => {
    const Icon = iconByPhLevel[level] || CheckIcon;
    const backgroundColor = bgByPhLevel[level] || "#F1F6F4";

    return (
        <div
            className={styles.levelPh}
            style={{ backgroundColor }}
        >
            <Icon />
            <p className={styles.levelPhText}>{level}</p>
        </div>
    );
};

export default PhBadge;