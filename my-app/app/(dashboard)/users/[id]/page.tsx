import { getUserById } from "@/app/actions/user";
import KycActions from "@/components/KycActions";
import { AlertCircle, ArrowLeft, ShieldCheck, Mail, Phone, MapPin, Briefcase, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ChefDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getUserById(id);

  if (!result.success || !result.data) {
    if (result.error === "User not found") {
      notFound();
    }
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-red-50 rounded-2xl border border-red-200 mt-10">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-red-700">Failed to load user</h2>
        <p className="text-red-600/80 mt-2 text-center max-w-md">
          {result.error}
        </p>
      </div>
    );
  }

  const user = result.data as any;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-500 hover:text-zinc-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Partner Details</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Reviewing profile for {user.name || 'Unknown'}</p>
          </div>
        </div>

        <Link 
          href={`/users/${user.uid}/book`}
          className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm flex items-center"
        >
          Create Booking
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white backdrop-blur-xl border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col items-center">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg mb-4 bg-brand-50 flex items-center justify-center">
              {user.kycDocuments?.selfieUrl ? (
                <Image src={user.kycDocuments.selfieUrl} alt="Selfie" fill className="object-cover" />
              ) : (
                <span className="text-4xl font-bold text-brand-600">{user.name?.[0] || '?'}</span>
              )}
            </div>
            <h2 className="text-xl font-bold text-zinc-900">{user.name || 'No Name'}</h2>
            
            <div className="mt-2">
              {user.kycStatus === "pending_verification" && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  Pending KYC
                </span>
              )}
              {(user.kycStatus === "approved" || user.kycStatus === "verified") && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  Verified
                </span>
              )}
              {(!user.kycStatus || user.kycStatus === "unsubmitted") && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200">
                  Incomplete Profile
                </span>
              )}
            </div>

            <div className="w-full h-px bg-zinc-100 my-6" />

            <div className="w-full space-y-4">
              <div className="flex items-center text-sm">
                <Mail className="w-4 h-4 text-zinc-400 mr-3 shrink-0" />
                <span className="text-zinc-600 truncate">{user.email || 'No email provided'}</span>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="w-4 h-4 text-zinc-400 mr-3 shrink-0" />
                <span className="text-zinc-600">{user.phone || 'No phone provided'}</span>
              </div>
              {user.emergencyPhone && (
                <div className="flex items-center text-sm">
                  <span className="w-4 h-4 text-rose-500 mr-3 shrink-0 flex items-center justify-center font-bold text-[10px] bg-rose-100 rounded-full">!</span>
                  <span className="text-zinc-600">{user.emergencyPhone} (Emergency)</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white backdrop-blur-xl border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-zinc-900 mb-4 flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-zinc-400" /> Location
            </h3>
            <p className="text-sm text-zinc-600 mb-2"><span className="font-medium text-zinc-900 block mb-1">City</span> {user.city || 'Not provided'}</p>
            <p className="text-sm text-zinc-600"><span className="font-medium text-zinc-900 block mb-1">Address</span> {user.address || 'Not provided'}</p>
          </div>
          
          <div className="bg-white backdrop-blur-xl border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-zinc-900 mb-4 flex items-center">
              <Briefcase className="w-4 h-4 mr-2 text-zinc-400" /> Profession
            </h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider block mb-2">Experience</span>
                <div className="flex flex-wrap gap-2">
                  {user.experience && user.experience.length > 0 ? user.experience.map((exp: string, idx: number) => (
                    <span key={idx} className="bg-brand-50 text-brand-700 text-xs px-2.5 py-1 rounded-md font-medium">
                      {exp}
                    </span>
                  )) : (
                    <span className="text-sm text-zinc-500">None listed</span>
                  )}
                </div>
              </div>
              <div className="pt-2 border-t border-zinc-100">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider block mb-1">Gender</span>
                <p className="text-sm text-zinc-900 capitalize">{user.gender || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Documents */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white backdrop-blur-xl border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-zinc-900 mb-4 border-b border-zinc-100 pb-4">KYC Documents</h3>
            
            {!user.kycDocuments ? (
               <div className="py-12 flex flex-col items-center justify-center text-center">
                 <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                   <FileText className="w-8 h-8 text-zinc-300" />
                 </div>
                 <h4 className="text-zinc-900 font-medium">No documents uploaded</h4>
                 <p className="text-sm text-zinc-500 mt-1 max-w-sm">This user hasn't submitted their KYC documents yet.</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Aadhar Front */}
                <div className="space-y-2">
                  <span className="text-sm font-medium text-zinc-700 inline-flex items-center">
                    Aadhar Card (Front)
                  </span>
                  <div className="relative aspect-[1.6/1] w-full rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 group">
                    {user.kycDocuments.aadharFrontUrl ? (
                      <a href={user.kycDocuments.aadharFrontUrl} target="_blank" rel="noreferrer">
                        <Image src={user.kycDocuments.aadharFrontUrl} alt="Aadhar Front" fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-zinc-900 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm transition-opacity">View Full Size</span>
                        </div>
                      </a>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-400">Missing</div>
                    )}
                  </div>
                </div>
                
                {/* Aadhar Back */}
                <div className="space-y-2">
                  <span className="text-sm font-medium text-zinc-700">Aadhar Card (Back)</span>
                  <div className="relative aspect-[1.6/1] w-full rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 group">
                    {user.kycDocuments.aadharBackUrl ? (
                      <a href={user.kycDocuments.aadharBackUrl} target="_blank" rel="noreferrer">
                        <Image src={user.kycDocuments.aadharBackUrl} alt="Aadhar Back" fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-zinc-900 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm transition-opacity">View Full Size</span>
                        </div>
                      </a>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-400">Missing</div>
                    )}
                  </div>
                </div>

                {/* PAN Card */}
                <div className="space-y-2">
                  <span className="text-sm font-medium text-zinc-700">PAN Card</span>
                  <div className="relative aspect-[1.6/1] w-full rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 group">
                    {user.kycDocuments.panUrl ? (
                      <a href={user.kycDocuments.panUrl} target="_blank" rel="noreferrer">
                        <Image src={user.kycDocuments.panUrl} alt="PAN Card" fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-zinc-900 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm transition-opacity">View Full Size</span>
                        </div>
                      </a>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-400">Missing</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* KYC Action Buttons */}
          <KycActions uid={user.uid} currentStatus={user.kycStatus || "unsubmitted"} />
        </div>
      </div>
    </div>
  );
}
