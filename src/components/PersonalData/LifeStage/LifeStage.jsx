import { memo } from "react";

import InfoTooltip from "../../InfoTooltip/InfoTooltip";
import LifeStageIcon from "../../../assets/AddDetailsIcons/LifeStageIcon";
import DetailChipRow from "../DetailChipRow/DetailChipRow";
import { LIFE_STAGE_MAIN_OPTIONS } from "./lifeStageOptions";
import { buildSelectionChipClassName, buildSkippedChipClassName } from "../../../shared/utils/selectionChipClassName";
import styles from "./LifeStage.module.css";
import titleStyles from "../../../shared/styles/titleWithIcon.module.css";

const LifeStage = ({
  lifeStage,
  onChange,
  showHeadingError = false,
  disabledItems = [],
  showDetailOptions = false,
  skipped = false,
}) => {
  const selected = Array.isArray(lifeStage) ? lifeStage : [];
  const disabledSet = new Set(Array.isArray(disabledItems) ? disabledItems : []);

  const renderChip = (item) => {
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
    const isDisabled = disabledSet.has(item);

    const className = buildSelectionChipClassName(isActive, {
      disabled: isDisabled,
    });

    return (
      <div
        key={item}
        className={className}
        onClick={() => {
          if (isDisabled) return;
          onChange(item);
        }}
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        aria-disabled={isDisabled}
        onKeyDown={(e) => {
          if (isDisabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onChange(item);
          }
        }}
      >
        <span>{item}</span>
      </div>
    );
  };

  const mainList = LIFE_STAGE_MAIN_OPTIONS.map((item) => renderChip(item));

  return (
    <div className={`${styles.wrap} ${skipped ? styles.wrapSkipped : ""}`.trim()}>
      <InfoTooltip
        title={
          <span className={titleStyles.titleWithIcon}>
            <LifeStageIcon aria-hidden />
            <span>Life stage</span>
          </span>
        }
        showArrow={false}
        showErrorCircle={showHeadingError && !skipped}
      >
        Your hormones shift across life stages - this helps us read your pH in the right context.
      </InfoTooltip>
      <div className={styles.list}>{mainList}</div>
      {showDetailOptions && (
        <DetailChipRow
          selected={lifeStage}
          onChange={onChange}
          skipped={skipped}
        />
      )}
    </div>
  );
};

export default memo(LifeStage);
