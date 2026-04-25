"use client";

import { createBookingForChef, getChefsByZone, ChefForBroadcast } from "@/app/actions/booking";
import { X, Calendar, ChevronDown, Loader2, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";

/* ─── Shared styles ─── */
const inputClass =
  "w-full px-4 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-[14px] text-gray-700 placeholder-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#E11D48] focus:border-[#E11D48] transition-all";

type FormValues = {
  clientName: string;
  phone: string;
  eventType: string;
  cuisine: string;
  location: string;
  date: string;
  time: string;
  guests: string;
  zone: string;
  address: string;
  requirements: string;
  amount: string;
};

/* ─── Chef list modal ─── */
function ChefSelectionModal({
  zone,
  chefs,
  loading,
  onClose,
  onBroadcast,
  broadcasting,
}: {
  zone: string;
  chefs: ChefForBroadcast[];
  loading: boolean;
  onClose: () => void;
  onBroadcast: (selectedIds: string[]) => void;
  broadcasting: boolean;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (uid: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(uid) ? next.delete(uid) : next.add(uid);
      return next;
    });
  };

  const zoneLabel =
    zone.charAt(0).toUpperCase() + zone.slice(1);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-[640px] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="text-[17px] font-bold text-[#374151]">
            {zoneLabel} Zone Halwai List
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
              <Loader2 className="w-7 h-7 animate-spin text-[#E11D48]" />
              <p className="text-sm">Loading chefs for {zoneLabel} zone…</p>
            </div>
          ) : chefs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
              <p className="text-sm font-medium">No chefs found in {zoneLabel} zone</p>
              <p className="text-xs text-gray-300">Broadcast will go to all chefs instead.</p>
            </div>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-[#F9FAFB] text-gray-500 text-[11px] uppercase tracking-wide">
                  <th className="pl-6 pr-2 py-3 text-left w-10"></th>
                  <th className="px-3 py-3 text-left">Chef Name</th>
                  <th className="px-3 py-3 text-left">Location</th>
                  <th className="px-3 py-3 text-center">Bookings</th>
                  <th className="px-3 py-3 text-center">Ratings</th>
                  <th className="px-3 py-3 text-left">Service Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {chefs.map((chef) => (
                  <tr
                    key={chef.uid}
                    onClick={() => toggle(chef.uid)}
                    className={`cursor-pointer transition-colors ${
                      selected.has(chef.uid)
                        ? "bg-red-50/60"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="pl-6 pr-2 py-4">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          selected.has(chef.uid)
                            ? "bg-[#1a1a2e] border-[#1a1a2e]"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {selected.has(chef.uid) && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </td>

                    {/* Name + Avatar */}
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gray-200 text-gray-600 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                          {chef.initials}
                        </div>
                        <span className="font-medium text-gray-800">{chef.name}</span>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-3 py-4 text-gray-500 max-w-[150px]">
                      <span className="line-clamp-2 leading-tight">{chef.location}</span>
                    </td>

                    {/* Bookings */}
                    <td className="px-3 py-4 text-center font-semibold text-gray-700">
                      {chef.bookings}
                    </td>

                    {/* Ratings */}
                    <td className="px-3 py-4 text-center">
                      <span className={`font-bold ${chef.ratings >= 4.5 ? "text-gray-800" : "text-gray-500"}`}>
                        {chef.ratings > 0 ? chef.ratings.toFixed(1) : "—"}
                      </span>
                    </td>

                    {/* Service Type */}
                    <td className="px-3 py-4 text-gray-600 capitalize">
                      {chef.serviceType}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
          <p className="text-xs text-gray-400">
            {selected.size > 0
              ? `${selected.size} chef${selected.size > 1 ? "s" : ""} selected`
              : chefs.length === 0
              ? "Will broadcast to all chefs"
              : "Select chefs to broadcast to"}
          </p>
          <button
            onClick={() => onBroadcast([...selected])}
            disabled={broadcasting}
            className="px-6 py-2.5 bg-[#E11D48] hover:bg-red-700 text-white text-[14px] font-semibold rounded-xl transition-all disabled:opacity-70 flex items-center gap-2 shadow-md shadow-red-100"
          >
            {broadcasting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Broadcasting…
              </>
            ) : (
              "Send Booking Invitation"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function CreateBookingPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Zone-select → chef-list modal state
  const [showChefModal, setShowChefModal] = useState(false);
  const [zoneChefs, setZoneChefs] = useState<ChefForBroadcast[]>([]);
  const [chefsLoading, setChefsLoading] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const [pendingData, setPendingData] = useState<FormValues | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const values: FormValues = {
      clientName: formData.get("clientName") as string,
      phone: formData.get("phone") as string,
      eventType: formData.get("eventType") as string,
      cuisine: formData.get("cuisine") as string,
      location: formData.get("location") as string,
      date: formData.get("date") as string,
      time: formData.get("time") as string,
      guests: formData.get("guests") as string,
      zone: formData.get("zone") as string,
      address: formData.get("address") as string,
      requirements: formData.get("requirements") as string,
      amount: formData.get("amount") as string,
    };

    setPendingData(values);
    setShowChefModal(true);
    setChefsLoading(true);
    setZoneChefs([]);

    // Fetch chefs for selected zone
    const result = await getChefsByZone(values.zone);
    setChefsLoading(false);
    if (result.success) {
      setZoneChefs(result.chefs || []);
    } else {
      setError(result.error || "Failed to load chefs.");
      setShowChefModal(false);
    }
  };

  const handleBroadcast = async (selectedIds: string[]) => {
    if (!pendingData) return;
    setBroadcasting(true);
    setError(null);

    const dateTime =
      pendingData.date && pendingData.time
        ? new Date(`${pendingData.date}T${pendingData.time}`)
        : new Date(pendingData.date || Date.now());

    const result = await createBookingForChef(
      "generic-booking",
      {
        clientName: pendingData.clientName,
        phone: pendingData.phone,
        eventType: pendingData.eventType,
        date: dateTime,
        location: pendingData.location,
        address: pendingData.address,
        guests: parseInt(pendingData.guests, 10),
        amount: parseFloat(pendingData.amount) || 0,
        zone: pendingData.zone,
        requirements: pendingData.requirements,
      },
      selectedIds.length > 0 ? selectedIds : undefined
    );

    setBroadcasting(false);
    setShowChefModal(false);

    if (result.success) {
      setSuccess(true);
      setPendingData(null);
      formRef.current?.reset();
      setTimeout(() => setSuccess(false), 4000);
    } else {
      setError(result.error || "Something went wrong.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0f1c]/20 backdrop-blur-sm">
      {/* Modal — flex-col so header is sticky and form scrolls */}
      <div className="bg-white w-full max-w-[580px] rounded-[24px] shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">

        {/* Header — fixed, never scrolls */}
        <div className="flex items-center justify-between px-8 pt-7 pb-5 flex-shrink-0">
          <h2 className="text-[18px] font-bold text-[#374151]">New Booking Form</h2>
          <Link
            href="/bookings"
            className="w-7 h-7 bg-[#9CA3AF]/20 text-[#9CA3AF] rounded-full flex items-center justify-center hover:bg-[#9CA3AF]/30 transition-colors"
          >
            <X className="w-4 h-4" />
          </Link>
        </div>

        {/* Scrollable form body */}
        <form ref={formRef} onSubmit={handleSubmit} className="px-8 pb-8 space-y-4 overflow-y-auto flex-1">

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs border border-red-100">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 text-green-700 rounded-lg text-xs border border-green-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              Booking broadcasted successfully!
            </div>
          )}

          {/* Row 1: Name & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="clientName" required placeholder="Client full name" className={inputClass} />
            <input name="phone" required placeholder="Client Contact number" className={inputClass} />
          </div>

          {/* Row 2: Location & Occasion */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <select name="location" required className={inputClass + " appearance-none"}>
                <option value="">Select location</option>
                <option value="delhi">Delhi</option>
                <option value="mumbai">Mumbai</option>
                <option value="bangalore">Bangalore</option>
              </select>
              <ChevronDown className="w-4 h-4 text-[#9CA3AF] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <div className="relative">
              <select name="eventType" required className={inputClass + " appearance-none"}>
                <option value="">Select occasion</option>
                <option value="Cocktail and Sangeet">Cocktail and Sangeet</option>
                <option value="Gala Evening">Gala Evening</option>
                <option value="High Tea Menu">High Tea Menu</option>
                <option value="No Onion No Garlic">No Onion No Garlic</option>
                <option value="Continental Food">Continental Food</option>
                <option value="Royal Lunch">Royal Lunch</option>
                <option value="Roka Ceremony">Roka Ceremony</option>
                <option value="Pooja at Home">Pooja at Home</option>
                <option value="Mehendi Cocktail">Mehendi Cocktail</option>
                <option value="Kids Party">Kids Party</option>
                <option value="House Party">House Party</option>
                <option value="Corporate Event">Corporate Event</option>
                <option value="Bachelor Party">Bachelor Party</option>
                <option value="Wedding Functions">Wedding Functions</option>
                <option value="Birthday Party">Birthday Party</option>
                <option value="Anniversary">Anniversary</option>
                <option value="Baby Shower">Baby Shower</option>
                <option value="Other Occasion">Other Occasion</option>
              </select>
              <ChevronDown className="w-4 h-4 text-[#9CA3AF] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Row 3: Guests & Cuisine */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="guests" type="number" required placeholder="No of guests" className={inputClass} />
            <div className="relative">
              <select name="cuisine" required className={inputClass + " appearance-none bg-white"}>
                <option value="">Cuisine type</option>
                <option value="indian">Indian</option>
                <option value="continental">Continental</option>
                <option value="chinese">Chinese</option>
              </select>
              <ChevronDown className="w-4 h-4 text-[#9CA3AF] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Row 4: Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <input
                name="date"
                type="text"
                required
                onFocus={(e) => (e.target.type = "date")}
                placeholder="Select date"
                className={inputClass}
              />
              <Calendar className="w-5 h-5 text-[#9CA3AF] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                name="time"
                required
                defaultValue=""
                className={inputClass + " appearance-none"}
              >
                <option value="" disabled>Select time</option>
                {Array.from({ length: 48 }, (_, i) => {
                  const h24 = Math.floor(i / 2);
                  const mins = i % 2 === 0 ? "00" : "30";
                  const period = h24 < 12 ? "AM" : "PM";
                  const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
                  const value = `${String(h24).padStart(2, "0")}:${mins}`;
                  const label = `${h12}:${mins} ${period}`;
                  return <option key={value} value={value}>{label}</option>;
                })}
              </select>
              <Clock className="w-5 h-5 text-[#9CA3AF] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Row 5: Zone & Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <select name="zone" required className={inputClass + " appearance-none"}>
                <option value="">Select zone</option>
                <option value="north">North</option>
                <option value="south">South</option>
                <option value="east">East</option>
                <option value="west">West</option>
              </select>
              <ChevronDown className="w-4 h-4 text-[#9CA3AF] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <input
              name="amount"
              type="number"
              step="0.01"
              required
              placeholder="Booking Amount (₹)"
              className={inputClass}
            />
          </div>

          {/* Row 6: Address */}
          <textarea
            name="address"
            required
            placeholder="Enter full address"
            rows={3}
            className={inputClass + " resize-none"}
          />

          {/* Row 7: Special Requirements */}
          <input name="requirements" placeholder="Any special requirement" className={inputClass} />

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E11D48] hover:bg-red-700 text-white py-4 rounded-xl font-bold text-[16px] transition-all disabled:opacity-70 shadow-lg shadow-red-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading…
              </>
            ) : (
              "Next: Select Chefs"
            )}
          </button>
        </form>
      </div>

      {/* Chef Selection Modal */}
      {showChefModal && pendingData && (
        <ChefSelectionModal
          zone={pendingData.zone}
          chefs={zoneChefs}
          loading={chefsLoading}
          onClose={() => setShowChefModal(false)}
          onBroadcast={handleBroadcast}
          broadcasting={broadcasting}
        />
      )}
    </div>
  );
}
