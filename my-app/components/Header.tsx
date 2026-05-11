"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Search, Download } from "lucide-react";
import Link from "next/link";
import ExportReportModal from "./ExportReportModal";

export default function Header() {
  const pathname = usePathname();
  const isChefsPage = pathname === "/chef" || pathname === "/chefs";
  const isBookingsPage = pathname === "/booking" || pathname === "/bookings";

  const [showExportModal, setShowExportModal] = useState(false);

  return (
    <>
      <header className="h-[60px] flex items-center justify-end px-6 flex-shrink-0 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          {isChefsPage ? (
            <>
              {/* <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, city"
                  className="pl-9 pr-4 py-2 border border-[#E5E7EB] rounded-md text-[13px] text-gray-700 focus:outline-none focus:border-gray-300 w-64"
                />
              </div>
              <button className="px-5 py-2 bg-white border border-[#E5E7EB] text-[13px] font-medium rounded-md text-[#4B5563] hover:bg-gray-50 transition-colors">
                Filter
              </button>
              <button className="px-5 py-2 bg-[#E11D48] text-white text-[13px] font-medium rounded-md hover:bg-[#BE123C] transition-colors">
                + Add Chef
              </button> */}
            </>
          ) : isBookingsPage ? (
            <>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search booking"
                  className="pl-9 pr-4 py-2 border border-[#E5E7EB] rounded-md text-[13px] text-gray-700 focus:outline-none focus:border-gray-300 w-72"
                />
              </div>
              <button className="px-4 py-2 bg-white border border-[#E5E7EB] text-[13px] font-medium rounded-md text-[#4B5563] hover:bg-gray-50 transition-colors">
                Export
              </button>
              <Link href="/bookings/new">
                <button className="px-4 py-2 bg-[#E11D48] text-white text-[13px] font-medium rounded-md hover:bg-[#BE123C] transition-colors">
                  + New Booking
                </button>
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E7EB] text-[13px] font-medium rounded-md text-[#4B5563] hover:bg-gray-50 hover:border-[#E11D48] hover:text-[#E11D48] transition-all"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
              <Link href="/bookings/new">
                <button className="px-4 py-2 bg-[#E11D48] text-white text-[13px] font-medium rounded-md hover:bg-[#BE123C] transition-colors">
                  + New Booking
                </button>
              </Link>
            </>
          )}
        </div>
      </header>

      {showExportModal && (
        <ExportReportModal onClose={() => setShowExportModal(false)} />
      )}
    </>
  );
}
