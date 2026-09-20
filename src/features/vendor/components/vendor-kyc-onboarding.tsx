"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  Check,
  Clock3,
  FileCheck2,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
  UploadCloud,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { KycUploadField } from "@/features/authentication/components/kyc-upload-field";
import { kycDocumentSchema } from "@/features/authentication/validation/register.schema";
import {
  useVendorKyc,
  vendorKycQueryKey,
} from "@/features/vendor/hooks/use-vendor-kyc";
import { useAccountKey } from "@/lib/account-identity";
import { getApiErrorMessage } from "@/services/api-error";
import {
  vendorKycService,
  type VendorKycState,
} from "@/services/vendor-kyc.service";

const onboardingSchema = z.object({ kycDocument: kycDocumentSchema });
type OnboardingValues = z.infer<typeof onboardingSchema>;

export function VendorKycOnboarding() {
  const queryClient = useQueryClient();
  const accountKey = useAccountKey();
  const kyc = useVendorKyc();
  const [uploadProgress, setUploadProgress] = useState(0);
  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { kycDocument: undefined as unknown as File },
  });

  const upload = useMutation({
    mutationFn: (document: File) =>
      vendorKycService.upload(document, (event) => {
        if (!event.total) return;
        setUploadProgress(Math.round((event.loaded / event.total) * 100));
      }),
    onSuccess: async () => {
      if (accountKey) {
        queryClient.setQueryData<VendorKycState>(
          vendorKycQueryKey(accountKey),
          {
            status: "PENDING",
            rejectionReason: null,
            hasDocument: true,
          },
        );
      }
      await queryClient.invalidateQueries({
        queryKey: ["vendor", "settings", "profile"],
      });
      form.reset();
      setUploadProgress(0);
      toast.success("Your identification document was submitted for review.");
    },
    onError: (error) => {
      setUploadProgress(0);
      toast.error(
        getApiErrorMessage(error, "Your document could not be uploaded."),
      );
    },
  });

  if (kyc.isLoading) return <OnboardingSkeleton />;

  if (kyc.isError) {
    return (
      <OnboardingFrame stage="identity">
        <StatusPanel
          icon={TriangleAlert}
          title="We could not check your verification status"
          description="Your account is secure, but the verification service could not be reached. Please try again."
          tone="destructive"
        >
          <Button onClick={() => kyc.refetch()} disabled={kyc.isFetching}>
            {kyc.isFetching ? <Spinner /> : <RefreshCw />}
            Try again
          </Button>
        </StatusPanel>
      </OnboardingFrame>
    );
  }

  const status = kyc.data?.status ?? "NOT_SUBMITTED";

  if (status === "VERIFIED") {
    return (
      <OnboardingFrame stage="complete">
        <StatusPanel
          icon={BadgeCheck}
          title="Identity verified"
          description="Your vendor identity has been approved. You now have full access to vendor features."
          tone="success"
        >
          <Button asChild>
            <Link href="/vendor/dashboard">Continue to dashboard</Link>
          </Button>
        </StatusPanel>
      </OnboardingFrame>
    );
  }

  if (status === "PENDING") {
    return (
      <OnboardingFrame stage="approval">
        <StatusPanel
          icon={Clock3}
          title="Verification in progress"
          description="Your identification document has been received. An administrator will review it and your status will update automatically."
          tone="warning"
        >
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="outline" onClick={() => kyc.refetch()}>
              <RefreshCw /> Refresh status
            </Button>
            <Button asChild>
              <Link href="/vendor/dashboard">Go to dashboard</Link>
            </Button>
          </div>
        </StatusPanel>
      </OnboardingFrame>
    );
  }

  return (
    <OnboardingFrame stage="identity">
      <Card className="shadow-sm">
        <CardHeader className="border-b px-6 pb-5 sm:px-8">
          <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="size-6" />
          </div>
          <CardTitle className="text-xl">
            {status === "REJECTED"
              ? "Submit a clearer identification document"
              : "Verify your identity"}
          </CardTitle>
          <CardDescription className="max-w-xl leading-6">
            Vendor verification protects property seekers and keeps listings
            trustworthy. Upload one valid government-issued document to finish
            setting up your vendor account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-6 sm:px-8">
          {status === "REJECTED" && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm">
              <p className="font-medium text-destructive">
                Your previous submission needs attention
              </p>
              <p className="mt-1 text-muted-foreground">
                {kyc.data?.rejectionReason ||
                  "Please upload a clear, complete and unexpired identification document."}
              </p>
            </div>
          )}

          <form
            id="vendor-kyc-onboarding-form"
            onSubmit={form.handleSubmit(({ kycDocument }) =>
              upload.mutate(kycDocument),
            )}
            className="space-y-5"
          >
            <KycUploadField control={form.control} name="kycDocument" />
            {upload.isPending && (
              <div className="space-y-2" role="status" aria-live="polite">
                <Progress value={uploadProgress} />
                <p className="text-center text-xs text-muted-foreground">
                  {uploadProgress < 100
                    ? `Uploading securely… ${uploadProgress}%`
                    : "Upload complete. Recording your submission…"}
                </p>
              </div>
            )}
          </form>

          <div className="grid gap-3 rounded-xl bg-muted/50 p-4 text-sm sm:grid-cols-3">
            <Requirement icon={FileCheck2} label="JPEG, PNG or PDF" />
            <Requirement icon={Check} label="Maximum size: 10 MB" />
            <Requirement icon={ShieldCheck} label="Encrypted upload" />
          </div>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-3 px-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="text-xs text-muted-foreground">
            Verification is required before vendor onboarding can be completed.
          </p>
          <Button
            type="submit"
            form="vendor-kyc-onboarding-form"
            disabled={upload.isPending}
          >
            {upload.isPending ? <Spinner /> : <UploadCloud />}
            {upload.isPending ? "Submitting…" : "Submit for verification"}
          </Button>
        </CardFooter>
      </Card>
    </OnboardingFrame>
  );
}

function OnboardingFrame({
  children,
  stage,
}: {
  children: React.ReactNode;
  stage: "identity" | "approval" | "complete";
}) {
  return (
    <div className="mx-auto w-full max-w-3xl py-4 lg:py-10">
      <div className="mb-6">
        <p className="text-sm font-medium text-primary">Vendor onboarding</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Complete your account setup
        </h1>
        <p className="mt-2 text-muted-foreground">
          Complete identity verification to build a trusted vendor profile and
          access vendor features.
        </p>
      </div>
      <div className="mb-6 grid grid-cols-3 gap-2 text-xs sm:text-sm">
        <Step complete label="Google account" />
        <Step
          active={stage === "identity"}
          complete={stage === "approval" || stage === "complete"}
          label="Identity check"
        />
        <Step
          active={stage === "approval"}
          complete={stage === "complete"}
          label="Admin approval"
        />
      </div>
      {children}
    </div>
  );
}

function Step({
  label,
  active = false,
  complete = false,
}: {
  label: string;
  active?: boolean;
  complete?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div
        className={`h-1.5 rounded-full ${complete || active ? "bg-primary" : "bg-muted"}`}
      />
      <p
        className={complete || active ? "font-medium" : "text-muted-foreground"}
      >
        {label}
      </p>
    </div>
  );
}

function Requirement({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon className="size-4 shrink-0 text-primary" />
      <span>{label}</span>
    </div>
  );
}

function StatusPanel({
  icon: Icon,
  title,
  description,
  tone,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  tone: "success" | "warning" | "destructive";
  children: React.ReactNode;
}) {
  return (
    <Card className="shadow-sm">
      <CardContent className="flex flex-col items-center px-6 py-12 text-center sm:px-10">
        <div
          className={`flex size-16 items-center justify-center rounded-full ${
            tone === "success"
              ? "bg-success/10 text-success"
              : tone === "warning"
                ? "bg-warning/10 text-warning"
                : "bg-destructive/10 text-destructive"
          }`}
        >
          <Icon className="size-8" />
        </div>
        <h2 className="mt-5 text-2xl font-semibold">{title}</h2>
        <p className="mt-2 max-w-lg leading-6 text-muted-foreground">
          {description}
        </p>
        <div className="mt-7">{children}</div>
      </CardContent>
    </Card>
  );
}

function OnboardingSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 py-10">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-[520px] w-full" />
    </div>
  );
}
