"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";

export default function BookingsFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState(searchParams.get("status") || "All");
  const [type, setType] = useState(searchParams.get("type") || "All");
  const [start, setStart] = useState(searchParams.get("start") || "");
  const [end, setEnd] = useState(searchParams.get("end") || "");
  const [q, setQ] = useState(searchParams.get("q") || "");

  const applyFilters = (updates: any) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1"); // reset page
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "All") {
        params.set(key, value as string);
      } else {
        params.delete(key);
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleReset = () => {
    setStatus("All");
    setType("All");
    setStart("");
    setEnd("");
    setQ("");
    
    // Maintain some params if necessary like partnerId
    const partnerId = searchParams.get("partnerId");
    
    const params = new URLSearchParams();
    if (partnerId) params.set("partnerId", partnerId);
    params.set("page", "1");
    
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div className="flex flex-wrap items-center gap-3">
        {/* Status Dropdown */}
        <div className="relative">
          <select 
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              applyFilters({ status: e.target.value, type, start, end, q });
            }}
            className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white min-w-[120px] focus:outline-none focus:ring-1 focus:ring-[#C44629]"
          >
            <option value="All">All booking</option>
            <option value="Completed">Completed</option>
            <option value="In progress">In progress</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
            </svg>
          </div>
        </div>

        {/* Event Type Dropdown */}
        <div className="relative">
          <select 
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              applyFilters({ status, type: e.target.value, start, end, q });
            }}
            className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white min-w-[120px] focus:outline-none focus:ring-1 focus:ring-[#C44629]"
          >
            <option value="All">Event Type</option>
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
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 hidden sm:inline">Date range:</span>
          <input 
            type="date"
            value={start}
            onChange={(e) => {
               setStart(e.target.value);
               applyFilters({ status, type, start: e.target.value, end, q });
            }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-[#C44629]"
          />
          <input 
            type="date"
            value={end}
            onChange={(e) => {
               setEnd(e.target.value);
               applyFilters({ status, type, start, end: e.target.value, q });
            }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-[#C44629]"
          />
          <button 
            onClick={handleReset}
            className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Search box */}
      <div className="relative w-full sm:w-auto">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text"
          placeholder="Search booking"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              applyFilters({ status, type, start, end, q });
            }
          }}
          onBlur={() => applyFilters({ status, type, start, end, q })}
          className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full sm:w-[220px] focus:outline-none focus:ring-1 focus:ring-[#C44629] bg-white"
        />
      </div>
    </div>
  );
}
