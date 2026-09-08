"use client";

import { useEffect, useRef } from "react";
import { propertyService } from "@/services/property.service";
import { useAuthStore } from "@/store/auth.store";
import { useAccountKey } from "@/lib/account-identity";
import { recordRecentlyViewedProperty } from "@/features/properties/lib/recently-viewed-properties";

/**
 * Opens the authenticated single-property endpoint once per detail-page mount.
 * The backend owns view counting so uniqueness and persistence stay consistent.
 */
export function PropertyViewTracker({ propertyId }: { propertyId: string }) {
  const tracked = useRef(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);
  const accountKey = useAccountKey();

  useEffect(() => {
    if (
      tracked.current ||
      !isAuthenticated ||
      !["buyer", "user"].includes(role ?? "") ||
      !accountKey
    ) {
      return;
    }

    tracked.current = true;
    recordRecentlyViewedProperty(accountKey, propertyId);
    // Analytics must never prevent the visitor from reading the listing.
    void propertyService.getById(propertyId).catch(() => undefined);
  }, [accountKey, isAuthenticated, propertyId, role]);

  return null;
}
