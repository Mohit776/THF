"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Chefs", href: "/chefs", badge: "1200" },
    { name: "Bookings", href: "/bookings", badge: "2k" },
    { name: "Onboard Chef", href: "/onboard-chef" },
    { name: "Payments", href: "/payments" },
    { name: "Settings", href: "/settings" },
  ];

  return (
    <aside className="w-[260px] shrink-0 flex-col hidden md:flex border-r border-zinc-200 bg-white">
      <div className="pt-8 px-6 pb-6 border-b border-zinc-100">
        <div className="w-12 h-12 bg-[#eb243e] rounded-lg flex items-center justify-center text-white font-bold text-xl mb-4">
          TFH
        </div>
        <h1 className="text-[17px] font-bold tracking-tight text-zinc-900 leading-tight">
          TheFamousHalwai
        </h1>
        <p className="text-[13px] font-medium text-zinc-500 mt-1">Admin Platform</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-start justify-start w-full px-4 py-3 pl-8  rounded-lg transition-all font-medium text-[14px] ${
                isActive
                  ? "bg-[#eb243e] text-white shadow-sm"
                  : "bg-[#F9FAFB] text-gray-700 border-2 border-[#d3dbe2] hover:bg-gray-100"
              }`}
            >
              <span>{item.name}</span>
              {item.badge && (
                <span className="absolute right-4 px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#F8F8F8] text-gray-700">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
