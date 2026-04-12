"use client";

import { ChevronDown, Upload } from "lucide-react";
import { useState } from "react";

export default function OnboardChefPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-[1000px] mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold text-[#1F2937] mb-6">Onboard Chef</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Chef Registration Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
          <div className="px-8 py-6">
            <h2 className="text-[18px] font-semibold text-[#1F2937] mb-6">Chef Registration Form</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Row 1 */}
              <div>
                <input
                  required
                  name="fullName"
                  placeholder="Full name"
                  className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg text-[15px] placeholder-gray-400 focus:outline-none focus:border-gray-400"
                />
              </div>
              <div>
                <input
                  required
                  name="mobile"
                  placeholder="Mobile number"
                  className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg text-[15px] placeholder-gray-400 focus:outline-none focus:border-gray-400"
                />
              </div>

              {/* Row 2 */}
              <div>
                <input
                  required
                  name="emergencyContact"
                  placeholder="Emergency contact number"
                  className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg text-[15px] placeholder-gray-400 focus:outline-none focus:border-gray-400"
                />
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email (optional)"
                  className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg text-[15px] placeholder-gray-400 focus:outline-none focus:border-gray-400"
                />
              </div>

              {/* Row 3 */}
              <div className="relative">
                <select name="gender" className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg text-[15px] text-gray-500 appearance-none focus:outline-none focus:border-gray-400">
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="relative">
                <select name="experience" className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg text-[15px] text-gray-500 appearance-none focus:outline-none focus:border-gray-400">
                  <option value="">Work experience</option>
                  <option value="0-2">0-2 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5+">5+ years</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Row 4 */}
              <div className="relative">
                <select name="city" className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg text-[15px] text-gray-500 appearance-none focus:outline-none focus:border-gray-400">
                  <option value="">Select city</option>
                  <option value="delhi">Delhi</option>
                  <option value="mumbai">Mumbai</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
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

            {/* Row 5 - Full Width */}
            <div className="mt-5">
              <textarea
                required
                name="address"
                placeholder="Enter full address"
                rows={4}
                className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg text-[15px] placeholder-gray-400 focus:outline-none focus:border-gray-400 resize-none"
              />
            </div>

            {/* Row 6 - Full Width */}
            <div className="mt-5">
              <input
                required
                name="bio"
                placeholder="A short bio"
                className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg text-[15px] placeholder-gray-400 focus:outline-none focus:border-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Banking & Compliance Card */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
          <div className="px-8 py-6">
            <h2 className="text-[18px] font-semibold text-[#1F2937] mb-6">Banking & Compliance</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Row 1 */}
              <div>
                <input
                  required
                  name="aadhar"
                  placeholder="Aadhar number"
                  className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg text-[15px] placeholder-gray-400 focus:outline-none focus:border-gray-400"
                />
              </div>
              <div>
                <input
                  required
                  name="pan"
                  placeholder="PAN number"
                  className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg text-[15px] placeholder-gray-400 focus:outline-none focus:border-gray-400"
                />
              </div>

              {/* Row 2 */}
              <div>
                <input
                  required
                  name="bankAccount"
                  placeholder="Bank Account number"
                  className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg text-[15px] placeholder-gray-400 focus:outline-none focus:border-gray-400"
                />
              </div>
              <div>
                <input
                  required
                  name="ifsc"
                  placeholder="IFSC code"
                  className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg text-[15px] placeholder-gray-400 focus:outline-none focus:border-gray-400"
                />
              </div>

              {/* Row 3 */}
              <div className="relative">
                <select name="bankName" className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg text-[15px] text-gray-500 appearance-none focus:outline-none focus:border-gray-400">
                  <option value="">Bank Name</option>
                  <option value="sbi">State Bank of India</option>
                  <option value="hdfc">HDFC Bank</option>
                  <option value="icici">ICICI Bank</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Upload Documents Section */}
            <h3 className="text-[17px] font-semibold text-[#1F2937] mt-8 mb-5">Upload documents</h3>
            
            <div className="space-y-4">
              {/* Aadhar Upload */}
              <div className="flex items-center justify-between border border-[#E5E7EB] rounded-lg px-4 py-2">
                <span className="text-[15px] text-gray-500">Upload Aadhar Card</span>
                <button type="button" className="px-4 py-1.5 border border-[#E5E7EB] rounded-md text-[13px] font-medium text-[#1F2937] hover:bg-gray-50 transition-colors">
                  Upload
                </button>
              </div>

              {/* PAN Upload */}
              <div className="flex items-center justify-between border border-[#E5E7EB] rounded-lg px-4 py-2">
                <span className="text-[15px] text-gray-500">PAN card</span>
                <button type="button" className="px-4 py-1.5 border border-[#E5E7EB] rounded-md text-[13px] font-medium text-[#1F2937] hover:bg-gray-50 transition-colors">
                  Upload
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <button
                type="button"
                className="w-full py-3.5 bg-white border border-[#E5E7EB] hover:bg-gray-50 text-[#E11D48] rounded-lg font-medium text-[15px] transition-colors"
              >
                Save Draft
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded-lg font-medium text-[15px] transition-colors disabled:opacity-50"
              >
                {loading ? "Processing..." : "Create Booking"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
