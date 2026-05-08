"use client";

import { useRef, useState } from "react";
import { Upload, Send, Bell, X, CheckCircle, Loader2, EyeOff, ChevronDown } from "lucide-react";

type SendState = "idle" | "sending" | "success" | "error";

export default function SettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [headline, setHeadline] = useState("");
  const [message, setMessage] = useState("");
  const [sendState, setSendState] = useState<SendState>("idle");
  const [resultMsg, setResultMsg] = useState("");

  // ── Image handling ──────────────────────────────────────────────────
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5 MB.");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Send notification ───────────────────────────────────────────────
  const handleSend = async () => {
    if (!headline.trim() || !message.trim()) {
      alert("Please fill in both the headline and message.");
      return;
    }

    setSendState("sending");
    setResultMsg("");

    try {
      // Step 1: Upload image if one was chosen
      let imageUrl: string | undefined;
      if (imageFile) {
        const form = new FormData();
        form.append("image", imageFile);

        const uploadRes = await fetch("/api/upload-notification-image", {
          method: "POST",
          body: form,
        });
        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadJson.error ?? "Image upload failed");
        imageUrl = uploadJson.url as string;
      }

      // Step 2: Send notification with image HTTPS URL (not base64 — FCM 4KB limit)
      const res = await fetch("/api/send-custom-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: headline.trim(),
          body: message.trim(),
          imageUrl,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Unknown error");

      setSendState("success");
      setResultMsg(
        `Notification sent to ${json.totalDevices ?? 0} device(s) — ✓ ${json.sent ?? 0} delivered, ✗ ${json.failed ?? 0} failed.`
      );

      // Reset form after 4 seconds
      setTimeout(() => {
        setSendState("idle");
        setResultMsg("");
        setHeadline("");
        setMessage("");
        clearImage();
      }, 4000);
    } catch (err: any) {
      setSendState("error");
      setResultMsg(err.message ?? "Failed to send notification.");
    }
  };

  const canSend = headline.trim().length > 0 && message.trim().length > 0;

  return (
    <div className="space-y-6 mx-6 bg-transparent">
      {/* Existing Send Notification Component */}
      <div className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
        <div className="border-b border-gray-100 px-6 py-4">
          <h1 className="text-base font-bold text-gray-800">Account Settings</h1>
        </div>

      <div className="p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* ── Left Column ─────────────────── */}
          <div className="flex flex-col space-y-6">
            
            {/* Image Upload Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="border border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center text-red-500 mb-2 mt-2 font-medium text-[13px]">
                <Upload className="w-4 h-4 mr-2" />
                <span>Upload Identity document</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed mb-1">
                Supports: JPG, JPEG, PNG | File size should not be<br />more than 5 MB
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpg,image/jpeg,image/png"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Headline Input */}
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Enter Headline"
              maxLength={80}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-500 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-400"
            />

            {/* Message Input */}
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter Message"
              maxLength={200}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-500 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-400"
            />
          </div>

          {/* ── Right Column ─────────────────── */}
          <div className="flex flex-col space-y-6 mx-20">
            
            {/* Image Preview Box */}
            <div className="relative w-full h-48 bg-[#D9D9D9] rounded-xl overflow-hidden flex items-center justify-center border border-transparent">
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={clearImage}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : null}
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!canSend || sendState === "sending"}
              className={`w-full py-3.5 rounded-lg font-medium text-sm transition-all
                ${canSend && sendState !== "sending"
                  ? "bg-red-500 text-white hover:bg-red-600 shadow-sm"
                  : "bg-[#EEF2F6] text-[#8A98AC] cursor-not-allowed"
                }`}
            >
              {sendState === "sending" ? (
                 <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> Sending...</span>
              ) : "Broadcast"}
            </button>
            
            <div className="min-h-[24px]">
               {resultMsg && (
                 <p className={`text-xs text-center ${sendState === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                   {resultMsg}
                 </p>
               )}
            </div>

          </div>
        </div>
      </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column - Account Settings */}
        <div className="space-y-6">
          
          {/* Create New Password Card */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="text-base font-bold text-gray-800">Account Settings</h2>
            </div>
            <div className="p-6">
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-1">Create new password</h3>
                <p className="text-[12px] text-[#8A98AC]">Your new password must be different from previous used passwords.</p>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <input 
                    type="password" 
                    placeholder="Enter Password" 
                    className="w-full text-sm px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 text-gray-600 placeholder-gray-400" 
                  />
                  <EyeOff className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600" />
                </div>
                <div className="relative">
                  <input 
                    type="password" 
                    placeholder="Confirm Password" 
                    className="w-full text-sm px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 text-gray-600 placeholder-gray-400" 
                  />
                  <EyeOff className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600" />
                </div>
                <button className="w-full bg-[#EEF2F6] text-[#8A98AC] font-medium py-2.5 rounded-md text-sm mt-2 cursor-not-allowed transition-colors">
                  Reset Password
                </button>
              </div>
            </div>
          </div>

          {/* Platform Settings Card */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="text-base font-bold text-gray-800">Account Settings</h2>
            </div>
            <div className="p-6 space-y-7">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <p className="text-[13px] text-gray-700">Platform Commission rate</p>
                  <p className="text-[11px] text-[#8A98AC] mt-0.5">Percentage deducted from each booking</p>
                </div>
                <input 
                  type="text" 
                  defaultValue="5%" 
                  className="w-[100px] px-3 py-2 border border-gray-200 rounded-md text-[13px] text-center focus:outline-none text-gray-600 bg-white" 
                  readOnly 
                />
              </div>
              
              <div className="flex justify-between items-center gap-4">
                <div>
                  <p className="text-[13px] text-gray-700">Minimum payout amount</p>
                  <p className="text-[11px] text-[#8A98AC] mt-0.5">Minimum balance before chef receives payout</p>
                </div>
                <input 
                  type="text" 
                  defaultValue="Rs. 500" 
                  className="w-[100px] px-3 py-2 border border-gray-200 rounded-md text-[13px] text-center focus:outline-none text-gray-600 bg-white" 
                  readOnly 
                />
              </div>

              <div className="flex justify-between items-center gap-4">
                <div>
                  <p className="text-[13px] text-gray-700">Schedule payout</p>
                  <p className="text-[11px] text-[#8A98AC] mt-0.5">How often payouts are processed</p>
                </div>
                <div className="relative w-[100px]">
                  <select className="w-full appearance-none px-3 py-2 border border-gray-200 rounded-md text-[13px] text-center focus:outline-none focus:ring-1 focus:ring-red-500 text-gray-600 bg-white cursor-pointer">
                    <option>Monthly</option>
                    <option>Weekly</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* Right Column - Notifications */}
        <div>
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 h-3/6">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="text-base font-bold text-gray-800">Notification</h2>
            </div>
            <div className="p-6 space-y-7">
              {[
                "New Booking Alerts",
                "Chef availability updates",
                "Payment Confirmation",
                "SMS Alerts",
                "Cancellation Alert",
                "Payout Alert"
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-[13px] text-[#8A98AC]">{item}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
