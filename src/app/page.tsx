"use client";

import { useState } from "react";
import TestContent from "../components/TestContent";
import TestHistory from "../components/TestHistory";
import Temp from "../components/Temp";
import ClarityDashboardContent from "../components/ClarityDashboardContent";
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

import { FlaskConical, FileText, History, MessageCircle, BarChart3 } from "lucide-react";
import AIChat from "../components/AIChat";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

export default function DashboardPage() {
  const [tab, setTab] = useState<"test" | "history" | "temp" | "clarity">("test");

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
      case "clarity":
        return <ClarityDashboardContent />;
      default:
        return null;
    }
  })();

  // NOTE: UI-only helpers (no state, no side effects)
  const tabLabel =
    tab === "test" ? "Test Section" :
    tab === "history" ? "Test History" :
    tab === "clarity" ? "Clarity Analytics" :
    "Dashboard";

  const TabIcon = tab === "test"
    ? FlaskConical
    : tab === "history"
      ? History
      : tab === "clarity"
        ? BarChart3
        : FileText;

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-white/5 bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur-xl">
          {/* Logo/Brand Header */}
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="relative group/logo">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-30 group-hover/logo:opacity-50 blur transition duration-300"></div>
                <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10">
                  <span className="text-2xl">🧪</span>
                </div>
              </div>
              <div>
                <h2 className="text-base font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  DevPiP
                </h2>
                <p className="text-xs text-white/40">AutoTest Suite</p>
              </div>
            </div>
          </div>

          <SidebarContent className="px-3 py-4">
            <SidebarGroup>
              <SidebarGroupLabel className="px-3 mb-2 text-white/40 uppercase tracking-wider text-[10px] font-bold">
                Testing Tools
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1.5">
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={tab === "test"}
                      className={tab === "test" ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white font-medium" : "hover:bg-white/5 text-white/70 hover:text-white"}
                    >
                      <button
                        onClick={() => setTab("test")}
                        title="Run and debug tests"
                      >
                        <FlaskConical className={tab === "test" ? "text-blue-400" : ""} />
                        <span>Test Runner</span>
                        {tab === "test" && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                        )}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={tab === "history"}
                      className={tab === "history" ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-white font-medium" : "hover:bg-white/5 text-white/70 hover:text-white"}
                    >
                      <button
                        onClick={() => setTab("history")}
                        title="Previous runs and artifacts"
                      >
                        <History className={tab === "history" ? "text-emerald-400" : ""} />
                        <span>Test History</span>
                        {tab === "history" && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        )}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <div className="my-4 mx-3 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

            <SidebarGroup>
              <SidebarGroupLabel className="px-3 mb-2 text-white/40 uppercase tracking-wider text-[10px] font-bold">
                Dashboard
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1.5">
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={tab === "clarity"}
                      className={tab === "clarity" ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-white font-medium" : "hover:bg-white/5 text-white/70 hover:text-white"}
                    >
                      <button
                        onClick={() => setTab("clarity")}
                        title="Microsoft Clarity Analytics Dashboard"
                      >
                        <BarChart3 className={tab === "clarity" ? "text-purple-400" : ""} />
                        <span>Clarity Dashboard</span>
                        {tab === "clarity" && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
                        )}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          {/* Footer with version info */}
          <div className="mt-auto p-4 border-t border-white/5">
            <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-medium text-white/70">System Status</span>
              </div>
              <p className="text-[10px] text-white/40">v2.0.0 • All systems operational</p>
              <p className="text-[10px] text-white/40">Dev Team PIP</p>
            </div>
          </div>
      </Sidebar>

      {/* Main */}
      <SidebarInset className="bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950">
          {/* Topbar */}
          <header className="flex h-16 shrink-0 items-center gap-4 border-b border-white/5 px-6 bg-gradient-to-r from-slate-900/50 to-slate-950/50 backdrop-blur-xl">
            <SidebarTrigger className="hover:bg-white/10 transition-colors" />
            <div className="h-6 w-px bg-white/10"></div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10">
                <TabIcon className="size-4 text-blue-400" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white">
                  {tabLabel}
                </h1>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">
                  {tab === "test" ? "Automated Testing" :
                   tab === "history" ? "Test Execution History" :
                   tab === "clarity" ? "Microsoft Clarity Analytics" :
                   "Dashboard"}
                </p>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex flex-1 flex-col w-full">
            <div className="w-full h-full px-8 py-6">
              {view}
            </div>
          </div>
      </SidebarInset>

      {/* AI Chat */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogTrigger asChild>
          <button
            className="group fixed bottom-8 right-8 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-110 transition-all duration-300"
            onClick={() => { setChatPrompt(null); }}
            aria-label="Open AI Assistant"
            title="Open AI Assistant"
          >
            <div className="relative">
              <MessageCircle className="size-6" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-pulse"></span>
            </div>
          </button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-xl bg-slate-900 border border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-white">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10">
                <MessageCircle className="size-4 text-purple-400" />
              </div>
              AI Assistant PIP
            </DialogTitle>
          </DialogHeader>
          <div>
            <AIChat initialMessage={chatPrompt ?? ""} />
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
