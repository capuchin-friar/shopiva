"use client";

import { useEffect, useState } from "react";

const overlayBase = {
  position: "fixed",
  inset: 0,
  zIndex: 100058,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "16px",
  background: "rgba(0,0,0,0)",
  transition: "background 0.35s ease",
};

const panelBase = {
  width: "100%",
  maxWidth: "400px",
  background: "#fff",
  borderRadius: "16px",
  padding: "24px 22px 20px",
  boxShadow: "0 16px 48px rgba(0,0,0,0.2)",
  boxSizing: "border-box",
  transition: "transform 0.42s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease",
  willChange: "transform",
};

/**
 * Slides up from below the viewport into the vertical center; tells the user to complete the form.
 */
export default function FillFormHintModal({ open, onClose, title = "Complete the form", message }) {
  const [mounted, setMounted] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  const defaultMessage =
    message ||
    "Please fill in every required field on this page (title, category, price, quantity, and any category-specific options) before saving. Check the red messages next to each field.";

  useEffect(() => {
    if (!open) {
      setAnimateIn(false);
      const t = setTimeout(() => setMounted(false), 400);
      return () => clearTimeout(t);
    }
    setMounted(true);
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimateIn(true));
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted && !open) return null;

  const overlayStyle = {
    ...overlayBase,
    background: animateIn ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0)",
    pointerEvents: mounted ? "auto" : "none",
  };

  const panelStyle = {
    ...panelBase,
    opacity: animateIn ? 1 : 0,
    transform: animateIn ? "translateY(0) scale(1)" : "translateY(min(75vh, 520px)) scale(0.98)",
  };

  return (
    <div
      style={overlayStyle}
      role="presentation"
      onClick={onClose}
      aria-hidden={!open}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="fill-form-hint-title"
        style={panelStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="fill-form-hint-title"
          style={{
            margin: "0 0 12px",
            fontSize: "1.15rem",
            fontWeight: 700,
            color: "#111",
          }}
        >
          {title}
        </h2>
        <p style={{ margin: "0 0 22px", fontSize: "0.95rem", lineHeight: 1.5, color: "#444" }}>
          {defaultMessage}
        </p>
        <button
          type="button"
          onClick={onClose}
          style={{
            width: "100%",
            height: 46,
            borderRadius: 10,
            border: "none",
            background: "#000",
            color: "#fff",
            fontWeight: 600,
            fontSize: "1rem",
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}
