import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: invitations } = await supabase
    .from("invitations")
    .select("id, slug, title, template, status, event_date, views, shares")
    .eq("owner_id", user!.id)
    .order("created_at", { ascending: false });

  const list = invitations ?? [];

  // RSVP counts per invitation, in one query.
  const ids = list.map((i) => i.id);
  const { data: rsvps } = ids.length
    ? await supabase.from("rsvps").select("invitation_id, attendance").in("invitation_id", ids)
    : { data: [] as { invitation_id: string; attendance: string }[] };

  const rsvpCountByInvitation = new Map<string, number>();
  for (const r of rsvps ?? []) {
    rsvpCountByInvitation.set(
      r.invitation_id,
      (rsvpCountByInvitation.get(r.invitation_id) ?? 0) + 1
    );
  }

  const totals = {
    total: list.length,
    published: list.filter((i) => i.status === "published").length,
    views: list.reduce((sum, i) => sum + (i.views ?? 0), 0),
    shares: list.reduce((sum, i) => sum + (i.shares ?? 0), 0),
    rsvps: rsvps?.length ?? 0,
  };

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-16">
      <div className="mb-10 flex items-center justify-between">
        <p className="text-sm uppercase tracking-[0.3em] text-gold">reveal.</p>
        <Link
          href="/create"
          className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-ink hover:bg-gold/90"
        >
          + New invitation
        </Link>
      </div>

      <h1 className="mb-8 text-3xl">Your dashboard</h1>

      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-5">
        <Stat label="Invitations" value={totals.total} />
        <Stat label="Published" value={totals.published} />
        <Stat label="Views" value={totals.views} />
        <Stat label="Shares" value={totals.shares} />
        <Stat label="RSVPs" value={totals.rsvps} />
      </div>

      {list.length === 0 ? (
        <p className="text-ivory/60">
          No invitations yet.{" "}
          <Link href="/create" className="text-gold underline">
            Create your first one
          </Link>
          .
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {list.map((inv) => (
            <div
              key={inv.id}
              className="flex flex-col justify-between gap-3 rounded-lg border border-ivory/15 p-4 sm:flex-row sm:items-center"
            >
              <div>
                <p className="font-semibold">{inv.title || "Untitled"}</p>
                <p className="text-xs text-ivory/50">
                  {inv.template} · {inv.event_date ?? "no date set"} ·{" "}
                  <span
                    className={
                      inv.status === "published" ? "text-gold" : "text-ivory/50"
                    }
                  >
                    {inv.status}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs text-ivory/60">
                <span>{inv.views ?? 0} views</span>
                <span>{inv.shares ?? 0} shares</span>
                <span>{rsvpCountByInvitation.get(inv.id) ?? 0} RSVPs</span>
                {inv.status === "published" && (
                  <Link href={`/i/${inv.slug}`} className="text-gold underline">
                    View
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-ivory/15 p-4 text-center">
      <p className="text-2xl font-semibold text-gold">{value}</p>
      <p className="text-xs text-ivory/60">{label}</p>
    </div>
  );
}
