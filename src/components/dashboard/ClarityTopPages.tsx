"use client";

import { useClarity } from "@/hooks/useClarity";
import { ExternalLink } from "lucide-react";

export default function ClarityTopPages() {
  const { latest } = useClarity();
  if (!latest) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-light text-white tracking-tight">Top Pages</h1>
        <p className="text-white/50 text-sm">Most viewed pages on your site</p>
      </div>

      {/* Table Card */}
      <div className="bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="px-6 py-4 text-left text-sm font-medium text-white/80 uppercase tracking-wider">
                  Page
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/80 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium text-white/80 uppercase tracking-wider">
                  Sessions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {latest.topPages.map((page, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-white/90">
                    {page.pageTitle || <span className="text-white/50 italic">(no title)</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-white/90">
                    <a
                      href={page.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-400 transition-colors inline-flex items-center gap-2"
                    >
                      {page.url.length > 60 ? page.url.substring(0, 60) + "..." : page.url}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/90 text-right font-medium">
                    {page.sessions.toLocaleString()}
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
