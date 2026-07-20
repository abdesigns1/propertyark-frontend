import Image from "next/image";
import { Navbar } from "@/components/shared/navbar";

interface PageBannerProps {
  title: string;
  description?: string;
  imageSrc: string;
  imageAlt: string;
  belowContent?: React.ReactNode;
}

export function PageBanner({
  title,
  description,
  imageSrc,
  imageAlt,
  belowContent,
}: PageBannerProps) {
  return (
    <>
      <Navbar />

      <section
        className={`relative isolate overflow-hidden pt-32 ${belowContent ? "pb-28" : "pb-16"}`}
      >
        <div className="absolute inset-0 -z-10">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/45 to-slate-950/70" />
        </div>

        <div className="mx-auto mt-6 max-w-7xl px-6">
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80">
              {description}
            </p>
          )}
        </div>

        {belowContent && (
          <div className="relative z-10 mx-auto mt-10 max-w-7xl translate-y-1/2 px-6">
            {belowContent}
          </div>
        )}
      </section>
    </>
  );
}
