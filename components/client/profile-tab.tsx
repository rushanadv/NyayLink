"use client";

import { useState } from "react";
import { UserProfile } from "@/lib/portal/types";
import { updateClientProfile } from "@/app/actions/portal";
import { LogoutButton } from "@/components/logout-button";
import {
  User,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Save,
} from "lucide-react";

interface ProfileTabProps {
  userEmail: string;
  userId: string;
  profile: UserProfile | null;
}

export function ProfileTab({ userEmail, userId, profile }: ProfileTabProps) {
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await updateClientProfile({
        fullName,
        phone,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to update profile");
      }

      setSuccessMessage("Profile updated successfully.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="pb-4 border-b border-[#D5E5D9]">
        <h1 className="text-xl sm:text-2xl font-serif font-semibold text-[#202824]">
          Profile & Account Settings
        </h1>
        <p className="text-xs text-[#69736D] mt-1">
          Manage your verified contact details and authenticated session credentials.
        </p>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
          {errorMessage}
        </div>
      )}

      {/* Profile Form */}
      <div className="p-6 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-5">
        <h2 className="text-sm font-serif font-semibold text-[#202824]">
          Personal Legal Profile
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-semibold uppercase text-[#202824]">
              Full Legal Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#69736D] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isSaving}
                placeholder="Your full legal name as per Aadhaar / PAN"
                className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-[#D5E5D9] text-xs text-[#202824] focus:outline-none focus:border-[#205C43] focus:ring-2 focus:ring-[#205C43]/15"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-semibold uppercase text-[#202824]">
              Mobile Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#69736D] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isSaving}
                placeholder="+91 98765 43210"
                className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-[#D5E5D9] text-xs text-[#202824] focus:outline-none focus:border-[#205C43] focus:ring-2 focus:ring-[#205C43]/15"
              />
            </div>
            <span className="text-[10px] text-[#69736D]">
              Used for confidential consultation SMS/WhatsApp alerts.
            </span>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Security Credentials Card */}
      <div className="p-6 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-4">
        <h2 className="text-sm font-serif font-semibold text-[#202824]">
          Account & Authentication Security
        </h2>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9]">
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#205C43]" />
              <div>
                <span className="font-semibold text-[#202824]">Registered Email</span>
                <p className="text-[11px] text-[#69736D]">{userEmail}</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
              Verified
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9]">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#205C43]" />
              <div>
                <span className="font-semibold text-[#202824]">Account Identity ID</span>
                <p className="text-[11px] font-mono text-[#69736D]">{userId}</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EAF3ED] text-[#205C43] border border-[#D5E5D9]">
              Client Role
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-[#D5E5D9] flex items-center justify-between">
          <span className="text-xs text-[#69736D]">
            Terminate this authenticated browser session:
          </span>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
