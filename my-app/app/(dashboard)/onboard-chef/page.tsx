"use client";

import { ChevronDown, Upload, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onboardChef } from "@/app/actions/chefs";

const CUISINES_LIST = ['North Indian', 'South Indian', 'Chinese', 'Mexican', 'Thai', 'Fast Food', 'Korean', 'Italian'];

export default function OnboardChefPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aadharFileName, setAadharFileName] = useState<string | null>(null);
  const [panFileName, setPanFileName] = useState<string | null>(null);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [showCuisines, setShowCuisines] = useState(false);
  const cuisinesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cuisinesRef.current && !cuisinesRef.current.contains(event.target as Node)) {
        setShowCuisines(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisines(prev => 
      prev.includes(cuisine) ? prev.filter(c => c !== cuisine) : [...prev, cuisine]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const res = await onboardChef(formData);
      if (res.success) {
        alert("Chef registered successfully!");
        router.push("/chefs");
      } else {
        alert("Error registering chef: " + res.error);
      }
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
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
                  <option value="Delhi">Delhi</option>
                  <option value="Noida">Noida</option>
                  <option value="Ghaziabad">Ghaziabad</option>
                  <option value="Faridabad">Faridabad</option>
                  <option value="Gurugram">Gurugram</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Kolkata">Kolkata</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Pune">Pune</option>
                  <option value="Jaipur">Jaipur</option>
                  <option value="Lucknow">Lucknow</option>
                  <option value="Chandigarh">Chandigarh</option>
                  <option value="Indore">Indore</option>
                  <option value="Kochi">Kochi</option>
                  <option value="Ahmedabad">Ahmedabad</option>
                  <option value="Bhubaneswar">Bhubaneswar</option>
                  <option value="Nagpur">Nagpur</option>
                  <option value="Dehradun">Dehradun</option>
                  <option value="Shimla">Shimla</option>
                  <option value="Jalandhar">Jalandhar</option>
                  <option value="Mysuru">Mysuru</option>
                  <option value="Udaipur">Udaipur</option>
                  <option value="Varanasi">Varanasi</option>
                  <option value="Rajkot">Rajkot</option>
                  <option value="Haridwar">Haridwar</option>
                  <option value="Rishikesh">Rishikesh</option>
                  <option value="Mussoorie">Mussoorie</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="relative">
                <select name="zone" className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg text-[15px] text-gray-500 appearance-none focus:outline-none focus:border-gray-400">
                  <option value="">Select zone</option>
                  <option value="north">North zone</option>
                  <option value="south">South zone</option>
                  <option value="east">East zone</option>
                  <option value="west">West zone</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Row 5 */}
              <div className="relative">
                <select name="serviceType" className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg text-[15px] text-gray-500 appearance-none focus:outline-none focus:border-gray-400">
                  <option value="">Job Preference</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Full-Time">Full-Time</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Cuisines - Full Width */}
            <div className="mt-5 relative" ref={cuisinesRef}>
              <div 
                className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg min-h-[46px] flex flex-wrap items-center gap-2 cursor-pointer focus:outline-none focus:border-gray-400 pr-10"
                onClick={() => setShowCuisines(!showCuisines)}
              >
                {selectedCuisines.length === 0 && <span className="text-[15px] text-gray-400">Select cuisines</span>}
                {selectedCuisines.map((cuisine) => (
                  <span key={cuisine} className="inline-flex items-center px-2 py-1 rounded bg-[#FFE4E6] text-[#E11D48] text-[13px] font-medium">
                    {cuisine}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleCuisine(cuisine); }}
                      className="ml-1 hover:text-[#BE123C] focus:outline-none"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
                <ChevronDown className={`w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-transform ${showCuisines ? 'rotate-180' : ''}`} />
              </div>
              
              {/* Dropdown Options */}
              <div className={`absolute z-10 w-full mt-1 bg-white border border-[#E5E7EB] rounded-lg shadow-lg max-h-60 overflow-y-auto ${showCuisines ? 'block' : 'hidden'}`}>
                {CUISINES_LIST.map((cuisine) => (
                  <label 
                    key={cuisine} 
                    className="px-4 py-2.5 text-[14px] cursor-pointer flex items-center space-x-3 hover:bg-gray-50 transition-colors m-0"
                  >
                    <input 
                      type="checkbox" 
                      name="cuisines" 
                      value={cuisine} 
                      checked={selectedCuisines.includes(cuisine)}
                      onChange={() => toggleCuisine(cuisine)}
                      className="rounded text-[#E11D48] focus:ring-[#E11D48] w-4 h-4" 
                    />
                    <span className={selectedCuisines.includes(cuisine) ? 'text-[#E11D48] font-medium' : 'text-gray-700'}>
                      {cuisine}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Address - Full Width */}
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
                <input
                  required
                  name="bankName"
                  placeholder="Bank Name"
                  className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg text-[15px] placeholder-gray-400 focus:outline-none focus:border-gray-400"
                />
              </div>
            </div>

            {/* Upload Documents Section */}
            <h3 className="text-[17px] font-semibold text-[#1F2937] mt-8 mb-5">Upload documents</h3>

            <div className="space-y-4">
              {/* Aadhar Upload */}
              <div className="flex items-center justify-between border border-[#E5E7EB] rounded-lg px-4 py-2 relative">
                <span className="text-[15px] text-gray-500 truncate max-w-[200px]">
                  {aadharFileName || "Upload Aadhar Card"}
                </span>
                <button type="button" className="px-4 py-1.5 border border-[#E5E7EB] rounded-md text-[13px] font-medium text-[#1F2937] hover:bg-gray-50 transition-colors pointer-events-none">
                  Upload
                </button>
                <input 
                  type="file" 
                  name="aadharFile"
                  accept="image/*,application/pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => setAadharFileName(e.target.files?.[0]?.name || null)}
                />
              </div>

              {/* PAN Upload */}
              <div className="flex items-center justify-between border border-[#E5E7EB] rounded-lg px-4 py-2 relative">
                <span className="text-[15px] text-gray-500 truncate max-w-[200px]">
                  {panFileName || "Upload PAN Card"}
                </span>
                <button type="button" className="px-4 py-1.5 border border-[#E5E7EB] rounded-md text-[13px] font-medium text-[#1F2937] hover:bg-gray-50 transition-colors pointer-events-none">
                  Upload
                </button>
                <input 
                  type="file" 
                  name="panFile"
                  accept="image/*,application/pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => setPanFileName(e.target.files?.[0]?.name || null)}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <button
                type="button"
                className="w-full py-3.5 bg-white border border-[#E5E7EB] hover:bg-gray-50 text-[#E11D48] rounded-lg font-medium text-[15px] transition-colors"
                onClick={() => router.back()}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded-lg font-medium text-[15px] transition-colors disabled:opacity-50"
              >
                {loading ? "Processing..." : "Register Chef"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
