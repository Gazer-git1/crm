import type { ReactNode } from "react";
import { TopNav } from "./TopNav";

export function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav />
      <main className="mx-auto max-w-[1440px] px-6 py-8">{children}</main>
    </div>
  );
}
