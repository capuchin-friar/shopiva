"use client";

export default function SaveBtn({ onClick, disabled = false, label = "Save" }) {
  return (
    <div
      className="save-btn-cnt"
      style={{
        width: "100%",
        height: "60px",
        position: "fixed",
        bottom: 0,
        padding: "10px",
        paddingBottom: "calc(10px + env(safe-area-inset-bottom, 0px))",
        left: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#fff",
        boxSizing: "border-box",
        zIndex: 100050,
        boxShadow: "0 -4px 20px rgba(0,0,0,0.06)",
      }}
    >
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        style={{
          background: "#000",
          width: "100%",
          height: 44,
          color: "#fff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 8,
          border: "none",
          fontWeight: 600,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.65 : 1,
        }}
      >
        {label}
      </button>
    </div>
  );
}
