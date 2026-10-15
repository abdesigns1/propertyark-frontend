export interface SiteAnnouncement {
  id: string;
  enabled: boolean;
  label: string;
  title: string;
  message: string;
  period: string;
  ctaLabel: string;
  ctaHref: string;
  showVendorWelcomeModal: boolean;
}

/**
 * The active announcement shown on authentication pages and the homepage.
 * Set `enabled` to false when the campaign ends, or replace these values to
 * reuse the same presentation for a future announcement.
 */
export const activeSiteAnnouncement: SiteAnnouncement = {
  id: "vendor-launch-bonus-2026",
  enabled: true,
  label: "PropertyArk is live",
  title: "Vendors get 1,000 free points",
  message: "Use your free points to post properties on PropertyArk.",
  period: "Available from 1 October to 1 December 2026.",
  ctaLabel: "Sign up as a vendor",
  ctaHref: "/register?role=vendor",
  // Disable this independently when the new-vendor welcome campaign ends.
  showVendorWelcomeModal: true,
};
