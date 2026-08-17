import {
  CheckCircle2,
  CircleEllipsis,
  ExternalLink,
  Flag,
  KeyRound,
  Mail,
  Phone,
  Send,
} from "lucide-react";
import {
  formatAdminDate,
  getUserInitials,
} from "@/features/admin/lib/user-display";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { Property } from "@/features/properties/types";
import type { AdminUser } from "@/services/admin.service";
import { DeleteAccountButton } from "@/features/admin/components/delete-account-button";

export function VendorProfileSidebar({
  user,
  properties,
  propertiesLoading,
}: {
  user: AdminUser;
  properties: Property[];
  propertiesLoading: boolean;
}) {
  return (
    <aside className="flex flex-col gap-6">
      <VendorIdentityCard
        user={user}
        propertyCount={properties.length}
        propertiesLoading={propertiesLoading}
      />
      <VendorAdminActions user={user} />
      <VerificationChecklist user={user} />
    </aside>
  );
}

function VendorIdentityCard({
  user,
  propertyCount,
  propertiesLoading,
}: {
  user: AdminUser;
  propertyCount: number;
  propertiesLoading: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center px-6 py-7 text-center">
        <div className="relative">
          <Avatar className="size-32 rounded-2xl border-4 border-background shadow-lg">
            <AvatarImage src={user.avatar ?? undefined} alt={user.fullName} />
            <AvatarFallback className="rounded-2xl bg-primary/10 text-3xl text-primary">
              {getUserInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>
          <Badge className="absolute -right-3 -bottom-2 bg-warning text-warning-foreground">
            Vendor
          </Badge>
        </div>

        <h2 className="mt-6 text-2xl font-semibold">{user.fullName}</h2>
        <a
          className="mt-2 inline-flex items-center gap-1 text-muted-foreground hover:text-primary"
          href={`mailto:${user.email}`}
        >
          <Mail className="size-4" />
          {user.email}
        </a>
        <a
          className="mt-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
          href={user.phone ? `tel:${user.phone}` : undefined}
        >
          <Phone className="size-4" />
          {user.phone || "Phone not provided"}
        </a>

        <Separator className="my-7" />
        <div className="grid w-full grid-cols-2">
          {propertiesLoading ? (
            <Skeleton className="mx-auto h-11 w-16" />
          ) : (
            <Metric label="Properties" value={propertyCount.toString()} />
          )}
          <Metric label="Sales" value="—" accent />
        </div>
        <div className="mt-6 w-full rounded-lg bg-primary/5 px-4 py-3">
          <p className="text-xs text-muted-foreground">Joined Platform</p>
          <p className="font-semibold">{formatAdminDate(user.createdAt)}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase">{label}</p>
      <p
        className={
          accent
            ? "text-lg font-medium text-warning"
            : "text-lg font-medium text-primary"
        }
      >
        {value}
      </p>
    </div>
  );
}

function VendorAdminActions({ user }: { user: AdminUser }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium uppercase tracking-wide text-muted-foreground">
          Administrative Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Button variant="outline" className="h-14 justify-start" disabled>
          <KeyRound data-icon="inline-start" /> Reset Password
        </Button>
        <Button variant="outline" className="h-14 justify-start" asChild>
          <a href={`mailto:${user.email}`}>
            <Send data-icon="inline-start" /> Send Direct Email
          </a>
        </Button>
        <Button
          variant="outline"
          className="h-14 justify-start text-destructive"
          disabled
        >
          <Flag data-icon="inline-start" /> Flag for Review
        </Button>
        <DeleteAccountButton
          userId={user.id}
          fullName={user.fullName}
          role={user.role}
        />
      </CardContent>
    </Card>
  );
}

function VerificationChecklist({ user }: { user: AdminUser }) {
  const identityPassed = user.ninVerificationStatus === "VERIFIED";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium uppercase tracking-wide text-muted-foreground">
          Verification Checklist
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ChecklistItem label="Identity ID (NIN)" passed={identityPassed} />
        <ChecklistItem label="Address Proof" passed={Boolean(user.location)} />
        <ChecklistItem label="Business License" passed={false} />
        <Button variant="link" className="mt-2" disabled>
          View Document Vault <ExternalLink data-icon="inline-end" />
        </Button>
      </CardContent>
    </Card>
  );
}

function ChecklistItem({ label, passed }: { label: string; passed: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {passed ? (
        <CheckCircle2 className="size-5 text-success" />
      ) : (
        <CircleEllipsis className="size-5 text-warning" />
      )}
      <span className="flex-1 text-sm font-medium">{label}</span>
      <Badge variant={passed ? "secondary" : "outline"}>
        {passed ? "Passed" : "Pending"}
      </Badge>
    </div>
  );
}
