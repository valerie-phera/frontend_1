import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import EditNotes from "../../../assets/icons/EditNotes";

import { NOTES_INPUT_MAX_LENGTH } from "../../../shared/utils/notesDisplay";
import {
  findScrollableAncestor,
  getScrollportClipBottom,
} from "../../../shared/utils/scrollAncestor";
import styles from "./Notes.module.css";

/** Space between char counter and sticky footer / keyboard */
const FOOTER_CLEARANCE_PX = 12;
const MIN_SCROLL_DELTA_PX = 2;

const Notes = ({ notes, setNotes, skipped = false, embedded = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const containerRef = useRef(null);
  const editAreaRef = useRef(null);
  const textareaRef = useRef(null);
  const charCountRef = useRef(null);
  const scrollRafRef = useRef(0);

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;

    // Use offsetHeight (includes borders) so overflow-y: hidden does not clip edges.
    el.style.height = "auto";
    el.style.height = `${el.offsetHeight}px`;
  }, []);

  const scrollNotesContentIntoView = useCallback(() => {
    const anchor = editAreaRef.current;
    const target = charCountRef.current ?? textareaRef.current ?? anchor;
    if (!target) return;

    const scroller = findScrollableAncestor(target);
    if (!scroller) return;

    const clipBottom = getScrollportClipBottom(scroller, target);
    const rects = [anchor, charCountRef.current, textareaRef.current].filter(Boolean);
    const targetBottom = Math.max(
      ...rects.map((el) => el.getBoundingClientRect().bottom)
    );
    const gap = clipBottom - targetBottom;

    if (gap >= FOOTER_CLEARANCE_PX) return;

    const scrollBy = FOOTER_CLEARANCE_PX - gap;
    if (scrollBy < MIN_SCROLL_DELTA_PX) return;

    const prevTop = scroller.scrollTop;
    scroller.scrollTop = prevTop + scrollBy;

    if (scroller.scrollTop === prevTop) {
      try {
        target.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "auto" });
      } catch {
        // ignore
      }
    }
  }, []);

  const scheduleNotesScroll = useCallback(() => {
    window.cancelAnimationFrame(scrollRafRef.current);
    scrollRafRef.current = window.requestAnimationFrame(() => {
      scrollRafRef.current = window.requestAnimationFrame(() => {
        resizeTextarea();
        scrollNotesContentIntoView();
      });
    });
  }, [resizeTextarea, scrollNotesContentIntoView]);

  useEffect(() => {
    if (!isEditing) return;

    const el = textareaRef.current;
    if (!el) return;

    const focusTimer = window.setTimeout(() => {
      try {
        el.focus({ preventScroll: true });
      } catch {
        el.focus();
      }
    }, 0);

    return () => window.clearTimeout(focusTimer);
  }, [isEditing]);

  useLayoutEffect(() => {
    if (!isEditing) return;
    scheduleNotesScroll();
  }, [notes, isEditing, scheduleNotesScroll]);

  useEffect(
    () => () => {
      window.cancelAnimationFrame(scrollRafRef.current);
    },
    []
  );

  const sanitizeNotes = (value) => {
    const raw = String(value ?? "");
    const normalized = raw
      .normalize("NFKC")
      .replace(/\u00A0/g, " ")
      .replace(/\r\n?/g, "\n")
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
      .replace(/[<>]/g, "")
      .replace(/[^\S\n]+/g, " ")
      .replace(/\n{3,}/g, "\n\n");

    return normalized.slice(0, NOTES_INPUT_MAX_LENGTH);
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isEditing && containerRef.current && !containerRef.current.contains(e.target)) {
        setIsEditing(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isEditing]);

  useEffect(() => {
    const handleEscape = (e) => e.key === "Escape" && setIsEditing(false);
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    if (skipped) setIsEditing(false);
  }, [skipped]);

  if (embedded) {
    return (
      <div
        className={`${styles.wrapEmbedded} ${skipped ? styles.wrapSkipped : ""}`.trim()}
        ref={containerRef}
        onClick={() => {
          if (skipped) return;
          if (!isEditing) setIsEditing(true);
        }}
        style={{
          cursor: skipped ? "default" : isEditing ? "auto" : "pointer",
          pointerEvents: skipped ? "none" : undefined,
        }}
      >
        {isEditing ? (
          <div ref={editAreaRef} className={styles.editArea}>
            <textarea
              ref={textareaRef}
              className={styles.textarea}
              value={notes}
              maxLength={NOTES_INPUT_MAX_LENGTH}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setNotes(sanitizeNotes(e.target.value))}
            />
            <p ref={charCountRef} className={styles.charCount} aria-live="polite">
              {String(notes ?? "").length}/{NOTES_INPUT_MAX_LENGTH}
            </p>
          </div>
        ) : (
          <p className={styles.text}>
            {notes || "Add notes, any extra symptoms, or how you've been feeling"}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={`${styles.wrap} ${skipped ? styles.wrapSkipped : ""}`.trim()}
      ref={containerRef}
      onClick={() => {
        if (skipped) return;
        if (!isEditing) setIsEditing(true);
      }}
      style={{
        cursor: skipped ? "default" : isEditing ? "auto" : "pointer",
        pointerEvents: skipped ? "none" : undefined,
      }}
    >
      <div className={styles.heading}>
        <h4 className={styles.title}>Notes</h4>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className={styles.edit}
          aria-label="Edit notes"
        >
          <EditNotes />
        </button>
      </div>

      {isEditing ? (
        <div ref={editAreaRef} className={styles.editArea}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={notes}
            maxLength={NOTES_INPUT_MAX_LENGTH}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setNotes(sanitizeNotes(e.target.value))}
          />
          <p ref={charCountRef} className={styles.charCount} aria-live="polite">
            {String(notes ?? "").length}/{NOTES_INPUT_MAX_LENGTH}
          </p>
        </div>
      ) : (
        <p className={styles.text}>
          {notes || "Add notes, any extra symptoms, or how you’ve been feeling"}
        </p>
      )}
    </div>
  );
};

export default Notes;
