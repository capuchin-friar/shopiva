import { Suspense } from "react";
import ResetPasswordPageClient from "./ResetPasswordPageClient";

export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-muted">Loading…</div>}>
      <ResetPasswordPageClient />
    </Suspense>
  );
}
