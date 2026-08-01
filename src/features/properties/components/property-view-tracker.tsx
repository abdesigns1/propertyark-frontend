"use client";

import { useEffect, useRef } from "react";
import { propertyService } from "@/services/property.service";
import { useAuthStore } from "@/store/auth.store";

/**
 * Opens the authenticated single-property endpoint once per detail-page mount.
 * The backend owns view counting so uniqueness and persistence stay consistent.
 */
export function PropertyViewTracker({ propertyId }: { propertyId: string }) {
  const tracked = useRef(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);

  useEffect(() => {
    if (
      tracked.current ||
      !isAuthenticated ||
      !["buyer", "user"].includes(role ?? "")
    ) {
      return;
    }

    tracked.current = true;
    // Analytics must never prevent the visitor from reading the listing.
    void propertyService.getById(propertyId).catch(() => undefined);
  }, [isAuthenticated, propertyId, role]);

  return null;
}
