"use client";

import { createBookingForChef } from "@/app/actions/booking";
import { X, Calendar, ChevronDown, MapPin, Users, Clock, FileText, Phone, User, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

const inputBase =
  "w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[14px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#eb243e]/20 focus:border-[#eb243e] transition-all";

const selectBase =
  "w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[14px] text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-[#eb243e]/20 focus:border-[#eb243e] transition-all";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
      {children}
    </label>
  );
}

type FormValues = {
  clientName: string;
  phone: string;
  eventType: string;
  location: string;
  date: string;
  time: string;
  guests: string;
  zone: string;
  address: string;
  requirements: string;
  amount: string;
};

export default function CreateBookingPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Confirmation dialog state
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingData, setPendingData] = useState<FormValues | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setPendingData({
      clientName: formData.get("clientName") as string,
      phone: formData.get("phone") as string,
      eventType: formData.get("eventType") as string,
      location: formData.get("location") as string,
      date: formData.get("date") as string,
      time: formData.get("time") as string,
      guests: formData.get("guests") as string,
      zone: formData.get("zone") as string,
      address: formData.get("address") as string,
      requirements: formData.get("requirements") as string,
      amount: formData.get("amount") as string,
    });
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (!pendingData) return;
    setShowConfirm(false);
    setLoading(true);
    setError(null);

    const dateTime = pendingData.date && pendingData.time
      ? new Date(`${pendingData.date}T${pendingData.time}`)
      : new Date(pendingData.date || Date.now());

    const result = await createBookingForChef("generic-booking", {
      clientName: pendingData.clientName,
      phone: pendingData.phone,
      eventType: pendingData.eventType,
      date: dateTime,
      location: pendingData.location, // City from dropdown
      address: pendingData.address,   // Full address from textarea
      guests: parseInt(pendingData.guests, 10),
      amount: parseFloat(pendingData.amount) || 0,
      zone: pendingData.zone,
      requirements: pendingData.requirements,
    });

    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setPendingData(null);
      formRef.current?.reset();
      setTimeout(() => setSuccess(false), 4000);
    } else {
      setError(result.error || "Something went wrong.");
    }
  };

  const inputClass = "w-full px-4 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-[14px] text-gray-700 placeholder-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#E11D48] focus:border-[#E11D48] transition-all";
  const selectWrapper = "relative";
  const selectIcon = "w-4 h-4 text-[#9CA3AF] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0f1c]/20 backdrop-blur-sm">
      <div className="bg-white w-full max-w-[580px] rounded-[24px] shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <Link
          href="/bookings"
          className="absolute top-6 right-6 z-10 w-7 h-7 bg-[#9CA3AF]/20 text-[#9CA3AF] rounded-full flex items-center justify-center hover:bg-[#9CA3AF]/30 transition-colors"
        >
          <X className="w-4 h-4" />
        </Link>

        {/* Header */}
        <div className="px-8 pt-8 pb-6">
          <h2 className="text-[18px] font-bold text-[#374151]">New Booking Form</h2>
        </div>

        {/* Form Body */}
        <form ref={formRef} onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
          
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs border border-red-100 mb-2">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 text-green-700 rounded-lg text-xs border border-green-100 mb-2">
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
            <div className={selectWrapper}>
              <select name="location" required className={inputClass + " appearance-none"}>
                <option value="">Select location</option>
                <option value="delhi">Delhi</option>
                <option value="mumbai">Mumbai</option>
                <option value="bangalore">Bangalore</option>
              </select>
              <ChevronDown className={selectIcon} />
            </div>
            <div className={selectWrapper}>
              <select name="eventType" required className={inputClass + " appearance-none"}>
                <option value="">Select occasion</option>
                <option value="birthday">Birthday</option>
                <option value="wedding">Wedding</option>
                <option value="other">Other</option>
              </select>
              <ChevronDown className={selectIcon} />
            </div>
          </div>

          {/* Row 3: Guests & Cuisine */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="guests" type="number" required placeholder="No of guests" className={inputClass} />
            <div className={selectWrapper}>
              <select name="cuisine" className={inputClass + " appearance-none bg-white"}>
                <option value="">Cuisine type</option>
                <option value="indian">Indian</option>
                <option value="continental">Continental</option>
                <option value="chinese">Chinese</option>
              </select>
              <ChevronDown className={selectIcon} />
            </div>
          </div>

          {/* Row 4: Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <input name="date" type="text" onFocus={(e) => (e.target.type = "date")} placeholder="Select date" className={inputClass} />
              <Calendar className="w-5 h-5 text-[#9CA3AF] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <input name="time" placeholder="Enter time" className={inputClass} />
          </div>

          {/* Row 5: Address */}
          <textarea
            name="address"
            required
            placeholder="Enter full address"
            rows={4}
            className={inputClass + " resize-none"}
          />

          {/* Row 6: Zone & Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={selectWrapper}>
              <select name="zone" required className={inputClass + " appearance-none"}>
                <option value="">Select zone</option>
                <option value="north">North</option>
                <option value="south">South</option>
                <option value="east">East</option>
                <option value="west">West</option>
              </select>
              <ChevronDown className={selectIcon} />
            </div>
            <input 
              name="amount" 
              type="number" 
              step="0.01" 
              required 
              placeholder="Booking Amount" 
              className={inputClass} 
            />
          </div>

          {/* Row 7: Special Requirements */}
          <input name="requirements" placeholder="any special requirement" className={inputClass} />

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E11D48] hover:bg-red-700 text-white py-4 rounded-xl font-bold text-[16px] transition-all disabled:opacity-70 mt-4 shadow-lg shadow-red-100"
          >
            {loading ? "Creating..." : "Create Booking"}
          </button>
        </form>
      </div>

      {/* Confirmation Dialog Placeholder (Hidden logic preserved) */}
      {showConfirm && pendingData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
            <h3 className="text-lg text-[#374151] font-bold mb-4">Confirm Broadcast</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to broadcast this booking to all chefs?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-2 rounded-lg border border-[#E5E7EB] text-[#374151] text-sm font-medium">Cancel</button>
              <button onClick={handleConfirm} className="flex-1 py-2 rounded-lg bg-[#E11D48] text-white text-sm font-semibold">Yes, Broadcast</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
