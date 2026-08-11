import type { FinanceMetric, FinanceTransaction } from "./types";

export const FINANCE_METRICS: FinanceMetric[] = [
  { label: "Total Revenue", value: "₦450.0M", trend: "+12%", tone: "positive" },
  { label: "Completed", value: "24", trend: "+3", tone: "positive" },
  { label: "Pending Payments", value: "8", trend: "-2", tone: "attention" },
  { label: "Escrow Balance", value: "₦85.0M", tone: "neutral" },
  { label: "Avg. Transaction", value: "₦18.7M", tone: "neutral" },
];

export const FINANCE_TRANSACTIONS: FinanceTransaction[] = [
  {
    id: "TXN-2026-00124",
    user: {
      name: "David Johnson",
      email: "d.johnson@email.com",
      phone: "+234 812 345 6789",
    },
    property: {
      id: "luxury-5-bedroom-duplex",
      name: "Luxury 5 Bedroom Duplex",
      type: "Sale",
      location: "Ikoyi, Lagos",
      imageUrl: "/assets/images/hero-property.jpeg",
    },
    amount: 120_000_000,
    status: "COMPLETED",
    date: "2026-06-20T09:00:00.000Z",
    timeline: [
      { title: "User initiated purchase", date: "2026-06-15T10:45:00.000Z" },
      { title: "Payment received", date: "2026-06-16T14:15:00.000Z" },
      { title: "Funds released", date: "2026-06-20T09:00:00.000Z" },
    ],
  },
  {
    id: "TXN-2026-00125",
    user: {
      name: "Amaka Okafor",
      email: "amaka.okafor@email.com",
      phone: "+234 803 147 2254",
    },
    property: {
      id: "modern-duplex-apartment",
      name: "Modern Duplex Apartment",
      type: "Rent",
      location: "Maitama, Abuja",
      imageUrl: "/assets/images/hero-property.jpg",
    },
    amount: 85_000_000,
    status: "PENDING",
    date: "2026-06-18T12:30:00.000Z",
    timeline: [
      { title: "User initiated purchase", date: "2026-06-18T12:30:00.000Z" },
      {
        title: "Awaiting payment confirmation",
        date: "2026-06-18T12:45:00.000Z",
      },
    ],
  },
  {
    id: "TXN-2026-00126",
    user: {
      name: "Tunde Balogun",
      email: "tunde.balogun@email.com",
      phone: "+234 806 920 4418",
    },
    property: {
      id: "victoria-island-office",
      name: "Victoria Island Office",
      type: "Sale",
      location: "Victoria Island, Lagos",
      imageUrl: "/assets/images/hero-property.jpeg",
    },
    amount: 250_000_000,
    status: "ESCROW_HELD",
    date: "2026-06-15T08:20:00.000Z",
    timeline: [
      { title: "Payment received", date: "2026-06-14T16:20:00.000Z" },
      { title: "Funds moved to escrow", date: "2026-06-15T08:20:00.000Z" },
    ],
  },
  {
    id: "TXN-2026-00127",
    user: {
      name: "Sarah Williams",
      email: "sarah.williams@email.com",
      phone: "+234 704 550 1290",
    },
    property: {
      id: "lekki-phase-one-terrace",
      name: "Lekki Phase 1 Terrace",
      type: "Shortlet",
      location: "Lekki, Lagos",
      imageUrl: "/assets/images/hero-property.jpg",
    },
    amount: 65_000_000,
    status: "PROCESSING",
    date: "2026-06-12T11:00:00.000Z",
    timeline: [
      { title: "User initiated purchase", date: "2026-06-12T11:00:00.000Z" },
      {
        title: "Transaction verification started",
        date: "2026-06-12T13:10:00.000Z",
      },
    ],
  },
  {
    id: "TXN-2026-00128",
    user: {
      name: "Chinedu Eze",
      email: "chinedu.eze@email.com",
      phone: "+234 809 201 6831",
    },
    property: {
      id: "banana-island-penthouse",
      name: "Banana Island Penthouse",
      type: "Shortlet",
      location: "Banana Island, Lagos",
      imageUrl: "/assets/images/hero-property.jpeg",
    },
    amount: 175_000_000,
    status: "COMPLETED",
    date: "2026-06-08T15:00:00.000Z",
    timeline: [
      { title: "User initiated purchase", date: "2026-06-03T09:15:00.000Z" },
      { title: "Payment received", date: "2026-06-04T10:00:00.000Z" },
      { title: "Funds released", date: "2026-06-08T15:00:00.000Z" },
    ],
  },
  {
    id: "TXN-2026-00129",
    user: {
      name: "Fatima Bello",
      email: "fatima.bello@email.com",
      phone: "+234 802 775 4130",
    },
    property: {
      id: "asokoro-family-home",
      name: "Asokoro Family Home",
      type: "Land",
      location: "Asokoro, Abuja",
      imageUrl: "/assets/images/hero-property.jpg",
    },
    amount: 98_000_000,
    status: "PENDING",
    date: "2026-06-05T08:45:00.000Z",
    timeline: [
      { title: "User initiated purchase", date: "2026-06-05T08:45:00.000Z" },
    ],
  },
];
