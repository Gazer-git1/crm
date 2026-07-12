export type ChannelType = "portal" | "email" | "whatsapp" | "system";

export interface Conversation {
  id: string;
  contactName: string;
  contactRole: string;
  avatarUrl: string;
  online: boolean;
  channel: ChannelType;
  lastMessagePreview: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface Attachment {
  name: string;
  sizeLabel: string;
  kind: "pdf" | "image" | "file";
}

export interface Message {
  id: string;
  conversationId: string;
  author: "me" | "them";
  authorName: string;
  avatarUrl?: string;
  body: string[];
  sentAt: string;
  read?: boolean;
  attachment?: Attachment;
  dayLabel?: string;
}

export interface ApplicationOverview {
  applicationNumber: string;
  propertyName: string;
  propertyLocation: string;
  propertyPrice: string;
  planLabel: string;
  planDetail: string;
  status: "In Progress" | "Approved" | "Pending" | "Rejected";
}

export interface ProfileCompletionItem {
  label: string;
  done: boolean;
}

export interface UserProfile {
  fullName: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  language: string;
  maritalStatus: string;
  avatarUrl: string;
  email: string;
  emailVerified: boolean;
  phone: string;
  phoneVerified: boolean;
  whatsapp: string;
  whatsappVerified: boolean;
  address: string;
}

export interface IdentityDocument {
  label: string;
  value: string;
  verified: boolean;
}

export interface FinancialInfo {
  employmentStatus: string;
  occupation: string;
  monthlyIncome: string;
  sourceOfIncome: string;
  bankName: string;
  bankAccountLast4: string;
  bankVerified: boolean;
}
