"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createInvitation, publishInvitation } from "./actions";

const TEMPLATES = [
  "Luxury Reveal",
  "Minimal",
  "Wedding",
  "Birthday",
  "Celebration",
  "Corporate",
  "Church",
  "Sports",
];

export default function CreateInvitationPage() {
  const router = useRouter();
  const [template, setTemplate] = useState(TEMPLATES[0]);
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [venue, setVenue] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<{ id: string; slug: string } | null>(null);

  async function handleSaveDraft(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const result = await createInvitation({
        template,
        title,
        event_date: eventDate || null,
        event_time: eventTime || null,
        venue: venue || null,
        message: message || null,
      });
      setSaved(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!saved) return;
    setSaving(true);
    setError("");
    try {
      const { slug } = await publishInvitation(saved.id);
      router.push(`/i/${slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-gold">
          Draft saved
        </p>
        <h1 className="mb-4 text-2xl">Your invitation link:</h1>
        <p className="mb-8 rounded-lg border border-ivory/20 px-4 py-3 text-gold">
          /i/{saved.slug}
        </p>
        <p className="mb-6 text-sm text-ivory/60">
          It&apos;s still a draft — guests can&apos;t see it until you
          publish.
        </p>
        <button
          onClick={handlePublish}
          disabled={saving}
          className="rounded-full bg-gold px-8 py-3 text-sm font-semibold text-ink hover:bg-gold/90 disabled:opacity-60"
        >
          {saving ? "Publishing…" : "Publish invitation"}
        </button>
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-xl px-6 py-16">
      <p className="mb-2 text-sm uppercase tracking-[0.3em] text-gold">
        reveal.
      </p>
      <h1 className="mb-8 text-3xl">Create your invitation</h1>

      <form onSubmit={handleSaveDraft} className="flex flex-col gap-6">
        <div>
          <label className="mb-2 block text-sm text-ivory/70">Template</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TEMPLATES.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setTemplate(t)}
                className={`rounded-lg border px-3 py-2 text-xs ${
                  template === t
                    ? "border-gold text-gold"
                    : "border-ivory/20 text-ivory/70"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <Field label="Title">
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ama & Kofi's Wedding"
            className="input"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Date">
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Time">
            <input
              type="time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              className="input"
            />
          </Field>
        </div>

        <Field label="Venue">
          <input
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            placeholder="La Villa, Accra"
            className="input"
          />
        </Field>

        <Field label="Message">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Join us as we celebrate..."
            className="input"
          />
        </Field>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-gold px-8 py-3 text-sm font-semibold text-ink hover:bg-gold/90 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save draft"}
        </button>
      </form>

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
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-ivory/70">{label}</label>
      {children}
    </div>
  );
}
