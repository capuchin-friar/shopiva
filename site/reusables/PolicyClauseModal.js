"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const overlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 100050,
  background: "rgba(0,0,0,0.55)",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  padding: "16px",
  overflowY: "auto",
};

const panelShellStyle = {
  background: "#fff",
  borderRadius: "12px",
  maxWidth: "520px",
  width: "min(520px, calc(100vw - 32px))",
  maxHeight: "calc(100vh - 32px)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
  boxSizing: "border-box",
  margin: "auto 0",
};

const panelScrollStyle = {
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  overflowX: "hidden",
  padding: "18px 20px 10px",
  boxSizing: "border-box",
  WebkitOverflowScrolling: "touch",
};

const panelFooterStyle = {
  flexShrink: 0,
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: "6px",
  height: "fit-content",
  rowGap: "6px",
  padding: "10px 20px 16px",
  borderTop: "1px solid #eee",
  background: "#fff",
  boxSizing: "border-box",
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "14px",
  boxSizing: "border-box",
};

const btnOutline = {
  padding: "6px 12px",
  borderRadius: "6px",
  border: "1px solid #005c45",
  background: "#fff",
  color: "#005c45",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: 600,
  lineHeight: 1.2,
};

const btnFooterSecondary = {
  padding: "6px 12px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  background: "#fff",
  color: "#333",
  cursor: "pointer",
  fontSize: "12px",
  lineHeight: 1.2,
};

const fieldStackStyle = { marginBottom: "6px" };

const DELIVERY_TIMELINE_OPTIONS = [
  "Same day delivery",
  "1-2 days",
  "3-5 days",
  "5-7 days",
  "More than 7 days",
];

const DELIVERY_LOCATION_OPTIONS = [
  "Same city",
  "Same state",
  "Nationwide",
  "Pickup only",
];

const DELIVERY_METHOD_OPTIONS = [
  "Vendor self-delivery",
  "Third-party courier",
  "Pickup from store",
  "Platform courier",
];

const PROCESSING_TIME_UNIT_OPTIONS = ["hours", "days"];

const FAILED_DELIVERY_OPTIONS = [
  "Extra delivery fee required",
  "Order returned",
  "Customer must reschedule",
];

function parseJson(v) {
  if (v == null) return null;
  if (typeof v === "object") return v;
  if (typeof v === "string") {
    try {
      return JSON.parse(v);
    } catch {
      return null;
    }
  }
  return null;
}

function clauseList(obj) {
  const o = parseJson(obj);
  if (!o || !Array.isArray(o.clauses)) return [];
  return o.clauses;
}

function customList(raw) {
  const a = parseJson(raw);
  return Array.isArray(a) ? a : [];
}

/**
 * Title + description, then add to refund / delivery / custom. Shows checklist from `policies` row.
 */
export default function PolicyClauseModal({
  open,
  onClose,
  shopId,
  policies,
  policyTarget,
  onComplete,
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [deliveryTimeline, setDeliveryTimeline] = useState(
    DELIVERY_TIMELINE_OPTIONS[0]
  );
  const [deliveryLocation, setDeliveryLocation] = useState(
    DELIVERY_LOCATION_OPTIONS[0]
  );
  const [deliveryMethod, setDeliveryMethod] = useState(
    DELIVERY_METHOD_OPTIONS[0]
  );
  const [processingTimeValue, setProcessingTimeValue] = useState("1");
  const [processingTimeUnit, setProcessingTimeUnit] = useState(
    PROCESSING_TIME_UNIT_OPTIONS[1]
  );
  const [failedDeliveryPolicy, setFailedDeliveryPolicy] = useState(
    FAILED_DELIVERY_OPTIONS[2]
  );
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (open) {
      setTitle("");
      setContent("");
      setDeliveryTimeline(DELIVERY_TIMELINE_OPTIONS[0]);
      setDeliveryLocation(DELIVERY_LOCATION_OPTIONS[0]);
      setDeliveryMethod(DELIVERY_METHOD_OPTIONS[0]);
      setProcessingTimeValue("1");
      setProcessingTimeUnit(PROCESSING_TIME_UNIT_OPTIONS[1]);
      setFailedDeliveryPolicy(FAILED_DELIVERY_OPTIONS[2]);
      setDeliveryNotes("");
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

  const refundClauses = useMemo(
    () => clauseList(policies?.refundpolicy),
    [policies]
  );
  const deliveryClauses = useMemo(
    () => clauseList(policies?.deliverypolicy),
    [policies]
  );
  const customPolicies = useMemo(
    () => customList(policies?.custompolicies),
    [policies]
  );

  if (!open) return null;

  const targetLabelMap = {
    refund: "refund policy",
    delivery: "delivery policy",
    custom: "custom policy",
  };
  const targetTitleMap = {
    refund: "Refund policy",
    delivery: "Delivery policy",
    custom: "Custom policy",
  };
  const targetDescriptionMap = {
    refund:
      "Set refund and return terms customers should follow before requesting a refund.",
    delivery:
      "Set delivery and shipping terms. Open days and business hours (including delivery) are set under Shop availability.",
    custom:
      "Set any additional custom policy your shop wants customers to accept.",
  };
  const targetPlaceholderMap = {
    refund: {
      title: "e.g. Returns accepted within 7 days",
      content:
        "Explain eligible returns, conditions, and refund timeline in clear terms.",
    },
    delivery: {
      title: "e.g. Orders delivered in 2-5 business days",
      content:
        "Explain processing times, delivery coverage, delays, and shipping conditions.",
    },
    custom: {
      title: "e.g. No order cancellation after confirmation",
      content:
        "Write any custom policy your shop wants customers to comply with.",
    },
  };
  const singleTarget =
    policyTarget === "refund" || policyTarget === "delivery" || policyTarget === "custom"
      ? policyTarget
      : null;
  const activeTarget = singleTarget || "custom";

  const add = async (target) => {
    let payloadTitle = title.trim();
    let payloadContent = content.trim();

    if (target === "delivery") {
      const processingNumber = Number(processingTimeValue);
      if (!Number.isFinite(processingNumber) || processingNumber <= 0) {
        setErr("Enter a valid processing time.");
        return;
      }
      payloadTitle = payloadTitle || `Delivery: ${deliveryTimeline}`;
      payloadContent = [
        `Delivery timeline: ${deliveryTimeline}`,
        "",
        `Delivery location: ${deliveryLocation}`,
        `Delivery method: ${deliveryMethod}`,
        `Processing time before shipping: ${processingNumber} ${processingTimeUnit}`,
        `If customer is not available: ${failedDeliveryPolicy}`,
        deliveryNotes.trim()
          ? `\nAdditional notes:\n${deliveryNotes.trim()}`
          : "",
      ]
        .join("\n")
        .trim();
    } else if (!payloadTitle || !payloadContent) {
      setErr("Add a policy title and description first.");
      return;
    }

    setBusy(true);
    setErr(null);
    try {
      await axios.post(
        `/api/shop/patch/${shopId}/policy-clause`,
        { target, title: payloadTitle, content: payloadContent },
        { withCredentials: true }
      );
      await onComplete?.();
      setTitle("");
      setContent("");
      setDeliveryTimeline(DELIVERY_TIMELINE_OPTIONS[0]);
      setDeliveryLocation(DELIVERY_LOCATION_OPTIONS[0]);
      setDeliveryMethod(DELIVERY_METHOD_OPTIONS[0]);
      setProcessingTimeValue("1");
      setProcessingTimeUnit(PROCESSING_TIME_UNIT_OPTIONS[1]);
      setFailedDeliveryPolicy(FAILED_DELIVERY_OPTIONS[2]);
      setDeliveryNotes("");
    } catch (e) {
      setErr(e.response?.data?.error || e.message || "Could not save policy");
    } finally {
      setBusy(false);
    }
  };

  const CheckBlock = ({ label, items, compact }) => (
    <div
      style={{
        marginBottom: compact ? "8px" : "10px",
        ...(compact
          ? { maxHeight: "132px", overflowY: "auto", paddingRight: "4px" }
          : {}),
      }}
    >
      <div
        style={{
          fontWeight: 600,
          fontSize: "12px",
          marginBottom: "4px",
          color: "#333",
        }}
      >
        {label}
      </div>
      <ul
        style={{
          margin: 0,
          paddingLeft: "18px",
          fontSize: "12px",
          color: "#444",
          lineHeight: 1.35,
        }}
      >
        {items.length === 0 ? (
          <li style={{ color: "#999" }}>None yet — add below</li>
        ) : (
          items.map((c, i) => (
            <li key={i} style={{ marginBottom: "2px" }}>
              <strong>{c.title}</strong>
              {c.content ? (
                <span style={{ color: "#666", wordBreak: "break-word" }}>
                  {" "}
                  — {c.content.slice(0, 80)}
                  {c.content.length > 80 ? "…" : ""}
                </span>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </div>
  );

  return (
    <div
      style={overlayStyle}
      role="dialog"
      aria-modal="true"
      aria-labelledby="policy-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div style={panelShellStyle} onClick={(e) => e.stopPropagation()}>
        <div style={panelScrollStyle}>
          <h3
            id="policy-modal-title"
            style={{ margin: "0 0 6px", fontSize: "17px", color: "#111" }}
          >
            {singleTarget ? targetTitleMap[singleTarget] : "Shop policies"}
          </h3>
          <p style={{ margin: "0 0 10px", fontSize: "13px", color: "#555", lineHeight: 1.4 }}>
            {singleTarget
              ? targetDescriptionMap[singleTarget]
              : "Draft a policy title and description, then attach it to refund, delivery, or custom policies."}
          </p>

          {singleTarget === "refund" ? (
            <CheckBlock label="Current refund policy items" items={refundClauses} />
          ) : null}
          {singleTarget === "custom" ? (
            <CheckBlock label="Current custom policies" items={customPolicies} />
          ) : null}
          {!singleTarget ? (
            <>
              <CheckBlock label="Refund policy items" items={refundClauses} />
              <CheckBlock label="Delivery policy items" items={deliveryClauses} />
              <CheckBlock label="Custom policies" items={customPolicies} />
            </>
          ) : null}

          {singleTarget === "delivery" ? (
            <>
            <div style={{ marginTop: "2px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#333" }}>
                Delivery timeline
              </label>
              <select
                value={deliveryTimeline}
                onChange={(e) => setDeliveryTimeline(e.target.value)}
                style={{ ...inputStyle, marginTop: "3px", ...fieldStackStyle }}
              >
                {DELIVERY_TIMELINE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#333" }}>
                Delivery location
              </label>
              <select
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                style={{
                  ...inputStyle,
                  marginTop: "3px",
                  ...fieldStackStyle,
                }}
              >
                {DELIVERY_LOCATION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#333" }}>
                Delivery method
              </label>
              <select
                value={deliveryMethod}
                onChange={(e) => setDeliveryMethod(e.target.value)}
                style={{ ...inputStyle, marginTop: "3px", ...fieldStackStyle }}
              >
                {DELIVERY_METHOD_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#333" }}>
                Processing time before shipping
              </label>
              <div
                style={{
                  height: "fit-content",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "3px",
                  ...fieldStackStyle,
                  flexWrap: "wrap",
                }}
              >
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={processingTimeValue}
                  onChange={(e) => setProcessingTimeValue(e.target.value)}
                  style={{ ...inputStyle, margin: 0, minWidth: "72px", maxWidth: "120px", height: "fit-content" }}
                />
                <select
                  value={processingTimeUnit}
                  onChange={(e) => setProcessingTimeUnit(e.target.value)}
                  style={{ ...inputStyle, margin: 0, maxWidth: "120px", height: "fit-content" }}
                >
                  {PROCESSING_TIME_UNIT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#333",
                  display: "block",
                  marginTop: "2px",
                }}
              >
                If customer is not available
              </label>
              <select
                value={failedDeliveryPolicy}
                onChange={(e) => setFailedDeliveryPolicy(e.target.value)}
                style={{ ...inputStyle, marginTop: "3px", ...fieldStackStyle }}
              >
                {FAILED_DELIVERY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            
            {/* <CheckBlock
              compact
              label="Saved delivery policy items"
              items={deliveryClauses}
            /> */}
            </>
          ) : (
            <div style={{ marginTop: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#333" }}>
                Policy title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={targetPlaceholderMap[activeTarget].title}
                style={{ ...inputStyle, marginTop: "4px", marginBottom: "10px" }}
              />
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#333" }}>
                Policy description
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={targetPlaceholderMap[activeTarget].content}
                rows={4}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  marginTop: "4px",
                  minHeight: "88px",
                }}
              />
            </div>
          )}

        {err ? (
          <p style={{ color: "#b91c1c", fontSize: "12px", margin: "10px 0 0" }}>
            {err}
          </p>
        ) : null}
        </div>

        <div style={panelFooterStyle}>
          {singleTarget ? (
            <button
              type="button"
              style={btnOutline}
              disabled={busy}
              onClick={() => add(singleTarget)}
            >
              {busy ? "Saving…" : `Save ${targetLabelMap[singleTarget]}`}
            </button>
          ) : (
            <>
              <button
                type="button"
                style={btnOutline}
                disabled={busy}
                onClick={() => add("refund")}
              >
                Add to refund
              </button>
              <button
                type="button"
                style={btnOutline}
                disabled={busy}
                onClick={() => add("delivery")}
              >
                Add to delivery
              </button>
              <button
                type="button"
                style={btnOutline}
                disabled={busy}
                onClick={() => add("custom")}
              >
                Add custom
              </button>
            </>
          )}
          <button
            type="button"
            style={btnFooterSecondary}
            disabled={busy}
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
