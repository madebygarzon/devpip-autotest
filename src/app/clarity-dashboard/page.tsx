"use client";

import ClarityKPIs from "@/components/dashboard/ClarityKPIs";
import ClarityDevicesChart from "@/components/dashboard/ClarityDevicesChart";
import ClarityBrowserChart from "@/components/dashboard/ClarityBrowserChart";
import ClarityOSChart from "@/components/dashboard/ClarityOSChart";
import ClarityCountriesChart from "@/components/dashboard/ClarityCountriesChart";
import ClarityTopPages from "@/components/dashboard/ClarityTopPages";
import ClarityTrafficSources from "@/components/dashboard/ClarityTrafficSources";
import ClarityReferrers from "@/components/dashboard/ClarityReferrers";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

export default function ClarityDashboardPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Call POST endpoint to refresh data from Clarity API
      const response = await fetch("/api/clarity", { method: "POST" });
      const data = await response.json();

      if (data.ok) {
        if (data.fromCache && data.apiCallsSaved) {
          // Snapshot already exists for today
          alert("✅ Ya existe un snapshot para hoy. No se consumió ninguna llamada API adicional.\n\nLos datos están actualizados.");
        } else {
          // Fresh data fetched
          alert("✅ Datos actualizados desde la API de Clarity.\n\nNuevo snapshot guardado en la base de datos.");
        }
        // Reload the page to get fresh data
        window.location.reload();
      } else if (data.warning) {
        // Rate limit or error - showing cached data
        if (data.limitReached) {
          alert(
            "⚠️ LÍMITE DIARIO ALCANZADO\n\n" +
            "Has alcanzado el límite de 10 llamadas API por día de Microsoft Clarity.\n\n" +
            "📊 Mostrando datos guardados en la base de datos.\n\n" +
            "💡 Los datos se refrescarán automáticamente mañana."
          );
        } else {
          alert(data.warning + "\n\nMostrando datos guardados en la base de datos.");
        }
        // Still reload to show any data we have
        window.location.reload();
      }
    } catch (error) {
      console.error("Error refreshing Clarity data:", error);
      alert("❌ Error al refrescar datos.\n\nPor favor intenta nuevamente.");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-[1600px] mx-auto p-8 space-y-12">
        {/* Header with Refresh Button */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-light text-white tracking-tight">
              Microsoft Clarity Analytics
            </h1>
            <p className="text-white/50 text-sm">
              Comprehensive dashboard powered by Clarity Data Export API
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>

        {/* Main KPIs */}
        <section>
          <ClarityKPIs />
        </section>

        {/* Charts Grid - Devices, Browsers, OS */}
        <section className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ClarityDevicesChart />
          </div>
          <div className="lg:col-span-1">
            <ClarityBrowserChart />
          </div>
          <div className="lg:col-span-1">
            <ClarityOSChart />
          </div>
        </section>

        {/* Countries Chart */}
        <section>
          <ClarityCountriesChart />
        </section>

        {/* Traffic Sources */}
        <section>
          <ClarityTrafficSources />
        </section>

        {/* Top Pages Table */}
        <section>
          <ClarityTopPages />
        </section>

        {/* Top Referrers */}
        <section>
          <ClarityReferrers />
        </section>

        {/* Footer Note */}
        <div className="text-center text-white/40 text-sm pt-8 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <span className="text-emerald-400 font-medium">💾 Stored in PostgreSQL</span>
            </div>
            <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <span className="text-blue-400 font-medium">⚡ Always Available</span>
            </div>
          </div>

          <p>
            Data is stored in PostgreSQL database • Limited to 10 Clarity API calls per day
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.02] border border-white/10 rounded-lg">
            <span className="text-white/60">Strategy:</span>
            <span className="font-medium text-blue-400">
              {process.env.NEXT_PUBLIC_CLARITY_API_STRATEGY || 'minimal'}
            </span>
            <span className="text-white/40">•</span>
            <span className="text-white/60">
              {process.env.NEXT_PUBLIC_CLARITY_API_STRATEGY === 'full' ? '5' :
               process.env.NEXT_PUBLIC_CLARITY_API_STRATEGY === 'balanced' ? '3' : '2'} calls per refresh
            </span>
          </div>

          <div className="mt-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg max-w-2xl mx-auto">
            <p className="text-white/70 text-xs leading-relaxed">
              <strong className="text-white/90">💡 Smart API Usage:</strong> The system checks if today's snapshot already exists before making API calls.
              Multiple refreshes in the same day won't consume additional API quota.
              Data is permanently stored in the database and always accessible.
            </p>
          </div>

          <p className="mt-2">
            Learn more about the{" "}
            <a
              href="https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-data-export-api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Clarity Data Export API
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
