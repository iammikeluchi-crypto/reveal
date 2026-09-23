import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RsvpForm from "./rsvp-form";
import ViewTracker from "./view-tracker";
import ShareButton from "./share-button";

export default async function GuestInvitationPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();

  const { data: invitation } = await supabase
    .from("invitations")
    .select("id, title, event_date, event_time, venue, message, template")
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();

  if (!invitation) {
    notFound();
  }

  const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/i/${params.slug}`;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <ViewTracker invitationId={invitation.id} />

      <p className="text-xs uppercase tracking-[0.4em] text-gold">
        {invitation.template}
      </p>
      <h1 className="max-w-lg text-3xl font-display md:text-5xl">
        {invitation.title}
      </h1>

      {(invitation.event_date || invitation.event_time || invitation.venue) && (
        <div className="flex flex-col gap-1 text-ivory/80">
          {invitation.event_date && <p>{invitation.event_date}</p>}
          {invitation.event_time && <p>{invitation.event_time}</p>}
          {invitation.venue && <p>{invitation.venue}</p>}
        </div>
      )}

      {invitation.message && (
        <p className="max-w-md text-ivory/70">{invitation.message}</p>
      )}

      <ShareButton invitationId={invitation.id} title={invitation.title} url={url} />

      <div className="mt-10 w-full">
        <h2 className="mb-4 text-lg text-ivory/80">RSVP</h2>
        <div className="flex justify-center">
          <RsvpForm invitationId={invitation.id} />
        </div>
      </div>
    </main>
  );
}
