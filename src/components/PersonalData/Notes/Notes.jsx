import { useState, useRef, useEffect } from "react";
import EditNotes from "../../../assets/icons/EditNotes";

import styles from "./Notes.module.css";

const Notes = ({ notes, setNotes }) => {
  const [isEditing, setIsEditing] = useState(false);
  const containerRef = useRef(null);
  const textareaRef = useRef(null);

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
          onClick={() => setIsEditing(true)}
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

