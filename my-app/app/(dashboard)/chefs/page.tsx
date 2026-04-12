"use client";

import React, { useEffect, useState } from "react";
import { Eye, Pencil, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { getChefsList } from "@/app/actions/chefs";
import type { ChefRow, ChefStats } from "@/app/actions/chefs";

function formatEarnings(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}k`;
  if (value === 0) return "₹0";
  return `₹${value}`;
}

const ITEMS_PER_PAGE = 10;

const TAB_KEYS = ["all", "active", "pending", "suspended", "inactive"] as const;
type TabKey = (typeof TAB_KEYS)[number];

export default function ChefsPage() {
  const [stats, setStats] = useState<ChefStats | null>(null);
  const [chefsByTab, setChefsByTab] = useState<Record<string, ChefRow[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      setError(null);
      try {
        const results = await Promise.all(TAB_KEYS.map((k) => getChefsList(k)));
        const [allResult] = results;
        if (!allResult.success || !allResult.data) {
          setError(allResult.error || "Failed to load chefs.");
          return;
        }
        setStats(allResult.data.stats);
        const map: Record<string, ChefRow[]> = {};
        TAB_KEYS.forEach((k, i) => {
          map[k] = results[i].data?.chefs || [];
        });
        setChefsByTab(map);
      } catch (e: any) {
        setError(e.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-500 gap-3">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm font-medium">Loading chefs…</span>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-red-50 rounded-2xl border border-red-200 mt-10">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-red-700">Failed to load chefs</h2>
        <p className="text-red-600/80 mt-2 text-center max-w-md">
          {error || "An unknown error occurred while fetching chef data."}
        </p>
      </div>
    );
  }

  const tabs = [
    { key: "all" as TabKey, label: "All Chefs", count: stats.total },
    { key: "active" as TabKey, label: "Active", count: stats.active },
    { key: "pending" as TabKey, label: "Pending", count: stats.pending },
    { key: "suspended" as TabKey, label: "Suspended", count: stats.suspended },
    { key: "inactive" as TabKey, label: "Inactive", count: stats.inactive },
  ];

  const cards = [
    {
      title: "Total Chef",
      value: stats.total.toLocaleString(),
      subtext: "Registered on platform",
      borderColor: "border-t-emerald-500",
    },
    {
      title: "Active Chef",
      value: stats.active.toLocaleString(),
      subtext: `of ${stats.total.toLocaleString()} total`,
      borderColor: "border-t-blue-500",
    },
    {
      title: "Pending approval",
      value: stats.pending.toLocaleString(),
      subtext: "Awaiting review",
      borderColor: "border-t-amber-600",
    },
    {
      title: "Suspended",
      value: stats.suspended.toLocaleString(),
      subtext: "Accounts on hold",
      borderColor: "border-t-[#E11D48]",
    },
  ];

  const chefs = chefsByTab[activeTab] || [];
  const totalPages = Math.max(1, Math.ceil(chefs.length / ITEMS_PER_PAGE));
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageChefs = chefs.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const handleTabChange = (key: TabKey) => {
    setActiveTab(key);
    setCurrentPage(1);
  };

  return (
    <div className="bg-[#eeefef] min-h-screen">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className={`bg-white rounded-xl border-2 border-[#d3dbe2] border-t-4 ${card.borderColor} p-5`}
          >
            <p className="text-[11px] font-medium text-gray-500 mb-1">{card.title}</p>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            <p className="text-[10px] text-gray-500 mt-1">{card.subtext}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
              activeTab === tab.key
                ? "bg-[#C44629] text-white border-transparent"
                : "bg-white text-gray-600 border-2 border-[#d3dbe2] hover:bg-gray-50"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] ${
                activeTab === tab.key ? "bg-white text-[#C44629]" : "bg-[#F3F4F6] text-gray-500"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border-2 border-[#d3dbe2] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#EAEBEB]/50 border-b border-gray-200 text-xs font-semibold text-gray-700">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">S. no.</th>
                <th className="px-6 py-4 whitespace-nowrap">Chef Name</th>
                <th className="px-6 py-4 whitespace-nowrap">Profile</th>
                <th className="px-6 py-4 whitespace-nowrap">Bookings</th>
                <th className="px-6 py-4 whitespace-nowrap">Ratings</th>
                <th className="px-6 py-4 whitespace-nowrap">Earnings</th>
                <th className="px-6 py-4 whitespace-nowrap">Docs</th>
                <th className="px-6 py-4 whitespace-nowrap">Status</th>
                <th className="px-6 py-4 whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageChefs.length > 0 ? (
                pageChefs.map((chef, i) => (
                  <tr key={chef.uid} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-medium">
                      {String(startIdx + i + 1).padStart(2, "0")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs uppercase border-2 border-[#d3dbe2]">
                          {chef.initials}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-800">{chef.name}</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">{chef.city}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${chef.profilePct}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600">
                          {chef.profilePct}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-gray-700">
                      {chef.bookings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-gray-700">
                      {chef.ratings > 0 ? chef.ratings.toFixed(1) : "–"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-gray-700">
                      {formatEarnings(chef.earnings)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {chef.docsStatus === "Approved" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
                          {chef.docsStatus}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {chef.status === "Active" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                          Active
                        </span>
                      )}
                      {chef.status === "Hold" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
                          Hold
                        </span>
                      )}
                      {chef.status === "Pending" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                          Pending
                        </span>
                      )}
                      {chef.status === "Suspended" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-100">
                          Suspended
                        </span>
                      )}
                      {chef.status === "Inactive" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3 text-gray-400">
                        <Link
                          href={`/users/${chef.uid}`}
                          className="hover:text-gray-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button className="hover:text-gray-600 transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-400 text-sm">
                    No chefs found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-end px-6 py-4 border-t border-gray-100 bg-[#FAFAFA]">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="flex items-center justify-center w-7 h-7 rounded border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 text-xs shadow-sm disabled:opacity-40"
              >
                &laquo;
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center justify-center w-7 h-7 rounded border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 text-xs shadow-sm disabled:opacity-40"
              >
                &lsaquo;
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page: number;
                if (totalPages <= 5) page = i + 1;
                else if (currentPage <= 3) page = i + 1;
                else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                else page = currentPage - 2 + i;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`flex items-center justify-center w-7 h-7 rounded text-xs font-medium shadow-sm ${
                      currentPage === page
                        ? "bg-[#E11D48] text-white"
                        : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center w-7 h-7 rounded border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 text-xs shadow-sm disabled:opacity-40"
              >
                &rsaquo;
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center w-7 h-7 rounded border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 text-xs shadow-sm disabled:opacity-40"
              >
                &raquo;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
