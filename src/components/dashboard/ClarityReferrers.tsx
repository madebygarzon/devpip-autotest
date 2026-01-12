"use client";

import { useClarity } from "@/hooks/useClarity";
import { ExternalLink } from "lucide-react";

export default function ClarityReferrers() {
  const { latest } = useClarity();
  if (!latest || !latest.topReferrers || latest.topReferrers.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-medium text-white">Top Referrers</h3>
      <div className="bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="px-6 py-4 text-left text-sm font-medium text-white/80 uppercase tracking-wider">
                  Referrer URL
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium text-white/80 uppercase tracking-wider">
                  Sessions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {latest.topReferrers.map((referrer, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 text-sm text-white/90">
                    {referrer.url === "(direct)" ? (
                      <span className="text-white/60 italic">(direct)</span>
                    ) : (
                      <a
                        href={referrer.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-400 transition-colors inline-flex items-center gap-2"
                      >
                        {referrer.url}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-white/90 text-right font-medium">
                    {referrer.sessions.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
