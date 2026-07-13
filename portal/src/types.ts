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

// Shape returned by GET /api/profile — raw D1 rows, snake_case, booleans as 0/1.
export interface ProfileApiUser {
  id: string;
  full_name: string;
  email: string;
  email_verified: number;
  phone: string | null;
  phone_verified: number;
  whatsapp: string | null;
  whatsapp_verified: number;
  avatar_url: string | null;
  date_of_birth: string | null;
  nationality: string | null;
  passport_number: string | null;
  language: string | null;
  marital_status: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileApiDocument {
  label: string;
  value: string | null;
  verified: number;
}

export interface ProfileApiFinancial {
  employment_status: string | null;
  occupation: string | null;
  monthly_income_range: string | null;
  source_of_income: string | null;
  bank_name: string | null;
  bank_account_last4: string | null;
  bank_verified: number;
}

export interface ProfileApiResponse {
  user: ProfileApiUser;
  documents: ProfileApiDocument[];
  financial: ProfileApiFinancial | null;
}
