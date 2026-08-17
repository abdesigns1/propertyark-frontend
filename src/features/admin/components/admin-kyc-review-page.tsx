"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  FileBadge,
  RotateCw,
  UserRoundCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { AdminActionDialog } from "@/features/admin/components/admin-action-dialog";
import { AdminWorkspace } from "@/features/admin/components/admin-workspace";
import { useAdminKycRequest } from "@/features/admin/hooks/use-admin-dashboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { adminService } from "@/services/admin.service";

export function AdminKycReviewPage({ requestId }: { requestId: string }) {
  const query = useAdminKycRequest(requestId);
  const request = query.data;
  if (query.isLoading)
    return (
      <AdminWorkspace>
        <Skeleton className="m-8 h-[700px]" />
      </AdminWorkspace>
    );
  if (!request)
    return (
      <AdminWorkspace>
        <main className="p-8">
          <Card>
            <CardContent className="p-16 text-center">
              This verification request is no longer in the pending queue.
              <br />
              <Button className="mt-4" asChild>
                <Link href="/admin/kyc">Back to KYC</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </AdminWorkspace>
    );
  return <KycReview request={request} />;
}

function KycReview({
  request,
}: {
  request: import("@/services/admin.service").AdminKycRequest;
}) {
  const client = useQueryClient();
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [reason, setReason] = useState("");
  const isPending = request.status === "PENDING";
  const isVerified = request.status === "VERIFIED";
  const [checks, setChecks] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(verificationChecks.map((item) => [item.id, isVerified])),
  );
  const checklistComplete = verificationChecks.every((item) => checks[item.id]);
  const mutation = useMutation({
    mutationFn: () =>
      adminService.reviewKyc(
        request.userId,
        action === "approve" ? "VERIFIED" : "REJECTED",
        reason,
      ),
    onSuccess: async () => {
      toast.success(
        action === "approve" ? "Document approved" : "Document rejected",
      );
      setAction(null);
      await client.invalidateQueries({ queryKey: ["admin", "kyc"] });
    },
    onError: () =>
      toast.error("The verification decision could not be submitted."),
  });
  return (
    <AdminWorkspace>
      <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
        <p className="text-muted-foreground">
          <Link href="/admin/kyc">Verifications</Link> › NIN Verification ›{" "}
          <span className="text-primary">Case #{request.id}</span>
        </p>
        <h1 className="mt-2 text-3xl font-semibold">
          Review: {request.fullName}
        </h1>
        <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <FileBadge className="text-primary" />
                {request.documentName}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex min-h-[600px] items-center justify-center p-8">
              {request.documentUrl ? (
                isPdfDocument(request.documentUrl, request.documentName) ? (
                  <iframe
                    src={request.documentUrl}
                    title={`NIN document for ${request.fullName}`}
                    className="min-h-[540px] w-full rounded-md border"
                  />
                ) : (
                  <div className="relative size-full min-h-[540px]">
                    <Image
                      src={request.documentUrl}
                      alt="Submitted NIN document"
                      fill
                      className="object-contain"
                    />
                  </div>
                )
              ) : (
                <div className="text-center text-muted-foreground">
                  <FileBadge className="mx-auto size-12" />
                  <p className="mt-3">
                    The endpoint did not return a document URL.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          <aside className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserRoundCheck className="text-primary" />
                  System Record
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <Info label="Full name" value={request.fullName} />
                <Info label="Email" value={request.email} />
                <Info label="Phone" value={request.phone || "Not provided"} />
                <Info
                  label="Residential address"
                  value={request.location || "Not provided"}
                />
                <Info label="Entity type" value={request.role} />
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <FieldSet>
                  <FieldLegend>Verification Checklist</FieldLegend>
                  <FieldGroup data-slot="checkbox-group">
                    {verificationChecks.map((item) => (
                      <Field
                        key={item.id}
                        orientation="horizontal"
                        data-disabled={!isPending}
                      >
                        <Checkbox
                          id={item.id}
                          checked={checks[item.id]}
                          disabled={!isPending}
                          onCheckedChange={(checked) =>
                            setChecks((current) => ({
                              ...current,
                              [item.id]: checked === true,
                            }))
                          }
                        />
                        <FieldLabel htmlFor={item.id}>{item.label}</FieldLabel>
                      </Field>
                    ))}
                  </FieldGroup>
                </FieldSet>
              </CardContent>
            </Card>
          </aside>
        </div>
        <div className="mt-8 flex justify-end gap-3 border-t py-5">
          {isPending ? (
            <>
              <Button variant="outline" onClick={() => setAction("reject")}>
                <XCircle data-icon="inline-start" />
                Reject Document
              </Button>
              <Button
                disabled={!checklistComplete}
                onClick={() => setAction("approve")}
              >
                <BadgeCheck data-icon="inline-start" />
                Approve Document
              </Button>
            </>
          ) : (
            <Badge variant={isVerified ? "secondary" : "destructive"}>
              Decision completed: {request.status.toLowerCase()}
            </Badge>
          )}
        </div>
        <AdminActionDialog
          open={Boolean(action)}
          onOpenChange={(open) => !open && setAction(null)}
          icon={action === "reject" ? XCircle : BadgeCheck}
          tone={action === "reject" ? "destructive" : "success"}
          title={
            action === "reject"
              ? "Reject this document?"
              : "Approve this document?"
          }
          description={`Confirm you want to ${action} this identity document.`}
          footer={
            <>
              <Button variant="outline" onClick={() => setAction(null)}>
                Cancel
              </Button>
              <Button
                variant={action === "reject" ? "destructive" : "default"}
                disabled={
                  mutation.isPending ||
                  (action === "reject" && reason.trim().length < 5)
                }
                onClick={() => mutation.mutate()}
              >
                {mutation.isPending && (
                  <RotateCw data-icon="inline-start" className="animate-spin" />
                )}
                Confirm
              </Button>
            </>
          }
        >
          {action === "reject" && (
            <Textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Reason for rejection"
            />
          )}
        </AdminActionDialog>
      </main>
    </AdminWorkspace>
  );
}

const verificationChecks = [
  { id: "name-matches-id", label: "Name matches ID" },
  { id: "photo-is-clear", label: "Photo is clear" },
  { id: "document-is-valid", label: "Document is not expired" },
] as const;

function isPdfDocument(url: string, name: string) {
  return /\.pdf(?:$|[?#])/i.test(url) || /\.pdf$/i.test(name);
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
