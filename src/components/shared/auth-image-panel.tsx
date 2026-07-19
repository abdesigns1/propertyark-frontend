"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface SlideContent {
  imageSrc: string;
  imageAlt: string;
  heading: string;
  highlight: string;
  headingEnd: string;
}

interface AuthImagePanelProps {
  imageSrc?: string;
  imageAlt?: string;
  heading?: string;
  highlight?: string;
  headingEnd?: string;
  slides?: SlideContent[];
}

export function AuthImagePanel({
  imageSrc,
  imageAlt,
  heading,
  highlight,
  headingEnd,
  slides,
}: AuthImagePanelProps) {
  const fallbackSlide: SlideContent = {
    imageSrc: imageSrc ?? "",
    imageAlt: imageAlt ?? "",
    heading: heading ?? "",
    highlight: highlight ?? "",
    headingEnd: headingEnd ?? "",
  };

  const slideData = slides?.length ? slides : [fallbackSlide];
  const [activeIndex, setActiveIndex] = useState(0);

  const currentSlide = slideData[activeIndex] ?? slideData[0];

  useEffect(() => {
    if (slideData.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slideData.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [slideData.length]);

  const goToPrevious = () => {
    setActiveIndex((current) =>
      current === 0 ? slideData.length - 1 : current - 1,
    );
  };

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % slideData.length);
  };

  return (
    <div className="relative hidden overflow-hidden lg:sticky lg:top-0 lg:block lg:h-screen">
      <Image
        key={currentSlide.imageSrc}
        src={currentSlide.imageSrc}
        alt={currentSlide.imageAlt}
        fill
        priority
        className="object-cover transition-opacity duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-black/30" />

      <Link href="/" className="absolute left-8 top-8 z-10">
        <Image
          src="/property%20arc%20logo-12.png"
          alt="PropertyArk logo"
          width={140}
          height={28}
          className="h-9 w-auto object-contain"
          priority
        />
      </Link>

      <div className="absolute bottom-12 left-8 right-8">
        <h2 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">
          {currentSlide.heading}
          <br />
          <span className="text-secondary">{currentSlide.highlight}</span>{" "}
          {currentSlide.headingEnd}
        </h2>
        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            aria-label="Previous slide"
            onClick={goToPrevious}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 text-white transition-colors hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={goToNext}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-foreground transition-colors hover:bg-white/90"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
