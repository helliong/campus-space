import type { ReactNode } from "react";

import { DashboardAuthGuard } from "@/components/auth/dashboard-auth-guard";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { SiteFooter } from "@/components/layout/site-footer";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardAuthGuard>
      <div className="flex min-h-[100dvh] flex-col bg-canvas">
        <DashboardHeader />
        <div className="flex w-full flex-1 flex-col lg:flex-row">
          <DashboardSidebar />
          {children}
        </div>
        <SiteFooter bordered />
      </div>
    </DashboardAuthGuard>
  );
}
