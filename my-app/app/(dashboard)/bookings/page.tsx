import { getBookingsData, getChefBookings } from "@/app/actions/bookings";
import BookingActionButtons from "@/components/BookingActionButtons";
import BookingsFilterBar from "@/components/BookingsFilterBar";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

const STATUS_CONFIG: Record<
  string,
  { pill: string; tab: string; border: string; subtext: string }
> = {
  Completed: {
    pill: "bg-emerald-50 text-emerald-600 border-emerald-100",
    tab: "border-t-emerald-500",
    border: "border-t-emerald-500",
    subtext: "All time",
  },
  "In progress": {
    pill: "bg-blue-50 text-blue-600 border-blue-100",
    tab: "border-t-blue-500",
    border: "border-t-blue-500",
    subtext: "Live right now",
  },
  Scheduled: {
    pill: "bg-amber-50 text-amber-600 border-amber-100",
    tab: "border-t-amber-500",
    border: "border-t-amber-500",
    subtext: "Upcoming",
  },
  Cancelled: {
    pill: "bg-red-50 text-red-600 border-red-100",
    tab: "border-t-[#E11D48]",
    border: "border-t-[#E11D48]",
    subtext: "All time",
  },
};

export default async function BookingsPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const pageStr    = typeof searchParams.page      === "string" ? searchParams.page      : "1";
  const partnerId  = typeof searchParams.partnerId === "string" ? searchParams.partnerId : null;
  const currentPage = parseInt(pageStr, 10) || 1;
  const itemsPerPage = 10;

  const statusFilter = typeof searchParams.status === "string" ? searchParams.status : "All";
  const typeFilter = typeof searchParams.type === "string" ? searchParams.type : "All";
  const startFilter = typeof searchParams.start === "string" ? searchParams.start : "";
  const endFilter = typeof searchParams.end === "string" ? searchParams.end : "";
  const qFilter = typeof searchParams.q === "string" ? searchParams.q.toLowerCase() : "";

  // ── Fetch data (chef-filtered or all) ────────────────
  let bookings: any[] = [];
  let stats = { completed: 0, inProgress: 0, scheduled: 0, cancelled: 0, total: 0 };
  let fetchError: string | null = null;
  let chefName: string | null = null;

  if (partnerId) {
    const result = await getChefBookings(partnerId);
    if (!result.success || !result.data) {
      fetchError = result.error || "Failed to load bookings for this chef.";
    } else {
      bookings = result.data;
      chefName = bookings[0]?.chefName ?? null;
      for (const b of bookings) {
        stats.total++;
        if (b.status === "Completed")   stats.completed++;
        else if (b.status === "In progress") stats.inProgress++;
        else if (b.status === "Scheduled")   stats.scheduled++;
        else if (b.status === "Cancelled")   stats.cancelled++;
      }
    }
  } else {
    const result = await getBookingsData();
    if (!result.success || !result.data) {
      fetchError = result.error || "An unknown error occurred.";
    } else {
      bookings = result.data.bookings;
      stats    = result.data.stats;
    }
  }

  // ── Apply Search Filters (Local) ────────────────
  if (statusFilter !== "All") bookings = bookings.filter(b => b.status === statusFilter);
  if (typeFilter !== "All") bookings = bookings.filter(b => b.eventType?.toLowerCase() === typeFilter.toLowerCase());
  
  if (startFilter || endFilter) {
    const startNum = startFilter ? new Date(`${startFilter}T00:00:00+05:30`).getTime() : 0;
    const endNum = endFilter ? new Date(`${endFilter}T23:59:59.999+05:30`).getTime() : Infinity;
    bookings = bookings.filter(b => {
      const d = b.rawDate || 0;
      return d >= startNum && d <= endNum;
    });
  }

  if (qFilter) {
    bookings = bookings.filter(b => 
      (b.client?.toLowerCase() || "").includes(qFilter) ||
      (b.chefName?.toLowerCase() || "").includes(qFilter) ||
      (b.id?.toLowerCase() || "").includes(qFilter) 
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-red-50 rounded-2xl border border-red-200 mt-10">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-red-700">Failed to load bookings</h2>
        <p className="text-red-600/80 mt-2 text-center max-w-md">{fetchError}</p>
      </div>
    );
  }

  const totalItems = bookings.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const safePage   = Math.min(Math.max(1, currentPage), totalPages);
  const currentBookings = bookings.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  // helper: build pagination url preserving partnerId and filters
  const pageUrl = (p: number) => {
    const params = new URLSearchParams(props.searchParams ? searchParams as any : {});
    params.set("page", String(p));
    if (partnerId) params.set("partnerId", partnerId);
    return `?${params.toString()}`;
  };

  const cards = [
    {
      title: "Completed",
      value: stats.completed.toLocaleString(),
      subtext: STATUS_CONFIG["Completed"].subtext,
      borderColor: "border-t-emerald-500",
    },
    {
      title: "In progress",
      value: stats.inProgress.toLocaleString(),
      subtext: STATUS_CONFIG["In progress"].subtext,
      borderColor: "border-t-blue-500",
    },
    {
      title: "Scheduled",
      value: stats.scheduled.toLocaleString(),
      subtext: STATUS_CONFIG["Scheduled"].subtext,
      borderColor: "border-t-amber-500",
    },
    {
      title: "Cancelled",
      value: stats.cancelled.toLocaleString(),
      subtext: STATUS_CONFIG["Cancelled"].subtext,
      borderColor: "border-t-[#E11D48]",
    },
  ];

  const tabs = [
    { label: "All Bookings", count: stats.total },
    { label: "Completed", count: stats.completed },
    { label: "In progress", count: stats.inProgress },
    { label: "Scheduled", count: stats.scheduled },
    { label: "Cancelled", count: stats.cancelled },
  ];

  return (
    <div className="bg-[#eeefef] min-h-screen">
      {/* ── Chef filter banner ── */}
      {partnerId && (
        <div className="flex items-center gap-3 mb-5 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
          <span className="text-[13px] text-gray-500">Showing bookings for</span>
          <span className="font-semibold text-gray-800 text-[13px]">{chefName || "this chef"}</span>
          <Link
            href="/bookings"
            className="ml-auto text-[12px] font-semibold text-[#E11D48] hover:underline flex items-center gap-1"
          >
            ✕ Clear filter
          </Link>
        </div>
      )}
      {/* Metric Cards */}
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

      {/* Filter Bar */}
      <BookingsFilterBar />

      {/* Table */}
      <div className="bg-white rounded-xl border-2 border-[#d3dbe2] overflow-hidden">
        {bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-sm font-medium">No bookings found</p>
            <p className="text-xs mt-1">Bookings will appear here once created.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#EAEBEB]/50 border-b border-gray-200 text-xs font-semibold text-gray-700">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">Booking ID</th>
                  <th className="px-6 py-4 whitespace-nowrap">Chef Name</th>
                  <th className="px-6 py-4 whitespace-nowrap">Client</th>
                  <th className="px-6 py-4 whitespace-nowrap">Event Type</th>
                  <th className="px-6 py-4 whitespace-nowrap">Date &amp; Time</th>
                  <th className="px-6 py-4 whitespace-nowrap">Guests</th>
                  <th className="px-6 py-4 whitespace-nowrap">Amount</th>
                  <th className="px-6 py-4 whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentBookings.map((booking, i) => {
                  const pill = STATUS_CONFIG[booking.status]?.pill ?? "bg-gray-100 text-gray-600 border-gray-200";
                  return (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-medium">
                        {booking.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-800">
                        {booking.chefName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-gray-800">
                        {booking.client}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-gray-800">
                        {booking.eventType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs font-medium text-gray-800">{booking.date}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">{booking.time}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-700">
                        {booking.guests}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-700">
                        {booking.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${pill}`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <BookingActionButtons booking={booking} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination footer */}
        {bookings.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-[#FAFAFA]">
            <p className="text-[11px] text-gray-500">
              Showing {(safePage - 1) * itemsPerPage + 1} to {Math.min(safePage * itemsPerPage, totalItems)} of {totalItems} bookings
            </p>
            <div className="flex items-center gap-1">
              <Link 
                href={pageUrl(1)}
                className={`flex items-center justify-center w-7 h-7 rounded border text-xs shadow-sm transition-colors ${safePage <= 1 ? "border-gray-100 bg-gray-50 text-gray-300 pointer-events-none" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"}`}
              >
                &laquo;
              </Link>
              <Link 
                href={pageUrl(Math.max(1, safePage - 1))}
                className={`flex items-center justify-center w-7 h-7 rounded border text-xs shadow-sm transition-colors ${safePage <= 1 ? "border-gray-100 bg-gray-50 text-gray-300 pointer-events-none" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"}`}
              >
                &lsaquo;
              </Link>
              <button className="flex items-center justify-center px-3 h-7 rounded bg-[#C44629] text-white text-xs font-medium shadow-sm transition-colors">
                {safePage}
              </button>
              <Link 
                href={pageUrl(Math.min(totalPages, safePage + 1))}
                className={`flex items-center justify-center w-7 h-7 rounded border text-xs shadow-sm transition-colors ${safePage >= totalPages ? "border-gray-100 bg-gray-50 text-gray-300 pointer-events-none" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"}`}
              >
                &rsaquo;
              </Link>
              <Link 
                href={pageUrl(totalPages)}
                className={`flex items-center justify-center w-7 h-7 rounded border text-xs shadow-sm transition-colors ${safePage >= totalPages ? "border-gray-100 bg-gray-50 text-gray-300 pointer-events-none" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"}`}
              >
                &raquo;
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
