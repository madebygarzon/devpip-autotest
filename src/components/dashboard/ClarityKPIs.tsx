"use client";

import { useClarity } from "@/hooks/useClarity";
import { Card } from "../ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Activity, Users, Clock, MousePointer, AlertCircle, Zap, TrendingDown, MousePointerClick, Info } from "lucide-react";

export default function ClarityKPIs() {
  const { latest, isLoading, isError } = useClarity();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-light text-white tracking-tight">Clarity KPIs</h1>
          <p className="text-white/50 text-sm">Loading Microsoft Clarity Analytics...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-light text-white tracking-tight">Clarity KPIs</h1>
          <p className="text-rose-400 text-sm">Error loading data</p>
        </div>
        <div className="p-6 bg-rose-500/10 border border-rose-500/30 rounded-lg">
          <p className="text-white/80">
            Failed to load Clarity data. Please check:
          </p>
          <ul className="list-disc list-inside text-white/60 text-sm mt-2 space-y-1">
            <li>Your CLARITY_TOKEN and CLARITY_PROJECT_ID are set in .env</li>
            <li>The Clarity cache file exists in data/clarityCache.json</li>
            <li>You haven't exceeded the 10 API calls per day limit</li>
          </ul>
        </div>
      </div>
    );
  }

  if (!latest) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-light text-white tracking-tight">Clarity KPIs</h1>
          <p className="text-white/50 text-sm">No data available</p>
        </div>
        <div className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <p className="text-white/80">
            No Clarity snapshots found. Click "Refresh Data" to fetch from Clarity API.
          </p>
        </div>
      </div>
    );
  }

  const kpis = [
    {
      title: "Total Sessions",
      value: (latest.totals.sessions || 0).toLocaleString(),
      icon: Activity,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      description: "The total number of user sessions recorded. A session represents a single visit to your site.",
    },
    {
      title: "Distinct Users",
      value: (latest.totals.distinctUsers || 0).toLocaleString(),
      icon: Users,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      description: "The number of unique users who visited your site. Each user is counted only once.",
    },
    {
      title: "Avg. Engagement",
      value: `${Math.round(latest.totals.engagementTimeAvg || 0)}s`,
      icon: Clock,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      description: "Average time users actively engage with your content. Higher values indicate better user engagement.",
    },
    {
      title: "Avg. Scroll Depth",
      value: `${Math.round(latest.totals.scrollDepthAvg || 0)}%`,
      icon: TrendingDown,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      description: "Average percentage of page scrolled by users. Shows how much of your content users actually see.",
    },
    {
      title: "Rage Clicks",
      value: (latest.totals.rageClicks || 0).toLocaleString(),
      icon: MousePointerClick,
      color: "text-rose-400",
      bgColor: "bg-rose-500/10",
      description: "Repeated clicks on the same element, indicating user frustration. High values suggest UX issues.",
    },
    {
      title: "Dead Clicks",
      value: (latest.totals.deadClicks || 0).toLocaleString(),
      icon: MousePointer,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      description: "Clicks on non-interactive elements. Users expect something to happen but nothing does.",
    },
    {
      title: "Quick Backs",
      value: (latest.totals.quickBackClicks || 0).toLocaleString(),
      icon: Zap,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      description: "Users who quickly navigate back after clicking. May indicate misleading links or unmet expectations.",
    },
    {
      title: "Excessive Scrolls",
      value: (latest.totals.excessiveScrolls || 0).toLocaleString(),
      icon: TrendingDown,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      description: "Rapid or excessive scrolling behavior. May suggest users are struggling to find content.",
    },
    {
      title: "Script Errors",
      value: (latest.totals.scriptErrors || 0).toLocaleString(),
      icon: AlertCircle,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      description: "JavaScript errors encountered by users. These can break functionality and harm user experience.",
    },
    {
      title: "Error Clicks",
      value: (latest.totals.errorClicks || 0).toLocaleString(),
      icon: AlertCircle,
      color: "text-pink-400",
      bgColor: "bg-pink-500/10",
      description: "Clicks that resulted in errors. Indicates broken links, buttons, or interactive elements.",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-light text-white tracking-tight">Clarity KPIs</h1>
        <p className="text-white/50 text-sm">Microsoft Clarity Analytics Dashboard • {latest.date}</p>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className="bg-white/[0.02] backdrop-blur-sm border border-white/10 p-6 hover:bg-white/[0.04] transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                  <Icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-1 rounded-md hover:bg-white/10 transition-colors">
                      <Info className="w-3.5 h-3.5 text-white/40 hover:text-white/70" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="max-w-xs bg-slate-800 border-white/20 text-white/90 shadow-xl"
                    sideOffset={5}
                  >
                    <p className="text-xs leading-relaxed">{kpi.description}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <h3 className="text-xs font-medium text-white/60 uppercase tracking-wider mb-1">
                {kpi.title}
              </h3>
              <p className="text-2xl font-light text-white">{kpi.value}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
