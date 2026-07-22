"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDashboardUser } from "@/features/dashboard/hooks/use-dashboard-user";

export function DashboardUserAvatar() {
  const user = useDashboardUser();
  return (
    <Avatar size="lg">
      {user.avatarUrl && (
        <AvatarImage src={user.avatarUrl} alt={user.fullName} />
      )}
      <AvatarFallback className="bg-foreground font-semibold text-background">
        {user.initials}
      </AvatarFallback>
    </Avatar>
  );
}
