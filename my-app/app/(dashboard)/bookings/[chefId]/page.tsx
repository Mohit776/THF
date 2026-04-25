import { getChefBookings } from "@/app/actions/bookings";
import { getUserById } from "@/app/actions/user";
import { AlertCircle, CheckCircle, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

// ── Status styling ─────────────────────────────────────────────────────────────
const STATUS_PILL: Record<string, string> = {
  "New Booking":  "bg-green-100 text-green-700 border-green-200",
  Completed:      "bg-emerald-50 text-emerald-600 border-emerald-100",
  "In progress":  "bg-blue-50 text-blue-600 border-blue-100",
  Scheduled:      "bg-amber-50 text-amber-600 border-amber-100",
  Cancelled:      "bg-red-50 text-red-600 border-red-100",
};

// ── Page ───────────────────────────────────────────────────────────────────────
interface PageProps {
  params: Promise<{ chefId: string }>;
  searchParams?: Promise<{ page?: string }>;
}

export default async function ChefBookingsPage({ params, searchParams }: PageProps) {
  const { chefId }   = await params;
  const sp           = searchParams ? await searchParams : {};
  const currentPage  = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const itemsPerPage = 10;

  // ── Data fetch ────────────────────────────────────────────────────────────────
  const [userResult, bookingsResult] = await Promise.all([
    getUserById(chefId),
    getChefBookings(chefId),
  ]);

  if (!userResult.success || !userResult.data) notFound();

  const user     = userResult.data as any;
  const bookings = bookingsResult.success && bookingsResult.data ? bookingsResult.data : [];

  const totalItems      = bookings.length;
  const totalPages      = Math.ceil(totalItems / itemsPerPage) || 1;
  const safePage        = Math.min(Math.max(1, currentPage), totalPages);
  const currentBookings = bookings.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  const isVerified = user.kycStatus === "approved" || user.kycStatus === "verified";
  const pageUrl    = (p: number) => `?page=${p}`;

  const tags = [
    user.jobType,
    Array.isArray(user.cuisines) ? user.cuisines[0] : user.cuisines,
    user.city,
  ].filter(Boolean) as string[];

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-16 space-y-5">

        {/* ── Hero Header ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-6 flex items-center gap-5 shadow-sm">
          {/* Avatar */}
          <div className="w-[72px] h-[72px] rounded-full overflow-hidden flex-shrink-0 bg-gray-100 border-2 border-gray-200 relative">
            {user.kycDocuments?.selfieUrl ? (
              <Image src={user.kycDocuments.selfieUrl} alt="Chef" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-black text-gray-500">
                {user.name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[20px] font-bold text-gray-900">{user.name || "Unknown Chef"}</h1>
              {isVerified && (
                <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  <CheckCircle className="w-3 h-3" /> KYC verified
                </span>
              )}
              {user.kycStatus === "pending_verification" && (
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">Pending</span>
              )}
              {user.kycStatus === "rejected" && (
                <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">Rejected</span>
              )}
            </div>
            <p className="text-[13px] text-gray-500 mt-0.5">
              Chef-Id: {user.uid?.slice(0, 6).toUpperCase() || "—"}
            </p>
            {tags.length > 0 && (
              <p className="text-[13px] text-gray-500 mt-1">{tags.join(" | ")}</p>
            )}
          </div>

          {/* Approval placeholder (display only – actions on chef detail page) */}
          <div className="flex-shrink-0">
            <Link
              href={`/users/${chefId}`}
              className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2 text-[13px] text-gray-600 bg-white hover:bg-gray-50 transition-colors shadow-sm min-w-[180px] justify-between"
            >
              <span>
                {isVerified ? "KYC Approved" : user.kycStatus === "rejected" ? "KYC Rejected" : "Select Approval Status"}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </Link>
          </div>
        </div>

        {/* ── Booking Table ────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <h2 className="text-[16px] font-bold text-gray-900">Booking detail</h2>
            <Link href={`/users/${chefId}`} className="text-[13px] font-semibold text-[#E11D48] hover:text-red-700">
              Chef detail
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-gray-400">
              <AlertCircle className="w-10 h-10 mb-3" />
              <p className="text-sm font-medium">No bookings found for this chef</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#FAFAFA] border-b border-gray-100">
                    <tr className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                      <th className="px-6 py-4 whitespace-nowrap">S. no</th>
                      <th className="px-6 py-4 whitespace-nowrap">Client</th>
                      <th className="px-6 py-4 whitespace-nowrap">Event Type</th>
                      <th className="px-6 py-4 whitespace-nowrap">Date &amp; Time</th>
                      <th className="px-6 py-4 whitespace-nowrap">Guest</th>
                      <th className="px-6 py-4 whitespace-nowrap">Amount</th>
                      <th className="px-6 py-4 whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {currentBookings.map((booking, i) => {
                      const pill = STATUS_PILL[booking.status] ?? "bg-gray-100 text-gray-600 border-gray-200";
                      const sNo  = (safePage - 1) * itemsPerPage + i + 1;
                      return (
                        <tr key={booking.fullId || i} className="hover:bg-gray-50/60 transition-colors">
                          {/* S.no */}
                          <td className="px-6 py-4 text-xs text-gray-400 font-medium">
                            #{String(sNo).padStart(5, "0")}
                          </td>

                          {/* Client */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                                {booking.client?.[0]?.toUpperCase() || "?"}
                              </div>
                              <span className="text-xs font-medium text-gray-800 whitespace-nowrap">
                                {booking.client}
                              </span>
                            </div>
                          </td>

                          {/* Event Type */}
                          <td className="px-6 py-4 text-xs font-medium text-gray-800 whitespace-nowrap">
                            {booking.eventType}
                          </td>

                          {/* Date & Time */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-xs font-medium text-gray-800">{booking.date}</div>
                            <div className="text-[10px] text-gray-400 mt-0.5">{booking.time}</div>
                          </td>

                          {/* Guest */}
                          <td className="px-6 py-4 text-xs text-gray-700">{booking.guests}</td>

                          {/* Amount */}
                          <td className="px-6 py-4 text-xs font-medium text-gray-800 whitespace-nowrap">
                            {booking.amount}
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${pill}`}>
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ── Pagination ─────────────────────────────────────── */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-[#FAFAFA]">
                <p className="text-[11px] text-gray-500">
                  Showing {(safePage - 1) * itemsPerPage + 1}–{Math.min(safePage * itemsPerPage, totalItems)} of {totalItems} bookings
                </p>
                <div className="flex items-center gap-1">
                  {/* First */}
                  <Link
                    href={pageUrl(1)}
                    className={`flex items-center justify-center w-7 h-7 rounded border text-xs shadow-sm transition-colors
                      ${safePage <= 1 ? "border-gray-100 bg-gray-50 text-gray-300 pointer-events-none" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"}`}
                  >&laquo;</Link>

                  {/* Prev */}
                  <Link
                    href={pageUrl(Math.max(1, safePage - 1))}
                    className={`flex items-center justify-center w-7 h-7 rounded border text-xs shadow-sm transition-colors
                      ${safePage <= 1 ? "border-gray-100 bg-gray-50 text-gray-300 pointer-events-none" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"}`}
                  >&lsaquo;</Link>

                  {/* Current */}
                  <button className="flex items-center justify-center px-3 h-7 rounded bg-[#C44629] text-white text-xs font-medium shadow-sm">
                    {safePage}
                  </button>

                  {totalPages > 1 && (
                    <>
                      <span className="px-1.5 text-xs text-gray-400">…</span>
                      <Link
                        href={pageUrl(totalPages)}
                        className="flex items-center justify-center px-2.5 h-7 rounded border text-xs border-gray-200 bg-white text-gray-500 hover:bg-gray-50 shadow-sm"
                      >
                        {totalPages}
                      </Link>
                    </>
                  )}

                  {/* Next */}
                  <Link
                    href={pageUrl(Math.min(totalPages, safePage + 1))}
                    className={`flex items-center justify-center w-7 h-7 rounded border text-xs shadow-sm transition-colors
                      ${safePage >= totalPages ? "border-gray-100 bg-gray-50 text-gray-300 pointer-events-none" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"}`}
                  >&rsaquo;</Link>

                  {/* Last */}
                  <Link
                    href={pageUrl(totalPages)}
                    className={`flex items-center justify-center w-7 h-7 rounded border text-xs shadow-sm transition-colors
                      ${safePage >= totalPages ? "border-gray-100 bg-gray-50 text-gray-300 pointer-events-none" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"}`}
                  >&raquo;</Link>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
