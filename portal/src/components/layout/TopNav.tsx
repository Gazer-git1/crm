import { NavLink } from "react-router-dom";
import {
  Home,
  Building2,
  ShieldCheck,
  ClipboardList,
  Mail,
  User,
  Settings,
  Bell,
  ChevronDown,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", label: "My Home", icon: Home, end: true },
  { to: "/properties", label: "Properties", icon: Building2 },
  { to: "/verification", label: "Verification", icon: ShieldCheck },
  { to: "/application", label: "My Application", icon: ClipboardList },
  { to: "/messages", label: "Messages", icon: Mail, badge: 2 },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/account", label: "Account", icon: Settings },
];

export function TopNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6">
        <div className="flex items-center gap-1.5">
          <span className="text-xl">🦅</span>
          <span className="text-sm font-bold leading-tight text-blue-950">
            INVESTORS'
            <br />
            ANGELS
          </span>
        </div>

        <nav className="flex items-center gap-6">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "relative flex flex-col items-center gap-1 pb-4 pt-1 text-[11px] font-medium text-slate-500 hover:text-blue-700",
                  isActive && "text-blue-700",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                    {badge && (
                      <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                        {badge}
                      </span>
                    )}
                  </span>
                  {label}
                  {isActive && (
                    <span className="absolute -bottom-px h-0.5 w-full rounded-full bg-blue-700" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button className="text-slate-400 hover:text-slate-600" aria-label="Notifications">
            <Bell className="h-5 w-5" strokeWidth={1.8} />
          </button>
          <div className="flex items-center gap-2">
            <Avatar name="John Doe" size="sm" />
            <span className="text-sm font-medium text-slate-700">John Doe</span>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </div>
        </div>
      </div>
    </header>
  );
}
