import {
    useState,
    useRef,
    useEffect,
    useLayoutEffect,
    useCallback,
} from "react";
import { createPortal } from "react-dom";
import InfoCircle from "../../assets/icons/InfoCircle";
import ArrowDown from "../../assets/icons/ArrowDown";
import { findScrollableAncestor } from "../../shared/utils/scrollAncestor";
import styles from "./InfoTooltip.module.css";

const VIEWPORT_PADDING_PX = 16;

const useAnchoredPopoverStyle = (open, anchorRef, popoverRef) => {
    const [style, setStyle] = useState(null);

    const update = useCallback(() => {
        const root = anchorRef.current;
        if (!root) return;

        const button = root.querySelector("button");
        const anchor = button instanceof HTMLElement ? button : root;
        const rect = anchor.getBoundingClientRect();
        const popoverEl = popoverRef.current;

        const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
        const popoverWidth =
            popoverEl?.offsetWidth ??
            Math.min(215, Math.max(180, viewportWidth * 0.8), viewportWidth - VIEWPORT_PADDING_PX * 2);

        const anchorCenterX = rect.left + rect.width / 2;
        const halfWidth = popoverWidth / 2;
        const minLeft = VIEWPORT_PADDING_PX + halfWidth;
        const maxLeft = viewportWidth - VIEWPORT_PADDING_PX - halfWidth;
        const left = Math.max(minLeft, Math.min(maxLeft, anchorCenterX));
        const arrowOffset = anchorCenterX - left;
        const maxArrowOffset = Math.max(0, halfWidth - 14);

        setStyle({
            top: rect.top,
            left,
            arrowOffset: Math.max(
                -maxArrowOffset,
                Math.min(maxArrowOffset, arrowOffset)
            ),
        });
    }, [anchorRef, popoverRef]);

    useLayoutEffect(() => {
        if (!open) {
            setStyle(null);
            return undefined;
        }

        update();
        const rafId = window.requestAnimationFrame(update);

        const scroller = findScrollableAncestor(anchorRef.current);
        window.addEventListener("resize", update);
        window.addEventListener("scroll", update, true);
        scroller?.addEventListener?.("scroll", update, { passive: true });
        window.visualViewport?.addEventListener("resize", update);
        window.visualViewport?.addEventListener("scroll", update);

        return () => {
            window.cancelAnimationFrame(rafId);
            window.removeEventListener("resize", update);
            window.removeEventListener("scroll", update, true);
            scroller?.removeEventListener?.("scroll", update);
            window.visualViewport?.removeEventListener("resize", update);
            window.visualViewport?.removeEventListener("scroll", update);
        };
    }, [open, update, anchorRef]);

    return style;
};

const InfoTooltip = ({
    title,
    children = false,
    onToggle,
    onToggleArrow,
    showArrow = true,
    iconOnly = false,
    popoverClassName = "",
    showErrorCircle = false,
}) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const popoverRef = useRef(null);
    const popoverStyle = useAnchoredPopoverStyle(open, ref, popoverRef);
    const titleInteractive = typeof onToggle === "function";

    useEffect(() => {
        const close = (e) => {
            if (ref.current?.contains(e.target)) return;
            if (popoverRef.current?.contains(e.target)) return;
            setOpen(false);
        };
        document.addEventListener("mousedown", close);
        document.addEventListener("touchstart", close);
        return () => {
            document.removeEventListener("mousedown", close);
            document.removeEventListener("touchstart", close);
        };
    }, []);

    const popover =
        open &&
        createPortal(
            <div
                ref={popoverRef}
                className={`${styles.popover} ${styles.popoverPortaled} ${popoverClassName}`.trim()}
                style={{
                    top: popoverStyle?.top ?? 0,
                    left: popoverStyle?.left ?? 0,
                    visibility: popoverStyle ? "visible" : "hidden",
                    pointerEvents: popoverStyle ? undefined : "none",
                    ["--popover-arrow-offset"]: popoverStyle
                        ? `${popoverStyle.arrowOffset}px`
                        : "0px",
                }}
                role="tooltip"
            >
                <div className={styles.content}>{children}</div>
                <span className={styles.popoverArrow} />
            </div>,
            document.body
        );

    if (iconOnly) {
        return (
            <div className={styles.wrap} ref={ref}>
                <button
                    type="button"
                    className={styles.infoCircle}
                    onClick={() => setOpen((v) => !v)}
                    aria-expanded={open}
                    aria-label="Toggle info"
                >
                    <InfoCircle />
                </button>
                {popover}
            </div>
        );
    }

    return (
        <div className={styles.wrap} ref={ref}>
            <div
                className={`${styles.wrapTitle} ${titleInteractive ? styles.wrapTitleInteractive : ""}`}
                {...(titleInteractive
                    ? {
                          role: "button",
                          tabIndex: 0,
                          onClick: onToggle,
                          onKeyDown: (e) => {
                              if (e.key === "Enter" || e.key === " ") onToggle?.(e);
                          },
                      }
                    : {})}
            >
                <h4 className={styles.title}>{title}</h4>

                {children && (
                    <button
                        type="button"
                        className={styles.infoCircle}
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpen((v) => !v);
                        }}
                        aria-expanded={open}
                        aria-label="Toggle info"
                    >
                        <InfoCircle />
                    </button>
                )}

                {(showErrorCircle || showArrow) && (
                    <div className={styles.wrapTitleTrailing}>
                        {showErrorCircle && (
                            <span className={styles.errorCircle} aria-hidden />
                        )}
                        {showArrow && (
                            <div
                                className={`${styles.arrow} ${
                                    onToggleArrow ? styles.arrowOpen : ""
                                }`}
                            >
                                <ArrowDown />
                            </div>
                        )}
                    </div>
                )}
            </div>
            {popover}
        </div>
    );
};

export default InfoTooltip;
