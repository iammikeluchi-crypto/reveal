"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "./actions";

export default function ViewTracker({ invitationId }: { invitationId: string }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackEvent(invitationId, "view").catch(() => {
      // Non-fatal — never block the guest experience on analytics.
    });
  }, [invitationId]);

  return null;
}
