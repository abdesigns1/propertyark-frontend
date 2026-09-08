export interface ConversationPreview {
  id: string;
  name: string;
  initials: string;
  preview: string;
  time: string;
  unread: number;
  online: boolean;
}

const buyerConversations: ConversationPreview[] = [
  {
    id: "buyer-preview-1",
    name: "James John",
    initials: "JJ",
    preview: "Thanks for your interest in the property...",
    time: "04:24 AM",
    unread: 2,
    online: true,
  },
  {
    id: "buyer-preview-2",
    name: "Prime Estates",
    initials: "PE",
    preview: "The inspection time is available.",
    time: "Yesterday",
    unread: 0,
    online: false,
  },
  {
    id: "buyer-preview-3",
    name: "PropertyArk Support",
    initials: "PA",
    preview: "How can we help with your enquiry?",
    time: "Mon",
    unread: 0,
    online: true,
  },
];

const vendorConversations: ConversationPreview[] = [
  {
    id: "vendor-preview-1",
    name: "Ayeni Victor",
    initials: "AV",
    preview: "Is the property still available?",
    time: "04:24 AM",
    unread: 2,
    online: true,
  },
  {
    id: "vendor-preview-2",
    name: "John Doe",
    initials: "JD",
    preview: "Perfect! The inspection date works for me.",
    time: "Yesterday",
    unread: 0,
    online: false,
  },
  {
    id: "vendor-preview-3",
    name: "PropertyArk Support",
    initials: "PA",
    preview: "Your listing enquiry has been received.",
    time: "Mon",
    unread: 0,
    online: true,
  },
];

export function messagePreviewData(role: "buyer" | "vendor") {
  return role === "vendor" ? vendorConversations : buyerConversations;
}
