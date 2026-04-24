import { Suspense } from "react";
import SignupPageClient from "./SignupPageClient";

export const dynamic = "force-dynamic";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-muted">Loading…</div>}>
      <SignupPageClient />
    </Suspense>
  );
}
