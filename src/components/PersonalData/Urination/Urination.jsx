import { memo } from "react";

import InfoTooltip from "../../InfoTooltip/InfoTooltip";
import ToiletIcon from "../../../assets/AddDetailsIcons/ToiletIcon";
import skippedStyles from "../../../shared/styles/skippedChipSection.module.css";
import SymptomsChipSection from "../SymptomsChipSection/SymptomsChipSection";
import { buildSelectionChipClassName, buildSkippedChipClassName } from "../../../shared/utils/selectionChipClassName";
import styles from "./Urination.module.css";
import titleStyles from "../../../shared/styles/titleWithIcon.module.css";

const options = ["More frequent than usual", "Burning sensation"];

const Urination = ({
    urination,
    onChange,
    showHeadingError = false,
    skipped = false,
    embedded = false,
    infoSlot = null,
}) => {
    const selected = Array.isArray(urination) ? urination : [];

    const list = options.map((item) => {
        if (skipped) {
            const isSelected = selected.includes(item);
            return (
                <div
                    key={item}
                    className={buildSkippedChipClassName(isSelected)}
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
                className={buildSelectionChipClassName(isActive)}
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

    if (embedded) {
        return (
            <SymptomsChipSection
                options={options}
                selected={selected}
                onChange={onChange}
                skipped={skipped}
                infoSlot={infoSlot}
            />
        );
    }

    return (
        <div
            className={`${styles.wrap} ${
                skipped ? skippedStyles.wrapSkipped : ""
            }`.trim()}
        >
            <InfoTooltip
                title={
                    <span className={titleStyles.titleWithIcon}>
                        <ToiletIcon aria-hidden />
                        <span>Urine</span>
                    </span>
                }
                showArrow={false}
                showErrorCircle={showHeadingError && !skipped}
            >
                It is normal to urinate more often after drinking more fluids, coffee, or during periods of stress. More trips to the bathroom than is normal for you. A brief burning sensation can happen after using a new product or after sex. If such sensations last a long time or appear with other symptoms, they may signal an infection.
            </InfoTooltip>
            <div className={styles.list}>{list}</div>
        </div>
    );
};

export default memo(Urination);
