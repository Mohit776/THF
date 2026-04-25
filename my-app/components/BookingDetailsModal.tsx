"use client";

import { BookingRow, updateBooking } from "@/app/actions/bookings";
import { X, ChevronDown, CheckCircle, Send, Phone, MapPin, FileText, Users, Calendar, Clock, IndianRupee } from "lucide-react";
import { useState } from "react";

interface BookingDetailsModalProps {
  booking: BookingRow;
  onClose: () => void;
}

export default function BookingDetailsModal({ booking, onClose }: BookingDetailsModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [amount, setAmount] = useState(booking.rawAmount.toString());
  const [zone, setZone] = useState(booking.zone);
  const [status, setStatus] = useState(booking.status);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    const res = await updateBooking(booking.fullId, {
      rawAmount: parseFloat(amount) || 0,
      zone,
      status,
    });
    setLoading(false);
    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } else {
      setError(res.error || "Update failed");
    }
  };

  // Shared styles
  const card = "bg-[#F9FAFB] rounded-2xl p-4 flex flex-col gap-1 min-w-0";
  const label = "text-[10px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5";
  const value = "text-[14px] font-semibold text-[#111827] break-words leading-snug";
  const editCard = "bg-[#F9FAFB] rounded-2xl p-4 flex flex-col gap-2 min-w-0";
  const selectClass =
    "bg-transparent text-[14px] font-semibold text-[#111827] w-full outline-none cursor-pointer appearance-none";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-[540px] rounded-[32px] shadow-2xl flex flex-col max-h-[90vh]">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="px-7 pt-7 pb-4 flex items-start justify-between flex-shrink-0">
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Booking Details</p>
            <h2 className="text-[18px] font-extrabold text-[#111827] leading-tight">
              {booking.id}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="mt-1 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable body ────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-7 pb-2 space-y-3">

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs border border-red-100">
              {error}
            </div>
          )}

          {/* Row 1: Chef & Client */}
          <div className="grid grid-cols-2 gap-3">
            <div className={card}>
              <span className={label}>Chef name</span>
              <span className={value}>{booking.chefName || "—"}</span>
            </div>
            <div className={card}>
              <span className={label}>Client name</span>
              <span className={value}>{booking.client || "—"}</span>
            </div>
          </div>

          {/* Row 2: Phone & Event */}
          <div className="grid grid-cols-2 gap-3">
            <div className={card}>
              <span className={label}><Phone className="w-3 h-3" /> Phone</span>
              <span className={value}>{booking.phone || "—"}</span>
            </div>
            <div className={card}>
              <span className={label}>Event type</span>
              <span className={value}>{booking.eventType || "—"}</span>
            </div>
          </div>

          {/* Row 3: Date, Time & Guests */}
          <div className="grid grid-cols-3 gap-3">
            <div className={card}>
              <span className={label}><Calendar className="w-3 h-3" /> Date</span>
              <span className={value}>{booking.date}</span>
            </div>
            <div className={card}>
              <span className={label}><Clock className="w-3 h-3" /> Time</span>
              <span className={value}>{booking.time}</span>
            </div>
            <div className={card}>
              <span className={label}><Users className="w-3 h-3" /> Guests</span>
              <span className={value}>{booking.guests}</span>
            </div>
          </div>

          {/* Row 4: Location & Address */}
          <div className="grid grid-cols-2 gap-3">
            <div className={card}>
              <span className={label}><MapPin className="w-3 h-3" /> Area/Location</span>
              <span className={value}>{booking.location || "—"}</span>
            </div>
            <div className={card}>
              <span className={label}><MapPin className="w-3 h-3" /> Full Address</span>
              <span className={value + " whitespace-pre-wrap"}>{booking.address || "—"}</span>
            </div>
          </div>

          {/* Row 5: Additional notes (full width) */}
          <div className={card}>
            <span className={label}><FileText className="w-3 h-3" /> Special Requirements / Notes</span>
            <span className={value + " whitespace-pre-wrap"}>{booking.requirements || "—"}</span>
          </div>

          {/* ── Divider ── */}
          <div className="border-t border-dashed border-gray-200 my-1" />
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Edit booking</p>

          {/* Row 6: Amount (editable) + Zone (editable) */}
          <div className="grid grid-cols-2 gap-3">
            <div className={editCard}>
              <span className={label}><IndianRupee className="w-3 h-3" /> Amount (₹)</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-transparent text-[14px] font-semibold text-[#111827] w-full outline-none border-b border-gray-200 pb-0.5 focus:border-[#E11D48] transition-colors"
                placeholder="0"
              />
            </div>
            <div className={editCard}>
              <div className="flex items-center justify-between">
                <span className={label}>Zone</span>
                <ChevronDown className="w-3 h-3 text-gray-400 flex-shrink-0" />
              </div>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className={selectClass}
              >
                <option value="">No Zone</option>
                <option value="north">North Zone</option>
                <option value="south">South Zone</option>
                <option value="east">East Zone</option>
                <option value="west">West Zone</option>
              </select>
            </div>
          </div>

          {/* Row 7: Status (full width) */}
          <div className={editCard}>
            <div className="flex items-center justify-between">
              <span className={label}>Status</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={selectClass}
            >
              <option value="Scheduled">Scheduled</option>
              <option value="In progress">In progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

        </div>

        {/* ── Footer ─────────────────────────────────────────── */}
        <div className="px-7 py-5 flex gap-3 flex-shrink-0 border-t border-gray-100">
          <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-[#E11D48] py-3.5 rounded-2xl font-bold text-[14px] transition-all flex items-center justify-center gap-2">
            <Send className="w-4 h-4" />
            Send invite
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-[#E11D48] hover:bg-red-700 text-white py-3.5 rounded-2xl font-bold text-[14px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-100 disabled:opacity-70"
          >
            {loading
              ? "Saving…"
              : success
              ? <><CheckCircle className="w-5 h-5" /> Saved!</>
              : "Save Changes"}
          </button>
        </div>

      </div>
    </div>
  );
}
