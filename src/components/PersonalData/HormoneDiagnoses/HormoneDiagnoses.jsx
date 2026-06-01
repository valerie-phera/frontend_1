import { memo } from "react";
import InfoTooltip from "../../InfoTooltip/InfoTooltip";
import StethoscopeIcon from "../../../assets/AddDetailsIcons/StethoscopeIcon";
import DetailChipRow from "../DetailChipRow/DetailChipRow";
import skippedStyles from "../../../shared/styles/skippedChipSection.module.css";
import styles from "./HormoneDiagnoses.module.css";
import titleStyles from "../../../shared/styles/titleWithIcon.module.css";

const options = [
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
    showDetailOptions = false,
    skipped = false,
}) => {
    const selected = Array.isArray(hormoneDiagnoses) ? hormoneDiagnoses : [];

    const list = options.map((item) => {
        if (skipped) {
            const isSelected = selected.includes(item);
            return (
                <div
                    key={item}
                    className={
                        isSelected
                            ? skippedStyles.itemSkippedSelected
                            : skippedStyles.itemSkippedInactive
                    }
                    role="presentation"
                    aria-hidden={!isSelected}
                >
                    <span>{item}</span>
                </div>
            );
        }

        const isActive = selected.includes(item);

        return (
            <div
                key={item}
                className={isActive ? styles.itemSelected : styles.item}
                onClick={() => onChange(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onChange(item);
                    }
                }}
            >
                <span>{item}</span>
            </div>
        );
    });

    return (
        <div
            className={`${styles.wrap} ${
                skipped ? skippedStyles.wrapSkipped : ""
            }`.trim()}
        >
            <InfoTooltip
                title={
                    <span className={titleStyles.titleWithIcon}>
                        <StethoscopeIcon aria-hidden />
                        <span>Diagnoses related to hormones</span>
                    </span>
                }
                showArrow={false}
                showErrorCircle={showHeadingError && !skipped}
            />
            <div className={styles.list}>{list}</div>
            {showDetailOptions && (
                <DetailChipRow
                    selected={hormoneDiagnoses}
                    onChange={onChange}
                    skipped={skipped}
                />
            )}
        </div>
    );
};

export default memo(HormoneDiagnoses);
