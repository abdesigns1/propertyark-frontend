"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { PropertyArkMark } from "@/components/admin/propertyark-mark";
import { cn } from "@/lib/utils";

const slides = [
  {
    src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=90&w=2000",
    alt: "Modern luxury residence at dusk",
  },
  {
    src: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=90&w=2000",
    alt: "Contemporary luxury property interior",
  },
  {
    src: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=90&w=2000",
    alt: "Premium modern residential property",
  },
] as const;

export function AdminAuthShell({
  children,
  title,
  description,
  compact = false,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
  compact?: boolean;
}) {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = window.setInterval(
      () => setActiveSlide((current) => (current + 1) % slides.length),
      6500,
    );
    return () => window.clearInterval(interval);
  }, []);

  return (
    <main className="relative isolate min-h-screen overflow-x-hidden bg-[#4b355d] px-5 py-8 sm:px-8 sm:py-10">
      <div className="fixed inset-0 -z-20" aria-hidden="true">
        {slides.map((slide, index) => (
          <Image
            key={slide.src}
            src={slide.src}
            alt=""
            fill
            priority={index === 0}
            className={cn(
              "object-cover object-center transition-[opacity,transform] duration-[1800ms] ease-in-out motion-reduce:transition-none",
              index === activeSlide
                ? "scale-100 opacity-100"
                : "scale-[1.03] opacity-0",
            )}
            sizes="100vw"
          />
        ))}
      </div>
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(115deg,rgba(10,31,69,0.62),rgba(40,27,55,0.42))] sm:bg-[linear-gradient(115deg,rgba(10,31,69,0.72),rgba(40,27,55,0.5))]" />
      <section
        className={cn(
          "relative z-10 mx-auto flex min-h-[calc(100dvh-4rem)] max-w-2xl flex-col items-center justify-center sm:min-h-[calc(100vh-5rem)]",
          compact && "max-w-xl",
        )}
      >
        <PropertyArkMark light className="mb-10" />
        <header className="mb-8 text-center text-white">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-white/90 sm:text-base">
            {description}
          </p>
        </header>
        {children}
        <div
          className="mt-6 flex items-center gap-2 rounded-full border border-white/20 bg-black/15 px-3 py-2 backdrop-blur-sm"
          aria-label="Background property carousel"
        >
          {slides.map((slide, index) => (
            <button
              key={slide.src}
              type="button"
              onClick={() => setActiveSlide(index)}
              aria-label={`Show ${slide.alt}`}
              aria-current={index === activeSlide ? "true" : undefined}
              className={cn(
                "h-1.5 rounded-full bg-white/45 transition-[width,background-color] duration-500",
                index === activeSlide ? "w-8 bg-white" : "w-2",
              )}
            />
          ))}
        </div>
        <p className="mt-12 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-white/80">
          <LockKeyhole aria-hidden="true" />
          Enterprise-grade security protocol active
        </p>
      </section>
    </main>
  );
}
