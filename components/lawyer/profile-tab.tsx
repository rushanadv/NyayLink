"use client";

import { useState } from "react";
import { LawyerProfileData, LawyerVerificationData } from "@/lib/portal/types";
import {
  updateLawyerChamberProfile,
  toggleLawyerPublicationConsent,
} from "@/app/actions/portal";
import { LogoutButton } from "@/components/logout-button";
import {
  Scale,
  CheckCircle2,
  Clock,
  Save,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";

interface ProfileTabProps {
  userEmail: string;
  lawyerProfile: LawyerProfileData | null;
  verification: LawyerVerificationData | null;
}

const AVAILABLE_PRACTICE_AREAS = [
  "Constitutional Law",
  "Commercial & Corporate Arbitration",
  "Criminal Defense & Bail",
  "Insolvency & Bankruptcy (NCLT)",
  "Real Estate & RERA Appeals",
  "Technology, IP & Data Protection",
  "Consumer Protection & Class Actions",
  "Family & Matrimonial Law",
  "Taxation & Customs",
  "Civil Appeals",
];

export function ProfileTab({
  userEmail,
  lawyerProfile,
  verification,
}: ProfileTabProps) {
  const [bio, setBio] = useState(lawyerProfile?.bio || "");
  const [city, setCity] = useState(lawyerProfile?.city || "");
  const [state, setState] = useState(lawyerProfile?.state || "");
  const [experienceYears, setExperienceYears] = useState(
    lawyerProfile?.experience_years || 5
  );
  const [selectedAreas, setSelectedAreas] = useState<string[]>(
    lawyerProfile?.practice_areas || ["Commercial & Corporate Arbitration"]
  );

  const [isPublished, setIsPublished] = useState<boolean>(
    lawyerProfile?.is_published ?? false
  );
  const [isTogglingConsent, setIsTogglingConsent] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleToggleConsent = async () => {
    setIsTogglingConsent(true);
    setFeedback(null);
    try {
      const targetState = !isPublished;
      const res = await toggleLawyerPublicationConsent(targetState);
      if (!res.success) {
        throw new Error(res.error || "Failed to update publication consent.");
      }
      setIsPublished(targetState);
      setFeedback({
        type: "success",
        text: targetState
          ? "Profile is now discoverable to registered NyayLink clients."
          : "Profile is now hidden from the client directory.",
      });
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to update directory visibility",
      });
    } finally {
      setIsTogglingConsent(false);
    }
  };

  const togglePracticeArea = (area: string) => {
    if (selectedAreas.includes(area)) {
      if (selectedAreas.length > 1) {
        setSelectedAreas(selectedAreas.filter((a) => a !== area));
      }
    } else {
      setSelectedAreas([...selectedAreas, area]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await updateLawyerChamberProfile({
        bio,
        practiceAreas: selectedAreas,
        city,
        state,
        experienceYears: Number(experienceYears),
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to update chamber profile");
      }

      setFeedback({
        type: "success",
        text: "Chamber profile updated successfully.",
      });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Save failed",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="pb-4 border-b border-[#D5E5D9]">
        <h1 className="text-xl sm:text-2xl font-serif font-semibold text-[#202824]">
          Professional Chamber Profile & Verification
        </h1>
        <p className="text-xs text-[#69736D] mt-1">
          Bar Council enrollment credentials, practice specialties, and directory publication status.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Verification Status Lifecycle Card */}
      <div className="p-6 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#D5E5D9]">
          <h2 className="text-sm font-serif font-semibold text-[#202824]">
            Bar Council Verification Lifecycle
          </h2>
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold uppercase">
            Review: {verification?.status || "Pending"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] space-y-1">
            <span className="text-[10px] font-mono text-[#69736D] uppercase">1. Account</span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Registered</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] space-y-1">
            <span className="text-[10px] font-mono text-[#69736D] uppercase">2. Bar Council Roll</span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#202824]">
              <Scale className="w-3.5 h-3.5 text-[#205C43]" />
              <span>{lawyerProfile?.bar_council_number || "DL/DEMO/2026"}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-1">
            <span className="text-[10px] font-mono text-amber-900 uppercase">3. Verification</span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
              <Clock className="w-3.5 h-3.5" />
              <span className="capitalize">{verification?.status || "Pending Review"}</span>
            </div>
          </div>

          <div
            className={`p-3 rounded-xl border space-y-1 ${
              isPublished
                ? "bg-emerald-50/60 border-emerald-200/80"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <span
              className={`text-[10px] font-mono uppercase ${
                isPublished ? "text-emerald-900" : "text-gray-500"
              }`}
            >
              4. Client Directory
            </span>
            <div
              className={`flex items-center gap-1.5 text-xs font-semibold ${
                isPublished ? "text-emerald-800" : "text-gray-700"
              }`}
            >
              {isPublished ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Discoverable</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-gray-500" />
                  <span>Unpublished</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] text-[11px] text-[#69736D] leading-relaxed">
          <strong className="text-[#202824]">Statutory Notice (BCI Rule 36):</strong> Profiles published with advocate consent are discoverable exclusively to registered clients on NyayLink. While Bar Council verification is in progress, your card clearly displays a &apos;Newly Joined • Verification Pending&apos; badge. Upon official Bar Council verification, the &apos;BCI Verified Advocate&apos; badge is awarded. Private enrollment records and direct phone numbers remain strictly confidential.
        </div>
      </div>

      {/* Client Directory Visibility & Publication Consent Card */}
      <div className="p-6 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D5E5D9]">
          <div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#205C43]" />
              <h2 className="text-sm font-serif font-semibold text-[#202824]">
                Client Directory Discovery & Consent
              </h2>
            </div>
            <p className="text-xs text-[#69736D] mt-0.5">
              Control whether registered NyayLink clients can discover your profile and send consultation inquiries.
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggleConsent}
            disabled={isTogglingConsent}
            className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all shrink-0 ${
              isPublished
                ? "bg-[#174530] text-white border-[#174530] hover:bg-[#0E2C1E] shadow-xs"
                : "bg-white text-[#202824] border-[#D5E5D9] hover:bg-[#F8FAF9]"
            }`}
          >
            {isTogglingConsent ? (
              <span>Updating...</span>
            ) : isPublished ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Visible in Directory</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-gray-500" />
                <span>Make Profile Discoverable</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] space-y-1.5">
            <span className="font-mono text-[10px] text-[#69736D] uppercase block">
              Current Directory Badging
            </span>
            <div className="flex items-center gap-2">
              {verification?.status === "approved" ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  BCI Verified Advocate
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Newly Joined • Verification Pending
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#69736D] leading-relaxed">
              {verification?.status === "approved"
                ? "Your Bar Council credentials are authenticated by the registrar."
                : "Clients are clearly informed that your enrollment verification is awaiting administrative review."}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] space-y-1.5">
            <span className="font-mono text-[10px] text-[#69736D] uppercase block">
              Privacy & Regulatory Boundaries
            </span>
            <div className="flex items-center gap-1.5 text-[#202824] font-medium">
              <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>Full BCI Rule 36 Compliance</span>
            </div>
            <p className="text-[11px] text-[#69736D] leading-relaxed">
              Phone numbers, email addresses, and enrollment certificate uploads remain confidential and are never shared in the client directory.
            </p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="p-6 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-5">
        <h2 className="text-sm font-serif font-semibold text-[#202824]">
          Chambers Presentation & Practice Fields
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-semibold uppercase text-[#202824]">
              Professional Title / Name
            </label>
            <input
              type="text"
              disabled
              value={lawyerProfile?.professional_name || "Adv. Demo Lawyer"}
              className="w-full h-10 px-3.5 rounded-xl border border-[#D5E5D9] text-xs text-[#69736D] bg-[#F8FAF9] cursor-not-allowed"
            />
            <span className="text-[10px] text-[#69736D]">
              Name locked to Bar Council enrollment roll.
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-semibold uppercase text-[#202824]">
              Chamber Overview & Litigation Bio
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={isSaving}
              placeholder="Outline appellate experience, landmark judgments, trial benches, and areas of counsel..."
              className="w-full p-3.5 rounded-xl border border-[#D5E5D9] text-xs text-[#202824] focus:outline-none focus:border-[#205C43] leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-semibold uppercase text-[#202824]">
                City / Seat
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={isSaving}
                placeholder="e.g. New Delhi"
                className="w-full h-10 px-3.5 rounded-xl border border-[#D5E5D9] text-xs text-[#202824] focus:outline-none focus:border-[#205C43]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-semibold uppercase text-[#202824]">
                State Jurisdiction
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                disabled={isSaving}
                placeholder="e.g. Delhi"
                className="w-full h-10 px-3.5 rounded-xl border border-[#D5E5D9] text-xs text-[#202824] focus:outline-none focus:border-[#205C43]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-semibold uppercase text-[#202824]">
                Standing (Years)
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                disabled={isSaving}
                className="w-full h-10 px-3.5 rounded-xl border border-[#D5E5D9] text-xs text-[#202824] focus:outline-none focus:border-[#205C43]"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="block text-xs font-mono font-semibold uppercase text-[#202824]">
              Practice Specialties (Select to toggle)
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_PRACTICE_AREAS.map((area) => {
                const isSelected = selectedAreas.includes(area);
                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() => togglePracticeArea(area)}
                    disabled={isSaving}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-[#174530] text-white border-[#174530] shadow-xs"
                        : "bg-[#F8FAF9] text-[#69736D] border-[#D5E5D9] hover:border-[#205C43]"
                    }`}
                  >
                    {area}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-[#D5E5D9]">
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-[#174530] hover:bg-[#0E2C1E] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? "Saving Profile..." : "Update Chamber Profile"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Account Info and Logout */}
      <div className="p-6 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-4">
        <h2 className="text-sm font-serif font-semibold text-[#202824]">
          Session Security
        </h2>
        <div className="flex items-center justify-between text-xs text-[#69736D]">
          <span>Logged in as: <strong className="text-[#202824]">{userEmail}</strong></span>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
