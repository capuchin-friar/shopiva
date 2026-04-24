"use client";

import { useState } from "react";
import axios from "axios";

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
  maxWidth: "440px",
  width: "100%",
  height: "fit-content",
  padding: "20px 22px",

  boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
};

const btnPrimary = {
  padding: "8px 16px",
  borderRadius: "8px",
  border: "none",
  background: "#005c45",
  color: "#fff",
  height: "fit-content",
  cursor: "pointer",

  fontSize: "14px",
  fontWeight: 600,
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

/**
 * Upload a document (image/PDF) and PATCH shop verificationDocuments[docKey].
 */
export default function VerificationDocumentModal({
  open,
  onClose,
  title,
  shopId,
  docKey,
  onComplete,
  helpText,
}) {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  if (!open) return null;

  const submit = async () => {
    if (!file || !shopId || !docKey) return;
    setBusy(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data: up } = await axios.post("/api/upload/verification", fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      await axios.patch(
        `/api/shop/patch/${shopId}`,
        {
          verificationDocuments: {
            [docKey]: {
              url: up.url,
              verified: false,
              submittedAt: new Date().toISOString(),
            },
          },
        },
        { withCredentials: true }
      );
      await onComplete?.();
      setFile(null);
      onClose();
    } catch (e) {
      setErr(e.response?.data?.error || e.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={overlayStyle}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ver-doc-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        <h3
          id="ver-doc-title"
          style={{ margin: "0 0 12px", fontSize: "17px", color: "#111" }}
        >
          {title || "Upload document"}
        </h3>
        {helpText ? (
          <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#555" }}>
            {helpText}
          </p>
        ) : null}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          style={{ width: "100%", marginBottom: "12px", height: "fit-content" }}
        />
        {err ? (
          <p style={{ color: "#b91c1c", fontSize: "13px", margin: "0 0 8px" }}>
            {err}
          </p>
        ) : null}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button
            type="button"
            style={btnSecondary}
            disabled={busy}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            style={btnPrimary}
            disabled={busy || !file}
            onClick={submit}
          >
            {busy ? "Saving…" : "Save to shop"}
          </button>
        </div>
      </div>
    </div>
  );
}
