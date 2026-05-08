"use client";

import { updateKycStatus, updateUserProfile } from "@/app/actions/user";
import { CheckCircle, ChevronDown, Pencil, FileText, Save, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Option lists
// ─────────────────────────────────────────────────────────────────────────────
const CUISINE_OPTIONS = [
  "North Indian", "South Indian", "Chinese", "Mexican",
  "Continental", "Thai", "Italian", "Korean"

];

const WORK_EXP_OPTIONS = [
  "Hotel", "Hostels", "Canteen", "Houses",
  "Restaurant", "Pub & bar", "Other",
];

const CITY_OPTIONS = [
  "Delhi",
  "Noida",
  "Ghaziabad",
  "Faridabad",
  "Gurugram",
  "Mumbai",
  'Bengaluru',
  'Chennai',
  'Kolkata',
  'Hyderabad',
  'Pune',
  'Jaipur',
  'Lucknow',
  'Chandigarh',
  'Indore',
  'Kochi',
  'Ahmedabad',
  'Bhubaneswar',
  'Nagpur',
  'Dehradun',
  'Shimla',
  'Jalandhar',
  'Mysuru',
  'Udaipur',
  'Varanasi',
  'Rajkot',
  'Haridwar',
  'Rishikesh',
  'Mussoorie',

];

const ZONE_OPTIONS = [
  "North Zone", "South Zone", "East Zone", "West Zone"
];

// ─────────────────────────────────────────────────────────────────────────────
// EditableField
// ─────────────────────────────────────────────────────────────────────────────
function EditableField({
  label, value, onChange, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="relative border border-gray-200 rounded-xl px-4 py-2.5 focus-within:border-[#E11D48] transition-all group">
      <label className="absolute -top-2 left-3 bg-white px-1.5 text-[11px] text-gray-400 font-medium">
        {label}
      </label>
      <div className="flex items-center">
        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 text-[15px] text-gray-800 font-medium bg-transparent outline-none placeholder:text-gray-300"
          placeholder={`Enter ${label.toLowerCase()}`}
        />
        <button type="button" tabIndex={-1} onClick={() => inputRef.current?.focus()}
          className="ml-2 opacity-30 group-focus-within:opacity-0 hover:opacity-60 transition-opacity">
          <img src="/edit.svg" alt="edit" className="w-3.5 h-3.5" color="black" />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EditableSelect (single)
// ─────────────────────────────────────────────────────────────────────────────
function EditableSelect({
  label, value, options, onChange,
}: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <div className="relative border border-gray-200 rounded-xl px-4 py-2.5 focus-within:border-[#E11D48] transition-all">
      <label className="absolute -top-2 left-3 bg-white px-1.5 text-[11px] text-gray-400 font-medium">
        {label}
      </label>
      <div className="flex items-center">
        <select value={value} onChange={(e) => onChange(e.target.value)}
          className="flex-1 text-[15px] text-gray-800 font-medium bg-transparent outline-none appearance-none cursor-pointer">
          <option value="">— Select —</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 pointer-events-none" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MultiSelectDropdown — pill list with circle / green-check toggle
// ─────────────────────────────────────────────────────────────────────────────
function MultiSelectDropdown({
  label, selected, options, onChange,
}: {
  label: string; selected: string[]; options: string[]; onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (opt: string) => {
    onChange(
      selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]
    );
  };

  const displayText =
    selected.length === 0
      ? "— Select —"
      : selected.length <= 2
        ? selected.join(", ")
        : `${selected.slice(0, 2).join(", ")} +${selected.length - 2} more`;

  return (
    <div className="relative" ref={ref}>
      <div className="relative border border-gray-200 rounded-xl px-4 py-2.5 hover:border-[#E11D48] transition-all">
        <label className="absolute -top-2 left-3 bg-white px-1.5 text-[11px] text-gray-400 font-medium">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between"
        >
          <span className={`text-[15px] font-medium truncate text-left ${selected.length === 0 ? "text-gray-300" : "text-gray-800"}`}>
            {displayText}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto">
          {options.map((opt, i) => {
            const isSelected = selected.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => toggle(opt)}
                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left ${i < options.length - 1 ? "border-b border-gray-100" : ""}`}
              >
                <span className="text-[14px] text-gray-700">{opt}</span>
                {isSelected ? (
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EditableTextarea
// ─────────────────────────────────────────────────────────────────────────────
function EditableTextarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="col-span-3 relative border border-gray-200 rounded-xl px-4 py-2.5 focus-within:border-[#E11D48] transition-all">
      <label className="absolute -top-2 left-3 bg-white px-1.5 text-[11px] text-gray-400 font-medium">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder="Enter address…"
        className="w-full text-[15px] text-gray-800 font-medium bg-transparent outline-none resize-none placeholder:text-gray-300 mt-1"
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DocRow
// ─────────────────────────────────────────────────────────────────────────────
function DocRow({ label, url }: { label: string; url?: string }) {
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
        <span className="text-[13px] font-medium text-gray-700">{label}</span>
        {url && <CheckCircle className="w-4 h-4 text-green-500" />}
      </div>
      {url ? (
        <a href={url} target="_blank" rel="noreferrer"
          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
            <Image src={url} alt={label} fill className="object-cover" />
          </div>
          <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors truncate">
            {label.toLowerCase().replace(/\s+/g, "_")}.jpg
          </span>
          <span className="ml-auto text-gray-400 text-lg leading-none">⋮</span>
        </a>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3 text-gray-400">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <span className="text-[13px]">Not uploaded</span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
interface Props { user: any; bookings: any[]; }

export default function ChefDetailClient({ user, bookings }: Props) {
  const router = useRouter();

  // ── Normalizers ────────────────────────────────────────
  const normalizeGender = (g: string) => {
    if (!g) return "";
    const lower = g.toLowerCase();
    if (lower === "male") return "Male";
    if (lower === "female") return "Female";
    if (lower === "other") return "Other";
    return g;
  };

  const normalizeCity = (c: string) => {
    if (!c) return "";
    const lower = c.toLowerCase();
    if (lower === "delhi" || lower === "new delhi") return "New Delhi";
    return CITY_OPTIONS.find(opt => opt.toLowerCase() === lower) || c;
  };

  const normalizeZone = (z: string) => {
    if (!z) return "";
    const lower = z.toLowerCase();
    if (lower === "north") return "North Zone";
    if (lower === "south") return "South Zone";
    if (lower === "east") return "East Zone";
    if (lower === "west") return "West Zone";

    return ZONE_OPTIONS.find(opt => opt.toLowerCase() === lower) || z;
  };

  const normalizeLanguage = (l: string) => {
    if (!l) return "";
    const lower = l.toLowerCase();
    if (lower === "en") return "English";
    if (lower === "hi") return "Hindi";
    return l.charAt(0).toUpperCase() + l.slice(1);
  };

  // ── Form state ─────────────────────────────────────────
  const [form, setForm] = useState({
    phone: user.phone || "",
    email: user.email || "",
    emergencyPhone: user.emergencyPhone || "",
    gender: normalizeGender(user.gender),
    jobPreference: user.jobPreference || "",
    city: normalizeCity(user.city),
    zone: normalizeZone(user.zone),
    address: user.address || "",
    language: normalizeLanguage(user.language),
    bankAccount: user.bankAccount || user.accountNumber || "",
    ifscCode: user.ifscCode || user.ifsc || "",
    bankNumber: user.bankNumber || "",
    upiId: user.upiId || user.upi || "",
    aadharNumber: user.kycDocuments?.aadharNumber || user.aadharNumber || "",
    panNumber: user.kycDocuments?.panNumber || user.panNumber || "",
  });

  // ── Array states (multi-select) ────────────────────────
  const [cuisines, setCuisines] = useState<string[]>(
    Array.isArray(user.cuisines) ? user.cuisines : []
  );

  const initialExp = user.experience || user.workExperience;
  const [workExperience, setWorkExperience] = useState<string[]>(
    Array.isArray(initialExp)
      ? initialExp
      : initialExp
        ? [initialExp]
        : []
  );

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // ── Approval ───────────────────────────────────────────
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [kycLoading, setKycLoading] = useState<string | null>(null);
  const isVerified = user.kycStatus === "approved" || user.kycStatus === "verified";

  const handleKycUpdate = async (status: "approved" | "rejected") => {
    setKycLoading(status);
    setApprovalOpen(false);
    const res = await updateKycStatus(user.uid, status);
    setKycLoading(null);
    if (res.success) router.refresh();
    else alert(res.error || "Something went wrong");
  };

  // ── Save ───────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const handleSave = async (mode: "profile" | "draft") => {
    setSaving(true);
    setSaveErr(null);
    let mappedLang = form.language;
    if (mappedLang === "English") mappedLang = "en";
    else if (mappedLang === "Hindi") mappedLang = "hi";

    const res = await updateUserProfile(user.uid, {
      ...form,
      language: mappedLang,
      cuisines,
      experience: workExperience as any,
      workExperience: workExperience as any,
    });
    setSaving(false);
    if (res.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      if (mode === "profile") router.refresh();
    } else {
      setSaveErr(res.error || "Save failed");
    }
  };

  // ── Header tags ────────────────────────────────────────
  const tags: string[] = [];
  if (form.jobPreference) tags.push(form.jobPreference);
  if (cuisines.length > 0) tags.push(cuisines.slice(0, 2).join(", "));
  if (form.city) tags.push(form.city);

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="max-w-4xl pb-16 mx-auto px-4 pt-6 space-y-5">

        {/* ── Hero Header ────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-6 flex items-center gap-5 shadow-sm">
          <div className="w-[72px] h-[72px] rounded-full overflow-hidden flex-shrink-0 bg-gray-100 border-2 border-gray-200 relative">
            {user.kycDocuments?.selfieUrl ? (
              <Image src={user.kycDocuments.selfieUrl} alt="Chef" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-black text-gray-500">
                {user.name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[20px] font-bold text-gray-900">{user.name || "Unknown Chef"}</h1>
              {isVerified && (
                <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  <CheckCircle className="w-3 h-3" /> KYC verified
                </span>
              )}
              {user.kycStatus === "pending_verification" && (
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">Pending</span>
              )}
              {user.kycStatus === "rejected" && (
                <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">Rejected</span>
              )}
            </div>
            <p className="text-[13px] text-gray-500 mt-0.5">Chef-Id: {user.uid?.slice(0, 8).toUpperCase() || "—"}</p>
            {tags.length > 0 && <p className="text-[13px] text-gray-500 mt-1">{tags.join(" | ")}</p>}
          </div>

          <div className="relative flex-shrink-0">
            <button onClick={() => setApprovalOpen((v) => !v)}
              className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2 text-[13px] text-gray-600 bg-white hover:bg-gray-50 transition-colors shadow-sm min-w-[180px] justify-between">
              <span>
                {kycLoading
                  ? `${kycLoading === "approved" ? "Approving" : "Rejecting"}…`
                  : isVerified ? "KYC Approved"
                    : user.kycStatus === "rejected" ? "KYC Rejected"
                      : "Select Approval Status"}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            {approvalOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden min-w-[180px]">
                <button onClick={() => handleKycUpdate("approved")}
                  className="w-full text-left px-4 py-3 text-[13px] text-green-700 font-medium hover:bg-green-50 transition-colors">
                  ✓ Approve
                </button>
                <button onClick={() => handleKycUpdate("rejected")}
                  className="w-full text-left px-4 py-3 text-[13px] text-red-600 font-medium hover:bg-red-50 transition-colors">
                  ✕ Reject
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Chef Detail ────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[16px] font-bold text-gray-900">Chef detail</h2>
            <Link href={`/bookings/${user.uid}`} className="text-[13px] border-1 border-gray-300 rounded-lg px-2 py-1 font-semibold text-[#E11D48] hover:text-red-700">Booking detail</Link>
          </div>

          <div className="grid grid-cols-3 gap-x-8 gap-y-6">
            <EditableField label="Enter mobile number" value={form.phone} onChange={set("phone")} type="tel" />
            <EditableField label="Enter Email" value={form.email} onChange={set("email")} type="email" />
            <EditableField label="Emergency contact number" value={form.emergencyPhone} onChange={set("emergencyPhone")} type="tel" />

            <EditableSelect label="Select Gender" value={form.gender} onChange={set("gender")} options={["Male", "Female", "Other"]} />
            <EditableSelect label="Job Preference" value={form.jobPreference} onChange={set("jobPreference")} options={["Full-Time", "Part-Time", "Freelance"]} />
            <EditableField label="Language" value={form.language} onChange={set("language")} />

            {/* ── Cuisine Type multi-select ── */}
            <MultiSelectDropdown
              label="Cuisine Type"
              selected={cuisines}
              options={CUISINE_OPTIONS}
              onChange={setCuisines}
            />

            {/* ── Work Experience multi-select ── */}
            <MultiSelectDropdown
              label="Work Experience"
              selected={workExperience}
              options={WORK_EXP_OPTIONS}
              onChange={setWorkExperience}
            />

            <EditableSelect label="City" value={form.city} onChange={set("city")} options={CITY_OPTIONS} />
            <EditableSelect label="Zone" value={form.zone} onChange={set("zone")} options={ZONE_OPTIONS} />

            <EditableTextarea label="Address" value={form.address} onChange={set("address")} />
          </div>
        </div>

        {/* ── KYC Details ────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[16px] font-bold text-gray-900">KYC details &amp; verification</h2>
            <div className="text-right">
              {user.kycSubmittedAt && (
                <p className="text-[12px] text-gray-500" suppressHydrationWarning>Submitted: {new Date(user.kycSubmittedAt).toLocaleString()}</p>
              )}
              {user.kycVerifiedAt && (
                <p className="text-[12px] text-gray-500" suppressHydrationWarning>Verified: {new Date(user.kycVerifiedAt).toLocaleString()}</p>
              )}
            </div>
          </div>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-8">
              <EditableField label="Adhaar number" value={form.aadharNumber} onChange={set("aadharNumber")} />
              <EditableField label="PAN number" value={form.panNumber} onChange={set("panNumber")} />
            </div>
            {user.kycDocuments ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <DocRow label="Adhaar card (Front)" url={user.kycDocuments.aadharFrontUrl} />
                  {user.kycDocuments.aadharFrontUrl && <p className="text-[11px] text-gray-400 mt-2 px-1">Documents Added</p>}
                </div>
                <div>
                  <DocRow label="Adhaar card (Back)" url={user.kycDocuments.aadharBackUrl} />
                  {user.kycDocuments.aadharBackUrl && <p className="text-[11px] text-gray-400 mt-2 px-1">Documents Added</p>}
                </div>
                {user.kycDocuments.panUrl && <div><DocRow label="PAN Card" url={user.kycDocuments.panUrl} /></div>}
              </div>
            ) : (
              <p className="text-[13px] text-gray-400 italic">No KYC documents uploaded yet.</p>
            )}
          </div>
        </div>

        {/* ── Bank Details ────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-[16px] font-bold text-gray-900 mb-6">Bank Details</h2>
          <div className="grid grid-cols-3 gap-x-8 gap-y-6 mb-8">
            <EditableField label="Bank Account number" value={form.bankAccount} onChange={set("bankAccount")} />
            <EditableField label="IFSC code" value={form.ifscCode} onChange={set("ifscCode")} />
            <EditableField label="Bank Number" value={form.bankNumber} onChange={set("bankNumber")} />
          </div>
          <h3 className="text-[15px] font-bold text-gray-900 mb-4">UPI Details</h3>
          <div className="grid grid-cols-3 gap-x-8">
            <EditableField label="UPI number" value={form.upiId} onChange={set("upiId")} />
          </div>
        </div>

        {saveErr && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] font-medium px-4 py-3 rounded-xl">{saveErr}</div>
        )}

        {/* ── Save Buttons ────────────────────────────────── */}
        <div className="bg-white px-6 py-4 flex items-center justify-center gap-4 rounded-2xl shadow-sm border border-gray-100">
          <button onClick={() => handleSave("draft")} disabled={saving}
            className="w-48 py-3 border border-[#E11D48] rounded-xl text-[14px] font-bold text-[#E11D48] hover:bg-red-50 transition-colors disabled:opacity-50">
            {saving ? "Saving…" : "Save Draft"}
          </button>
          <button onClick={() => handleSave("profile")} disabled={saving}
            className="w-48 py-3 bg-[#E11D48] rounded-xl text-[14px] font-bold text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-100 disabled:opacity-50 flex items-center justify-center gap-2">
            {saved ? (<><Check className="w-4 h-4" />Saved!</>) : saving ? "Saving…" : (<><Save className="w-4 h-4" />Save Profile</>)}
          </button>
        </div>

      </div>
    </div>
  );
}
