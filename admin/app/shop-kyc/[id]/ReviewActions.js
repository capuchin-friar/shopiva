"use client";

import { useState } from 'react';

export default function ReviewActions({ shopId, docKey }) {
  const [busy, setBusy] = useState(false);

  const submitAction = async (action) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/shop-kyc/${shopId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, docKey }),
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || 'Unable to update document status');
      }

      window.alert(`Document ${action === 'approve' ? 'approved' : 'rejected'} successfully.`);
      window.location.reload();
    } catch (error) {
      window.alert(error.message ?? String(error));
      setBusy(false);
    }
  };

  return (
    <div className="review-actions">
      <button type="button" disabled={busy} onClick={() => submitAction('approve')} className="review-button approve">
        Approve
      </button>
      <button type="button" disabled={busy} onClick={() => submitAction('reject')} className="review-button reject">
        Reject
      </button>
    </div>
  );
}
