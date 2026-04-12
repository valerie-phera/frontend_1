import { useState, useRef, useEffect } from "react";
import InfoCircle from "../../assets/icons/InfoCircle";
import ArrowDown from "../../assets/icons/ArrowDown";
import styles from "./InfoTooltip.module.css";

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

    // Close tooltip when clicking outside the component
    useEffect(() => {
        const close = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", close);
        document.addEventListener("touchstart", close);
        return () => {
            document.removeEventListener("mousedown", close);
            document.removeEventListener("touchstart", close);
        };
    }, []);


    // Render minimal tooltip version: only icon that opens a popover 
    if (iconOnly) {
        return (
            <div className={styles.wrap} ref={ref}>
                <div
                    className={styles.infoCircle}
                    onClick={() => setOpen((v) => !v)}
                >
                    <InfoCircle />
                </div>

                {open && (
                    <div
                        className={`${styles.popover} ${popoverClassName}`.trim()}
                        role="tooltip"
                    >
                        <div className={styles.content}>{children}</div>
                        <span className={styles.popoverArrow} />
                    </div>
                )}
            </div>
        );
    }

    // Default tooltip mode: title + optional info icon + arrow indicator
    return (
        <div className={styles.wrap} ref={ref}>
            <div className={styles.wrapTitle} onClick={onToggle}>
                <h4 className={styles.title}>{title}</h4>

                {children && (
                    <div
                        className={styles.infoCircle}
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpen((v) => !v);
                        }}
                    >
                        <InfoCircle />
                    </div>
                )}

                {(showErrorCircle || showArrow) && (
                    <div className={styles.wrapTitleTrailing}>
                        {showErrorCircle && (
                            <span
                                className={styles.errorCircle}
                                aria-hidden
                            />
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

            {open && (
                <div
                    className={`${styles.popover} ${popoverClassName}`.trim()}
                    role="tooltip"
                >
                    <div className={styles.content}>{children}</div>
                    <span className={styles.popoverArrow} />
                </div>
            )}
        </div>
    );
};

export default InfoTooltip;