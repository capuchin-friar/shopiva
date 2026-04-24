"use client";

import { useEffect, useState } from "react";
import { getTopLevelCategoryOptions } from "./getCategoryOptions";

const overlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 100050,
  background: "rgba(0,0,0,0.55)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "16px",
};

const panelStyle = {
  background: "#fff",
  borderRadius: "12px",
  height: "fit-content",
  maxWidth: "420px",
  width: "100%",
  padding: "20px 22px",
  boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "14px",
  boxSizing: "border-box",
};

const actionsStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  marginTop: "18px",
};

const btnSecondary = {
  padding: "8px 16px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  background: "#fff",
  height: "fit-content",
  cursor: "pointer",
  fontSize: "14px",
  color: "#000"
};

const btnPrimary = {
  padding: "8px 16px",
  borderRadius: "8px",
  border: "none",
  height: "fit-content",
  background: "#005c45",
  color: "#fff",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: 600,
};

/**
 * Modal overlay: input type follows `mode` (category = JSON-backed select, etc.).
 */
export default function FieldEditorModal({
  open,
  onClose,
  mode,
  title,
  initialValue = "",
  onSave,
  options = null,
  placeholder = "",
  selectPlaceholder = "Select…",
}) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!open) return;
    if (mode === "availability") {
      const v =
        initialValue === true ||
        initialValue === "true" ||
        initialValue === 1
          ? "true"
          : initialValue === false ||
              initialValue === "false" ||
              initialValue === 0
            ? "false"
            : "true";
      setValue(v);
      return;
    }
    setValue(
      initialValue != null && initialValue !== false && initialValue !== true
        ? String(initialValue)
        : ""
    );
  }, [open, initialValue, mode]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const categoryOptions =
    mode === "category" ? options ?? getTopLevelCategoryOptions() : [];

  const handleSave = async () => {
    if ((mode === "category" || mode === "select") && !String(value).trim()) {
      return;
    }
    try {
      if (mode === "availability") {
        await Promise.resolve(onSave?.(value === "true"));
      } else {
        await Promise.resolve(onSave?.(value));
      }
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  let field = null;
  if (mode === "category" || mode === "select") {
    const opts = mode === "category" ? categoryOptions : options ?? [];
    field = (
      <>
        <select
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={inputStyle}
          aria-label={title || "Select option"}
        >
          <option value="">{selectPlaceholder}</option>
          {opts.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </>
    );
  } else if (mode === "textarea") {
    field = (
      <>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          rows={5}
          style={{ ...inputStyle, resize: "vertical", minHeight: "100px" }}
          aria-label={title || "Text"}
        />
      </>
    );
  } else if (mode === "availability") {
    field = (
      <>
        <select
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={inputStyle}
          aria-label={title || "Availability"}
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </>
    );
  } else {
    field = (
      <>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          style={inputStyle}
          aria-label={title || "Text"}
        />
      </>
    );
  }

  return (
    <div
      style={overlayStyle}
      role="dialog"
      aria-modal="true"
      aria-labelledby="field-editor-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        <h3
          id="field-editor-title"
          style={{ margin: "0 0 16px", fontSize: "17px", color: "#111" }}
        >
          {title || "Edit"}
        </h3>
        {field}
        <div style={actionsStyle}>
          <button type="button" style={btnSecondary} onClick={onClose}>
            Cancel
          </button>
          <button type="button" style={btnPrimary} onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
