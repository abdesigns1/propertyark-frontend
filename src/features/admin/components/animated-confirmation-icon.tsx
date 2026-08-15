import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ConfirmationTone = "success" | "warning" | "destructive" | "primary";

const toneClasses: Record<ConfirmationTone, string> = {
  success: "bg-success/10 text-success ring-success/20",
  warning: "bg-warning/10 text-warning ring-warning/20",
  destructive: "bg-destructive/10 text-destructive ring-destructive/20",
  primary: "bg-primary/10 text-primary ring-primary/20",
};

export function AnimatedConfirmationIcon({
  icon: Icon,
  tone = "primary",
}: {
  icon: LucideIcon;
  tone?: ConfirmationTone;
}) {
  return (
    <div
      className={cn(
        "relative grid size-14 place-items-center rounded-full ring-1 motion-safe:animate-in motion-safe:zoom-in-50 motion-safe:duration-300",
        toneClasses[tone],
      )}
      aria-hidden="true"
    >
      <span className="absolute inset-1 rounded-full bg-current/10 motion-safe:animate-ping motion-reduce:animate-none" />
      <Icon className="relative size-7 motion-safe:animate-pulse motion-reduce:animate-none" />
    </div>
  );
}
