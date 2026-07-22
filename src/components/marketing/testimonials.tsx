import { Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AnimatedItem, SlideInTop } from "@/components/motion";

const TESTIMONIALS = [
  {
    quote:
      "PropertyArk completely changed how I approach real estate. The data transparency is unmatched, and the verification process gave me the confidence I needed to move quickly on luxury deals.",
    name: "Jameson K. Reed",
    role: "Real Estate Portfolio Manager",
  },
  {
    quote:
      "As a first-time homebuyer, I was intimidated by the process. PropertyArk made it incredibly easy, and their support team was there to help me every step of the way.",
    name: "Sarah Mitchell",
    role: "Homeowner & Designer",
  },
  {
    quote:
      "Commercial real estate is all about the numbers. The insights provided on this platform are second to none — I've found three high-yield properties in just six months.",
    name: "David Chen",
    role: "Senior Commercial Developer",
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
}

export function Testimonials() {
  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-7xl px-6">
        <SlideInTop className="text-center">
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Trusted by Industry Leaders
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Hear from those who have built their portfolios with PropertyArk.
          </p>
        </SlideInTop>

        <div className="mt-10 overflow-hidden">
          <div className="testimonial-marquee flex w-max">
            {Array.from({ length: 2 }).map((_, groupIndex) => (
              <div key={groupIndex} className="flex shrink-0 gap-6 pr-6">
                {TESTIMONIALS.map((t) => (
                  <AnimatedItem
                    key={`${t.name}-${groupIndex}`}
                    className="w-[85vw] max-w-[320px] shrink-0 rounded-2xl border border-border bg-card p-6 shadow-sm sm:w-[320px]"
                  >
                    <div className="flex gap-0.5 text-secondary">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-secondary" />
                      ))}
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="mt-5 flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                          {initials(t.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {t.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t.role}
                        </p>
                      </div>
                    </div>
                  </AnimatedItem>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
