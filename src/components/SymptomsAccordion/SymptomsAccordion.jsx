import { cloneElement, isValidElement } from "react";
import ArrowDown from "../../assets/icons/ArrowDown";
import InfoTooltip from "../InfoTooltip/InfoTooltip";
import styles from "./SymptomsAccordion.module.css";

const SymptomsAccordion = ({
    title,
    icon,
    isOpen,
    onToggle,
    selectionLabel = null,
    infoText,
    children,
    hasBody = true,
    skipped = false,
}) => {
    const showSelectionLabel = Boolean(selectionLabel);

    const infoSlot = infoText ? (
        <div className={styles.infoWrap}>
            <InfoTooltip iconOnly>{infoText}</InfoTooltip>
        </div>
    ) : null;

    const bodyContent =
        infoSlot && isValidElement(children)
            ? cloneElement(children, { infoSlot })
            : children;

    return (
        <div
            className={`${styles.accordion} ${
                skipped ? styles.accordionSkipped : ""
            } ${isOpen && hasBody ? styles.accordionExpanded : ""}`.trim()}
        >
            <button
                type="button"
                className={styles.header}
                onClick={onToggle}
                aria-expanded={isOpen}
            >
                <span className={styles.headerLeft}>
                    {icon ? <span className={styles.icon}>{icon}</span> : null}
                    <span className={styles.title}>{title}</span>
                </span>
                <span className={styles.headerTrailing}>
                    {showSelectionLabel ? (
                        <span
                            className={`${styles.selectionCount} ${
                                selectionLabel === "—"
                                    ? styles.selectionCountDash
                                    : styles.selectionCountMulti
                            }`.trim()}
                        >
                            {selectionLabel}
                        </span>
                    ) : null}
                    <span
                        className={`${styles.caret} ${
                            isOpen ? styles.caretOpen : ""
                        }`.trim()}
                        aria-hidden
                    >
                        <ArrowDown />
                    </span>
                </span>
            </button>

            {hasBody ? (
                <div
                    className={`${styles.bodyWrapper} ${
                        isOpen ? styles.bodyWrapperOpen : ""
                    }`.trim()}
                    aria-hidden={!isOpen}
                    inert={!isOpen}
                >
                    <div className={styles.bodyInner}>
                        <div className={styles.body}>
                            <hr className={styles.divider} />
                            {bodyContent}
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default SymptomsAccordion;
