"use client";

import { useState } from "react";
import TestContent from "../components/TestContent";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "../components/ui/sidebar";
import { FlaskConical, FileText } from "lucide-react";

export default function DashboardPage() {
  const [tab, setTab] = useState<"test" | "reports">("test");

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar className="border-r">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={tab === "test"}
                    >
                      <button
                        onClick={() => setTab("test")}
                        className="flex w-full items-center gap-2"
                      >
                        <FlaskConical className="size-4" />
                        <span>Test</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={tab === "reports"}
                    >
                      <button
                        onClick={() => setTab("reports")}
                        className="flex w-full items-center gap-2"
                      >
                        <FileText className="size-4" />
                        <span>Reports</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="flex-1 p-4">
          <SidebarTrigger className="mb-4 md:hidden" />
          {tab === "test" ? (
            <TestContent />
          ) : (
            <iframe src="/reports/index.html" className="w-full h-[80vh]" />
          )}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
