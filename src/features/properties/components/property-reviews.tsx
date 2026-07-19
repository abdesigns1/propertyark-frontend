import { Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { PropertyReview } from "@/features/properties/types";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
}

export function PropertyReviews({
  reviews,
  averageRating,
  totalReviews,
}: {
  reviews: PropertyReview[];
  averageRating: number;
  totalReviews: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            What Our Customers Say
          </h2>
          <div className="mt-1 flex items-center gap-2 text-sm">
            <span className="font-numeric font-semibold text-foreground">
              {averageRating.toFixed(1)}
            </span>
            <span className="flex text-secondary">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-secondary" />
              ))}
            </span>
            <span className="font-numeric text-muted-foreground">
              {totalReviews.toLocaleString()} reviews
            </span>
          </div>
        </div>
        <Button
          size="sm"
          className="rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover"
        >
          Write A Review
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {initials(review.reviewerName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {review.reviewerName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {review.createdAt}
                  </p>
                </div>
              </div>
              <span className="flex text-secondary">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-secondary" />
                ))}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {review.comment}
            </p>
          </div>
        ))}
      </div>

      <button className="mt-6 text-sm font-medium text-primary hover:text-primary-hover">
        View More
      </button>
    </div>
  );
}
