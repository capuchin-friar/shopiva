"use client";

import { useEffect, useState } from "react";
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
  height: "fit-content",
  background: "#fff",
  borderRadius: "12px",
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
  fontSize: "16px",
  boxSizing: "border-box",
  letterSpacing: "0.08em",
};

const btnPrimary = {
  padding: "8px 16px",
  borderRadius: "8px",
  border: "none",
  background: "#005c45",
  height: "fit-content",
  color: "#fff",
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
 * Collect 11-digit BVN and verify via API (format check + persist; hook KYC provider later).
 */
export default function BvnVerificationModal({
  open,
  onClose,
  shopId,
  onComplete,
  initialLast4,
}) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (open) {
      setValue("");
      setErr(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const verify = async () => {
    const digits = value.replace(/\D/g, "");
    if (digits.length !== 11) {
      setErr("Enter exactly 11 digits.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await axios.post(
        `/api/shop/patch/${shopId}/verify-bvn`,
        { bvn: digits },
        { withCredentials: true }
      );
      await onComplete?.();
      onClose();
    } catch (e) {
      setErr(e.response?.data?.error || e.message || "Verification failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={overlayStyle}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bvn-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        <h3
          id="bvn-title"
          style={{ margin: "0 0 12px", fontSize: "17px", color: "#111" }}
        >
          BVN verification
        </h3>
        <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#555" }}>
          Enter your 11-digit BVN. We only store a masked record after verification.
          Connect Paystack/Mono for live checks when ready.
        </p>
        {initialLast4 ? (
          <p style={{ margin: "0 0 8px", fontSize: "12px", color: "#00926e" }}>
            On file: ••••{initialLast4} (verified)
          </p>
        ) : null}
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="11-digit BVN"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={inputStyle}
          aria-label="BVN"
        />
        {err ? (
          <p style={{ color: "#b91c1c", fontSize: "13px", margin: "8px 0 0" }}>
            {err}
          </p>
        ) : null}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "16px",
          }}
        >
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
            disabled={busy}
            onClick={verify}
          >
            {busy ? "Verifying…" : "Verify"}
          </button>
        </div>
      </div>
    </div>
  );
}
