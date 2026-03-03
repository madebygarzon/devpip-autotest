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
import Swal from "sweetalert2";

export default function ClarityDashboardContent() {
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
          await Swal.fire({
            icon: "success",
            title: "Data Already Up to Date",
            html: `
              <div class="text-left space-y-2">
                <p>✅ A snapshot for today already exists.</p>
                <p>📊 No additional API calls were consumed.</p>
                <p class="text-sm text-gray-400 mt-3">The data is already up to date and will refresh automatically tomorrow.</p>
              </div>
            `,
            confirmButtonText: "Got it",
            confirmButtonColor: "#10b981",
            background: "#1e293b",
            color: "#fff",
          });
        } else {
          // Fresh data fetched
          await Swal.fire({
            icon: "success",
            title: "Data Refreshed Successfully",
            html: `
              <div class="text-left space-y-2">
                <p>✅ Data updated from Clarity API.</p>
                <p>💾 New snapshot saved to database.</p>
              </div>
            `,
            confirmButtonText: "Awesome",
            confirmButtonColor: "#10b981",
            background: "#1e293b",
            color: "#fff",
          });
        }
        // Reload the page to get fresh data
        window.location.reload();
      } else if (data.warning) {
        // Rate limit or error - showing cached data
        if (data.limitReached) {
          await Swal.fire({
            icon: "warning",
            title: "Daily Limit Reached",
            html: `
              <div class="text-left space-y-3">
                <p class="font-semibold text-yellow-400">⚠️ API Limit Reached</p>
                <p>You have reached the limit of 10 API calls per day for Microsoft Clarity.</p>
                <p>📊 Showing data saved in the database.</p>
                <p class="text-sm text-gray-400 mt-3">💡 The data will refresh automatically tomorrow.</p>
              </div>
            `,
            confirmButtonText: "Understood",
            confirmButtonColor: "#f59e0b",
            background: "#1e293b",
            color: "#fff",
          });
        } else {
          await Swal.fire({
            icon: "info",
            title: "Using Cached Data",
            html: `
              <div class="text-left space-y-2">
                <p>${data.warning}</p>
                <p class="text-sm text-gray-400 mt-2">📊 Showing data saved in the database.</p>
              </div>
            `,
            confirmButtonText: "OK",
            confirmButtonColor: "#3b82f6",
            background: "#1e293b",
            color: "#fff",
          });
        }
        // Still reload to show any data we have
        window.location.reload();
      }
    } catch (error) {
      console.error("Error refreshing Clarity data:", error);
      await Swal.fire({
        icon: "error",
        title: "Error Refreshing Data",
        html: `
          <div class="text-left space-y-2">
            <p>❌ An error occurred while refreshing the data.</p>
            <p class="text-sm text-gray-400 mt-2">Please try again in a few moments.</p>
          </div>
        `,
        confirmButtonText: "Try Again",
        confirmButtonColor: "#ef4444",
        background: "#1e293b",
        color: "#fff",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-light text-white tracking-tight">
            Microsoft Clarity Analytics
          </h2>
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

      {/* Device Analytics Section */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-light text-white tracking-tight">Device Analytics</h2>
          <p className="text-white/50 text-sm">Session distribution by device type, browser, and operating system</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ClarityDevicesChart />
          </div>
          <div className="lg:col-span-1">
            <ClarityBrowserChart />
          </div>
          <div className="lg:col-span-1">
            <ClarityOSChart />
          </div>
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

      
    </div>
  );
}
