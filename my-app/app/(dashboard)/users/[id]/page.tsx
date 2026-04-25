import { getUserById } from "@/app/actions/user";
import { getChefBookings } from "@/app/actions/bookings";
import { AlertCircle } from "lucide-react";
import { notFound } from "next/navigation";
import ChefDetailClient from "./ChefDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ChefDetailsPage({ params }: PageProps) {
  const { id } = await params;

  const [result, bookingsResult] = await Promise.all([
    getUserById(id),
    getChefBookings(id),
  ]);

  if (!result.success || !result.data) {
    if (result.error === "User not found") notFound();
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-red-900">Failed to load chef</h2>
        <p className="text-red-600 mt-2">{result.error}</p>
      </div>
    );
  }

  const user = result.data as any;
  const bookings =
    bookingsResult.success && bookingsResult.data ? bookingsResult.data : [];

  return <ChefDetailClient user={user} bookings={bookings} />;
}
