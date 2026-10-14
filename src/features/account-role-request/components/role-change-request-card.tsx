"use client";

import { useState } from "react";
import {
  ArrowRight,
  Clock3,
  ShieldCheck,
  Store,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import {
  useChatSessions,
  useCreateSupportRequest,
} from "@/features/messages/hooks/use-chat";
import {
  isRoleChangeRequestFor,
  ROLE_CHANGE_REQUESTS,
  type RoleChangeTarget,
} from "@/features/account-role-request/lib/role-change-request";
import { getApiErrorMessage } from "@/services/api-error";

const pendingStatuses = new Set(["PENDING", "ACTIVE"]);

const roleRequestContent = {
  VENDOR: {
    anchor: "become-vendor",
    title: "Become a vendor",
    description:
      "Request permission to list and manage properties on PropertyArk. An administrator must approve the request before your account is converted.",
    detail:
      "After approval, you must upload a valid government-issued ID and be verified before creating a property listing.",
    dialogTitle: "Request a vendor account?",
    dialogDescription:
      "PropertyArk administrators will review your account. Approval changes your role to Vendor, but property listing will remain locked until your identity is verified.",
    action: "Become a vendor",
    success: "Your vendor request was sent for administrator review.",
    failure: "Your vendor request could not be sent.",
    Icon: Store,
  },
  USER: {
    anchor: "switch-to-user",
    title: "Switch back to user",
    description:
      "Request to return to the standard PropertyArk user experience. An administrator must approve the role change.",
    detail:
      "Your vendor properties, verification details, transactions, and other records will remain stored. Vendor-only tools will be unavailable while your role is User.",
    dialogTitle: "Request to switch back to User?",
    dialogDescription:
      "An administrator will review the request. After approval, this session will move to your user dashboard while your existing vendor data remains preserved.",
    action: "Switch back to user",
    success: "Your request to switch back to User was sent for review.",
    failure: "Your role-change request could not be sent.",
    Icon: UserRound,
  },
} satisfies Record<RoleChangeTarget, Record<string, string | typeof Store>>;

export function RoleChangeRequestCard({
  targetRole,
}: {
  targetRole: RoleChangeTarget;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const sessions = useChatSessions();
  const createRequest = useCreateSupportRequest();
  const definition = ROLE_CHANGE_REQUESTS[targetRole];
  const content = roleRequestContent[targetRole];
  const Icon = content.Icon;
  const existingRequest = sessions.data?.find((request) =>
    isRoleChangeRequestFor(request, targetRole),
  );
  const requestPending =
    submitted ||
    Boolean(
      existingRequest &&
      pendingStatuses.has(existingRequest.status.toUpperCase()),
    );

  function submitRequest() {
    createRequest.mutate(
      {
        subject: definition.subject,
        description: definition.description,
        priority: "NORMAL",
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          setDialogOpen(false);
          toast.success(content.success);
        },
        onError: (error) =>
          toast.error(getApiErrorMessage(error, content.failure)),
      },
    );
  }

  return (
    <Card id={content.anchor} className="scroll-mt-24 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Icon className="text-primary" /> {content.title}
        </CardTitle>
        <CardDescription className="max-w-2xl leading-6">
          {content.description}
        </CardDescription>
        {requestPending && (
          <CardAction>
            <Badge variant="secondary">
              <Clock3 data-icon="inline-start" /> Request pending
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
        <p className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 shrink-0 text-primary" />
          {content.detail}
        </p>
      </CardContent>
      <CardFooter>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              disabled={
                sessions.isLoading || requestPending || createRequest.isPending
              }
            >
              {requestPending ? (
                <Clock3 data-icon="inline-start" />
              ) : (
                <Icon data-icon="inline-start" />
              )}
              {requestPending ? "Request pending" : content.action}
              {!requestPending && <ArrowRight data-icon="inline-end" />}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{content.dialogTitle}</DialogTitle>
              <DialogDescription>{content.dialogDescription}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={createRequest.isPending}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                onClick={submitRequest}
                disabled={createRequest.isPending}
              >
                {createRequest.isPending && (
                  <Spinner data-icon="inline-start" />
                )}
                {createRequest.isPending ? "Sending…" : "Send request"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
