import { memo, useRef, useEffect, useState, useCallback, useMemo } from "react";

import InfoTooltip from "../../InfoTooltip/InfoTooltip";
import EthnicIcon from "../../../assets/AddDetailsIcons/EthnicIcon";
import {
  ETHNIC_OTHER_OPTION,
  ETHNIC_OPTIONS,
} from "./ethnicOptions";
import Button from "../../Button/Button";
import DetailChipRow, {
  FORM_PREFER_NOT_TO_SAY,
} from "../DetailChipRow/DetailChipRow";
import { FORM_DETAIL_SET } from "../../../shared/constants/formDetailOptions";
import {
  applyDetailChipSelection,
  stripDetailOptions,
} from "../../../shared/utils/detailChipSelection";
import styles from "./EthnicBackground.module.css";
import titleStyles from "../../../shared/styles/titleWithIcon.module.css";

const options = ETHNIC_OPTIONS;

/** Matches CSS hide animation duration + small buffer before unmount. */
const OTHER_PANEL_ANIM_MS = 430;

/** Bottom sheet slide duration; keep in sync with .sheet / .sheetBackdrop transitions. */
const SHEET_ANIM_MS = 480;

/**
 * Duration for sheet “+ Other” expand/collapse — drives CSS via --sheet-other-duration.
 * Change only this value; CSS reads the variable from the element inline style.
 */
const SHEET_OTHER_ANIM_MS = 520;

const OTHER_CHIP_LABEL_MAX = 30;

const truncateChipLabel = (text, maxLen = OTHER_CHIP_LABEL_MAX) => {
  const s = String(text ?? "");
  if (s.length <= maxLen) return s;
  return `${s.slice(0, maxLen)}...`;
};

const sanitizeOtherText = (raw) => {
  const normalized = String(raw ?? "").normalize("NFKC");
  const noControl = Array.from(normalized)
    .filter((ch) => {
      const code = ch.charCodeAt(0);
      return code >= 32 && code !== 127;
    })
    .join("");

  return noControl
    .replace(/[!?@#*()_+=\d"<>[\]{}|`~^$%\\]/g, "")
    .replace(/\s+/g, " ")
    .replace(/^\s+/, "")
    .slice(0, 50);
};

const EthnicBackground = ({
  ethnicBackground,
  onChange,
  setEthnicBackground,
  otherText = "",
  onOtherTextChange,
  otherInputMode = "always",
  showHeadingError = false,
  showOtherError = false,
  showPreferNotToSay = false,
  skipped = false,
}) => {
  const isModalMode = otherInputMode === "when_other";
  const [sheetMounted, setSheetMounted] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const sheetCloseTimerRef = useRef(null);
  const [sheetDraft, setSheetDraft] = useState([]);
  const [sheetOtherDraft, setSheetOtherDraft] = useState("");
  const [sheetOtherError, setSheetOtherError] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const dragRef = useRef({
    active: false,
    startY: 0,
    lastY: 0,
    moved: false,
  });

  const clearSheetCloseTimer = useCallback(() => {
    if (sheetCloseTimerRef.current != null) {
      window.clearTimeout(sheetCloseTimerRef.current);
      sheetCloseTimerRef.current = null;
    }
  }, []);

  const closeSheet = useCallback(() => {
    clearSheetCloseTimer();
    setSheetVisible(false);
    setDragOffset(0);
    dragRef.current.active = false;
    dragRef.current.moved = false;
    sheetCloseTimerRef.current = window.setTimeout(() => {
      setSheetMounted(false);
      sheetCloseTimerRef.current = null;
    }, SHEET_ANIM_MS);
  }, [clearSheetCloseTimer]);

  const openSheet = useCallback(() => {
    clearSheetCloseTimer();
    const committed = stripDetailOptions(
      Array.isArray(ethnicBackground) ? ethnicBackground : []
    );
    setSheetDraft([...committed]);
    setSheetOtherDraft(otherText ?? "");
    setSheetOtherError(false);
    setSheetMounted(true);
    setSheetVisible(false);
    setDragOffset(0);
    dragRef.current.active = false;
    dragRef.current.moved = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setSheetVisible(true));
    });
  }, [clearSheetCloseTimer, ethnicBackground, otherText]);

  const applySheet = useCallback(() => {
    const next = stripDetailOptions(
      Array.isArray(sheetDraft) ? sheetDraft : []
    );
    const otherSelected = next.includes(ETHNIC_OTHER_OPTION);
    const otherTrimmed = String(sheetOtherDraft ?? "").trim();

    if (otherSelected && !otherTrimmed) {
      setSheetOtherError(true);
      requestAnimationFrame(() => {
        sheetOtherInputRef.current?.focus();
      });
      return;
    }

    setSheetOtherError(false);
    if (typeof setEthnicBackground === "function") {
      setEthnicBackground(next);
    } else {
      const prev = Array.isArray(ethnicBackground) ? ethnicBackground : [];
      const prevSet = new Set(prev);
      const nextSet = new Set(next);
      for (const item of options) {
        const was = prevSet.has(item);
        const now = nextSet.has(item);
        if (was !== now) onChange(item);
      }
    }
    onOtherTextChange?.(sheetOtherDraft);
    closeSheet();
  }, [
    sheetDraft,
    sheetOtherDraft,
    setEthnicBackground,
    ethnicBackground,
    onChange,
    onOtherTextChange,
    closeSheet,
  ]);

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

  useEffect(
    () => () => clearSheetCloseTimer(),
    [clearSheetCloseTimer]
  );

  const isOtherSelected = ethnicBackground.includes(ETHNIC_OTHER_OPTION);
  const showOtherInput = otherInputMode === "always" || isOtherSelected || otherPanelClosing;

  const handleOptionToggle = useCallback(
    (item) => {
      const wasSelected = ethnicBackground.includes(item);
      if (item === ETHNIC_OTHER_OPTION && otherInputMode === "when_other") {
        if (wasSelected) {
          onOtherTextChange?.("");
        }
      }
      onChange(item);
    },
    [ethnicBackground, onChange, onOtherTextChange, otherInputMode]
  );

  const toggleSheetDraft = useCallback((item) => {
    setSheetDraft((prev) => {
      const arr = Array.isArray(prev) ? prev : [];
      const wasSelected = arr.includes(item);
      if (wasSelected) {
        if (item === ETHNIC_OTHER_OPTION) {
          setSheetOtherDraft("");
          setSheetOtherError(false);
        }
        return arr.filter((x) => x !== item);
      }
      if (item === ETHNIC_OTHER_OPTION) {
        setSheetOtherError(false);
      }
      return [...arr, item];
    });
  }, []);

  const renderOptionChips = useCallback(
    (activeList, onToggle, { inSheet = false, items = options } = {}) =>
      items.map((item) => {
        const isActive = activeList.includes(item);
        return (
          <div
            key={item}
            className={isActive ? styles.isemSelected : styles.item}
            onClick={() => {
              if (
                inSheet &&
                item === ETHNIC_OTHER_OPTION &&
                otherInputMode === "when_other"
              ) {
                if (otherPanelClosing) {
                  clearCloseTimer();
                  setOtherPanelClosing(false);
                  return;
                }
                toggleSheetDraft(item);
                return;
              }
              if (
                !inSheet &&
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
                  onChange(item);
                  closeTimerRef.current = window.setTimeout(() => {
                    onOtherTextChange?.("");
                    setOtherPanelClosing(false);
                    closeTimerRef.current = null;
                  }, OTHER_PANEL_ANIM_MS);
                  return;
                }
                openSheet();
                onChange(item);
                return;
              }
              onToggle(item);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onToggle(item);
              }
            }}
          >
            {item}
          </div>
        );
      }),
    [
      clearCloseTimer,
      onChange,
      onOtherTextChange,
      openSheet,
      otherInputMode,
      otherPanelClosing,
      toggleSheetDraft,
    ]
  );

  const list = useMemo(
    () => renderOptionChips(ethnicBackground, handleOptionToggle),
    [ethnicBackground, handleOptionToggle, renderOptionChips]
  );

  const sheetList = useMemo(
    () => renderOptionChips(sheetDraft, toggleSheetDraft, { inSheet: true }),
    [sheetDraft, toggleSheetDraft, renderOptionChips]
  );

  const isOtherInSheetDraft = sheetDraft.includes(ETHNIC_OTHER_OPTION);
  const showSheetOtherError =
    sheetOtherError || (showOtherError && isOtherInSheetDraft);

  const sheetSelectedCount = sheetDraft.length;
  const applyButtonLabel =
    sheetSelectedCount > 0
      ? `Apply (${sheetSelectedCount} selected)`
      : "Apply";

  const handleOtherInputChange = (e) => {
    onOtherTextChange?.(sanitizeOtherText(e.target.value));
  };

  const handleSheetOtherInputChange = (e) => {
    setSheetOtherDraft(sanitizeOtherText(e.target.value));
    setSheetOtherError(false);
  };

  const inputBlockRef = useRef(null);
  const hintRef = useRef(null);
  const sheetBodyRef = useRef(null);
  const sheetOtherInputRef = useRef(null);

  useEffect(() => {
    if (isModalMode) return;
    if (otherInputMode !== "when_other") return;
    if (!isOtherSelected || otherPanelClosing) return;
    requestAnimationFrame(() => {
      hintRef.current?.scrollIntoView({
        block: "end",
        behavior: "smooth",
        inline: "nearest",
      });
    });
  }, [isModalMode, isOtherSelected, otherPanelClosing, otherInputMode]);

  useEffect(() => {
    if (!sheetMounted || !sheetVisible || !isOtherInSheetDraft) return;

    let cancelled = false;
    let rafId = 0;
    let focusTimerId = 0;

    const pinScrollToBottom = () => {
      if (cancelled) return;
      const body = sheetBodyRef.current;
      if (body) {
        body.scrollTop = body.scrollHeight - body.clientHeight;
      }
      rafId = requestAnimationFrame(pinScrollToBottom);
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled) return;
        pinScrollToBottom();
        focusTimerId = window.setTimeout(() => {
          cancelled = true;
          cancelAnimationFrame(rafId);
          sheetOtherInputRef.current?.focus({ preventScroll: true });
        }, SHEET_OTHER_ANIM_MS);
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      if (focusTimerId) window.clearTimeout(focusTimerId);
    };
  }, [sheetMounted, sheetVisible, isOtherInSheetDraft]);

  useEffect(() => {
    if (!sheetMounted) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeSheet();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [sheetMounted, closeSheet]);

  useEffect(() => {
    if (!skipped || !sheetMounted) return;
    closeSheet();
  }, [skipped, sheetMounted, closeSheet]);

  useEffect(() => {
    if (!sheetMounted) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [sheetMounted]);

  const selectedChips = useMemo(() => {
    const arr = (Array.isArray(ethnicBackground) ? ethnicBackground : []).filter(
      (item) => !FORM_DETAIL_SET.has(item)
    );
    const chips = [];
    for (const item of arr) {
      if (item === ETHNIC_OTHER_OPTION) {
        const trimmed = String(otherText ?? "").trim();
        chips.push({
          key: item,
          label: trimmed ? truncateChipLabel(trimmed) : ETHNIC_OTHER_OPTION,
          ariaLabel: trimmed || ETHNIC_OTHER_OPTION,
          value: item,
          isOther: true,
        });
      } else {
        chips.push({
          key: item,
          label: item,
          ariaLabel: item,
          value: item,
          isOther: false,
        });
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

  const handlePreferNotToSay = useCallback(() => {
    if (typeof setEthnicBackground !== "function") return;

    setEthnicBackground((prev) => {
      const prevArr = Array.isArray(prev) ? prev : [];
      const detailNext = applyDetailChipSelection(
        prevArr,
        FORM_PREFER_NOT_TO_SAY
      );
      if (detailNext === null) return prevArr;
      if (detailNext.includes(FORM_PREFER_NOT_TO_SAY)) {
        onOtherTextChange?.("");
      }
      return detailNext;
    });
  }, [onOtherTextChange, setEthnicBackground]);

  const sheetTranslate = Math.max(0, dragOffset);
  const sheetDragStyle =
    sheetVisible && sheetTranslate > 0
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
      <div className={`${styles.wrap} ${skipped ? styles.wrapSkipped : ""}`.trim()}>
        <InfoTooltip
          title={
            <span className={titleStyles.titleWithIcon}>
              <EthnicIcon aria-hidden />
              <span>Ethnic background(s)</span>
            </span>
          }
          showArrow={false}
          showErrorCircle={showHeadingError && !skipped}
        >
          Racial and ethnic backgrounds are linked to natural differences in genetics, immune responses, and care habits. This can shape vaginal flora and therefore its acidity, moisture, and scent. Knowing this helps pHera understand what is normal for your body.
        </InfoTooltip>

        {isModalMode ? (
          <div className={styles.modalField}>
            <button
              type="button"
              className={`${styles.selectChip} ${
                skipped
                  ? styles.selectChipSkipped
                  : selectedChips.length > 0
                      ? styles.selectChipFilled
                      : ""
              }`.trim()}
              onClick={skipped ? undefined : openSheet}
              aria-disabled={skipped}
              tabIndex={skipped ? -1 : 0}
            >
              <span className={styles.selectChipText}>
                {selectedChips.length > 0
                  ? "Your background(s)"
                  : "Select your background(s)"}
              </span>
              {selectedChips.length > 0 && (
                <span
                  className={`${styles.selectChipBadge} ${
                    skipped ? styles.selectChipBadgeSkipped : ""
                  }`.trim()}
                >
                  {selectedChips.length} selected
                </span>
              )}
            </button>

            {selectedChips.length > 0 && (
              <div className={styles.selectedList}>
                {selectedChips.map((c) => (
                  <div
                    key={c.key}
                    className={`${styles.selectedChip} ${
                      skipped ? styles.selectedChipSkipped : ""
                    }`.trim()}
                  >
                    <span className={styles.selectedChipText}>{c.label}</span>
                    <button
                      type="button"
                      className={styles.selectedChipRemove}
                      onClick={
                        skipped ? undefined : () => handleChipRemove(c.value)
                      }
                      aria-disabled={skipped}
                      aria-label={`Remove ${c.ariaLabel ?? c.label}`}
                      tabIndex={skipped ? -1 : 0}
                    >
                      <span className={styles.selectedChipX} aria-hidden>
                        ×
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            )}
            {showPreferNotToSay && (
              <div
                className={
                  selectedChips.length > 0 ? undefined : styles.preferNotToSayRow
                }
              >
                <DetailChipRow
                  selected={ethnicBackground}
                  onChange={handlePreferNotToSay}
                  options={[FORM_PREFER_NOT_TO_SAY]}
                  showDivider={selectedChips.length > 0}
                  dividerFlushTop
                  skipped={skipped}
                />
              </div>
            )}
          </div>
        ) : (
          <div className={styles.list}>{list}</div>
        )}
      </div>

      {isModalMode && sheetMounted && (
        <div
          className={`${styles.sheetOverlay} ${
            sheetVisible ? styles.sheetOverlayVisible : ""
          }`.trim()}
          role="presentation"
        >
          <button
            type="button"
            className={styles.sheetBackdrop}
            onClick={closeSheet}
            aria-label="Close"
          />

          <div
            className={`${styles.sheet} ${
              sheetTranslate > 0 ? styles.sheetDragging : ""
            }`.trim()}
            role="dialog"
            aria-modal="true"
            aria-label="Ethnic background(s)"
            style={sheetDragStyle}
          >
            <button
              type="button"
              className={styles.sheetClose}
              onClick={closeSheet}
              aria-label="Close"
            >
              <span aria-hidden>×</span>
            </button>

            <div
              className={styles.sheetChrome}
              onTouchStart={onSheetTouchStart}
              onTouchMove={onSheetTouchMove}
              onTouchEnd={onSheetTouchEnd}
              onTouchCancel={onSheetTouchEnd}
            >
              <div className={styles.sheetHandleWrap} aria-hidden>
                <div className={styles.sheetHandle} />
              </div>

              <div className={styles.sheetHeader}>
                <div className={styles.sheetTitle}>
                  <EthnicIcon aria-hidden />
                  <span>Ethnic background(s)</span>
                </div>
              </div>
            </div>

            <div ref={sheetBodyRef} className={styles.sheetBody}>
              <p className={styles.sheetSubtitle}>
                Ethnic backgrounds shape vaginal flora and pH norms. Select all that apply - this helps personalize your result.
              </p>
              <div className={styles.sheetList}>{sheetList}</div>
              <div
                className={`${styles.sheetOtherInput} ${
                  isOtherInSheetDraft ? styles.sheetOtherInputOpen : ""
                }`.trim()}
                style={{
                  "--sheet-other-duration": `${SHEET_OTHER_ANIM_MS}ms`,
                }}
                aria-hidden={!isOtherInSheetDraft}
              >
                <div className={styles.sheetOtherInputInner}>
                  <input
                    ref={sheetOtherInputRef}
                    type="text"
                    className={`${styles.input} ${
                      showSheetOtherError ? styles.inputError : ""
                    }`.trim()}
                    placeholder="e.g. Afro-Caribbean"
                    maxLength={50}
                    aria-invalid={showSheetOtherError}
                    value={sheetOtherDraft}
                    onChange={handleSheetOtherInputChange}
                    tabIndex={isOtherInSheetDraft ? 0 : -1}
                  />
                  <p
                    className={`${styles.inputHint} ${
                      showSheetOtherError ? styles.inputHintError : ""
                    }`.trim()}
                  >
                    Please specify your background
                  </p>
                </div>
              </div>
              <Button className={styles.modalBtn} onClick={applySheet}>
                {applyButtonLabel}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showOtherInput && !isModalMode && (
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
