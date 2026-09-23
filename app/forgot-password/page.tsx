"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center px-6">
          <p className="text-sm text-ivory/60">Loading…</p>
        </main>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/reset-password")}`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
    } else {
      setStatus("sent");
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="mb-2 text-center text-sm uppercase tracking-[0.3em] text-gold">reveal.</p>
        <h1 className="mb-3 text-center text-2xl">Reset your password</h1>
        <p className="mb-8 text-center text-sm leading-6 text-ivory/60">
          Enter the email you use for reveal. We&apos;ll send you a secure link to choose a new password.
        </p>

        {status === "sent" ? (
          <div className="space-y-5 text-center">
            <p className="text-ivory/80">
              If an account exists for <span className="text-gold">{email}</span>, a password reset link has been sent.
            </p>
            <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-sm text-gold underline-offset-4 hover:underline">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-ivory/20 bg-transparent px-4 py-3 text-ivory placeholder:text-ivory/40 focus:border-gold focus:outline-none"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition hover:bg-gold/90 disabled:opacity-60"
            >
              {status === "sending" ? "Sending…" : "Send reset link"}
            </button>
            {status === "error" && <p className="text-sm text-red-400">{errorMsg}</p>}
            <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-center text-sm text-ivory/60 underline-offset-4 hover:text-gold hover:underline">
              Back to sign in
            </Link>
          </form>
        )}
      </div>
    </main>
  );
}
