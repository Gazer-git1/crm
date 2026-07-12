import {
  Pencil,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  FileBadge,
  IdCard,
  FileText,
  Landmark,
  Lock,
  Bell,
  ShieldCheck,
  ChevronRight,
  Camera,
  Check,
  Headphones,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  financialInfo,
  identityDocuments,
  profile,
  profileCompletion,
  profileCompletionPercent,
} from "@/data/mock";

function SectionEditButton() {
  return (
    <Button variant="outline" size="sm">
      <Pencil className="h-3.5 w-3.5" /> Edit
    </Button>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-medium text-blue-950">{value}</p>
    </div>
  );
}

export function ProfilePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-950">Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your personal information and account settings.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <SectionEditButton />
            </CardHeader>
            <CardBody className="flex flex-wrap gap-8">
              <div className="relative">
                <Avatar name={profile.fullName} size="lg" />
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white ring-2 ring-white">
                  <Camera className="h-3 w-3" />
                </span>
              </div>
              <div className="grid flex-1 grid-cols-2 gap-x-8 gap-y-4">
                <Field label="Full Name" value={profile.fullName} />
                <Field label="Date of Birth" value={profile.dateOfBirth} />
                <Field label="Nationality" value={profile.nationality} />
                <Field label="Passport Number" value={profile.passportNumber} />
                <Field label="Language" value={profile.language} />
                <Field label="Marital Status" value={profile.maritalStatus} />
              </div>
            </CardBody>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <SectionEditButton />
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Mail className="h-4 w-4 text-slate-400" /> {profile.email}
                </div>
                {profile.emailVerified && <Badge tone="green">Verified</Badge>}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Phone className="h-4 w-4 text-slate-400" /> {profile.phone}
                </div>
                {profile.phoneVerified && <Badge tone="green">Verified</Badge>}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <MessageCircle className="h-4 w-4 text-slate-400" /> {profile.whatsapp}
                </div>
                {profile.whatsappVerified && <Badge tone="green">Verified</Badge>}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <MapPin className="h-4 w-4 text-slate-400" /> {profile.address}
              </div>
            </CardBody>
          </Card>

          {/* Identity Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Identity Documents</CardTitle>
              <SectionEditButton />
            </CardHeader>
            <CardBody className="space-y-1">
              {identityDocuments.map((doc) => (
                <div
                  key={doc.label}
                  className="flex items-center justify-between rounded-lg px-2 py-2.5 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    {doc.label.startsWith("Emirates") ? (
                      <IdCard className="h-4 w-4 text-slate-400" />
                    ) : doc.label.startsWith("Proof") ? (
                      <FileText className="h-4 w-4 text-slate-400" />
                    ) : (
                      <FileBadge className="h-4 w-4 text-slate-400" />
                    )}
                    <span>{doc.label}</span>
                    <span className="text-slate-400">{doc.value}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.verified && <Badge tone="green">Verified</Badge>}
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </div>
                </div>
              ))}
              <button className="pt-2 text-sm font-medium text-blue-600 hover:underline">
                View all documents
              </button>
            </CardBody>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
              <SectionEditButton />
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <span className="text-slate-400">Employment Status</span>
                <span className="text-right font-medium text-blue-950">
                  {financialInfo.employmentStatus}
                </span>
                <span className="text-slate-400">Occupation</span>
                <span className="text-right font-medium text-blue-950">
                  {financialInfo.occupation}
                </span>
                <span className="text-slate-400">Monthly Income</span>
                <span className="text-right font-medium text-blue-950">
                  {financialInfo.monthlyIncome}
                </span>
                <span className="text-slate-400">Source of Income</span>
                <span className="text-right font-medium text-blue-950">
                  {financialInfo.sourceOfIncome}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Landmark className="h-4 w-4 text-slate-400" />
                  {financialInfo.bankName} •••• {financialInfo.bankAccountLast4}
                </div>
                {financialInfo.bankVerified && <Badge tone="green">Verified</Badge>}
              </div>
              <button className="text-sm font-medium text-blue-600 hover:underline">
                View financial details
              </button>
            </CardBody>
          </Card>

          {/* Security & Login */}
          <Card>
            <CardHeader>
              <CardTitle>Security &amp; Login</CardTitle>
              <SectionEditButton />
            </CardHeader>
            <CardBody className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Password</span>
                <span className="flex items-center gap-2 text-slate-400">
                  ••••••••• <span className="text-xs">Last changed 12 May 2026</span>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Two-Factor Authentication</span>
                <Badge tone="green">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Login Email</span>
                <span className="text-slate-400">{profile.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Active Sessions</span>
                <span className="flex items-center gap-2 text-slate-400">
                  2 active sessions <ChevronRight className="h-4 w-4 text-slate-300" />
                </span>
              </div>
              <button className="text-sm font-medium text-blue-600 hover:underline">
                Manage security settings
              </button>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <Card>
            <CardBody className="space-y-1">
              <p className="text-sm font-semibold text-blue-950">Your information is secure</p>
              <p className="text-xs text-slate-500">
                We use bank-level encryption and secure systems to protect your data at every
                step.
              </p>
              <button className="text-sm font-medium text-blue-600 hover:underline">
                Learn more
              </button>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="text-center">
              <p className="text-sm font-semibold text-blue-950">Profile Completion</p>
              <div className="relative mx-auto my-4 flex h-28 w-28 items-center justify-center">
                <svg viewBox="0 0 36 36" className="h-28 w-28 -rotate-90">
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="3"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeDasharray={`${profileCompletionPercent} 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-xl font-bold text-blue-950">
                  {profileCompletionPercent}%
                </span>
              </div>
              <p className="text-sm font-semibold text-blue-950">Almost done!</p>
              <p className="mt-1 text-xs text-slate-500">
                Your profile is {profileCompletionPercent}% complete. Keep it updated to ensure a
                smooth application process.
              </p>
              <div className="mt-4 space-y-2 text-left">
                {profileCompletion.map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-sm">
                    <span
                      className={
                        item.done
                          ? "flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white"
                          : "h-4 w-4 rounded-full border-2 border-slate-200"
                      }
                    >
                      {item.done && <Check className="h-2.5 w-2.5" />}
                    </span>
                    <span className={item.done ? "text-slate-700" : "text-slate-400"}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="border-b-0 pb-2">
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              {[
                { icon: Pencil, title: "Update Profile", desc: "Review and update your personal information." },
                { icon: Lock, title: "Change Password", desc: "Update your password regularly." },
                { icon: FileText, title: "Manage Documents", desc: "Upload or update your documents." },
                { icon: Bell, title: "Notification Settings", desc: "Choose how you want to be notified." },
              ].map(({ icon: Icon, title, desc }) => (
                <button
                  key={title}
                  className="flex w-full items-start gap-3 rounded-lg p-2 text-left hover:bg-slate-50"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-blue-950">{title}</span>
                    <span className="block text-xs text-slate-400">{desc}</span>
                  </span>
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-300" />
                </button>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardBody className="text-center">
              <ShieldCheck className="mx-auto h-6 w-6 text-blue-600" />
              <p className="mt-2 text-sm font-semibold text-blue-950">Need Help?</p>
              <p className="text-xs text-slate-500">Our support team is here to help you.</p>
              <Button variant="outline" className="mt-3 w-full justify-center">
                <Headphones className="h-4 w-4" /> Contact Support
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-3">
              <p className="text-sm font-semibold text-blue-950">Your Homeownership Advisor</p>
              <div className="flex items-center gap-3">
                <Avatar name="Sarah Al Mansouri" online />
                <div>
                  <p className="text-sm font-medium text-blue-950">Sarah Al Mansouri</p>
                  <p className="text-xs text-slate-400">Homeownership Advisor</p>
                </div>
              </div>
              <div className="space-y-1 text-sm text-slate-600">
                <p className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-400" /> +971 50 123 4567
                </p>
              </div>
              <Button variant="outline" className="w-full justify-center">
                Message Sarah
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
