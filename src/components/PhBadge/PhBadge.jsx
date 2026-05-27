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

const resultThemeByLevel = {
    "Normal": {
        backgroundColor: "rgba(198, 201, 85, 0.12)",
        borderColor: "#C6C955",
        color: "#263E3A",
    },
    "Slightly Elevated": {
        backgroundColor: "rgba(82, 99, 56, 0.12)",
        borderColor: "#526338",
        color: "#414651",
    },
    Elevated: {
        backgroundColor: "rgba(12, 20, 70, 0.12)",
        borderColor: "#0C1446",
        color: "#263E3A",
    },
};

const PhBadge = ({ level, variant }) => {
    const Icon = iconByPhLevel[level] || CheckIcon;
    const isResult = variant === "result";
    const resultTheme = isResult ? resultThemeByLevel[level] : null;
    const backgroundColor = resultTheme?.backgroundColor ?? bgByPhLevel[level] ?? "#F1F6F4";

    return (
        <div
            className={`${styles.levelPh} ${isResult ? styles.levelPhResult : ""}`}
            style={{
                backgroundColor,
                borderColor: resultTheme?.borderColor,
                color: resultTheme?.color,
            }}
        >
            <Icon />
            <p className={styles.levelPhText}>{level}</p>
        </div>
    );
};

export default PhBadge;