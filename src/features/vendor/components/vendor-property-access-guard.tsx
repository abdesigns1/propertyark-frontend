"use client";

import Link from "next/link";
import { Clock3, RefreshCw, ShieldCheck, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useVendorKyc } from "@/features/vendor/hooks/use-vendor-kyc";

export function VendorPropertyAccessGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const kyc = useVendorKyc();

  if (kyc.isLoading) {
    return <Skeleton className="min-h-96 w-full" />;
  }

  if (kyc.data?.status === "VERIFIED") return children;

  const pending = kyc.data?.status === "PENDING";
  const failed = kyc.isError;
  const Icon = failed ? TriangleAlert : pending ? Clock3 : ShieldCheck;

  return (
    <Card className="mx-auto max-w-2xl shadow-sm">
      <CardHeader>
        <Icon className="text-primary" />
        <CardTitle>
          {failed
            ? "Verification status unavailable"
            : pending
              ? "Identity verification in progress"
              : "Verify your identity before listing"}
        </CardTitle>
        <CardDescription className="leading-6">
          {failed
            ? "We could not confirm your vendor verification status. Try again before creating a property."
            : pending
              ? "Your identification document is being reviewed. Property creation will unlock when an administrator verifies it."
              : "Upload a valid government-issued ID and complete vendor verification before creating your first property listing."}
        </CardDescription>
      </CardHeader>
      <CardContent />
      <CardFooter className="gap-3">
        {failed ? (
          <Button onClick={() => kyc.refetch()} disabled={kyc.isFetching}>
            {kyc.isFetching ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <RefreshCw data-icon="inline-start" />
            )}
            Try again
          </Button>
        ) : (
          <Button asChild>
            <Link href="/vendor/kyc-onboarding">
              <ShieldCheck data-icon="inline-start" />
              {pending ? "View verification status" : "Verify identity"}
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
