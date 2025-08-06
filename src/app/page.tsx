"use client";

import { useState } from "react";
import TestContent from "../components/TestContent";
import TestHistory from "../components/TestHistory";
import Temp from "../components/Temp";
import ClarityKPIs from "../components/dashboard/ClarityKPIs";
import ClarityDevicesChart from "../components/dashboard/ClarityDevicesChart";
import ClarityTopPages from "../components/dashboard/ClarityTopPages";
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

import { FlaskConical, FileText, History, MessageCircle } from "lucide-react";
import DeepseekChat from "../components/DeepseekChat";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

export default function DashboardPage() {
  const [tab, setTab] = useState<"test" | "history" | "temp" | "ClarityKPIs" |  "ClarityDevicesChart" | "ClarityTopPages">(
    "test"
  );

  const view = (() => {
    switch (tab) {
      case "test":
        return <TestContent />;
      case "history":
        return <TestHistory />;
      case "temp":
        return <Temp />;
      case "ClarityKPIs":
        return <ClarityKPIs />;
      case "ClarityDevicesChart":
        return <ClarityDevicesChart />;
      case "ClarityTopPages":
        return <ClarityTopPages />;
      default:
        return null;
    }
  })();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar className="border-r">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-2xl text-amber-50 mb-8">
                Dashboard PIP
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={tab === "test"}>
                      <button
                        onClick={() => setTab("test")}
                        className="flex w-full items-center gap-2"
                      >
                        <FlaskConical className="size-4" />
                        <span>Test Section</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={tab === "history"}>
                      <button
                        onClick={() => setTab("history")}
                        className="flex w-full items-center gap-2"
                      >
                        <History className="size-4" />
                        <span>Test History</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={tab === "ClarityKPIs"}>
                      <button
                        onClick={() => setTab("ClarityKPIs")}
                        className="flex w-full items-center gap-2"
                      >
                        <FileText className="size-4" />
                        <span>Clarity KPIs</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={tab === "ClarityDevicesChart"}>
                      <button
                        onClick={() => setTab("ClarityDevicesChart")}
                        className="flex w-full items-center gap-2"
                      >
                        <FileText className="size-4" />
                        <span>Clarity Charts</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={tab === "ClarityTopPages"}>
                      <button
                        onClick={() => setTab("ClarityTopPages")}
                        className="flex w-full items-center gap-2"
                      >
                        <FileText className="size-4" />
                        <span>Clarity Top Pages</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <p className="text-center text-sm text-gray-500 mb-2">By dev-team</p>
        </Sidebar>

        <SidebarInset className="flex-1 flex flex-col w-full min-h-screen p-0 m-0">
          <SidebarTrigger className="cursor-pointer mb-4" />
          
          <div className="flex-1 w-full h-full overflow-auto p-6">
            {view}
          </div>
        </SidebarInset>
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <button className="fixed bottom-4 right-4 rounded-full bg-blue-500 text-white p-3 shadow-lg">
            <MessageCircle className="w-5 h-5" />
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Deepseek Chat</DialogTitle>
          </DialogHeader>
          <DeepseekChat />
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
