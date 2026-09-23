"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { makeSlug } from "@/lib/slug";

export type CreateInvitationInput = {
  template: string;
  title: string;
  event_date: string | null;
  event_time: string | null;
  venue: string | null;
  message: string | null;
};

export async function createInvitation(input: CreateInvitationInput) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/create");
  }

  let slug = makeSlug(input.title);

  // Guard against the rare slug collision (unique constraint on invitations.slug).
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await supabase
      .from("invitations")
      .insert({
        owner_id: user!.id,
        slug,
        template: input.template,
        title: input.title,
        event_date: input.event_date,
        event_time: input.event_time,
        venue: input.venue,
        message: input.message,
        status: "draft",
      })
      .select("id, slug")
      .single();

    if (!error && data) {
      return { id: data.id, slug: data.slug };
    }

    if (error && error.code === "23505") {
      // unique_violation on slug — try again with a new suffix.
      slug = makeSlug(input.title);
      continue;
    }

    throw new Error(error?.message ?? "Failed to create invitation");
  }

  throw new Error("Could not generate a unique invitation link. Please try again.");
}

export async function publishInvitation(invitationId: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/create");
  }

  const { data, error } = await supabase
    .from("invitations")
    .update({ status: "published" })
    .eq("id", invitationId)
    .eq("owner_id", user!.id)
    .select("slug")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to publish invitation");
  }

  return { slug: data.slug };
}
