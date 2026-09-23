"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"checking" | "ready" | "saving" | "success" | "error">("checking");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) {
        setStatus("error");
        setErrorMsg("This password reset link is invalid or has expired. Please request a new one.");
      } else {
        setStatus("ready");
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (password.length < 6) {
      setStatus("error");
      setErrorMsg("Your password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("error");
      setErrorMsg("The passwords do not match.");
      return;
    }

    setStatus("saving");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
    } else {
      setStatus("success");
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="mb-2 text-center text-sm uppercase tracking-[0.3em] text-gold">reveal.</p>
        <h1 className="mb-3 text-center text-2xl">Choose a new password</h1>
        <p className="mb-8 text-center text-sm leading-6 text-ivory/60">Create a new password for your reveal. account.</p>

        {status === "checking" && <p className="text-center text-sm text-ivory/60">Checking your reset link…</p>}

        {status === "success" && (
          <div className="space-y-5 text-center">
            <p className="text-ivory/80">Your password has been updated successfully.</p>
            <Link href="/login" className="inline-block rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink">
              Sign in
            </Link>
          </div>
        )}

        {(status === "ready" || status === "saving" || (status === "error" && !errorMsg.includes("reset link"))) && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-ivory/20 bg-transparent px-4 py-3 text-ivory placeholder:text-ivory/40 focus:border-gold focus:outline-none"
            />
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="rounded-lg border border-ivory/20 bg-transparent px-4 py-3 text-ivory placeholder:text-ivory/40 focus:border-gold focus:outline-none"
            />
            <button
              type="submit"
              disabled={status === "saving"}
              className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition hover:bg-gold/90 disabled:opacity-60"
            >
              {status === "saving" ? "Updating…" : "Update password"}
            </button>
            {status === "error" && <p className="text-sm text-red-400">{errorMsg}</p>}
          </form>
        )}

        {status === "error" && errorMsg.includes("reset link") && (
          <div className="mt-5 text-center">
            <Link href="/forgot-password" className="text-sm text-gold underline-offset-4 hover:underline">Request a new reset link</Link>
          </div>
        )}
      </div>
    </main>
  );
}
