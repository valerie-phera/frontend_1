import { memo } from "react";

import InfoTooltip from "../../InfoTooltip/InfoTooltip";
import WavesIcon from "../../../assets/AddDetailsIcons/WavesIcon";
import skippedStyles from "../../../shared/styles/skippedChipSection.module.css";
import SymptomsChipSection from "../SymptomsChipSection/SymptomsChipSection";
import { buildSelectionChipClassName } from "../../../shared/utils/selectionChipClassName";
import styles from "./Smell.module.css";
import titleStyles from "../../../shared/styles/titleWithIcon.module.css";

const options = [
    "Strong and unpleasant (“fishy”)",
    "Sour",
    "Chemical-like",
    "Very strong or rotten",
];

const Smell = ({ smell, onChange, showHeadingError = false, skipped = false, embedded = false, infoSlot = null }) => {
    const selected = Array.isArray(smell) ? smell : [];

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
                        <WavesIcon aria-hidden />
                        <span>Smell</span>
                    </span>
                }
                showArrow={false}
                showErrorCircle={showHeadingError && !skipped}
            >
                A healthy vagina can have a natural scent that is metallic, musky, earthy, or tangy - all of these are normal! If you notice any of the unusual odors, such as those listed below, it might be helpful to mention them to your clinician.
            </InfoTooltip>
            <div className={styles.list}>{list}</div>
        </div>
    );
};

export default memo(Smell);
