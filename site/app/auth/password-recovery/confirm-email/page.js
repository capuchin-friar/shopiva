import { Suspense } from "react";
import ConfirmEmailPageClient from "./ConfirmEmailPageClient";

export const dynamic = "force-dynamic";

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-muted">Loading…</div>}>
      <ConfirmEmailPageClient />
    </Suspense>
  );
}
