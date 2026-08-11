import Image from "next/image";
import { LockKeyhole } from "lucide-react";
import { PropertyArkMark } from "@/components/admin/propertyark-mark";
import { cn } from "@/lib/utils";

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
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#4b355d] px-5 py-10 sm:px-8">
      <Image
        src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=90&w=2000"
        alt="Modern luxury residence at dusk"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-[#42203f]/50" />
      <section
        className={cn(
          "relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-2xl flex-col items-center justify-center",
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
        <p className="mt-12 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-white/80">
          <LockKeyhole aria-hidden="true" />
          Enterprise-grade security protocol active
        </p>
      </section>
    </main>
  );
}
