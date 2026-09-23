import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="mb-4 text-sm uppercase tracking-[0.3em] text-gold">reveal.</p>
      <h1 className="max-w-2xl text-4xl font-display leading-tight md:text-6xl">
        Don&apos;t just send an invitation.
        <br />
        Send an experience.
      </h1>
      <p className="mt-6 max-w-md text-ivory/70">
        Cinematic, interactive digital invitations — built to be opened on a
        phone, shared on WhatsApp, and remembered.
      </p>
      <div className="mt-10 flex gap-4">
        <Link
          href="/create"
          className="rounded-full bg-gold px-8 py-3 text-sm font-semibold text-ink transition hover:bg-gold/90"
        >
          Create an invitation
        </Link>
        <Link
          href="/login"
          className="rounded-full border border-ivory/30 px-8 py-3 text-sm font-semibold text-ivory transition hover:border-ivory"
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}
