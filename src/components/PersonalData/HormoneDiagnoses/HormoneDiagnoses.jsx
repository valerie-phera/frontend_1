import { memo } from "react";
import InfoTooltip from "../../InfoTooltip/InfoTooltip";
import styles from "./HormoneDiagnoses.module.css";

const options = [
    "None",
    "Adenomyosis",
    "Amenorhea",
    "Cushing’s syndrome",
    "Diabetes",
    "Endometriosis",
    "Intersex",
    "Thyroid disorder",
    "Uterine fibroids",
    "Premature ovarian insufficiency (POI)",
];

const HormoneDiagnoses = ({
    hormoneDiagnoses,
    onChange,
    showHeadingError = false,
}) => {
    const list = options.map((item) => {
        const isActive = hormoneDiagnoses.includes(item);

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
                title="Diagnoses related to hormones"
                showArrow={false}
                showErrorCircle={showHeadingError}
            />
            <div className={styles.list}>{list}</div>
        </div>
    );
};

export default memo(HormoneDiagnoses);
