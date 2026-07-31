export type ShortletBookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED";

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

const MOCK_SHORTLET_DASHBOARD: ShortletDashboardData = {
  stats: {
    upcomingBookings: 18,
    weeklyBookingChange: 3,
    pendingRequests: 7,
    activeGuests: 12,
    completedBookings: 245,
    revenue: 15_500_000,
    revenueGrowth: 12,
  },
  properties: [
    { id: "shortlet-ikoyi", name: "Luxury 3 Bed - Ikoyi" },
    { id: "shortlet-lekki", name: "Ocean View Suite - Lekki" },
    { id: "shortlet-wuse", name: "Executive Apartment - Wuse II" },
  ],
  bookings: [
    {
      id: "PA-8842",
      guestName: "David Johnson",
      guestInitials: "DJ",
      completedStays: 5,
      membership: "Premium Member",
      propertyId: "shortlet-ikoyi",
      propertyName: "Luxury 3 Bed, Ikoyi",
      checkIn: "2026-05-15",
      checkOut: "2026-05-20",
      nights: 5,
      amount: 500_000,
      status: "PENDING",
      checkInTime: "2:00 PM",
      checkOutTime: "11:00 AM",
      requestedAt: "2026-05-14T09:12:00Z",
    },
    {
      id: "PA-8841",
      guestName: "Amara Okafor",
      guestInitials: "AO",
      completedStays: 3,
      propertyId: "shortlet-lekki",
      propertyName: "Ocean View Suite, Lekki",
      checkIn: "2026-05-18",
      checkOut: "2026-05-22",
      nights: 4,
      amount: 680_000,
      status: "CONFIRMED",
      checkInTime: "2:00 PM",
      checkOutTime: "11:00 AM",
      requestedAt: "2026-05-13T14:40:00Z",
    },
    {
      id: "PA-8839",
      guestName: "Tunde Cole",
      guestInitials: "TC",
      completedStays: 2,
      propertyId: "shortlet-wuse",
      propertyName: "Executive Apartment, Wuse II",
      checkIn: "2026-05-21",
      checkOut: "2026-05-24",
      nights: 3,
      amount: 420_000,
      status: "PENDING",
      checkInTime: "3:00 PM",
      checkOutTime: "11:00 AM",
      requestedAt: "2026-05-14T11:25:00Z",
    },
  ],
  pricing: {
    propertyId: "shortlet-ikoyi",
    weekdayRate: 150_000,
    weekendRate: 200_000,
  },
  calendar: [
    { day: 1, label: "Confirmed: Ikoyi", tone: "confirmed" },
    { day: 3, label: "Maintenance block", tone: "blocked" },
    { day: 6, label: "Occupied: Tunde C.", tone: "occupied" },
    { day: 7, label: "Checked in", tone: "occupied" },
    { day: 8, label: "Pending approval", tone: "pending" },
  ],
  activities: [
    {
      id: "activity-1",
      time: "11:00 AM",
      type: "CHECK-OUT",
      title: "Bimbo Adeyemi",
      detail: "Ikoyi Unit · Room 402",
      tone: "destructive",
    },
    {
      id: "activity-2",
      time: "12:30 PM",
      type: "CLEANING",
      title: "Service Crew A",
      detail: "Full sanitize required",
      tone: "primary",
    },
    {
      id: "activity-3",
      time: "02:00 PM",
      type: "CHECK-IN",
      title: "David Johnson",
      detail: "Ikoyi Unit · Early access requested",
      tone: "success",
    },
  ],
};

export const shortletBookingService = {
  getDashboard: async () => MOCK_SHORTLET_DASHBOARD,
};
