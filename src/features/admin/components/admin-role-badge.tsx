import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const roleStyles: Record<string, string> = {
  USER: "border-primary/20 bg-primary/10 text-primary",
  BUYER: "border-primary/20 bg-primary/10 text-primary",
  VENDOR: "border-secondary/25 bg-secondary/15 text-secondary-hover",
  ADMIN: "border-navbar bg-navbar text-navbar-foreground",
  STAFF: "border-success/20 bg-success/10 text-success",
};

export function AdminRoleBadge({ role }: { role: string }) {
  const normalizedRole = role.toUpperCase();

  return (
    <Badge
      variant="outline"
      className={cn(
        "capitalize",
        roleStyles[normalizedRole] ??
          "border-muted-foreground/20 bg-muted text-muted-foreground",
      )}
    >
      {role.toLowerCase()}
    </Badge>
  );
}
