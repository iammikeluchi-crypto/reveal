"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "signing-in" | "sending-link" | "sent" | "error";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center px-6">
          <p className="text-sm text-ivory/60">Loading…</p>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setStatus("signing-in");
    setErrorMsg("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }

    window.location.assign(next);
  }

  async function handleMagicLink() {
    if (!email) {
      setStatus("error");
      setErrorMsg("Enter your email address first.");
      return;
    }

    setStatus("sending-link");
    setErrorMsg("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

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
        <h1 className="mb-8 text-center text-2xl">Sign in to your account</h1>

        {status === "sent" ? (
          <div className="space-y-5 text-center">
            <p className="text-ivory/80">
              Check <span className="text-gold">{email}</span> for your magic link.
            </p>
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="text-sm text-gold underline underline-offset-4"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <form onSubmit={handlePasswordLogin} className="flex flex-col gap-4">
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg border border-ivory/20 bg-transparent px-4 py-3 text-ivory placeholder:text-ivory/40 focus:border-gold focus:outline-none"
              />
              <input
                type="password"
                required
                minLength={6}
                autoComplete="current-password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-lg border border-ivory/20 bg-transparent px-4 py-3 text-ivory placeholder:text-ivory/40 focus:border-gold focus:outline-none"
              />
              <div className="-mt-2 text-right">
                <Link href={`/forgot-password?next=${encodeURIComponent(next)}`} className="text-sm text-gold underline-offset-4 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <button
                type="submit"
                disabled={status === "signing-in" || status === "sending-link"}
                className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition hover:bg-gold/90 disabled:opacity-60"
              >
                {status === "signing-in" ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <div className="flex items-center gap-3 py-1 text-xs uppercase tracking-widest text-ivory/40">
              <span className="h-px flex-1 bg-ivory/10" />
              <span>or</span>
              <span className="h-px flex-1 bg-ivory/10" />
            </div>

            <button
              type="button"
              onClick={handleMagicLink}
              disabled={status === "signing-in" || status === "sending-link"}
              className="rounded-full border border-ivory/20 px-6 py-3 text-sm font-semibold text-ivory transition hover:border-gold hover:text-gold disabled:opacity-60"
            >
              {status === "sending-link" ? "Sending link…" : "Email me a magic link"}
            </button>

            {status === "error" && <p className="text-sm text-red-400">{errorMsg}</p>}
          </div>
        )}
      </div>
    </main>
  );
}
