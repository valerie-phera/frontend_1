import { memo, useRef, useEffect, useState, useCallback } from "react";

import InfoTooltip from "../../InfoTooltip/InfoTooltip";
import EthnicIcon from "../../../assets/AddDetailsIcons/EthnicIcon";
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
  showOtherError = false,
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

  const isOtherSelected = ethnicBackground.includes(ETHNIC_OTHER_OPTION);
  const showOtherInput = otherInputMode === "always" || isOtherSelected || otherPanelClosing;

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
              // Unselect immediately for snappier UX, but keep the panel mounted
              // via `otherPanelClosing` so the hide animation can run.
              onChange(item);
              closeTimerRef.current = window.setTimeout(() => {
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
    const raw = String(e.target.value ?? "");
    // Keep it short, readable, and safe: normalize, strip control chars and
    // "noisy" symbols, collapse whitespace, and cap length.
    const next = raw
      .normalize("NFKC")
      .replace(/[\u0000-\u001F\u007F]/g, "")
      .replace(/[<>\[\]{}|`~^$%\\]/g, "")
      .replace(/\s+/g, " ")
      .replace(/^\s+/, "")
      .slice(0, 50);

    onOtherTextChange?.(next);
  };

  const inputBlockRef = useRef(null);
  const hintRef = useRef(null);

  useEffect(() => {
    if (otherInputMode !== "when_other") return;
    if (!isOtherSelected || otherPanelClosing) return;
    requestAnimationFrame(() => {
      hintRef.current?.scrollIntoView({
        block: "end",
        behavior: "smooth",
        inline: "nearest",
      });
    });
  }, [isOtherSelected, otherPanelClosing, otherInputMode]);

  return (
    <>
      <div className={styles.wrap}>
        <InfoTooltip
          title={
            <span className={styles.titleWithIcon}>
              <EthnicIcon aria-hidden />
              <span>Ethnic background(s)</span>
            </span>
          }
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
            isOtherSelected && !otherPanelClosing ? styles.inputBlockOpen : ""
          }`.trim()}
          aria-hidden={!(isOtherSelected && !otherPanelClosing)}
        >
          <input
            type="text"
            className={`${styles.input} ${
              showOtherError ? styles.inputError : ""
            }`.trim()}
            placeholder="e.g. Afro-Caribbean"
            maxLength={50}
            aria-invalid={showOtherError}
            {...(otherInputMode === "when_other"
              ? { value: otherText, onChange: handleOtherInputChange }
              : { onChange: handleOtherInputChange })}
          />
          <p
            ref={hintRef}
            className={`${styles.inputHint} ${
              showOtherError ? styles.inputHintError : ""
            }`.trim()}
          >
            Please specify your background
          </p>
        </div>
      )}
    </>
  );
};

export default memo(EthnicBackground);
