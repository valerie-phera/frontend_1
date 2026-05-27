import { memo, useRef, useEffect, useState, useCallback, useMemo } from "react";

import InfoTooltip from "../../InfoTooltip/InfoTooltip";
import EthnicIcon from "../../../assets/AddDetailsIcons/EthnicIcon";
import {
  ETHNIC_OTHER_OPTION,
  ETHNIC_OPTIONS,
} from "./ethnicOptions";
import styles from "./EthnicBackground.module.css";
import titleStyles from "../../../shared/styles/titleWithIcon.module.css";

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
  const isModalMode = otherInputMode === "when_other";
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const dragRef = useRef({
    active: false,
    startY: 0,
    lastY: 0,
    moved: false,
  });

  const closeSheet = useCallback(() => {
    setIsSheetOpen(false);
    setDragOffset(0);
    dragRef.current.active = false;
    dragRef.current.moved = false;
  }, []);

  const openSheet = useCallback(() => {
    setIsSheetOpen(true);
    setDragOffset(0);
    dragRef.current.active = false;
    dragRef.current.moved = false;
  }, []);

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

  const handleOptionToggle = useCallback(
    (item) => {
      const wasSelected = ethnicBackground.includes(item);
      if (item === ETHNIC_OTHER_OPTION && otherInputMode === "when_other") {
        if (wasSelected) {
          // In modal mode, hide other input immediately when deselecting.
          onOtherTextChange?.("");
        }
      }
      onChange(item);
    },
    [ethnicBackground, onChange, onOtherTextChange, otherInputMode]
  );

  const list = useMemo(
    () =>
      options.map((item) => {
        const isActive = ethnicBackground.includes(item);
        return (
          <div
            key={item}
            className={isActive ? styles.isemSelected : styles.item}
            onClick={() => {
              if (
                item === ETHNIC_OTHER_OPTION &&
                otherInputMode === "when_other"
              ) {
                if (otherPanelClosing) {
                  clearCloseTimer();
                  setOtherPanelClosing(false);
                  return;
                }
                if (isActive) {
                  setOtherPanelClosing(true);
                  clearCloseTimer();
                  // Unselect immediately for snappier UX, but keep the panel mounted
                  // via `otherPanelClosing` so the hide animation can run.
                  onChange(item);
                  closeSheet();
                  closeTimerRef.current = window.setTimeout(() => {
                    onOtherTextChange?.("");
                    setOtherPanelClosing(false);
                    closeTimerRef.current = null;
                  }, OTHER_PANEL_ANIM_MS);
                  return;
                }
                // Selecting "+ Other" in modal mode: open sheet and keep it selected.
                openSheet();
                onChange(item);
                return;
              }
              handleOptionToggle(item);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleOptionToggle(item);
              }
            }}
          >
            {item}
          </div>
        );
      }),
    [
      clearCloseTimer,
      closeSheet,
      ethnicBackground,
      handleOptionToggle,
      onChange,
      onOtherTextChange,
      openSheet,
      otherInputMode,
      otherPanelClosing,
    ]
  );

  const handleOtherInputChange = (e) => {
    const raw = String(e.target.value ?? "");
    const normalized = raw.normalize("NFKC");
    // Keep it short, readable, and safe:
    // - remove ASCII control chars (no regex to avoid `no-control-regex`)
    // - strip digits and punctuation we do not need
    // - collapse whitespace
    // - cap length
    const noControl = Array.from(normalized)
      .filter((ch) => {
        const code = ch.charCodeAt(0);
        return code >= 32 && code !== 127;
      })
      .join("");

    const next = noControl
      .replace(/[!?@#*()_+=\d"<>[\]{}|`~^$%\\]/g, "")
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

  useEffect(() => {
    if (!isSheetOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeSheet();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isSheetOpen, closeSheet]);

  useEffect(() => {
    if (!isSheetOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isSheetOpen]);

  const selectedChips = useMemo(() => {
    const arr = Array.isArray(ethnicBackground) ? ethnicBackground : [];
    const chips = [];
    for (const item of arr) {
      if (item === ETHNIC_OTHER_OPTION) {
        const trimmed = String(otherText ?? "").trim();
        chips.push({
          key: item,
          label: trimmed ? trimmed : ETHNIC_OTHER_OPTION,
          value: item,
          isOther: true,
        });
      } else {
        chips.push({ key: item, label: item, value: item, isOther: false });
      }
    }
    return chips;
  }, [ethnicBackground, otherText]);

  const handleChipRemove = useCallback(
    (value) => {
      if (value === ETHNIC_OTHER_OPTION) {
        onOtherTextChange?.("");
      }
      onChange(value);
    },
    [onChange, onOtherTextChange]
  );

  const sheetTranslate = Math.max(0, dragOffset);
  const sheetStyle = isSheetOpen
    ? { transform: `translateY(${sheetTranslate}px)` }
    : undefined;

  const onSheetTouchStart = (e) => {
    const t = e.touches?.[0];
    if (!t) return;
    dragRef.current.active = true;
    dragRef.current.startY = t.clientY;
    dragRef.current.lastY = t.clientY;
    dragRef.current.moved = false;
  };

  const onSheetTouchMove = (e) => {
    if (!dragRef.current.active) return;
    const t = e.touches?.[0];
    if (!t) return;
    const dy = t.clientY - dragRef.current.startY;
    dragRef.current.lastY = t.clientY;
    if (dy > 2) dragRef.current.moved = true;
    if (dy > 0) {
      setDragOffset(dy);
    } else {
      setDragOffset(0);
    }
  };

  const onSheetTouchEnd = () => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    const dy = dragOffset;
    const CLOSE_THRESHOLD = 120;
    if (dy > CLOSE_THRESHOLD) {
      closeSheet();
      return;
    }
    setDragOffset(0);
  };

  return (
    <>
      <div className={styles.wrap}>
        <InfoTooltip
          title={
            <span className={titleStyles.titleWithIcon}>
              <EthnicIcon aria-hidden />
              <span>Ethnic background(s)</span>
            </span>
          }
          showArrow={false}
          showErrorCircle={showHeadingError}
        >
          Racial and ethnic backgrounds are linked to natural differences in genetics, immune responses, and care habits. This can shape vaginal flora and therefore its acidity, moisture, and scent. Knowing this helps pHera understand what is normal for your body.
        </InfoTooltip>

        {isModalMode ? (
          <div className={styles.modalField}>
            <button
              type="button"
              className={styles.selectChip}
              onClick={openSheet}
            >
              Select your background(s)
            </button>

            {selectedChips.length > 0 && (
              <div className={styles.selectedList}>
                {selectedChips.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    className={styles.selectedChip}
                    onClick={() => handleChipRemove(c.value)}
                    aria-label={`Remove ${c.label}`}
                  >
                    <span className={styles.selectedChipText}>{c.label}</span>
                    <span className={styles.selectedChipX} aria-hidden>
                      ×
                    </span>
                  </button>
                ))}
              </div>
            )}

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
                  value={otherText}
                  onChange={handleOtherInputChange}
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
          </div>
        ) : (
          <div className={styles.list}>{list}</div>
        )}
      </div>

      {isModalMode && isSheetOpen && (
        <div className={styles.sheetOverlay} role="presentation">
          <button
            type="button"
            className={styles.sheetBackdrop}
            onClick={closeSheet}
            aria-label="Close"
          />

          <div
            className={styles.sheet}
            role="dialog"
            aria-modal="true"
            aria-label="Ethnic background(s)"
            style={sheetStyle}
            onTouchStart={onSheetTouchStart}
            onTouchMove={onSheetTouchMove}
            onTouchEnd={onSheetTouchEnd}
            onTouchCancel={onSheetTouchEnd}
          >
            <div className={styles.sheetHandleWrap} aria-hidden>
              <div className={styles.sheetHandle} />
            </div>

            <button
              type="button"
              className={styles.sheetClose}
              onClick={closeSheet}
              aria-label="Close"
            >
              <span aria-hidden>×</span>
            </button>

            <div className={styles.sheetHeader}>
              <div className={styles.sheetTitle}>
                <EthnicIcon aria-hidden />
                <span>Ethnic background(s)</span>
              </div>
              <p className={styles.sheetSubtitle}>
                Ethnic backgrounds shape vaginal flora and pH norms. Select all that apply - this helps personalize your result.
              </p>
            </div>

            <div className={styles.sheetList}>{list}</div>
          </div>
        </div>
      )}

      {showOtherInput && (
        !isModalMode && (
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
        )
      )}
    </>
  );
};

export default memo(EthnicBackground);
