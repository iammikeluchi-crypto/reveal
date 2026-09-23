"use client";

import { useState } from "react";
import { submitRsvp } from "./actions";

export default function RsvpForm({ invitationId }: { invitationId: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [attendance, setAttendance] = useState<"yes" | "no" | "maybe">("yes");
  const [guestCount, setGuestCount] = useState(1);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError("");
    try {
      await submitRsvp({
        invitationId,
        guest_name: name,
        guest_email: email || null,
        attendance,
        guest_count: guestCount,
        note: note || null,
      });
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "done") {
    return (
      <p className="text-center text-gold">
        Thank you, {name}! Your RSVP has been received.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-3">
      <input
        required
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="input"
      />
      <input
        type="email"
        placeholder="Email (optional)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input"
      />
      <div className="grid grid-cols-3 gap-2">
        {(["yes", "maybe", "no"] as const).map((opt) => (
          <button
            type="button"
            key={opt}
            onClick={() => setAttendance(opt)}
            className={`rounded-lg border px-3 py-2 text-xs uppercase ${
              attendance === opt ? "border-gold text-gold" : "border-ivory/20 text-ivory/70"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {attendance === "yes" && (
        <input
          type="number"
          min={1}
          value={guestCount}
          onChange={(e) => setGuestCount(Number(e.target.value))}
          className="input"
        />
      )}
      <textarea
        placeholder="Note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        className="input"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={status === "saving"}
        className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink hover:bg-gold/90 disabled:opacity-60"
      >
        {status === "saving" ? "Sending…" : "Submit RSVP"}
      </button>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgba(247, 245, 240, 0.2);
          background: transparent;
          padding: 0.75rem 1rem;
          color: #f7f5f0;
        }
        .input:focus {
          border-color: #c9a15a;
          outline: none;
        }
      `}</style>
    </form>
  );
}
