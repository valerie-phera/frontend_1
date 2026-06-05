import { memo } from "react";

import InfoTooltip from "../../InfoTooltip/InfoTooltip";
import FlowerIcom from "../../../assets/AddDetailsIcons/FlowerIcom";
import skippedStyles from "../../../shared/styles/skippedChipSection.module.css";
import SymptomsChipSection from "../SymptomsChipSection/SymptomsChipSection";
import { buildSelectionChipClassName, buildSkippedChipClassName } from "../../../shared/utils/selectionChipClassName";
import styles from "./VulvaCondition.module.css";
import titleStyles from "../../../shared/styles/titleWithIcon.module.css";

const options = ["Dry", "Itchy"];

const VulvaCondition = ({
    vulvaCondition,
    onChange,
    showHeadingError = false,
    skipped = false,
    embedded = false,
    infoSlot = null,
}) => {
    const selected = Array.isArray(vulvaCondition) ? vulvaCondition : [];

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
                        <FlowerIcom aria-hidden />
                        <span>Vulva &amp; Vagina</span>
                    </span>
                }
                showArrow={false}
                showErrorCircle={showHeadingError && !skipped}
            >
                It is normal to experience occasional dryness or itchiness - after shaving, using a new hygiene product, or wearing tight clothes. If such sensations become uncomfortable and appear along with other symptoms, they may signal an infection.
            </InfoTooltip>
            <div className={styles.list}>{list}</div>
        </div>
    );
};

export default memo(VulvaCondition);
