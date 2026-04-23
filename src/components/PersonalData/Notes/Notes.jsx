import { useState, useRef, useEffect } from "react";
import EditNotes from "../../../assets/icons/EditNotes";

import styles from "./Notes.module.css";

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

const scrollRootToBottom = (behavior = "auto") => {
  const docEl = document.documentElement;
  const body = document.body;
  const rootScroller = document.scrollingElement || docEl;
  if (!docEl || !body || !rootScroller) return;

  const maxScrollHeight = Math.max(
    body.scrollHeight,
    docEl.scrollHeight,
    rootScroller.scrollHeight
  );

  // Try multiple scroll targets (mobile Safari/Chrome differ).
  const top = Math.max(0, maxScrollHeight);
  window.scrollTo({ top, behavior });
  body.scrollTop = top;
  docEl.scrollTop = top;
  rootScroller.scrollTo({ top, behavior });
};

const Notes = ({ notes, setNotes }) => {
  const [isEditing, setIsEditing] = useState(false);
  const containerRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!isEditing) return;

    let cancelled = false;
    const scrollAllToBottom = () => {
      const anchor = containerRef.current;
      const textarea = textareaRef.current;
      if (!anchor || !textarea) return;

      const scrollContainer = getScrollParent(anchor);
      const scrollToBottom = (el) => {
        const maxTop = Math.max(0, el.scrollHeight - el.clientHeight);
        // Direct assignment is more reliable on mobile than smooth scrolling.
        el.scrollTop = maxTop;
      };

      // 1) Desktop: scroll inside DeviceFrame ".screen"
      if (scrollContainer) scrollToBottom(scrollContainer);

      // 2) Mobile: scroll root document scroller
      scrollRootToBottom("auto");
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled) return;

        scrollAllToBottom();

        // On mobile, focusing too early can cancel the scroll.
        window.setTimeout(() => {
          if (cancelled) return;
          scrollAllToBottom();
          window.setTimeout(() => {
            if (cancelled) return;
            const el = textareaRef.current;
            if (!el) return;
            // Avoid browser auto-scrolling on focus (mobile)
            try {
              el.focus({ preventScroll: true });
            } catch {
              el.focus();
            }
          }, 120);
        }, 80);
      });
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

    return normalized.slice(0, 500);
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [notes]);

  // click out
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isEditing && containerRef.current && !containerRef.current.contains(e.target)) {
        setIsEditing(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isEditing]);

  // click Escape
  useEffect(() => {
    const handleEscape = (e) => e.key === "Escape" && setIsEditing(false);
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <div className={styles.wrap} ref={containerRef}>
      <div className={styles.heading}>
        <h4 className={styles.title}>Notes</h4>
        <button
          type="button"
          onClick={() => {
            setIsEditing((prev) => {
              const next = !prev;
              if (next) {
                // Run immediately in the click handler (works reliably on mobile)
                scrollRootToBottom("auto");
              }
              return next;
            });
          }}
          className={styles.edit}
          aria-label="Edit notes"
        >
          <EditNotes />
        </button>
      </div>

      {isEditing ? (
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={notes}
          maxLength={500}
          onChange={(e) => setNotes(sanitizeNotes(e.target.value))}
          autoFocus
        />
      ) : (
        <p className={styles.text}>
          {notes || "Add notes, any extra symptoms, or how you’ve been feeling"}
        </p>
      )}
    </div>
  );
};

export default Notes;

