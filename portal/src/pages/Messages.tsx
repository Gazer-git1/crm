import { useMemo, useState } from "react";
import {
  Video,
  Phone,
  MoreVertical,
  Lock,
  Paperclip,
  Smile,
  Send,
  FileText,
  Download,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  applicationOverview,
  conversations,
  messagesByConversation,
  profile,
} from "@/data/mock";
import type { ChannelType } from "@/types";

const FILTERS: { key: "all" | ChannelType; label: string; count: number }[] = [
  { key: "all", label: "All Messages", count: 24 },
  { key: "portal", label: "Portal", count: 10 },
  { key: "email", label: "Email", count: 8 },
  { key: "whatsapp", label: "WhatsApp", count: 4 },
  { key: "system", label: "System", count: 2 },
];

export function MessagesPage() {
  const [activeFilter, setActiveFilter] = useState<"all" | ChannelType>("all");
  const [activeConversationId, setActiveConversationId] = useState(conversations[0].id);
  const [draft, setDraft] = useState("");

  const activeConversation = conversations.find((c) => c.id === activeConversationId)!;
  const thread = messagesByConversation[activeConversationId] ?? [];

  const filteredConversations = useMemo(
    () =>
      activeFilter === "all"
        ? conversations
        : conversations.filter((c) => c.channel === activeFilter),
    [activeFilter],
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-950">Messages</h1>
        <p className="mt-1 text-sm text-slate-500">All your conversations in one place.</p>
        <p className="text-sm text-slate-500">
          We combine messages from your Homeownership Advisor, email, WhatsApp and the portal.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={cn(
              "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              activeFilter === f.key
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
            )}
          >
            {f.label}
            <span
              className={cn(
                "rounded-full px-1.5 text-xs",
                activeFilter === f.key ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500",
              )}
            >
              {f.count}
            </span>
          </button>
        ))}

        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-400">
            <Search className="h-4 w-4" />
            <input
              placeholder="Search messages..."
              className="w-48 bg-transparent outline-none placeholder:text-slate-400"
            />
          </div>
          <Button variant="outline" size="icon">
            <SlidersHorizontal className="h-4 w-4 text-slate-500" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_1fr_300px]">
        {/* Conversation list */}
        <Card className="flex h-[720px] flex-col">
          <CardHeader className="border-b-0 pb-2">
            <CardTitle className="text-base">Conversations</CardTitle>
          </CardHeader>
          <div className="flex-1 overflow-y-auto px-2">
            {filteredConversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveConversationId(c.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors",
                  activeConversationId === c.id ? "bg-blue-50" : "hover:bg-slate-50",
                )}
              >
                <Avatar name={c.contactName} online={c.online} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-blue-950">
                      {c.contactName}
                    </span>
                    <span className="shrink-0 text-[11px] text-slate-400">{c.lastMessageAt}</span>
                  </div>
                  <p className="text-xs text-slate-400">{c.contactRole}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{c.lastMessagePreview}</p>
                </div>
                {c.unreadCount > 0 && (
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                    {c.unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="border-t border-slate-100 p-3">
            <Button variant="outline" className="w-full justify-center">
              View more conversations
            </Button>
          </div>
        </Card>

        {/* Thread */}
        <Card className="flex h-[720px] flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-3">
              <Avatar name={activeConversation.contactName} online={activeConversation.online} />
              <div>
                <p className="flex items-center gap-1.5 text-sm font-semibold text-blue-950">
                  {activeConversation.contactName}
                  {activeConversation.online && (
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  )}
                </p>
                <p className="text-xs text-slate-400">{activeConversation.contactRole}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-slate-400">
              <Video className="h-4.5 w-4.5 h-5 w-5 cursor-pointer hover:text-slate-600" />
              <Phone className="h-5 w-5 cursor-pointer hover:text-slate-600" />
              <MoreVertical className="h-5 w-5 cursor-pointer hover:text-slate-600" />
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-800">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                This is a secure conversation. We'll never ask for your password or banking
                details.
              </span>
            </div>

            {thread.map((m, idx) => {
              const showDay = m.dayLabel && (idx === 0 || thread[idx - 1].dayLabel !== m.dayLabel);
              return (
                <div key={m.id}>
                  {showDay && (
                    <div className="my-4 flex items-center justify-center">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-400">
                        {m.dayLabel}
                      </span>
                    </div>
                  )}
                  {m.author === "them" ? (
                    <div className="flex items-start gap-2.5">
                      <Avatar name={m.authorName} size="sm" />
                      <div className="max-w-[80%]">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs font-semibold text-blue-950">
                            {m.authorName}
                          </span>
                          <span className="text-[11px] text-slate-400">{m.sentAt}</span>
                        </div>
                        <div className="mt-1 space-y-1.5 rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3 text-sm text-slate-700">
                          {m.body.map((line, i) => (
                            <p key={i}>{line}</p>
                          ))}
                        </div>
                        {m.attachment && (
                          <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500 text-white">
                              <FileText className="h-4 w-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-medium text-slate-700">
                                {m.attachment.name}
                              </p>
                              <p className="text-[11px] text-slate-400">{m.attachment.sizeLabel}</p>
                            </div>
                            <Download className="h-4 w-4 shrink-0 cursor-pointer text-slate-400 hover:text-slate-600" />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <div className="max-w-[80%] text-right">
                        <div className="inline-block space-y-1.5 rounded-2xl rounded-tr-sm bg-blue-600 px-4 py-3 text-left text-sm text-white">
                          {m.body.map((line, i) => (
                            <p key={i}>{line}</p>
                          ))}
                        </div>
                        <p className="mt-1 text-[11px] text-slate-400">
                          {m.sentAt} {m.read && "· Read"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t border-slate-100 p-4">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
              <Paperclip className="h-4 w-4 cursor-pointer text-slate-400 hover:text-slate-600" />
              <Smile className="h-4 w-4 cursor-pointer text-slate-400 hover:text-slate-600" />
              <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
              <Lock className="h-3 w-3" /> Your messages are secure and encrypted.
            </p>
          </div>
        </Card>

        {/* Info panel */}
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Contact &amp; Application Info</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar name={activeConversation.contactName} online={activeConversation.online} />
                <div>
                  <p className="text-sm font-semibold text-blue-950">
                    {activeConversation.contactName}
                  </p>
                  <p className="text-xs text-slate-400">{activeConversation.contactRole}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <p>{profile.phone}</p>
                <p className="truncate">sarah@investorsangels.ae</p>
                <p className="text-blue-600">View Profile</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Application Overview</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-slate-400">Application Number</p>
                <p className="font-medium text-blue-950">{applicationOverview.applicationNumber}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Property</p>
                <p className="font-medium text-blue-950">{applicationOverview.propertyName}</p>
                <p className="text-xs text-slate-500">{applicationOverview.propertyLocation}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Property Price</p>
                <p className="font-medium text-blue-950">{applicationOverview.propertyPrice}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Selected Plan</p>
                <p className="font-medium text-blue-950">{applicationOverview.planLabel}</p>
                <p className="text-xs text-slate-500">• {applicationOverview.planDetail}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Status</p>
                <Badge tone="green">{applicationOverview.status}</Badge>
              </div>
              <Button variant="outline" className="w-full justify-center">
                View Application
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="text-center">
              <p className="text-sm font-semibold text-blue-950">Need Help?</p>
              <Button variant="outline" className="mt-3 w-full justify-center">
                Need Help?
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
