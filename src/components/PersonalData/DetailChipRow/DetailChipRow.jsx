import { memo } from "react";

import {
    FORM_DETAIL_OPTIONS,
    FORM_PREFER_NOT_TO_SAY,
} from "../../../shared/constants/formDetailOptions";
import detailStyles from "../../../shared/styles/detailChipRow.module.css";
import { buildSelectionChipClassName } from "../../../shared/utils/selectionChipClassName";

const DetailChipRow = ({
    selected,
    onChange,
    options = FORM_DETAIL_OPTIONS,
    showDivider = true,
    dividerFlushTop = false,
    skipped = false,
}) => {
    const selectedArr = Array.isArray(selected) ? selected : [];
    const dividerClassName = [
        detailStyles.divider,
        dividerFlushTop ? detailStyles.dividerFlushTop : "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <>
            {showDivider && <div className={dividerClassName} aria-hidden />}
            <div className={detailStyles.detailRow}>
                {options.map((item) => {
                    const isSelected = selectedArr.includes(item);
                    const isActive = !skipped && isSelected;
                    const className = skipped
                        ? isSelected
                            ? detailStyles.itemDetailSkippedSelected
                            : detailStyles.itemDetailSkipped
                        : buildSelectionChipClassName(isActive, {
                              variant: "detail",
                          });

                    return (
                        <div
                            key={item}
                            className={className}
                            onClick={skipped ? undefined : () => onChange(item)}
                            role={skipped ? "presentation" : "button"}
                            tabIndex={skipped ? undefined : 0}
                            onKeyDown={
                                skipped
                                    ? undefined
                                    : (e) => {
                                          if (e.key === "Enter" || e.key === " ") {
                                              e.preventDefault();
                                              onChange(item);
                                          }
                                      }
                            }
                        >
                            <span>{item}</span>
                        </div>
                    );
                })}
            </div>
        </>
    );
};

export { FORM_PREFER_NOT_TO_SAY };

export default memo(DetailChipRow);
