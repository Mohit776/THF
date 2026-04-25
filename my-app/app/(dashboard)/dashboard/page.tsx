import { getDashboardAnalytics } from "@/app/actions/dashboard";
import { AlertCircle } from "lucide-react";
import DashboardClient from "./DashboardClient";

export default async function DashboardView() {
  const result = await getDashboardAnalytics();

  if (!result.success || !result.data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-red-50 rounded-2xl border border-red-200 mt-10">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-red-700">Failed to load dashboard</h2>
        <p className="text-red-600/80 mt-2 text-center max-w-md">
          {result.error || "An unknown error occurred while fetching analytics."}
        </p>
      </div>
    );
  }

  return <DashboardClient data={result.data} />;
}
