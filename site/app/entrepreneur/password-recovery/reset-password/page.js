import { Suspense } from "react";
import ResetPasswordRedirectClient from "./ResetPasswordRedirectClient";

export const dynamic = "force-dynamic";

export default function EntrepreneurResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-muted">Redirecting…</div>}>
      <ResetPasswordRedirectClient />
    </Suspense>
  );
}
