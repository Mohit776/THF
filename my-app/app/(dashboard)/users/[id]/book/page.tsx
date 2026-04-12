"use client";

import { createBookingForChef } from "@/app/actions/booking";
import { X, Calendar, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";

export default function CreateBookingPage() {
  const router = useRouter();
  const params = useParams();
  const partnerId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      clientName: formData.get("clientName") as string,
      phone: formData.get("phone") as string,
      eventType: formData.get("eventType") as string,
      // For now, combine date and time handling generically or leave as is for action compatibility
      date: new Date(formData.get("date") as string || new Date()),
      location: formData.get("location") as string,
      guests: parseInt(formData.get("guests") as string, 10),
      amount: 0, // Placeholder
    };

    const result = await createBookingForChef(partnerId, data);
    setLoading(false);

    if (result.success) {
      router.push(`/users/${partnerId}`);
      router.refresh();
    } else {
      setError(result.error || "Something went wrong.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6">
          <h2 className="text-[22px] font-semibold text-[#1F2937]">New Booking Form</h2>
          <Link href={`/users/${partnerId}`} className="flex items-center justify-center w-7 h-7 bg-[#9CA3AF] text-white rounded-full hover:bg-gray-500 transition-colors">
            <X className="w-4 h-4" />
          </Link>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Row 1 */}
            <div className="relative">
              <select name="location" className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg text-[15px] text-gray-500 appearance-none focus:outline-none focus:border-gray-400">
                <option value="">Select location</option>
                <option value="delhi">Delhi</option>
                <option value="mumbai">Mumbai</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <div className="relative">
              <select name="eventType" className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg text-[15px] text-gray-500 appearance-none focus:outline-none focus:border-gray-400">
                <option value="">Select occasion</option>
                <option value="birthday">Birthday</option>
                <option value="wedding">Wedding</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Row 2 */}
            <div>
              <input
                required
                name="clientName"
                placeholder="Client full name"
                className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg text-[15px] placeholder-gray-400 focus:outline-none focus:border-gray-400"
              />
            </div>
            <div>
              <input
                required
                name="phone"
                placeholder="Client Contact number"
                className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg text-[15px] placeholder-gray-400 focus:outline-none focus:border-gray-400"
              />
            </div>

            {/* Row 3 */}
            <div>
              <input
                required
                type="number"
                name="guests"
                placeholder="No of guests"
                className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg text-[15px] placeholder-gray-400 focus:outline-none focus:border-gray-400"
              />
            </div>
            <div className="relative">
              <input
                required
                type="text"
                name="date"
                placeholder="Select date"
                className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg text-[15px] placeholder-gray-400 focus:outline-none focus:border-gray-400"
              />
              <Calendar className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Row 4 */}
            <div>
              <input
                required
                type="text"
                name="time"
                placeholder="Enter time"
                className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg text-[15px] placeholder-gray-400 focus:outline-none focus:border-gray-400"
              />
            </div>
            <div className="relative">
              <select name="zone" className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg text-[15px] text-gray-500 appearance-none focus:outline-none focus:border-gray-400">
                <option value="">Select zone</option>
                <option value="zone1">Zone 1</option>
                <option value="zone2">Zone 2</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Row 5 */}
          <div>
            <textarea
              required
              name="address"
              placeholder="Enter full address"
              rows={4}
              className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg text-[15px] placeholder-gray-400 focus:outline-none focus:border-gray-400 resize-none"
            />
          </div>

          {/* Row 6 */}
          <div>
            <input
              name="requirements"
              placeholder="any special requirement"
              className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg text-[15px] placeholder-gray-400 focus:outline-none focus:border-gray-400"
            />
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E11D48] hover:bg-[#BE123C] text-white px-6 py-3.5 rounded-lg font-medium text-[15px] transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
