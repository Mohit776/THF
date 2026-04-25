"use client";

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

type Status = "Hold" | "Cancelled" | "Completed";

interface Transaction {
  transactionId: string;
  bookingId: string;
  chefName: string;
  clientName: string;
  dateTime: string;
  amount: string;
  platformFee: string;
  status: Status;
}

interface Summary {
  totalProcessed: string;
  pendingPayouts: string;
  pendingCount: number;
  platformFeeEarned: string;
}

interface ApiResponse {
  transactions: Transaction[];
  totalPages: number;
  currentPage: number;
  total: number;
  summary: Summary;
}

// Format a Date to "YYYY-MM-DD" for type="date" input fields
function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const today = new Date();
const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

export default function PaymentsPage() {
  const [startDate, setStartDate] = useState(toISODate(firstOfMonth));
  const [endDate, setEndDate] = useState(toISODate(today));
  const [appliedStart, setAppliedStart] = useState(toISODate(firstOfMonth));
  const [appliedEnd, setAppliedEnd] = useState(toISODate(today));
  const [page, setPage] = useState(1);

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (start: string, end: string, p: number) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        startDate: start,
        endDate: end,
        page: String(p),
      });
      const res = await fetch(`/api/payments?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json: ApiResponse = await res.json();
      setData(json);
    } catch (e) {
      setError("Could not load payments. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(appliedStart, appliedEnd, page);
  }, [appliedStart, appliedEnd, page, fetchData]);

  const handleApply = () => {
    setPage(1);
    setAppliedStart(startDate);
    setAppliedEnd(endDate);
  };

  const handleReset = () => {
    const s = toISODate(firstOfMonth);
    const e = toISODate(today);
    setStartDate(s);
    setEndDate(e);
    setPage(1);
    setAppliedStart(s);
    setAppliedEnd(e);
  };

  const renderStatus = (status: Status) => {
    const styles: Record<Status, string> = {
      Hold: "bg-blue-50 text-blue-500",
      Cancelled: "bg-red-50 text-red-500",
      Completed: "bg-green-50 text-green-500",
    };
    return (
      <div
        className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-[11px] font-semibold min-w-[80px] ${styles[status]}`}
      >
        {status}
      </div>
    );
  };

  const totalPages = data?.totalPages ?? 1;

  // Build pagination numbers to show
  const buildPages = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="w-full bg-[#F6F8FA] min-h-full p-6 space-y-6 text-gray-800">
      {/* ── Summary Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-7 border border-gray-100 shadow-sm flex flex-col justify-center">
          <p className="text-gray-500 text-sm font-medium mb-1.5">Total Processed</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">
            {loading ? <span className="text-gray-300 animate-pulse">—</span> : data?.summary.totalProcessed}
          </h3>
          <p className="text-gray-400 text-xs">this month</p>
        </div>

        <div className="bg-white rounded-xl p-7 border border-gray-100 shadow-sm flex flex-col justify-center">
          <p className="text-gray-500 text-sm font-medium mb-1.5">Pending Payouts</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">
            {loading ? <span className="text-gray-300 animate-pulse">—</span> : data?.summary.pendingPayouts}
          </h3>
          <p className="text-gray-400 text-xs">
            {loading ? "" : `${data?.summary.pendingCount ?? 0} awaiting`}
          </p>
        </div>

        <div className="bg-white rounded-xl p-7 border border-gray-100 shadow-sm flex flex-col justify-center">
          <p className="text-gray-500 text-sm font-medium mb-1.5">Platform Fee Earned</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">
            {loading ? <span className="text-gray-300 animate-pulse">—</span> : data?.summary.platformFeeEarned}
          </h3>
          <p className="text-gray-400 text-xs">10% avg commission</p>
        </div>
      </div>

      {/* ── Filters ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-4 text-sm mt-2">
        <span className="text-gray-600 font-medium whitespace-nowrap">Date range:</span>

        <div className="relative">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-md w-36 text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-red-400"
          />
        </div>

        <span className="text-gray-400">to</span>

        <div className="relative">
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-md w-36 text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-red-400"
          />
        </div>

        <button
          onClick={handleApply}
          className="px-6 py-2 border border-gray-200 bg-white text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors shadow-sm"
        >
          Apply
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-2 border border-transparent bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* ── Transaction History Table ─────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Transaction History</h2>
          {data && (
            <span className="text-xs text-gray-400">
              {data.total} record{data.total !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="overflow-x-auto w-full min-h-[420px]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 text-red-500 text-sm">{error}</div>
          ) : data?.transactions.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
              No transactions found for this period.
            </div>
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-[#F8F9FA] text-gray-500 text-xs uppercase tracking-wider font-medium">
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Booking ID</th>
                  <th className="px-6 py-4">Chef Name</th>
                  <th className="px-6 py-4">Client Name</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Platform Fee</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[13px] text-gray-600">
                {data?.transactions.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-800">{tx.transactionId}</td>
                    <td className="px-6 py-4 font-mono">{tx.bookingId}</td>
                    <td className="px-6 py-4 font-medium text-gray-700">{tx.chefName}</td>
                    <td className="px-6 py-4">{tx.clientName}</td>
                    <td className="px-6 py-4">{tx.dateTime}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{tx.amount}</td>
                    <td className="px-6 py-4">{tx.platformFee}</td>
                    <td className="px-6 py-4">{renderStatus(tx.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Pagination ───────────────────────────────────────── */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-end px-6 py-5 border-t border-gray-100 gap-1.5">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-40"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {buildPages().map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors ${
                    page === p
                      ? "bg-red-500 text-white border border-transparent shadow-sm hover:bg-red-600"
                      : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-40"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
