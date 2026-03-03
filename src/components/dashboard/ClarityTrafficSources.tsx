"use client";

import { useClarity } from "@/hooks/useClarity";
import { Info } from "lucide-react";

export default function ClarityTrafficSources() {
  const { latest } = useClarity();
  if (!latest) return null;

  const sources = Object.entries(latest.bySource || {})
    .map(([source, sessions]) => ({ source, sessions }))
    .sort((a, b) => b.sessions - a.sessions);

  const channels = Object.entries(latest.byChannel || {})
    .map(([channel, sessions]) => ({ channel, sessions }))
    .sort((a, b) => b.sessions - a.sessions);

  const hasSourceData = sources.length > 0;
  const hasChannelData = channels.length > 0;
  const apiStrategy = process.env.NEXT_PUBLIC_CLARITY_API_STRATEGY || 'minimal';

  // Si no hay datos, mostrar mensaje informativo
  if (!hasSourceData && !hasChannelData) {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-medium text-white">Traffic Sources & Channels</h3>

        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <Info className="w-6 h-6 text-blue-400" />
            </div>
            <div className="space-y-3 flex-1">
              <h4 className="text-lg font-medium text-white">Data Not Available in Current API Strategy</h4>
              <p className="text-sm text-white/70 leading-relaxed">
                Traffic source and channel data requires the <code className="px-2 py-1 bg-white/10 rounded text-blue-300 font-mono text-xs">balanced</code> or <code className="px-2 py-1 bg-white/10 rounded text-blue-300 font-mono text-xs">full</code> API strategy.
              </p>
              <p className="text-sm text-white/60">
                Current strategy: <span className="text-blue-400 font-semibold">{apiStrategy}</span>
              </p>

              <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-lg space-y-2">
                <p className="text-xs font-semibold text-white/90">Available API Strategies:</p>
                <ul className="text-xs text-white/70 space-y-1.5 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-white/40">•</span>
                    <span><strong className="text-white/90">minimal</strong> (2 API calls) - Device, Browser, OS, Pages, Referrers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-white/40">•</span>
                    <span><strong className="text-white/90">balanced</strong> (3 API calls) - + Country, Source, Channel</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-white/40">•</span>
                    <span><strong className="text-white/90">full</strong> (5 API calls) - All dimensions separately</span>
                  </li>
                </ul>
              </div>

              <p className="text-xs text-white/50 mt-4">
                To enable this data, update <code className="px-1.5 py-0.5 bg-white/10 rounded font-mono">NEXT_PUBLIC_CLARITY_API_STRATEGY</code> in your <code className="px-1.5 py-0.5 bg-white/10 rounded font-mono">.env</code> file to <code className="px-1.5 py-0.5 bg-white/10 rounded font-mono text-emerald-400">balanced</code> or <code className="px-1.5 py-0.5 bg-white/10 rounded font-mono text-emerald-400">full</code>.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-medium text-white">Traffic Sources & Channels</h3>

      <div className="grid md:grid-cols-2 gap-6">
        {/* By Source */}
        <div className="bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h4 className="text-lg font-medium text-white/80 mb-4">By Source</h4>
          {hasSourceData ? (
            <div className="space-y-3">
              {sources.map(({ source, sessions }, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-white/70">{source}</span>
                  <span className="text-sm font-medium text-white">{sessions.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/40 italic">No source data available</p>
          )}
        </div>

        {/* By Channel */}
        <div className="bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h4 className="text-lg font-medium text-white/80 mb-4">By Channel</h4>
          {hasChannelData ? (
            <div className="space-y-3">
              {channels.map(({ channel, sessions }, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-white/70">{channel}</span>
                  <span className="text-sm font-medium text-white">{sessions.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/40 italic">No channel data available</p>
          )}
        </div>
      </div>
    </div>
  );
}
