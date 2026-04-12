"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/app/actions/auth";
import { Phone, Lock, Eye, EyeOff, Loader2, ChefHat } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("phone", phone);
      formData.append("password", password);

      const result = await login(formData);

      if (result.success) {
        router.push("/dashboard");
      } else {
        setError(result.error || "Login failed");
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-sans">
      {/* Background blobs for premium feel */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10 transition-all duration-500 animate-in fade-in slide-in-from-bottom-8">
        <div className="bg-white rounded-3xl border-2 border-[#e8e8ea] overflow-hidden">
          {/* Header Section */}
          <div className="bg-[#eb243e] p-8 text-white text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                <ChefHat className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
            <p className="text-emerald-50/80 text-sm mt-1">Sign in to TFH Partner Portal</p>
          </div>

          {/* Form Section */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-4">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                  Phone Number
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-gray-900 placeholder-gray-400 font-medium sm:text-sm"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Password
                  </label>
             
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-gray-900 placeholder-gray-400 font-medium sm:text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-emerald-500 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3.5 px-4 rounded-2xl border-2 border-[#e8e8ea] text-white bg-[#eb243e] hover:bg-[#eb243e] active:scale-[0.98] transition-all font-bold tracking-tight disabled:opacity-70 disabled:pointer-events-none"
              >
                {loading ? (
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                ) : null}
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

          
          </div>
        </div>

    
      </div>
    </div>
  );
}
