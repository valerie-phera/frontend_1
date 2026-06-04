import {
    useState,
    useRef,
    useEffect,
    useCallback,
} from "react";
import { createPortal } from "react-dom";
import { findScrollableAncestor } from "../../shared/utils/scrollAncestor";
import { useAnchoredPopoverStyle } from "../../shared/hooks/useAnchoredPopoverStyle";
import tooltipStyles from "../InfoTooltip/InfoTooltip.module.css";
import styles from "./HoverTooltip.module.css";

const HoverTooltip = ({ content, children, className = "" }) => {
    const [open, setOpen] = useState(false);
    const anchorRef = useRef(null);
    const popoverRef = useRef(null);
    const getAnchorEl = useCallback(() => anchorRef.current, []);
    const getBoundsEl = useCallback(() => anchorRef.current, []);
    const popoverStyle = useAnchoredPopoverStyle(open, getAnchorEl, getBoundsEl, popoverRef);

    useEffect(() => {
        if (!open) return undefined;

        const dismiss = () => setOpen(false);
        const scroller = findScrollableAncestor(anchorRef.current);

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

    const show = () => setOpen(true);
    const hide = () => setOpen(false);

    const popover =
        open &&
        createPortal(
            <div
                ref={popoverRef}
                className={`${tooltipStyles.popover} ${tooltipStyles.popoverPortaled}`}
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
                    pointerEvents: "none",
                    ["--popover-arrow-offset"]: popoverStyle
                        ? `${popoverStyle.arrowOffset}px`
                        : "0px",
                    ["--frame-scale"]: popoverStyle?.frameScale ?? 1,
                }}
                role="tooltip"
            >
                <div className={tooltipStyles.content}>{content}</div>
                <span className={tooltipStyles.popoverArrow} />
            </div>,
            document.body,
        );

    return (
        <span
            ref={anchorRef}
            className={`${styles.wrap} ${className}`.trim()}
            onMouseEnter={show}
            onMouseLeave={hide}
            onFocus={show}
            onBlur={hide}
        >
            {children}
            {popover}
        </span>
    );
};

export default HoverTooltip;
