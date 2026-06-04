import {
    useState,
    useRef,
    useEffect,
    useCallback,
} from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import InfoCircle from "../../assets/icons/InfoCircle";
import ArrowDown from "../../assets/icons/ArrowDown";
import { findScrollableAncestor } from "../../shared/utils/scrollAncestor";
import { useAnchoredPopoverStyle } from "../../shared/hooks/useAnchoredPopoverStyle";
import styles from "./InfoTooltip.module.css";

const ADD_DETAILS_HEADER_ICON_ALIGN_PATHS = new Set([
    "/add-details/basic",
    "/add-details/hormonal-health",
]);

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
    const getAnchorEl = useCallback(() => {
        const root = ref.current;
        if (!root) return null;
        const button = root.querySelector("button");
        return button instanceof HTMLElement ? button : root;
    }, []);
    const getBoundsEl = useCallback(() => ref.current, []);
    const popoverStyle = useAnchoredPopoverStyle(open, getAnchorEl, getBoundsEl, popoverRef);
    const { pathname } = useLocation();
    const alignInfoIconEnd =
        !iconOnly && ADD_DETAILS_HEADER_ICON_ALIGN_PATHS.has(pathname);
    const wrapClassName = [
        styles.wrap,
        alignInfoIconEnd ? styles.wrapHeaderFullWidth : "",
    ]
        .filter(Boolean)
        .join(" ");
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

    useEffect(() => {
        if (!open) return undefined;

        const dismiss = () => setOpen(false);
        const scroller = findScrollableAncestor(ref.current);

        window.addEventListener("scroll", dismiss, true);
        scroller?.addEventListener("scroll", dismiss, { passive: true });
        window.visualViewport?.addEventListener("scroll", dismiss, { passive: true });

        return () => {
            window.removeEventListener("scroll", dismiss, true);
            scroller?.removeEventListener("scroll", dismiss);
            window.visualViewport?.removeEventListener("scroll", dismiss);
        };
    }, [open]);

    useEffect(() => {
        if (open && popoverStyle?.visible === false) {
            setOpen(false);
        }
    }, [open, popoverStyle?.visible]);

    const popover =
        open &&
        createPortal(
            <div
                ref={popoverRef}
                className={`${styles.popover} ${styles.popoverPortaled} ${popoverClassName}`.trim()}
                style={{
                    top: popoverStyle?.top ?? 0,
                    left: popoverStyle?.left ?? 0,
                    maxWidth: popoverStyle?.maxWidth,
                    visibility:
                        popoverStyle?.visible === false
                            ? "hidden"
                            : popoverStyle
                              ? "visible"
                              : "hidden",
                    pointerEvents:
                        popoverStyle?.visible === false
                            ? "none"
                            : popoverStyle
                              ? undefined
                              : "none",
                    ["--popover-arrow-offset"]: popoverStyle
                        ? `${popoverStyle.arrowOffset}px`
                        : "0px",
                    ["--frame-scale"]: popoverStyle?.frameScale ?? 1,
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
            <div className={wrapClassName} ref={ref}>
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
        <div className={wrapClassName} ref={ref}>
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
