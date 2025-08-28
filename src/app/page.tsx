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
import AIChat from "../components/AIChat";
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

  const [chatOpen, setChatOpen] = useState(false);
  const [chatPrompt, setChatPrompt] = useState<string | null>(null);

  const handleAskAI = (prompt: string) => {
    setChatPrompt(prompt);
    setChatOpen(true);
  };

  const view = (() => {
    switch (tab) {
      case "test":
        return <TestContent />;
      case "history": 
        return <TestHistory onAskAI={handleAskAI} />;
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

  // NOTE: UI-only helpers (no state, no side effects)
  const tabLabel =
    tab === "test" ? "Test Section" :
    tab === "history" ? "Test History" :
    tab === "ClarityKPIs" ? "Clarity KPIs" :
    tab === "ClarityDevicesChart" ? "Clarity Charts" :
    tab === "ClarityTopPages" ? "Clarity Top Pages" :
    "Dashboard";

  const TabIcon = tab === "test"
    ? FlaskConical
    : tab === "history"
      ? History
      : FileText;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background text-foreground">
        {/* Sidebar */}
        <Sidebar className="border-r bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/30">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-xl sm:text-2xl font-semibold tracking-tight py-6 px-4">
                <span className="bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent">Dashboard PIP</span>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="px-2">
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={tab === "test"}>
                      <button
                        onClick={() => setTab("test")}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-current={tab === "test" ? "page" : undefined}
                        title="Run and debug tests"
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
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-current={tab === "history" ? "page" : undefined}
                        title="Previous runs and artifacts"
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
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-current={tab === "ClarityKPIs" ? "page" : undefined}
                        title="Microsoft Clarity KPIs"
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
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-current={tab === "ClarityDevicesChart" ? "page" : undefined}
                        title="Devices and charts"
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
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-current={tab === "ClarityTopPages" ? "page" : undefined}
                        title="Top pages"
                      >
                        <FileText className="size-4" />
                        <span>Clarity Top Pages</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>

                {/* Footer note */}
                <div className="mt-6 px-4 pb-4">
                  <p className="text-center text-xs text-muted-foreground">
                    By dev-team
                  </p>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Main */}
        <SidebarInset className="flex-1 flex flex-col w-full min-h-screen">
          {/* Topbar */}
          <div className="sticky top-0 z-20 flex items-center gap-3 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6 py-3">
            <SidebarTrigger
              className="cursor-pointer rounded-md border hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Toggle sidebar"
            />
            <div className="flex items-center gap-2">
              {TabIcon ? <TabIcon className="size-4 text-muted-foreground" /> : null}
              <h1 className="text-sm sm:text-base font-medium tracking-tight">
                {tabLabel}
              </h1>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 w-full h-full overflow-auto p-4 sm:p-6">
            <div className="mx-auto max-w-[1400px]">
              {view}
            </div>
          </div>
        </SidebarInset>
      </div>

      {/* AI Chat */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogTrigger asChild>
          <button
            className="fixed bottom-4 right-4 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-3 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
            onClick={() => { setChatPrompt(null); }} // clear seed if opened via FAB
            aria-label="Open AI Assistant"
            title="Open AI Assistant"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-xl rounded-xl border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 p-0 overflow-hidden">
          <DialogHeader className="px-5 pt-4 pb-2">
            <DialogTitle className="text-base font-semibold">AI Assistent PIP</DialogTitle>
          </DialogHeader>
          <div className="px-5 pb-5">
            {/* Pass the seed prompt to the chat */}
            <AIChat initialMessage={chatPrompt ?? ""} />
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
