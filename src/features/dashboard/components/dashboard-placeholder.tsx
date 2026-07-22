import { Navbar } from "@/components/shared/navbar";

interface DashboardPlaceholderProps {
  accountType: "Buyer" | "Vendor";
  description: string;
}

export function DashboardPlaceholder({
  accountType,
  description,
}: DashboardPlaceholderProps) {
  return (
    <>
      <Navbar />
      <main className="mx-auto flex min-h-[70vh] w-full max-w-7xl flex-col justify-center gap-3 px-6 py-20 lg:px-8">
        <p className="text-sm font-medium text-primary">
          {accountType} account
        </p>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
          Welcome to your {accountType.toLowerCase()} dashboard
        </h1>
        <p className="max-w-2xl text-muted-foreground">{description}</p>
      </main>
    </>
  );
}
