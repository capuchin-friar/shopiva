"use client";

import { useState } from "react";
import FieldEditorModal from "./FieldEditorModal";
import VerificationDocumentModal from "./VerificationDocumentModal";
import BvnVerificationModal from "./BvnVerificationModal";
import PolicyClauseModal from "./PolicyClauseModal";
import BusinessAvailabilityModal from "./BusinessAvailabilityModal";

/**
 * @param {"category"|"text"|"textarea"|"availability"|"businessAvailability"|"select"|"verificationUpload"|"bvn"|"policyBuilder"} [mode]
 * @param {string} [shopId] — required for upload / BVN / policy / persisted field saves via parent
 * @param {() => void|Promise<void>} [onComplete] — refresh dashboard after server save
 * @param {string} [verificationDocKey] — e.g. idCard, proofOfAddress, cacDocument
 * @param {object} [policies] — shop_policies row for policyBuilder checklist
 * @param {"refund"|"delivery"|"custom"} [policyTarget] — target policy type for policyBuilder
 * @param {string} [helpText] — verification upload hint
 * @param {string} [bvnInitialLast4] — show if BVN already verified
 * @param {object} [initialBusinessAvailability] — { perDay: [{ day, startTime, endTime }] } (legacy `{ days, startTime, endTime }` still loads)
 */
export default function AddBtn({
  action,
  mode,
  title,
  initialValue,
  onSave,
  options,
  placeholder,
  selectPlaceholder,
  shopId,
  onComplete,
  verificationDocKey,
  policies,
  policyTarget,
  helpText,
  bvnInitialLast4,
  initialBusinessAvailability,
}) {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (mode) {
      setOpen(true);
      return;
    }
    (action ?? (() => {}))();
  };

  let modal = null;
  if (mode === "verificationUpload") {
    modal = (
      <VerificationDocumentModal
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        shopId={shopId}
        docKey={verificationDocKey}
        onComplete={onComplete}
        helpText={helpText}
      />
    );
  } else if (mode === "bvn") {
    modal = (
      <BvnVerificationModal
        open={open}
        onClose={() => setOpen(false)}
        shopId={shopId}
        onComplete={onComplete}
        initialLast4={bvnInitialLast4}
      />
    );
  } else if (mode === "businessAvailability") {
    modal = (
      <BusinessAvailabilityModal
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        initialBusinessAvailability={initialBusinessAvailability}
        onSave={onSave}
      />
    );
  } else if (mode === "policyBuilder") {
    modal = (
      <PolicyClauseModal
        open={open}
        onClose={() => setOpen(false)}
        shopId={shopId}
        policies={policies}
        policyTarget={policyTarget}
        onComplete={onComplete}
      />
    );
  } else if (mode) {
    modal = (
      <FieldEditorModal
        open={open}
        onClose={() => setOpen(false)}
        mode={mode}
        title={title}
        initialValue={initialValue}
        onSave={onSave}
        options={options}
        placeholder={placeholder}
        selectPlaceholder={selectPlaceholder}
      />
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        style={{
          borderRadius: "50%",
          fontWeight: "bold",
          padding: "0px",
          height: "25px",
          width: "25px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#fff",
          border: "2px solid #005c45",
          color: "#005c45",
          cursor: "pointer",
        }}
      >
        +
      </button>
      {modal}
    </>
  );
}
