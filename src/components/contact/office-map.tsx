export function OfficeMap() {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 pb-20">
      <h2 className="text-center text-2xl font-semibold text-foreground sm:text-3xl">
        Visit Our Office
      </h2>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border">
        <iframe
          title="PropertyArk office location"
          src="https://www.google.com/maps?q=Abuja&output=embed"
          className="h-[420px] w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </section>
  );
}
