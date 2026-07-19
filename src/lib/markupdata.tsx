import type { Property } from "@/features/properties/types";
import type { Transaction } from "@/features/transactions/types";
import type { Notification } from "@/features/notifications/types";

// ---------- USERS ----------
export type MockRole = "buyer" | "vendor" | "admin";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: MockRole;
  avatarUrl: string;
  verified: boolean;
}

export const mockUsers: MockUser[] = [
  {
    id: "usr_001",
    name: "Amina Yusuf",
    email: "amina.yusuf@example.com",
    role: "buyer",
    avatarUrl: "/assets/images/avatars/amina.jpg",
    verified: true,
  },
  {
    id: "usr_002",
    name: "David Okafor",
    email: "david.okafor@example.com",
    role: "vendor",
    avatarUrl: "/assets/images/avatars/david.jpg",
    verified: true,
  },
  {
    id: "usr_003",
    name: "PropertyArk Admin",
    email: "admin@propertyark.com",
    role: "admin",
    avatarUrl: "/assets/images/avatars/admin.jpg",
    verified: true,
  },
];

// ---------- PROPERTIES ----------
export const mockProperties: Property[] = [
  {
    id: "prop_001",
    title: "3-Bedroom Duplex, Lekki Phase 1",
    description: "Modern duplex with BQ, close to the expressway.",
    price: 85000000,
    currency: "NGN",
    type: "duplex",
    purpose: "sale",
    status: "available",
    sizeSqm: 320,
    location: {
      address: "12 Admiralty Way",
      city: "Lagos",
      state: "Lagos",
      country: "Nigeria",
    },
    bedrooms: 3,
    bathrooms: 4,
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800",
      "https://picsum.photos/800/600",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=800",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=800",
    ],
    vendorId: "usr_002",
    isVerified: true,
    createdAt: "2026-05-14T10:00:00Z",
  },
  {
    id: "prop_002",
    title: "2-Bedroom Shortlet Apartment, Ikoyi",
    description: "Fully furnished shortlet with pool access.",
    price: 65000,
    currency: "NGN",
    type: "shortlet",
    purpose: "shortlet",
    status: "available",
    sizeSqm: 85,
    location: {
      address: "5 Bourdillon Road",
      city: "Lagos",
      state: "Lagos",
      country: "Nigeria",
    },
    bedrooms: 2,
    bathrooms: 2,
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800",
      "https://picsum.photos/800/600",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=800",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=800",
    ],
    vendorId: "usr_002",
    isVerified: true,
    createdAt: "2026-06-01T09:30:00Z",
  },
  {
    id: "prop_003",
    title: "Land Investment Plot, Epe",
    description: "Dry, fenced land suitable for development.",
    price: 12000000,
    currency: "NGN",
    type: "land",
    purpose: "land",
    status: "pending-approval",
    sizeSqm: 1200,
    location: {
      address: "Epe-Ijebu Road",
      city: "Epe",
      state: "Lagos",
      country: "Nigeria",
    },
    bedrooms: 0,
    bathrooms: 0,
    images: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800",
      "https://picsum.photos/800/600",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=800",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=800",
    ],
    vendorId: "usr_002",
    isVerified: false,
    createdAt: "2026-06-20T14:15:00Z",
  },
  {
    id: "prop_004",
    title: "4-Bedroom Terrace, Maitama",
    description:
      "Contemporary terrace duplex with EV charging and smart-home wiring.",
    price: 4500000,
    currency: "NGN",
    type: "terrace",
    purpose: "rent",
    status: "available",
    location: {
      address: "Sector F, FHA Lugbe",
      city: "Abuja",
      state: "FCT",
      country: "Nigeria",
    },
    bedrooms: 4,
    bathrooms: 3,
    sizeSqm: 285,
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800",
      "https://picsum.photos/800/600",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=800",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=800",
    ],
    vendorId: "usr_002",
    isVerified: true,
    createdAt: "2026-06-15T10:00:00Z",
  },
  {
    id: "prop_005",
    title: "Modern Smart Home, FHA Lugbe",
    description: "Fully automated smart home with solar backup and EV parking.",
    price: 4500000,
    currency: "NGN",
    type: "duplex",
    purpose: "rent",
    status: "available",
    location: {
      address: "Sector F, FHA Lugbe",
      city: "Abuja",
      state: "FCT",
      country: "Nigeria",
    },
    bedrooms: 4,
    bathrooms: 3,
    sizeSqm: 300,
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800",
      "https://picsum.photos/800/600",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=800",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=800",
    ],
    vendorId: "usr_002",
    isVerified: true,
    createdAt: "2026-06-18T10:00:00Z",
  },
  {
    id: "prop_006",
    title: "Executive Duplex, FHA Lugbe",
    description: "Premium finish duplex in a gated estate with 24/7 power.",
    price: 4500000,
    currency: "NGN",
    type: "duplex",
    purpose: "rent",
    status: "available",
    location: {
      address: "Sector F, FHA Lugbe",
      city: "Abuja",
      state: "FCT",
      country: "Nigeria",
    },
    bedrooms: 4,
    bathrooms: 3,
    sizeSqm: 290,
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800",
      "https://picsum.photos/800/600",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=800",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=800",
    ],
    vendorId: "usr_002",
    isVerified: true,
    createdAt: "2026-06-20T10:00:00Z",
  },
  {
    id: "prop_007",
    title: "Luxury Apartment, Jabi",
    description: "Bright serviced apartment with a balcony and city views.",
    price: 3800000,
    currency: "NGN",
    type: "apartment",
    purpose: "rent",
    status: "available",
    location: {
      address: "Jabi Lake District",
      city: "Abuja",
      state: "FCT",
      country: "Nigeria",
    },
    bedrooms: 3,
    bathrooms: 3,
    sizeSqm: 210,
    images: [
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=800",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800",
    ],
    vendorId: "usr_002",
    isVerified: true,
    createdAt: "2026-06-22T12:00:00Z",
  },
];

// ---------- TRANSACTIONS ----------
export const mockTransactions: Transaction[] = [
  {
    id: "txn_001",
    propertyId: "prop_001",
    buyerId: "usr_001",
    amount: 85000000,
    currency: "NGN",
    status: "in-escrow",
    method: "paystack",
    createdAt: "2026-06-25T11:00:00Z",
  },
  {
    id: "txn_002",
    propertyId: "prop_002",
    buyerId: "usr_001",
    amount: 65000,
    currency: "NGN",
    status: "completed",
    method: "flutterwave",
    createdAt: "2026-06-28T08:45:00Z",
  },
];

// ---------- NOTIFICATIONS ----------
export const mockNotifications: Notification[] = [
  {
    id: "ntf_001",
    userId: "usr_001",
    title: "Inspection Confirmed",
    message: "Your inspection for prop_001 is scheduled for July 5.",
    read: false,
    createdAt: "2026-06-29T09:00:00Z",
  },
  {
    id: "ntf_002",
    userId: "usr_002",
    title: "New Lead",
    message: "A buyer viewed your listing prop_002.",
    read: true,
    createdAt: "2026-06-27T16:20:00Z",
  },
];

// ---------- SHORTLET BOOKINGS ----------
export interface MockBooking {
  id: string;
  propertyId: string;
  buyerId: string;
  checkIn: string;
  checkOut: string;
  status: "confirmed" | "pending" | "cancelled";
  totalPrice: number;
}

export const mockBookings: MockBooking[] = [
  {
    id: "bkg_001",
    propertyId: "prop_002",
    buyerId: "usr_001",
    checkIn: "2026-07-10",
    checkOut: "2026-07-14",
    status: "confirmed",
    totalPrice: 260000,
  },
];

export const mockPropertyDetailExtras: Record<
  string,
  Partial<import("@/features/properties/types").Property>
> = {
  prop_001: {
    rating: 5,
    reviewCount: 2,
    garageSpaces: 2,
    yearBuilt: 2022,
    landSizeSqm: 3766,
    roomsCount: 5,
    amenities: ["Barbeque", "Laundry", "Dryer"],
    videoUrl: "https://www.youtube.com/embed/lpzEd8gpWVM?si=o68ARHdu2Vh2DS4o",
    vendorName: "Oladele Omotayo",
    vendorPhone: "0485.526.258",
    reviews: [
      {
        id: "rev_001",
        reviewerName: "Victor Abbey",
        rating: 5,
        comment:
          "Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim...",
        createdAt: "Today 09:36 AM",
      },
      {
        id: "rev_002",
        reviewerName: "Rachel Ayomide",
        rating: 5,
        comment:
          "Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim...",
        createdAt: "Today 09:36 AM",
      },
    ],
  },
};
