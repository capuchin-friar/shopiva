"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Redirects to unified auth password-recovery confirm-email (entrepreneur).
 */
export default function EntrepreneurConfirmEmailRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/auth/password-recovery/confirm-email?role=entrepreneur");
  }, [router]);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "linear-gradient(135deg, #00ccff, #4caf50)" }}>
      <p style={{ color: "#fff" }}>Redirecting…</p>
    </div>
  );
}
