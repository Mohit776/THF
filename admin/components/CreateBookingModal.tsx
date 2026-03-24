"use client";

import { useState } from "react";
import { collection, addDoc, getDocs, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Plus, X, Loader2 } from "lucide-react";

export default function CreateBookingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    clientName: "",
    phone: "",
    eventType: "",
    dateStr: "",
    timeStr: "",
    location: "",
    guests: "",
    amount: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Parse date and time to create a single Date object
      const dateTimeString = `${formData.dateStr}T${formData.timeStr}`;
      const dateObj = new Date(dateTimeString);

      if (isNaN(dateObj.getTime())) {
        throw new Error("Invalid date or time provider.");
      }

      const bookingData = {
        clientName: formData.clientName,
        phone: formData.phone,
        eventType: formData.eventType,
        date: Timestamp.fromDate(dateObj),
        location: formData.location,
        guests: parseInt(formData.guests) || 0,
        amount: parseFloat(formData.amount) || 0,
        status: "broadcasted", // Special status for any chef to pick up
        partnerId: "", // Not assigned yet
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "bookings"), bookingData);

      // Send push notifications to all partners
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const tokens: string[] = [];
        usersSnap.forEach((doc) => {
          const data = doc.data();
          if (data.expoPushToken) {
            tokens.push(data.expoPushToken);
          }
        });

        if (tokens.length > 0) {
          await fetch("/api/send-notification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tokens,
              title: "🍳 New Booking Available!",
              body: `${formData.clientName} - ${formData.eventType} - ${formData.guests} guests at ${formData.location}`,
              data: { type: "broadcast_booking" },
            }),
          });
          console.log("[CreateBookingModal] Push sent to", tokens.length, "partners");
        }
      } catch (pushErr) {
        console.warn("[CreateBookingModal] Failed to send push:", pushErr);
        // Don't fail the booking creation if push fails
      }

      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        setFormData({
          clientName: "",
          phone: "",
          eventType: "",
          dateStr: "",
          timeStr: "",
          location: "",
          guests: "",
          amount: "",
        });
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create booking.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-brand-600 text-white shadow hover:bg-brand-700 h-10 px-4 py-2"
      >
        <Plus className="mr-2 h-4 w-4" />
        Create Booking
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-zinc-900">Broadcast New Booking</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}
              {success && <div className="p-3 text-sm text-emerald-600 bg-emerald-50 rounded-lg">Booking broadcasted successfully!</div>}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Client Name</label>
                  <input required name="clientName" value={formData.clientName} onChange={handleChange} className="w-full flex h-10 rounded-md border border-zinc-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500" placeholder="John Doe" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Phone Number</label>
                  <input required name="phone" value={formData.phone} onChange={handleChange} className="w-full flex h-10 rounded-md border border-zinc-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500" placeholder="+91 9876543210" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Event Type & Cuisine</label>
                  <input required name="eventType" value={formData.eventType} onChange={handleChange} className="w-full flex h-10 rounded-md border border-zinc-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500" placeholder="North Indian + Cake" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Date</label>
                    <input required type="date" name="dateStr" value={formData.dateStr} onChange={handleChange} className="w-full flex h-10 rounded-md border border-zinc-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Time</label>
                    <input required type="time" name="timeStr" value={formData.timeStr} onChange={handleChange} className="w-full flex h-10 rounded-md border border-zinc-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Location</label>
                  <input required name="location" value={formData.location} onChange={handleChange} className="w-full flex h-10 rounded-md border border-zinc-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500" placeholder="GK-1 South Delhi" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Number of Guests</label>
                    <input required type="number" name="guests" value={formData.guests} onChange={handleChange} className="w-full flex h-10 rounded-md border border-zinc-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500" placeholder="12" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Booking Amount (₹)</label>
                    <input required type="number" name="amount" value={formData.amount} onChange={handleChange} className="w-full flex h-10 rounded-md border border-zinc-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500" placeholder="5000" />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || success}
                  className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors flex items-center disabled:opacity-70"
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Broadcast Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
