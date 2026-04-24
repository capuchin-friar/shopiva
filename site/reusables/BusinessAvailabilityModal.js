"use client";

import { useEffect, useState } from "react";

const BUSINESS_DAY_OPTIONS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

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

const panelStyle = {
  background: "#fff",
  borderRadius: "12px",
  maxWidth: "540px",
  width: "min(540px, calc(100vw - 32px))",
  maxHeight: "calc(100vh - 32px)",
  boxSizing: "border-box",
  margin: "auto 0",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
};

const scrollStyle = {
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  padding: "18px 20px 10px",
  boxSizing: "border-box",
};

const timeInputStyle = {
  padding: "8px 10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "14px",
  boxSizing: "border-box",
  maxWidth: "130px",
};

const btnPrimary = {
  padding: "6px 12px",
  borderRadius: "6px",
  border: "none",
  background: "#005c45",
  color: "#fff",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: 600,
  height: "fit-content"
};

const btnSecondary = {
  padding: "6px 12px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  background: "#fff",
  color: "#333",
  height: "fit-content",
  cursor: "pointer",
  fontSize: "12px",
};

function defaultRows() {
  return BUSINESS_DAY_OPTIONS.map((day) => ({
    day,
    enabled: false,
    startTime: "09:00",
    endTime: "18:00",
  }));
}

/** Build row state from saved `businessAvailability` (new or legacy). */
function rowsFromInitial(initial) {
  const rows = defaultRows();
  const o = initial && typeof initial === "object" ? initial : null;
  if (!o) {
    rows.forEach((r, i) => {
      if (i < 6) {
        r.enabled = true;
      }
    });
    return rows;
  }

  if (Array.isArray(o.perDay) && o.perDay.length > 0) {
    const byDay = new Map(
      o.perDay
        .filter(
          (e) =>
            e &&
            typeof e.day === "string" &&
            typeof e.startTime === "string" &&
            typeof e.endTime === "string"
        )
        .map((e) => [e.day, { startTime: e.startTime, endTime: e.endTime }])
    );
    rows.forEach((r) => {
      const slot = byDay.get(r.day);
      if (slot) {
        r.enabled = true;
        r.startTime = slot.startTime;
        r.endTime = slot.endTime;
      }
    });
    return rows;
  }

  const days = Array.isArray(o.days)
    ? o.days.filter((d) => typeof d === "string")
    : [];
  const startTime =
    typeof o.startTime === "string" && o.startTime ? o.startTime : "09:00";
  const endTime =
    typeof o.endTime === "string" && o.endTime ? o.endTime : "18:00";
  if (days.length > 0) {
    const set = new Set(days);
    rows.forEach((r) => {
      if (set.has(r.day)) {
        r.enabled = true;
        r.startTime = startTime;
        r.endTime = endTime;
      }
    });
  }
  return rows;
}

/**
 * Per-day business hours, stored on `location.businessAvailability` as `{ perDay: [{ day, startTime, endTime }] }`.
 */
export default function BusinessAvailabilityModal({
  open,
  onClose,
  title = "Business availability",
  initialBusinessAvailability,
  onSave,
}) {
  const [rows, setRows] = useState(defaultRows);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!open) return;
    setRows(rowsFromInitial(initialBusinessAvailability));
    setErr(null);
  }, [open, initialBusinessAvailability]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const updateRow = (day, patch) => {
    setRows((prev) =>
      prev.map((r) => (r.day === day ? { ...r, ...patch } : r))
    );
  };

  const save = async () => {
    const active = rows.filter((r) => r.enabled);
    if (active.length === 0) {
      setErr("Turn on at least one day and set its hours.");
      return;
    }
    for (const r of active) {
      if (!r.startTime || !r.endTime) {
        setErr(`Set open and close times for ${r.day}.`);
        return;
      }
      if (r.startTime >= r.endTime) {
        setErr(`On ${r.day}, close time must be after open time.`);
        return;
      }
    }
    const perDay = active
      .map((r) => ({
        day: r.day,
        startTime: r.startTime,
        endTime: r.endTime,
      }))
      .sort(
        (a, b) =>
          BUSINESS_DAY_OPTIONS.indexOf(a.day) -
          BUSINESS_DAY_OPTIONS.indexOf(b.day)
      );
    setBusy(true);
    setErr(null);
    try {
      await Promise.resolve(onSave?.({ perDay }));
      onClose();
    } catch (e) {
      setErr(e?.message || "Could not save.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={overlayStyle}
      role="dialog"
      aria-modal="true"
      aria-labelledby="biz-avail-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        <div style={scrollStyle}>
          <h3
            id="biz-avail-title"
            style={{ margin: "0 0 6px", fontSize: "17px", color: "#111" }}
          >
            {title}
          </h3>
          <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#555", lineHeight: 1.4 }}>
            Set hours for each day you are open (sales, support, delivery/pickup). Each day can
            have different times.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            {rows.map((r) => (
              <div
                key={r.day}
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr 1fr",
                  gap: "8px",
                  alignItems: "center",
                }}
              >
                <label
                  title={r.day}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#333",
                    minWidth: "108px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={r.enabled}
                    onChange={(e) =>
                      updateRow(r.day, { enabled: e.target.checked })
                    }
                  />
                  <span>{r.day.slice(0, 3)}</span>
                </label>
                <input
                  type="time"
                  value={r.startTime}
                  onChange={(e) =>
                    updateRow(r.day, { startTime: e.target.value })
                  }
                  disabled={!r.enabled}
                  style={{
                    ...timeInputStyle,
                    opacity: r.enabled ? 1 : 0.45,
                    width: "50%",
                  }}
                  aria-label={`${r.day} opens`}
                />
                <input
                  type="time"
                  value={r.endTime}
                  onChange={(e) =>
                    updateRow(r.day, { endTime: e.target.value })
                  }
                  disabled={!r.enabled}
                  style={{
                    ...timeInputStyle,
                    opacity: r.enabled ? 1 : 0.45,
                    width: "50%",
                  }}
                  aria-label={`${r.day} closes`}
                />
              </div>
            ))}
          </div>
          <p style={{ margin: 0, fontSize: "11px", color: "#6b7280" }}>
            Turn on a day, then set its open and close times (hover abbreviated names for full
            weekday).
          </p>

          {err ? (
            <p style={{ color: "#b91c1c", fontSize: "12px", margin: "8px 0 0" }}>
              {err}
            </p>
          ) : null}
        </div>

        <div
          style={{
            flexShrink: 0,
            display: "flex",
            justifyContent: "flex-end",
            gap: "8px",
            padding: "10px 20px 16px",
            borderTop: "1px solid #eee",
            height: "fit-content",
            background: "#fff",
          }}
        >
          <button type="button" style={btnSecondary} disabled={busy} onClick={onClose}>
            Cancel
          </button>
          <button type="button" style={btnPrimary} disabled={busy} onClick={save}>
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
