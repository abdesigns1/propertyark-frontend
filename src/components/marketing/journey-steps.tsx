import {
  AnimatedContainer,
  AnimatedItem,
  SlideInTop,
} from "@/components/motion";

const STEPS = [
  {
    number: 1,
    title: "Register",
    description: "Create an account and save your property preferences.",
  },
  {
    number: 2,
    title: "Verify",
    description: "Complete identity verification for trusted transactions.",
  },
  {
    number: 3,
    title: "Browse",
    description: "Explore verified property listings across Nigeria.",
  },
  {
    number: 4,
    title: "Connect",
    description: "Contact vendors and book property inspections directly.",
  },
];

export function JourneySteps() {
  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <SlideInTop>
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Your Property Search Journey with PropertyArk
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Discover verified properties for sale, rent, land and shortlets in
            Nigeria.
          </p>
        </SlideInTop>

        <AnimatedContainer className="mt-12 grid grid-cols-2 gap-y-10 sm:grid-cols-4 sm:gap-y-0">
          {STEPS.map((step) => (
            <AnimatedItem key={step.number}>
              <div className="flex flex-col items-center px-2">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary/30 bg-card text-lg font-semibold text-primary">
                  {step.number}
                </span>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </AnimatedItem>
          ))}
        </AnimatedContainer>
      </div>
    </section>
  );
}
