import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="max-w-sm mx-auto mt-20">
      <h1 className="font-display text-2xl font-semibold text-ink mb-2">Sign in</h1>
      <p className="text-ink-soft text-sm mb-6">Use your work email — we'll send a link, no password needed.</p>
      <Suspense fallback={<p className="text-sm text-ink-soft">Loading...</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
