"use client";

import { Heart, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  useFavorites,
  useToggleFavorite,
} from "@/features/properties/hooks/use-favorites";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";

interface PropertyCardActionsProps {
  propertyId: string;
  propertyTitle: string;
  className?: string;
}

export function PropertyCardActions({
  propertyId,
  propertyTitle,
  className,
}: PropertyCardActionsProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const favorites = useFavorites(Boolean(isAuthenticated || user));
  const toggleFavorite = useToggleFavorite();
  const isSaved = Boolean(favorites.data?.propertyIds.includes(propertyId));

  async function handleSave() {
    if (!isAuthenticated && !user) {
      const redirect = `${window.location.pathname}${window.location.search}`;
      router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }

    const save = !isSaved;
    try {
      await toggleFavorite.mutateAsync({ propertyId, save });
      toast.success(
        save ? "Property saved" : "Property removed from saved properties",
      );
    } catch {
      toast.error(
        save
          ? "Unable to save this property"
          : "Unable to remove this property",
      );
    }
  }

  async function handleShare() {
    const url = `${window.location.origin}/properties/${propertyId}`;
    const shareData = {
      title: propertyTitle,
      text: `View ${propertyTitle} on PropertyArk`,
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      if (!navigator.clipboard) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(url);
      toast.success("Property link copied");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("Unable to share this property");
    }
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Button
        type="button"
        variant="secondary"
        size="icon-sm"
        onClick={handleSave}
        disabled={favorites.isLoading || toggleFavorite.isPending}
        aria-pressed={isSaved}
        aria-label={isSaved ? "Remove from saved properties" : "Save property"}
        className="rounded-full bg-foreground/30 text-white backdrop-blur-sm hover:bg-foreground/50 hover:text-white"
      >
        <Heart className={cn(isSaved && "fill-secondary text-secondary")} />
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="icon-sm"
        onClick={handleShare}
        aria-label="Share property"
        className="rounded-full bg-foreground/30 text-white backdrop-blur-sm hover:bg-foreground/50 hover:text-white"
      >
        <Share2 />
      </Button>
    </div>
  );
}
