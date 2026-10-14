import type { ChatSession } from "@/features/messages/types/chat.types";

export type RoleChangeTarget = "USER" | "VENDOR";

export const ROLE_CHANGE_REQUESTS: Record<
  RoleChangeTarget,
  { subject: string; description: string }
> = {
  VENDOR: {
    subject: "Become a vendor request",
    description:
      "I would like my PropertyArk user account to be reviewed and converted to a vendor account. I understand that I must complete identity verification before I can list a property.",
  },
  USER: {
    subject: "Switch back to user request",
    description:
      "I would like my PropertyArk vendor account to be reviewed and switched back to a user account. I understand that my vendor records will remain stored, but vendor-only tools will no longer be available while my account role is User.",
  },
};

export function getRoleChangeRequestTarget(
  request: Pick<ChatSession, "subject">,
): RoleChangeTarget | null {
  const subject = request.subject.trim().toLowerCase();
  for (const [target, definition] of Object.entries(ROLE_CHANGE_REQUESTS)) {
    if (subject === definition.subject.toLowerCase()) {
      return target as RoleChangeTarget;
    }
  }
  return null;
}

export function isRoleChangeRequestFor(
  request: Pick<ChatSession, "subject">,
  target: RoleChangeTarget,
) {
  return getRoleChangeRequestTarget(request) === target;
}
