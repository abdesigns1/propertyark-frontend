export type NotificationType =
  | "inspection"
  | "appointment"
  | "transaction"
  | "escrow"
  | "message"
  | "subscription"
  | "verification"
  | "system";

export interface Notification {
  id: string;
  userId: string;
  type?: NotificationType;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface NotificationPreferences {
  userId: string;
  email: boolean;
  push: boolean;
  sms: boolean;
}
