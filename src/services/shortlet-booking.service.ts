import { api } from "@/services/axios";

type UnknownRecord = Record<string, unknown>;

export type ShortletBookingStatus =
  "PENDING" | "CONFIRMED" | "CHECKED_IN" | "COMPLETED" | "CANCELLED";

export interface ShortletBooking {
  id: string;
  guestName: string;
  guestInitials: string;
  guestAvatarUrl?: string;
  completedStays?: number;
  membership?: string;
  propertyId: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  amount: number;
  status: ShortletBookingStatus;
  checkInTime?: string;
  checkOutTime?: string;
  requestedAt?: string;
}

export interface ShortletCalendarEvent {
  day: number;
  label: string;
  tone: "confirmed" | "occupied" | "pending" | "blocked";
}

export interface ShortletActivity {
  id: string;
  time: string;
  type: string;
  title: string;
  detail: string;
  tone: "primary" | "destructive" | "success";
}

export interface ShortletDashboardData {
  stats: {
    upcomingBookings: number;
    weeklyBookingChange: number;
    pendingRequests: number;
    activeGuests: number;
    completedBookings: number;
    revenue: number;
    revenueGrowth: number;
  };
  bookings: ShortletBooking[];
  properties: Array<{ id: string; name: string }>;
  pricing: {
    propertyId: string;
    weekdayRate: number;
    weekendRate: number;
  };
  calendar: ShortletCalendarEvent[];
  activities: ShortletActivity[];
}

export type ShortletBookingAction = "approve" | "check-in" | "cancel";
export type ShortletPaymentMethod = "CASH" | "TRANSFER";

export interface CreateShortletBookingInput {
  propertyId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  adult: number;
  child: number;
  checkInDate: string;
  checkOutDate: string;
  paymentMethod: ShortletPaymentMethod;
}

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

function unwrap(value: unknown): UnknownRecord {
  const root = asRecord(value);
  const data = asRecord(root.data);
  return Object.keys(data).length ? data : root;
}

function stringFrom(source: UnknownRecord, keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function numberFrom(source: UnknownRecord, keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (
      typeof value === "string" &&
      value.trim() &&
      !Number.isNaN(Number(value))
    ) {
      return Number(value);
    }
  }
  return 0;
}

function findBookings(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const source = unwrap(value);
  for (const key of [
    "bookings",
    "recentBookings",
    "vendorBookings",
    "items",
    "records",
    "results",
  ]) {
    if (Array.isArray(source[key])) return source[key];
    const nested = asRecord(source[key]);
    if (Array.isArray(nested.data)) return nested.data;
    if (Array.isArray(nested.items)) return nested.items;
  }
  return [];
}

function normalizeStatus(value: unknown): ShortletBookingStatus {
  const status = typeof value === "string" ? value.toUpperCase() : "PENDING";
  if (["APPROVED", "ACCEPTED", "CONFIRMED", "PAID"].includes(status)) {
    return "CONFIRMED";
  }
  if (["CHECKED_IN", "CHECKED-IN", "ACTIVE"].includes(status)) {
    return "CHECKED_IN";
  }
  if (["CHECKED_OUT", "CHECKED-OUT", "COMPLETED"].includes(status)) {
    return "COMPLETED";
  }
  if (["CANCELLED", "CANCELED", "REJECTED", "DECLINED"].includes(status)) {
    return "CANCELLED";
  }
  return "PENDING";
}

function calculateNights(checkIn: string, checkOut: string) {
  const start = new Date(checkIn).getTime();
  const end = new Date(checkOut).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start)
    return 0;
  return Math.ceil((end - start) / 86_400_000);
}

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "GU"
  );
}

function normalizeBooking(value: unknown, index: number): ShortletBooking {
  const booking = asRecord(value);
  const guest = asRecord(
    booking.guest ?? booking.user ?? booking.customer ?? booking.bookedBy,
  );
  const property = asRecord(booking.property ?? booking.shortlet);
  const firstName =
    stringFrom(booking, ["firstName", "guestFirstName"]) ??
    stringFrom(guest, ["firstName"]);
  const lastName =
    stringFrom(booking, ["lastName", "guestLastName"]) ??
    stringFrom(guest, ["lastName"]);
  const guestName =
    stringFrom(booking, ["guestName", "customerName", "name"]) ??
    stringFrom(guest, ["fullName", "name"]) ??
    [firstName, lastName].filter(Boolean).join(" ") ??
    "PropertyArk guest";
  const checkIn =
    stringFrom(booking, ["checkInDate", "checkIn", "startDate", "fromDate"]) ??
    new Date(0).toISOString();
  const checkOut =
    stringFrom(booking, ["checkOutDate", "checkOut", "endDate", "toDate"]) ??
    checkIn;

  return {
    id:
      stringFrom(booking, ["id", "_id", "bookingId", "reference"]) ??
      `booking-${index}`,
    guestName: guestName || "PropertyArk guest",
    guestInitials: initials(guestName),
    guestAvatarUrl:
      stringFrom(booking, ["guestAvatarUrl", "avatarUrl"]) ??
      stringFrom(guest, ["avatar", "avatarUrl", "profilePicture"]) ??
      undefined,
    completedStays: numberFrom(guest, ["completedStays", "stays"]),
    membership:
      stringFrom(booking, ["membership"]) ??
      stringFrom(guest, ["membership", "membershipTier"]) ??
      undefined,
    propertyId:
      stringFrom(booking, ["propertyId", "shortletId"]) ??
      stringFrom(property, ["id", "_id"]) ??
      "unknown-property",
    propertyName:
      stringFrom(booking, ["propertyName", "propertyTitle", "shortletName"]) ??
      stringFrom(property, ["name", "title"]) ??
      "Shortlet property",
    checkIn,
    checkOut,
    nights:
      numberFrom(booking, ["nights", "numberOfNights", "duration"]) ||
      calculateNights(checkIn, checkOut),
    amount: numberFrom(booking, [
      "amount",
      "totalAmount",
      "totalPrice",
      "bookingAmount",
      "price",
    ]),
    status: normalizeStatus(booking.status),
    checkInTime:
      stringFrom(booking, ["checkInTime", "arrivalTime"]) ?? undefined,
    checkOutTime:
      stringFrom(booking, ["checkOutTime", "departureTime"]) ?? undefined,
    requestedAt:
      stringFrom(booking, ["createdAt", "requestedAt", "bookedAt"]) ??
      undefined,
  };
}

function normalizeDashboard(value: unknown): ShortletDashboardData {
  const source = unwrap(value);
  const statsSource = asRecord(
    source.stats ?? source.summary ?? source.bookingStats ?? source,
  );
  const bookings = findBookings(value).map(normalizeBooking);
  const count = (...statuses: ShortletBookingStatus[]) =>
    bookings.filter((booking) => statuses.includes(booking.status)).length;
  const propertyMap = new Map<string, string>();
  bookings.forEach((booking) => {
    if (booking.propertyId !== "unknown-property") {
      propertyMap.set(booking.propertyId, booking.propertyName);
    }
  });
  const properties = Array.from(propertyMap, ([id, name]) => ({ id, name }));
  const pricingSource = asRecord(source.pricing ?? source.rates);
  const firstPropertyId = properties[0]?.id ?? "";

  return {
    stats: {
      upcomingBookings:
        numberFrom(statsSource, [
          "upcomingBookings",
          "upcoming",
          "approvedBookings",
          "confirmedBookings",
        ]) || count("CONFIRMED", "CHECKED_IN"),
      weeklyBookingChange: numberFrom(statsSource, [
        "weeklyBookingChange",
        "weeklyChange",
        "newThisWeek",
      ]),
      pendingRequests:
        numberFrom(statsSource, [
          "pendingRequests",
          "pendingBookings",
          "pending",
        ]) || count("PENDING"),
      activeGuests:
        numberFrom(statsSource, [
          "activeGuests",
          "checkedInGuests",
          "active",
        ]) || count("CHECKED_IN"),
      completedBookings:
        numberFrom(statsSource, [
          "completedBookings",
          "completed",
          "checkedOutBookings",
        ]) || count("COMPLETED"),
      revenue: numberFrom(statsSource, [
        "revenue",
        "totalRevenue",
        "bookingRevenue",
        "earnings",
      ]),
      revenueGrowth: numberFrom(statsSource, [
        "revenueGrowth",
        "revenueGrowthPercentage",
        "growth",
      ]),
    },
    bookings,
    properties,
    pricing: {
      propertyId: stringFrom(pricingSource, ["propertyId"]) ?? firstPropertyId,
      weekdayRate: numberFrom(pricingSource, [
        "weekdayRate",
        "baseRate",
        "nightlyRate",
      ]),
      weekendRate: numberFrom(pricingSource, ["weekendRate"]),
    },
    calendar: bookings.slice(0, 12).map((booking) => ({
      day: new Date(booking.checkIn).getUTCDate(),
      label: `${booking.status === "CHECKED_IN" ? "Occupied" : booking.status === "PENDING" ? "Pending" : "Confirmed"}: ${booking.propertyName}`,
      tone:
        booking.status === "CHECKED_IN"
          ? "occupied"
          : booking.status === "PENDING"
            ? "pending"
            : "confirmed",
    })),
    activities: bookings.slice(0, 5).map((booking) => ({
      id: `activity-${booking.id}`,
      time: booking.checkInTime ?? "—",
      type: booking.status.replaceAll("_", " "),
      title: booking.guestName,
      detail: booking.propertyName,
      tone:
        booking.status === "CANCELLED"
          ? "destructive"
          : booking.status === "CHECKED_IN"
            ? "success"
            : "primary",
    })),
  };
}

export const shortletBookingService = {
  async create(input: CreateShortletBookingInput) {
    const { data } = await api.post("/shortlet-bookings", input);
    return data;
  },
  async getDashboard() {
    const { data } = await api.get("/shortlet-bookings/vendor-stats");
    return normalizeDashboard(data);
  },
  async updateStatus({
    bookingId,
    action,
  }: {
    bookingId: string;
    action: ShortletBookingAction;
  }) {
    const { data } = await api.patch(
      `/shortlet-bookings/${encodeURIComponent(bookingId)}/${action}`,
    );
    return data;
  },
};
