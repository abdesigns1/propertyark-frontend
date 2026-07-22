export interface VendorDashboardStats {
  totalListings: number;
  activeListings: number;
  pendingApproval: number;
  leadsReceived: number;
  acceptedInquiries: number;
  pendingInquiries: number;
  declinedInquiries: number;
}

export interface VendorPerformancePoint {
  label: string;
  date: string | null;
  views: number;
  inquiries: number;
}

export interface VendorPropertyStatusPoint {
  month: string;
  shortlet: number;
  rent: number;
  sale: number;
  land: number;
}

export interface VendorInquiry {
  id: string;
  name: string;
  email: string | null;
  propertyName: string;
  date: string;
  status: string;
}

export interface VendorProfile {
  id: string | null;
  fullName: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  avatarUrl: string | null;
}

export interface VendorDashboardData {
  stats: VendorDashboardStats;
  inquiries: VendorInquiry[];
  profile: VendorProfile | null;
  performance: VendorPerformancePoint[];
  propertyStatus: VendorPropertyStatusPoint[];
}
