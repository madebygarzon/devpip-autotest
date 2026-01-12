"use client";

import { useClarity } from "@/hooks/useClarity";
import { Card } from "../ui/card";

export default function ClarityTrafficSources() {
  const { latest } = useClarity();
  if (!latest || (!latest.bySource && !latest.byChannel)) return null;

  const sources = Object.entries(latest.bySource || {})
    .map(([source, sessions]) => ({ source, sessions }))
    .sort((a, b) => b.sessions - a.sessions);

  const channels = Object.entries(latest.byChannel || {})
    .map(([channel, sessions]) => ({ channel, sessions }))
    .sort((a, b) => b.sessions - a.sessions);

  if (sources.length === 0 && channels.length === 0) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-medium text-white">Traffic Sources & Channels</h3>

      <div className="grid md:grid-cols-2 gap-6">
        {/* By Source */}
        <div className="bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h4 className="text-lg font-medium text-white/80 mb-4">By Source</h4>
          <div className="space-y-3">
            {sources.map(({ source, sessions }, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-white/70">{source}</span>
                <span className="text-sm font-medium text-white">{sessions.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By Channel */}
        <div className="bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h4 className="text-lg font-medium text-white/80 mb-4">By Channel</h4>
          <div className="space-y-3">
            {channels.map(({ channel, sessions }, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-white/70">{channel}</span>
                <span className="text-sm font-medium text-white">{sessions.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
