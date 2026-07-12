import type {
  ApplicationOverview,
  Conversation,
  FinancialInfo,
  IdentityDocument,
  Message,
  ProfileCompletionItem,
  UserProfile,
} from "@/types";

export const conversations: Conversation[] = [
  {
    id: "sarah",
    contactName: "Sarah Al Mansouri",
    contactRole: "Homeownership Advisor",
    avatarUrl: "",
    online: true,
    channel: "portal",
    lastMessagePreview: "Received, thank you! Your home is now reserved.",
    lastMessageAt: "10:28 AM",
    unreadCount: 2,
  },
  {
    id: "team",
    contactName: "Investors' Angels Team",
    contactRole: "Support",
    avatarUrl: "",
    online: false,
    channel: "system",
    lastMessagePreview:
      "Important update about your application IA-APP-2026-0612-0017",
    lastMessageAt: "Yesterday",
    unreadCount: 1,
  },
  {
    id: "legal",
    contactName: "Legal Team",
    contactRole: "Documentation",
    avatarUrl: "",
    online: false,
    channel: "email",
    lastMessagePreview: "Please review and sign the attached document.",
    lastMessageAt: "13 Jun",
    unreadCount: 0,
  },
  {
    id: "support",
    contactName: "Support Team",
    contactRole: "Customer Care",
    avatarUrl: "",
    online: false,
    channel: "portal",
    lastMessagePreview: "Thanks for reaching out. We're here to help.",
    lastMessageAt: "11 Jun",
    unreadCount: 0,
  },
];

export const messagesByConversation: Record<string, Message[]> = {
  sarah: [
    {
      id: "m1",
      conversationId: "sarah",
      author: "them",
      authorName: "Sarah Al Mansouri",
      body: [
        "Great news! 🎉",
        "Your investor has confirmed the funding and is ready to proceed.",
        "The next step is to review and sign your Preliminary Lease-to-Own Agreement.",
        "You can do that directly in the portal.",
        "Let me know if you have any questions.",
      ],
      sentAt: "10:24 AM",
      dayLabel: "Today",
    },
    {
      id: "m2",
      conversationId: "sarah",
      author: "me",
      authorName: "John Doe",
      body: ["That's fantastic! Thank you for the update. I'll review and sign it today."],
      sentAt: "10:28 AM",
      read: true,
    },
    {
      id: "m3",
      conversationId: "sarah",
      author: "them",
      authorName: "Sarah Al Mansouri",
      body: [
        "Perfect 🙌",
        "I've also attached a summary of your agreement for your reference.",
      ],
      sentAt: "10:30 AM",
      attachment: {
        name: "Preliminary_Lease_to_Own_Agreement_Summary.pdf",
        sizeLabel: "1.2 MB",
        kind: "pdf",
      },
    },
    {
      id: "m4",
      conversationId: "sarah",
      author: "them",
      authorName: "Sarah Al Mansouri",
      body: [
        "Hi John,",
        "Just a reminder that your Security Deposit is now due to reserve your home.",
        "You can make the payment securely through the portal.",
        "Once we receive it, we'll confirm your commitment and move to the next stage.",
      ],
      sentAt: "4:15 PM",
      dayLabel: "Yesterday",
    },
    {
      id: "m5",
      conversationId: "sarah",
      author: "me",
      authorName: "John Doe",
      body: ["Thank you! I've just made the payment. Please confirm once you receive it."],
      sentAt: "4:20 PM",
      read: true,
    },
    {
      id: "m6",
      conversationId: "sarah",
      author: "them",
      authorName: "Sarah Al Mansouri",
      body: [
        "Received, thank you! ✅",
        "Your home is now reserved.",
        "We'll keep you updated as we move forward.",
      ],
      sentAt: "4:25 PM",
    },
  ],
  team: [
    {
      id: "t1",
      conversationId: "team",
      author: "them",
      authorName: "Investors' Angels Team",
      body: [
        "Important update about your application IA-APP-2026-0612-0017.",
        "Your funding has been confirmed — see Sarah's message for next steps.",
      ],
      sentAt: "Yesterday",
      dayLabel: "Yesterday",
    },
  ],
  legal: [
    {
      id: "l1",
      conversationId: "legal",
      author: "them",
      authorName: "Legal Team",
      body: ["Please review and sign the attached document."],
      sentAt: "13 Jun",
      dayLabel: "13 Jun",
      attachment: {
        name: "Lease_to_Own_Agreement.pdf",
        sizeLabel: "980 KB",
        kind: "pdf",
      },
    },
  ],
  support: [
    {
      id: "s1",
      conversationId: "support",
      author: "them",
      authorName: "Support Team",
      body: ["Thanks for reaching out. We're here to help."],
      sentAt: "11 Jun",
      dayLabel: "11 Jun",
    },
  ],
};

export const applicationOverview: ApplicationOverview = {
  applicationNumber: "IA-APP-2026-0612-0017",
  propertyName: "Burj Royale – 2BR Apartment",
  propertyLocation: "Downtown Dubai",
  propertyPrice: "AED 2,750,000",
  planLabel: "6 Years Lease Term",
  planDetail: "35% Target Purchase Option Balance",
  status: "In Progress",
};

export const profile: UserProfile = {
  fullName: "John Doe",
  dateOfBirth: "15 Mar 1985",
  nationality: "United States",
  passportNumber: "A12345678",
  language: "English",
  maritalStatus: "Married",
  avatarUrl: "",
  email: "john.doe@email.com",
  emailVerified: true,
  phone: "+971 50 123 4567",
  phoneVerified: true,
  whatsapp: "+971 50 123 4567",
  whatsappVerified: true,
  address: "Downtown Dubai, Dubai, UAE",
};

export const identityDocuments: IdentityDocument[] = [
  { label: "Passport", value: "A12345678", verified: true },
  { label: "Emirates ID (UAE Resident)", value: "784-1985-1234567-1", verified: true },
  { label: "Proof of Address", value: "Utility Bill · 12 May 2026", verified: true },
];

export const financialInfo: FinancialInfo = {
  employmentStatus: "Employed",
  occupation: "Business Owner",
  monthlyIncome: "AED 35,000 - 50,000",
  sourceOfIncome: "Business Income",
  bankName: "Emirates NBD",
  bankAccountLast4: "1234",
  bankVerified: true,
};

export const profileCompletion: ProfileCompletionItem[] = [
  { label: "Personal Information", done: true },
  { label: "Contact Information", done: true },
  { label: "Identity Documents", done: true },
  { label: "Financial Information", done: true },
  { label: "Security & Login", done: true },
  { label: "Notification Preferences", done: false },
];

export const profileCompletionPercent = Math.round(
  (profileCompletion.filter((i) => i.done).length / profileCompletion.length) * 100,
);
