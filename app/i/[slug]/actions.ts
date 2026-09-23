"use server";

import { createClient } from "@/lib/supabase/server";

export type RsvpInput = {
  invitationId: string;
  guest_name: string;
  guest_email: string | null;
  attendance: "yes" | "no" | "maybe";
  guest_count: number;
  note: string | null;
};

export async function submitRsvp(input: RsvpInput) {
  const supabase = createClient();

  const { error } = await supabase.from("rsvps").insert({
    invitation_id: input.invitationId,
    guest_name: input.guest_name,
    guest_email: input.guest_email,
    attendance: input.attendance,
    guest_count: input.guest_count,
    note: input.note,
  });

  if (error) {
    throw new Error(error.message);
  }

  // Log the rsvp event for analytics too (best-effort, non-fatal).
  await supabase
    .from("invitation_events")
    .insert({ invitation_id: input.invitationId, event_type: "rsvp" });

  return { ok: true };
}

export async function trackEvent(
  invitationId: string,
  eventType: "view" | "share" | "calendar_click"
) {
  const supabase = createClient();
  await supabase.from("invitation_events").insert({
    invitation_id: invitationId,
    event_type: eventType,
  });

  if (eventType === "view" || eventType === "share") {
    await supabase.rpc("increment_invitation_metric", {
      p_invitation_id: invitationId,
      p_metric: eventType === "view" ? "views" : "shares",
    });
  }
}
