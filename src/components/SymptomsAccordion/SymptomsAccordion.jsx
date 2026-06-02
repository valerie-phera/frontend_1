import { cloneElement, isValidElement, useEffect, useRef } from "react";
import ArrowDown from "../../assets/icons/ArrowDown";
import InfoTooltip from "../InfoTooltip/InfoTooltip";
import { scrollOpenedSectionIntoView } from "../../shared/utils/scrollAncestor";
import styles from "./SymptomsAccordion.module.css";

const OPEN_ANIMATION_MS = 440;

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
    const rootRef = useRef(null);
    const bodyWrapperRef = useRef(null);
    const prevOpenRef = useRef(isOpen);

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

    useEffect(() => {
        const wasOpen = prevOpenRef.current;
        prevOpenRef.current = isOpen;

        if (!isOpen || wasOpen || !hasBody) return undefined;

        const rootEl = rootRef.current;
        if (!rootEl) return undefined;

        let cancelled = false;
        let didScroll = false;
        let cancelScroll = null;

        const revealSection = () => {
            if (cancelled || didScroll) return;
            didScroll = true;
            cancelScroll = scrollOpenedSectionIntoView(rootEl);
        };

        const wrapperEl = bodyWrapperRef.current;
        const onTransitionEnd = (event) => {
            if (event.target !== wrapperEl) return;
            if (event.propertyName !== "grid-template-rows") return;
            revealSection();
        };

        wrapperEl?.addEventListener("transitionend", onTransitionEnd);
        const fallbackTimer = window.setTimeout(revealSection, OPEN_ANIMATION_MS);

        return () => {
            cancelled = true;
            window.clearTimeout(fallbackTimer);
            wrapperEl?.removeEventListener("transitionend", onTransitionEnd);
            cancelScroll?.();
        };
    }, [isOpen, hasBody]);

    return (
        <div
            ref={rootRef}
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
                    ref={bodyWrapperRef}
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
