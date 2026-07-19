import type { LucideIcon } from "lucide-react";

export interface DashboardStat {
  label: string;
  value: string;
  note: string;
  icon: LucideIcon;
  iconClass: string;
  badge?: boolean;
}

export interface DashboardActivity {
  title: string;
  time: string;
  text: string;
  color: string;
}
