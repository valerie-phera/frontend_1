import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import EditNotes from "../../../assets/icons/EditNotes";

import { NOTES_INPUT_MAX_LENGTH } from "../../../shared/utils/notesDisplay";
import styles from "./Notes.module.css";

/** Space below char counter so it clears the sticky footer / mobile keyboard */
const SCROLL_BOTTOM_PADDING_PX = 180;

const getScrollParent = (el) => {
  let node = el;
  while (node && node !== document.body) {
    if (node instanceof HTMLElement) {
      const style = window.getComputedStyle(node);
      const overflowY = style.overflowY;
      const canScroll =
        (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") &&
        node.scrollHeight > node.clientHeight + 1;
      if (canScroll) return node;
    }
    node = node.parentElement;
  }
  return null;
};

const Notes = ({ notes, setNotes }) => {
  const [isEditing, setIsEditing] = useState(false);
  const containerRef = useRef(null);
  const editAreaRef = useRef(null);
  const textareaRef = useRef(null);
  const charCountRef = useRef(null);

  const scrollNotesContentIntoView = useCallback((behavior = "auto") => {
    const textarea = textareaRef.current;
    const charCount = charCountRef.current;
    const anchor = editAreaRef.current ?? containerRef.current;
    if (!anchor) return;

    const scroller = getScrollParent(anchor);
    if (scroller) {
      const scrollerRect = scroller.getBoundingClientRect();
      let visibleBottom = scrollerRect.bottom;
      if (window.visualViewport) {
        const vvBottom =
          window.visualViewport.offsetTop + window.visualViewport.height;
        visibleBottom = Math.min(visibleBottom, vvBottom);
      }

      const targets = [textarea, charCount, anchor].filter(Boolean);
      let maxOverflow = 0;
      for (const el of targets) {
        const bottom = el.getBoundingClientRect().bottom;
        const overflow = bottom - visibleBottom;
        if (overflow > maxOverflow) maxOverflow = overflow;
      }

      const scrollBy = maxOverflow + SCROLL_BOTTOM_PADDING_PX;
      if (scrollBy > 0) {
        scroller.scrollTo({ top: scroller.scrollTop + scrollBy, behavior });
      }
      return;
    }

    try {
      charCount?.scrollIntoView({ block: "end", inline: "nearest", behavior });
    } catch {
      try {
        anchor.scrollIntoView({ block: "end", inline: "nearest", behavior });
      } catch {
        // older browsers
      }
    }
  }, []);

  useEffect(() => {
    if (!isEditing) return;

    let cancelled = false;

    requestAnimationFrame(() => {
      if (cancelled) return;
      scrollNotesContentIntoView("auto");

      // Focus after scroll to avoid mobile browsers jumping unexpectedly.
      window.setTimeout(() => {
        if (cancelled) return;
        const el = textareaRef.current;
        if (!el) return;
        try {
          el.focus({ preventScroll: true });
        } catch {
          el.focus();
        }
      }, 120);
    });

    return () => {
      cancelled = true;
    };
  }, [isEditing]);

  const sanitizeNotes = (value) => {
    const raw = String(value ?? "");
    const normalized = raw
      .normalize("NFKC")
      .replace(/\r\n?/g, "\n")
      // Remove control chars but keep newlines and tabs for readability
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
      // Avoid tag-like input; keep the rest of punctuation as-is
      .replace(/[<>]/g, "")
      // Collapse spaces/tabs, without touching line breaks
      .replace(/[ \t]+/g, " ")
      // Limit multiple blank lines
      .replace(/\n{3,}/g, "\n\n");

    return normalized.slice(0, NOTES_INPUT_MAX_LENGTH);
  };

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useLayoutEffect(() => {
    if (!isEditing || !textareaRef.current) return;

    resizeTextarea();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollNotesContentIntoView("auto");
      });
    });
  }, [notes, isEditing, resizeTextarea, scrollNotesContentIntoView]);

  useEffect(() => {
    if (!isEditing) return;

    const vv = window.visualViewport;
    if (!vv) return;

    const onViewportChange = () => {
      resizeTextarea();
      scrollNotesContentIntoView("auto");
    };

    vv.addEventListener("resize", onViewportChange);
    vv.addEventListener("scroll", onViewportChange);
    return () => {
      vv.removeEventListener("resize", onViewportChange);
      vv.removeEventListener("scroll", onViewportChange);
    };
  }, [isEditing, notes, resizeTextarea, scrollNotesContentIntoView]);

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

  // click Escape
  useEffect(() => {
    const handleEscape = (e) => e.key === "Escape" && setIsEditing(false);
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <div
      className={styles.wrap}
      ref={containerRef}
      onClick={() => !isEditing && setIsEditing(true)}
      style={{ cursor: isEditing ? "auto" : "pointer" }}
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
            onKeyUp={() => scrollNotesContentIntoView("auto")}
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

