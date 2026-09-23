"use client";

import { trackEvent } from "./actions";

export default function ShareButton({
  invitationId,
  title,
  url,
}: {
  invitationId: string;
  title: string;
  url: string;
}) {
  function handleShare() {
    trackEvent(invitationId, "share").catch(() => {});
    const text = encodeURIComponent(
      `You're invited to celebrate with us ✨\n${title}\nOpen your invitation:\n${url}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  return (
    <button
      onClick={handleShare}
      className="rounded-full border border-ivory/30 px-6 py-3 text-sm font-semibold text-ivory hover:border-gold hover:text-gold"
    >
      Share on WhatsApp
    </button>
  );
}
