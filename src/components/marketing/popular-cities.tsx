import Image from "next/image";
import Link from "next/link";
import {
  AnimatedContainer,
  AnimatedItem,
  SlideInTop,
} from "@/components/motion";

const CITIES = [
  {
    name: "Abuja",
    tag: "FCT Capital",
    href: "/properties?city=abuja",
    image:
      "https://images.unsplash.com/photo-1721642472312-cd30e9bd7cac?q=80&w=435&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    name: "Lagos",
    tag: "Nigeria's Commercial Hub",
    href: "/properties?city=lagos",
    image:
      "https://images.unsplash.com/photo-1719314073622-9399d167725b?q=80&w=417&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    name: "Ibadan",
    tag: "The Ancient City",
    href: "/properties?city=ibadan",
    image:
      "https://images.unsplash.com/photo-1663888848434-65251c939573?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8SWJhZGFufGVufDB8fDB8fHww",
  },
  {
    name: "Enugu",
    tag: "Coal City State",
    href: "/properties?city=enugu",
    image:
      "https://images.unsplash.com/photo-1577900190299-7316c32fe85f?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

export function PopularCities() {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 pb-20">
      <SlideInTop className="text-center">
        <h2 className="text-5xl font-semibold text-foreground sm:text-3xl">
          Popular Cities
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Discover properties in Nigeria&apos;s most sought-after locations.
        </p>
      </SlideInTop>

      <AnimatedContainer className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {CITIES.map((city) => (
          <AnimatedItem key={city.name}>
            <Link
              href={city.href}
              className="group relative block aspect-[4/5] overflow-hidden rounded-2xl"
            >
              <Image
                src={city.image}
                alt={city.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-2xl font-semibold text-white sm:text-3xl">
                  {city.name}
                </p>
                <p className="text-xs text-white/80">{city.tag}</p>
              </div>
            </Link>
          </AnimatedItem>
        ))}
      </AnimatedContainer>
    </section>
  );
}
