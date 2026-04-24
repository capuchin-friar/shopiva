"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Redirects to unified auth reset-password (entrepreneur), preserving token.
 */
export default function EntrepreneurResetPasswordRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  useEffect(() => {
    const token = searchParams.get("token");
    const q = new URLSearchParams({ role: "entrepreneur" });
    if (token) q.set("token", token);
    router.replace(`/auth/password-recovery/reset-password?${q.toString()}`);
  }, [router, searchParams]);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "linear-gradient(135deg, #00ccff, #4caf50)" }}>
      <p style={{ color: "#fff" }}>Redirecting…</p>
    </div>
  );
}
