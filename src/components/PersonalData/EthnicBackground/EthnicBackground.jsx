import { memo, useRef, useEffect, useState, useCallback } from "react";

import InfoTooltip from "../../InfoTooltip/InfoTooltip";
import styles from "./EthnicBackground.module.css";

export const ETHNIC_OTHER_OPTION = "+ Other";

export const ETHNIC_OPTIONS = [
  "African / Black",
  "North African",
  "Arab",
  "Middle Eastern",
  "East Asian",
  "South Asian",
  "Southeast Asian",
  "Central Asian / Caucasus",
  "Latin American / Latina / Latinx / Hispanic",
  "Sinti / Roma",
  "White / Caucasian / European",
  "Mixed / Multiple ancestrie",
  ETHNIC_OTHER_OPTION,
];

const options = ETHNIC_OPTIONS;

/** Matches CSS hide animation duration + small buffer before unmount. */
const OTHER_PANEL_ANIM_MS = 430;

const EthnicBackground = ({
  ethnicBackground,
  onChange,
  otherText = "",
  onOtherTextChange,
  otherInputMode = "always",
  showHeadingError = false,
}) => {
  const [otherPanelClosing, setOtherPanelClosing] = useState(false);
  const closeTimerRef = useRef(null);
  const otherPanelClosingRef = useRef(false);
  otherPanelClosingRef.current = otherPanelClosing;

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current != null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  const showOtherInput =
    otherInputMode === "always" ||
    ethnicBackground.includes(ETHNIC_OTHER_OPTION);

  const list = options.map((item) => {
    const isActive = ethnicBackground.includes(item);

    return (
      <div
        key={item}
        className={isActive ? styles.isemSelected : styles.item}
        onClick={() => {
          const wasSelected = ethnicBackground.includes(item);
          if (
            item === ETHNIC_OTHER_OPTION &&
            otherInputMode === "when_other"
          ) {
            if (otherPanelClosing) {
              clearCloseTimer();
              setOtherPanelClosing(false);
              return;
            }
            if (wasSelected) {
              setOtherPanelClosing(true);
              clearCloseTimer();
              closeTimerRef.current = window.setTimeout(() => {
                onChange(item);
                onOtherTextChange?.("");
                setOtherPanelClosing(false);
                closeTimerRef.current = null;
              }, OTHER_PANEL_ANIM_MS);
              return;
            }
          }
          onChange(item);
        }}
      >
        {item}
      </div>
    );
  });

  const handleOtherInputChange = (e) => {
    const next = e.target.value.slice(0, 50);
    onOtherTextChange?.(next);
  };

  const inputBlockRef = useRef(null);
  const hintRef = useRef(null);

  useEffect(() => {
    if (!showOtherInput || otherInputMode !== "when_other") return;
    const el = inputBlockRef.current;
    if (!el) return;

    const scrollHintIntoView = () => {
      requestAnimationFrame(() => {
        hintRef.current?.scrollIntoView({
          block: "end",
          behavior: "smooth",
          inline: "nearest",
        });
      });
    };

    const onAnimationEnd = (e) => {
      if (e.target !== el) return;
      if (otherPanelClosingRef.current) return;
      scrollHintIntoView();
    };

    el.addEventListener("animationend", onAnimationEnd);
    return () => el.removeEventListener("animationend", onAnimationEnd);
  }, [showOtherInput, otherInputMode]);

  return (
    <>
      <div className={styles.wrap}>
        <InfoTooltip
          title="Ethnic background(s)"
          showArrow={false}
          showErrorCircle={showHeadingError}
        >
          Racial and ethnic backgrounds are linked to natural differences in genetics, immune responses, and care habits. This can shape vaginal flora and therefore its acidity, moisture, and scent. Knowing this helps pHera understand what is normal for your body.
        </InfoTooltip>

        <div className={styles.list}>{list}</div>
      </div>
      {showOtherInput && (
        <div
          ref={inputBlockRef}
          className={`${styles.inputBlock} ${
            otherInputMode === "when_other"
              ? otherPanelClosing
                ? styles.inputBlockHide
                : styles.inputBlockReveal
              : ""
          }`.trim()}
        >
          <input
            type="text"
            className={styles.input}
            placeholder="e.g. Afro-Caribbean"
            maxLength={50}
            {...(otherInputMode === "when_other"
              ? { value: otherText, onChange: handleOtherInputChange }
              : { onChange: handleOtherInputChange })}
          />
          <p ref={hintRef} className={styles.inputHint}>
            Please specify your background
          </p>
        </div>
      )}
    </>
  );
};

export default memo(EthnicBackground);
