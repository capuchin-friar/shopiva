"use client";

import { useEffect } from "react";

const overlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 100060,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
  padding: 0,
};

const panelStyle = {
  width: "100%",
  maxWidth: "100%",
  maxHeight: "min(92vh, 720px)",
  background: "#fff",
  borderTopLeftRadius: "16px",
  borderTopRightRadius: "16px",
  boxShadow: "0 -8px 32px rgba(0,0,0,0.15)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  boxSizing: "border-box",
};

const scrollStyle = {
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  padding: "16px 18px 12px",
  WebkitOverflowScrolling: "touch",
};

const footerStyle = {
  flexShrink: 0,
  padding: "12px 18px calc(14px + env(safe-area-inset-bottom, 0px))",
  borderTop: "1px solid #eee",
  background: "#fff",
};

/**
 * Mobile finale step: brand, delivery methods, then Continue (parent validates full form + saves).
 */
export default function SubmissionFinaleModal({
  open,
  onClose,
  brand,
  onBrandChange,
  deliveryMethods,
  onDeliveryMethodsChange,
  errors,
  clearError,
  onContinue,
  saveLoading,
  editLoading,
  saveError,
  isEdit,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const busy = Boolean(saveLoading || editLoading);

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
        aria-labelledby="submission-finale-title"
        style={panelStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 18px 8px",
            borderBottom: "1px solid #eee",
          }}
        >
          <h2
            id="submission-finale-title"
            style={{
              margin: 0,
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "#111",
            }}
          >
            Finish &amp; save
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            style={{
              border: "none",
              background: "transparent",
              fontSize: "1.5rem",
              lineHeight: 1,
              padding: "4px 8px",
              cursor: busy ? "not-allowed" : "pointer",
              color: "#444",
            }}
          >
            ×
          </button>
        </div>

        <div style={scrollStyle}>
          <p style={{ margin: "0 0 14px", fontSize: "0.9rem", color: "#666" }}>
            Add brand and how you deliver. We&apos;ll validate the full product when you continue.
          </p>

          <div className="product-org-cnt" style={{ width: "100%", marginBottom: 18 }}>
            <h6 style={{ color: "#727272", margin: "0 0 10px" }}>Product organization</h6>
            <div
              className="input-cnt"
              style={{
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "flex-start",
              }}
            >
              <label htmlFor="finale-brand" style={{ color: "#727272" }}>
                <small>Brand name (manufacturer)</small>
              </label>
              <input
                id="finale-brand"
                style={{ width: "100%", border: "1px solid #727272", padding: "10px", borderRadius: 6, boxSizing: "border-box" }}
                value={brand}
                onChange={(e) => {
                  onBrandChange(e.target.value);
                  clearError("brand");
                }}
                type="text"
                autoComplete="organization"
                disabled={busy}
              />
              <div className="err-mssg" style={{ minHeight: 20 }}>
                {errors.brand || ""}
              </div>
            </div>
          </div>

          <div className="product-publication" style={{ height: "fit-content" }}>
            <h6 style={{ color: "#727272", margin: "0 0 14px" }}>Delivery methods</h6>
            <div
              className="input-cnt"
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "center",
                marginBottom: 12,
                gap: 8,
              }}
            >
              <input
                id="finale-pickup"
                style={{ width: 15, height: 15, marginTop: 3, flexShrink: 0 }}
                type="checkbox"
                checked={deliveryMethods.pickup}
                onChange={(e) => {
                  const checked = e.target.checked;
                  onDeliveryMethodsChange((prev) => ({ ...prev, pickup: checked }));
                  if (checked || deliveryMethods.delivery) clearError("deliveryMethods");
                }}
                disabled={busy}
              />
              <label htmlFor="finale-pickup" style={{ color: "#727272", lineHeight: 1.35 }}>
                <small>Allow customers to pick up orders from your location</small>
              </label>
            </div>
            <div
              className="input-cnt"
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "center",
                gap: 8,
              }}
            >
              <input
                id="finale-delivery"
                style={{ width: 15, height: 15, marginTop: 3, flexShrink: 0 }}
                type="checkbox"
                checked={deliveryMethods.delivery}
                onChange={(e) => {
                  const checked = e.target.checked;
                  onDeliveryMethodsChange((prev) => ({ ...prev, delivery: checked }));
                  if (checked || deliveryMethods.pickup) clearError("deliveryMethods");
                }}
                disabled={busy}
              />
              <label htmlFor="finale-delivery" style={{ color: "#727272", lineHeight: 1.35 }}>
                <small>Deliver orders to the customer&apos;s address</small>
              </label>
            </div>
            <div className="err-mssg" style={{ minHeight: 20, marginTop: 8 }}>
              {errors.deliveryMethods || ""}
            </div>
          </div>

          {saveError ? (
            <div className="err-mssg" style={{ marginTop: 12 }}>
              {saveError}
            </div>
          ) : null}
        </div>

        <div style={footerStyle}>
          <button
            type="button"
            onClick={onContinue}
            disabled={busy}
            style={{
              width: "100%",
              height: 48,
              borderRadius: 8,
              border: "none",
              background: "#000",
              color: "#fff",
              fontWeight: 600,
              fontSize: "1rem",
              display: "flex",
              justifyContent: "center",

              cursor: busy ? "not-allowed" : "pointer",
              opacity: busy ? 0.75 : 1,
              textAlign: "center"
            }}
          >
            {saveLoading ? (isEdit ? "Updating…" : "Saving…") : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
